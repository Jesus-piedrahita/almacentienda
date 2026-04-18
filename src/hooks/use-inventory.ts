/**
 * @fileoverview React Query hooks para el módulo de inventario.
 * Proporciona fetching, caching y mutaciones para productos, categorías y estadísticas.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import type {
  Product,
  Category,
  InventoryStats,
  CreateProductInput,
  CreateCategoryInput,
  ExpiringProduct,
  LowStockProduct,
  BulkMarkupInput,
  BulkMarkupResult,
} from '@/types/inventory';

// ============================================================
// Types de la API
// ============================================================

interface ApiCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

interface ApiProduct {
  id: number;
  barcode: string;
  name: string;
  description?: string;
  category_id: number;
  category_name: string;
  price: number;
  cost: number;
  markup_pct?: number | null;
  quantity: number;
  min_stock: number;
  created_at: string;
  updated_at?: string;
  stock_status: 'good' | 'warning' | 'critical';
  /** Fecha de vencimiento en formato ISO-8601 (YYYY-MM-DD). Opcional. */
  expiration_date?: string;
}

/**
 * Representación de un producto próximo a vencer tal como lo devuelve
 * el endpoint GET /api/inventory/alerts/expiring.
 */
interface ApiExpiringProduct {
  id: number;
  name: string;
  /** Fecha de vencimiento en formato ISO-8601 (YYYY-MM-DD). */
  expiration_date: string;
  /** Días restantes hasta el vencimiento (negativo si ya venció). */
  days_remaining: number;
  quantity: number;
}

/**
 * Representación de un producto bajo stock tal como lo devuelve
 * el endpoint GET /api/inventory/alerts/low-stock.
 */
interface ApiLowStockProduct {
  id: number;
  name: string;
  quantity: number;
  min_stock: number;
}

interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface ApiProductsResponse {
  data: ApiProduct[];
  pagination: ApiPagination;
}

interface ApiStats {
  total_products: number;
  total_quantity: number;
  total_value: number;
  stock_status: {
    good: number;
    warning: number;
    critical: number;
  };
  category_summary: Array<{
    category_id: number;
    category_name: string;
    product_count: number;
    total_quantity: number;
    total_value: number;
  }>;
}

interface ApiBulkMarkupResult {
  updated_count: number;
  skipped_count: number;
  updated_products: ApiProduct[];
}

// ============================================================
// Mappers
// ============================================================

function mapApiCategoryToCategory(apiCategory: ApiCategory): Category {
  return {
    id: String(apiCategory.id),
    name: apiCategory.name,
    description: apiCategory.description,
  };
}

function mapApiProductToProduct(apiProduct: ApiProduct): Product {
  return {
    id: String(apiProduct.id),
    barcode: apiProduct.barcode,
    name: apiProduct.name,
    description: apiProduct.description,
    categoryId: String(apiProduct.category_id),
    categoryName: apiProduct.category_name,
    price: Number(apiProduct.price),
    cost: Number(apiProduct.cost),
    markupPct:
      apiProduct.markup_pct !== undefined && apiProduct.markup_pct !== null
        ? Number(apiProduct.markup_pct)
        : undefined,
    quantity: apiProduct.quantity,
    minStock: apiProduct.min_stock,
    expiration_date: apiProduct.expiration_date,
    createdAt: apiProduct.created_at,
    updatedAt: apiProduct.updated_at || apiProduct.created_at,
  };
}

function mapApiExpiringProductToExpiringProduct(api: ApiExpiringProduct): ExpiringProduct {
  return {
    id: String(api.id),
    name: api.name,
    expiration_date: api.expiration_date,
    days_remaining: api.days_remaining,
    quantity: api.quantity,
  };
}

function mapApiLowStockProductToLowStockProduct(api: ApiLowStockProduct): LowStockProduct {
  return {
    id: String(api.id),
    name: api.name,
    quantity: api.quantity,
    min_stock: api.min_stock,
  };
}

function mapApiStatsToInventoryStats(apiStats: ApiStats): InventoryStats {
  return {
    totalProducts: apiStats.total_products,
    totalQuantity: apiStats.total_quantity,
    totalValue: apiStats.total_value,
    stockStatus: {
      good: apiStats.stock_status.good,
      warning: apiStats.stock_status.warning,
      critical: apiStats.stock_status.critical,
    },
    categorySummary: apiStats.category_summary.map((cat) => ({
      categoryId: String(cat.category_id),
      categoryName: cat.category_name,
      productCount: cat.product_count,
      totalQuantity: cat.total_quantity,
      totalValue: cat.total_value,
    })),
  };
}

function mapApiBulkMarkupResult(apiResult: ApiBulkMarkupResult): BulkMarkupResult {
  return {
    updatedCount: apiResult.updated_count,
    skippedCount: apiResult.skipped_count,
    updatedProducts: apiResult.updated_products.map(mapApiProductToProduct),
  };
}

// ============================================================
// Query Keys
// ============================================================

export const queryKeys = {
  products: (page: number) => ['products', page] as const,
  search: (q: string) => ['products', 'search', q] as const,
  categories: ['categories'] as const,
  stats: ['inventory-stats'] as const,
  expiring: ['inventory-expiring'] as const,
  lowStock: ['inventory-low-stock'] as const,
};

// ============================================================
// Hooks de Query
// ============================================================

/**
 * Hook para obtener productos paginados
 */
