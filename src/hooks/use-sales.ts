/**
 * @fileoverview React Query hooks para el módulo de ventas.
 *
 * Flujo de capas:
 *
 * ```mermaid
 * flowchart TD
 *     A[PaymentDialog] -->|CreateSaleInput| B[useCreateSale]
 *     B -->|POST /api/sales| C[Backend]
 *     C -->|ApiSale snake_case| B
 *     B -->|mapApiSaleToSale| D[Sale camelCase]
 *     B -->|onSuccess| E[invalidate sales + products + inventory-stats]
 *     F[Consumer] -->|page| G[useSales]
 *     G -->|GET /api/sales| C
 *     H[Consumer] -->|id| I[useSale]
 *     I -->|GET /api/sales/:id| C
 * ```
 *
 * Convenciones:
 * - Interfaces `Api*` son privadas — sólo para el mapeo interno.
 * - Las interfaces de dominio exportadas viven en `@/types/sales`.
 * - `salesQueryKeys` es namespace explícito para evitar colisión con otros módulos.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Sale, SalesPagination, CreateSaleInput } from '@/types/sales';
import { useUploadTransferProof } from '@/hooks/use-transfers';
import { invalidateOperationalQueries } from '@/lib/query-invalidation';

// ============================================================
// Types privados de la API (snake_case — forma del backend)
// ============================================================

interface ApiSaleItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;   // Decimal serializado como number en JSON
  unit_cost: number | null;
  subtotal: number;     // Decimal serializado como number en JSON
  tax_rate_snapshot: number | null;
  tax_amount: number;
}

interface ApiSale {
  id: number;
  user_id: number;
  client_id: number | null;
  client_name: string | null;
  state: 'completed' | 'cancelled';
  payment_method: 'cash' | 'credit' | 'transfer';
  transfer_proof_id?: number | null;
  transfer_status?: 'pending' | 'confirmed' | 'rejected' | null;
  transfer_proof_url?: string | null;
  reference_note?: string | null;
  subtotal: number;
  tax_total: number;
  total: number;
  created_at: string;          // ISO datetime
  cancelled_at: string | null;
  cancel_reason: string | null;
  items: ApiSaleItem[];
}

interface ApiTransferProofUploadResponse {
  proof_id: number;
  sale_id: number | null;
  debt_payment_id: number | null;
  status: 'pending' | 'confirmed' | 'rejected';
  proof_url: string;
  proof_filename: string;
  uploaded_at: string;
}

interface ApiSalesPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface ApiSalesListResponse {
  data: ApiSale[];
  pagination: ApiSalesPagination;
}

// ============================================================
// Mappers (privados)
// ============================================================

function mapApiSaleItemToSaleItem(apiItem: ApiSaleItem) {
  return {
    id: String(apiItem.id),
    productId: String(apiItem.product_id),
    productName: apiItem.product_name,
    quantity: apiItem.quantity,
    unitPrice: Number(apiItem.unit_price),
    unitCost: apiItem.unit_cost !== null ? Number(apiItem.unit_cost) : null,
    subtotal: Number(apiItem.subtotal),
    taxRateSnapshot:
      apiItem.tax_rate_snapshot !== null ? Number(apiItem.tax_rate_snapshot) : null,
    taxAmount: Number(apiItem.tax_amount),
  };
}

export function mapApiSaleToSale(apiSale: ApiSale): Sale {
  return {
    id: String(apiSale.id),
    userId: String(apiSale.user_id),
    clientId: apiSale.client_id !== null ? String(apiSale.client_id) : null,
    clientName: apiSale.client_name,
    state: apiSale.state,
    paymentMethod: apiSale.payment_method,
    transferProofId:
      apiSale.transfer_proof_id !== undefined && apiSale.transfer_proof_id !== null
        ? String(apiSale.transfer_proof_id)
        : null,
    transferStatus: apiSale.transfer_status ?? null,
    transferProofUrl: apiSale.transfer_proof_url ?? null,
    referenceNote: apiSale.reference_note ?? null,
    subtotal: Number(apiSale.subtotal),
    taxTotal: Number(apiSale.tax_total),
    total: Number(apiSale.total),
    createdAt: apiSale.created_at,
    cancelledAt: apiSale.cancelled_at,
    cancelReason: apiSale.cancel_reason,
    items: apiSale.items.map(mapApiSaleItemToSaleItem),
  };
}

// ============================================================
// Query Keys
// ============================================================

export const salesQueryKeys = {
  all: ['sales'] as const,
  list: (page: number) => ['sales', 'list', page] as const,
  detail: (id: string) => ['sales', id] as const,
};

// ============================================================
// Mutation: Crear venta
// ============================================================

/**
 * Hook para crear una venta en el backend.
 *
 * - Mapea `CreateSaleInput` (camelCase, string ids) al payload del backend (snake_case, number ids).
 * - Al tener éxito, invalida los caches de ventas, productos e inventario-stats.
 * - El carrito NO se limpia aquí — esa responsabilidad es del componente (PaymentDialog).
 */
export function useCreateSale() {
  const queryClient = useQueryClient();
  const uploadTransferProof = useUploadTransferProof();

  return useMutation({
    mutationFn: async (input: CreateSaleInput): Promise<Sale> => {
      const payload = {
        payment_method: input.paymentMethod,
        ...(input.paymentMethod === 'credit' && input.clientId
          ? { client_id: Number(input.clientId) }
          : {}),
        ...(input.paymentMethod === 'transfer' && input.referenceNote
          ? { reference_note: input.referenceNote }
          : {}),
        items: input.items.map((item) => ({
          product_id: Number(item.productId),
          quantity: item.quantity,
        })),
      };

      const response = await api.post<ApiSale>('/api/sales', payload);
      const sale = mapApiSaleToSale(response.data);

      if (input.paymentMethod === 'transfer' && input.transferFile && sale.transferProofId) {
        await uploadTransferProof.mutateAsync({
          proofId: sale.transferProofId,
          file: input.transferFile,
        }) as ApiTransferProofUploadResponse;
        const refreshed = await api.get<ApiSale>(`/api/sales/${sale.id}`);
        return mapApiSaleToSale(refreshed.data);
      }

      return sale;
    },
    onSuccess: async () => {
      await invalidateOperationalQueries(queryClient);
    },
  });
}

// ============================================================
// Query: Lista paginada de ventas
// ============================================================

/**
 * Hook para obtener la lista paginada de ventas.
 * Preparado para futuros consumidores (historial, reportes).
 */
export function useSales(page: number = 1) {
  return useQuery({
    queryKey: salesQueryKeys.list(page),
    queryFn: async (): Promise<{ data: Sale[]; pagination: SalesPagination }> => {
      const response = await api.get<ApiSalesListResponse>('/api/sales', {
        params: { page, limit: 20 },
      });

      return {
        data: response.data.data.map(mapApiSaleToSale),
        pagination: {
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.total_pages,
        },
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

// ============================================================
// Query: Detalle de una venta
// ============================================================

/**
 * Hook para obtener el detalle de una venta por ID.
 * La query queda deshabilitada si `id` es falsy.
 */
export function useSale(id: string) {
  return useQuery({
    queryKey: salesQueryKeys.detail(id),
    queryFn: async (): Promise<Sale> => {
      const response = await api.get<ApiSale>(`/api/sales/${id}`);
      return mapApiSaleToSale(response.data);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos — detalle de venta no cambia
  });
}