export function useProducts(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.products(page),
    queryFn: async (): Promise<{ data: Product[]; pagination: ApiPagination }> => {
      const response = await api.get<ApiProductsResponse>('/api/inventory/products', {
        params: { page, limit: 20 },
      });

      return {
        data: response.data.data.map(mapApiProductToProduct),
        pagination: response.data.pagination,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener todas las categorías
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async (): Promise<Category[]> => {
      const response = await api.get<ApiCategory[]>('/api/inventory/categories');
      return response.data.map(mapApiCategoryToCategory);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener estadísticas del inventario
 */
export function useInventoryStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async (): Promise<InventoryStats> => {
      const response = await api.get<ApiStats>('/api/inventory/stats');
      return mapApiStatsToInventoryStats(response.data);
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener productos próximos a vencer.
 *
 * Llama a GET /api/inventory/alerts/expiring y devuelve la lista de productos.
 * Si el backend responde con 404 o 501 (endpoint aún no implementado), retorna
 * un array vacío silenciosamente para no bloquear el renderizado de la página.
 *
 * @returns ExpiringProduct[] — vacío si el backend no está disponible aún.
 */
export function useExpiringProducts() {
  return useQuery({
    queryKey: queryKeys.expiring,
    queryFn: async (): Promise<ExpiringProduct[]> => {
      try {
        const response = await api.get<ApiExpiringProduct[]>('/api/inventory/alerts/expiring');
        return response.data.map(mapApiExpiringProductToExpiringProduct);
      } catch (err: unknown) {
        // Backend not yet implemented — fail silently on 404/501
        if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
          return [];
        }
        throw err; // re-throw unexpected errors
      }
    },
    retry: false,          // do not retry 404/501
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener productos con stock por debajo del mínimo.
 *
 * Llama a GET /api/inventory/alerts/low-stock y devuelve la lista de productos.
 * Si el backend responde con 404 o 501 (endpoint aún no implementado), retorna
 * un array vacío silenciosamente para no bloquear el renderizado.
 *
 * @returns LowStockProduct[] — vacío si el backend no está disponible aún.
 */
export function useLowStockProducts() {
  return useQuery({
    queryKey: queryKeys.lowStock,
    queryFn: async (): Promise<LowStockProduct[]> => {
      try {
        const response = await api.get<ApiLowStockProduct[]>('/api/inventory/alerts/low-stock');
        return response.data.map(mapApiLowStockProductToLowStockProduct);
      } catch (err: unknown) {
        // Backend not yet implemented — fail silently on 404/501
        if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
          return [];
        }
        throw err; // re-throw unexpected errors
      }
    },
    retry: false,             // do not retry 404/501
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para buscar productos por código de barras o nombre.
 * No dispara la petición si la query tiene menos de 3 caracteres.
 */
export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: async (): Promise<Product[]> => {
      const response = await api.get<ApiProduct[]>('/api/inventory/products/search', {
        params: { q: query },
      });
      return response.data.map(mapApiProductToProduct);
    },
    enabled: query.length >= 3,
    staleTime: 1000 * 30, // 30 segundos
  });
}

// ============================================================
// Hooks de Mutation
// ============================================================

/**
 * Hook para agregar un nuevo producto
 */
export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput): Promise<Product> => {
      const productData = {
        ...input,
        category_id: Number(input.categoryId),
        markup_pct: input.markupPct ?? null,
      };
      delete productData.categoryId;
      const response = await api.post<ApiProduct>('/api/inventory/products', productData);
      return mapApiProductToProduct(response.data);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

/**
 * Hook para actualizar un producto existente
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }): Promise<Product> => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.categoryId) {
        updateData.category_id = Number(updates.categoryId);
        delete updateData.categoryId;
      }
      if ('markupPct' in updates) {
        updateData.markup_pct = updates.markupPct ?? null;
        delete updateData.markupPct;
      }

      const response = await api.patch<ApiProduct>(
        `/api/inventory/products/${id}`,
        updateData
      );
      return mapApiProductToProduct(response.data);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

/**
 * Hook para eliminar un producto
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/inventory/products/${id}`);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

export function useBulkMarkup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BulkMarkupInput): Promise<BulkMarkupResult> => {
      const payload: Record<string, unknown> = {
        scope: input.scope,
        markup_pct: input.markupPct,
      };

      if (input.scope === 'selected') {
        payload.product_ids = input.productIds.map(Number);
      }

      if (input.scope === 'category') {
        payload.category_id = input.categoryId;
      }

      const response = await api.post<ApiBulkMarkupResult>('/api/inventory/products/bulk-markup', payload);
      return mapApiBulkMarkupResult(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

/**
 * Hook para agregar una nueva categoría
 */
export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput): Promise<Category> => {
      const response = await api.post<ApiCategory>('/api/inventory/categories', input);
      return mapApiCategoryToCategory(response.data);
    },
    onSuccess: () => {
      // Invalidar query de categorías
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

/**
 * Hook para actualizar una categoría existente
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateCategoryInput> }): Promise<Category> => {
      const response = await api.patch<ApiCategory>(
        `/api/inventory/categories/${id}`,
        updates
      );
      return mapApiCategoryToCategory(response.data);
    },
    onSuccess: () => {
      // Invalidar queries de categorías
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

/**
 * Hook para eliminar una categoría
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/inventory/categories/${id}`);
    },
    onSuccess: () => {
      // Invalidar queries de categorías
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}
