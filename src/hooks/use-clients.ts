/**
 * @fileoverview React Query hooks para el módulo de clientes.
 * Proporciona fetching, caching y mutaciones para clientes y deudas.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUploadTransferProof } from '@/hooks/use-transfers';
import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
  ClientWithDebts,
  ClientStats,
  TopClient,
  ClientDebt,
  ClientCreditAccount,
  CreditSaleGroup,
  CreditSaleItem,
  DebtPayment,
  RegisterPaymentInput,
} from '@/types/clients';

// ============================================================
// Types de la API
// ============================================================

interface ApiClient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  rfc?: string;
  is_active: number;
  created_at: string;
  updated_at?: string;
}

interface ApiClientDebt {
  id: number;
  client_id: number;
  product_id: number;
  product_name: string;
  sale_id?: number | null;
  quantity: number;
  unit_price: number;
  total: number;
  is_paid: number;
  created_at: string;
  updated_at?: string;
}

interface ApiClientWithDebts {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  rfc?: string;
  is_active: number;
  created_at: string;
  debts: ApiClientDebt[];
  total_debt: number;
}

interface ApiTopClient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  total_debt: number;
  debt_count: number;
}

interface ApiClientStats {
  total_clients: number;
  active_clients: number;
  total_debt: number;
  clients_with_debt: number;
  top_clients: ApiTopClient[];
}

interface ApiDebtPayment {
  id: number;
  client_id: number;
  sale_id: number | null;
  amount: number;
  payment_method: 'cash' | 'transfer';
  transfer_proof_id?: number | null;
  transfer_status?: 'pending' | 'confirmed' | 'rejected' | null;
  transfer_proof_url?: string | null;
  reference_note?: string | null;
  note?: string;
  created_at: string;
}

interface ApiCreditSaleItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ApiCreditSaleGroup {
  sale_id: number | null;
  sale_date: string | null;
  label?: string;
  items: ApiCreditSaleItem[];
  total_sale: number;
  total_paid: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid';
  payments: ApiDebtPayment[];
}

interface ApiClientCreditAccount {
  client_id: number;
  client_name: string;
  total_debt: number;
  total_paid: number;
  balance: number;
  sales: ApiCreditSaleGroup[];
}

// ============================================================
// Mappers
// ============================================================

function mapApiClientToClient(apiClient: ApiClient): Client {
  return {
    id: String(apiClient.id),
    name: apiClient.name,
    email: apiClient.email,
    phone: apiClient.phone,
    address: apiClient.address,
    rfc: apiClient.rfc,
    isActive: apiClient.is_active,
    createdAt: apiClient.created_at,
    updatedAt: apiClient.updated_at,
  };
}

function mapApiClientDebtToClientDebt(apiDebt: ApiClientDebt): ClientDebt {
  return {
    id: String(apiDebt.id),
    clientId: String(apiDebt.client_id),
    productId: String(apiDebt.product_id),
    productName: apiDebt.product_name,
    saleId: apiDebt.sale_id !== undefined ? (apiDebt.sale_id !== null ? String(apiDebt.sale_id) : null) : undefined,
    quantity: apiDebt.quantity,
    unitPrice: Number(apiDebt.unit_price),
    total: Number(apiDebt.total),
    isPaid: apiDebt.is_paid,
    createdAt: apiDebt.created_at,
    updatedAt: apiDebt.updated_at,
  };
}

function mapApiDebtPayment(apiPayment: ApiDebtPayment): DebtPayment {
  return {
    id: String(apiPayment.id),
    clientId: String(apiPayment.client_id),
    saleId: apiPayment.sale_id !== null ? String(apiPayment.sale_id) : null,
    amount: Number(apiPayment.amount),
    paymentMethod: apiPayment.payment_method,
    transferProofId:
      apiPayment.transfer_proof_id !== undefined && apiPayment.transfer_proof_id !== null
        ? String(apiPayment.transfer_proof_id)
        : null,
    transferStatus: apiPayment.transfer_status ?? null,
    transferProofUrl: apiPayment.transfer_proof_url ?? null,
    referenceNote: apiPayment.reference_note ?? null,
    note: apiPayment.note,
    createdAt: apiPayment.created_at,
  };
}

function mapApiCreditSaleItem(apiItem: ApiCreditSaleItem): CreditSaleItem {
  return {
    productName: apiItem.product_name,
    quantity: apiItem.quantity,
    unitPrice: Number(apiItem.unit_price),
    total: Number(apiItem.total),
  };
}

function mapApiCreditSaleGroup(apiGroup: ApiCreditSaleGroup): CreditSaleGroup {
  return {
    saleId: apiGroup.sale_id !== null ? String(apiGroup.sale_id) : null,
    saleDate: apiGroup.sale_date,
    label: apiGroup.label,
    items: apiGroup.items.map(mapApiCreditSaleItem),
    totalSale: Number(apiGroup.total_sale),
    totalPaid: Number(apiGroup.total_paid),
    balance: Number(apiGroup.balance),
    status: apiGroup.status,
    payments: apiGroup.payments.map(mapApiDebtPayment),
  };
}

function mapApiClientCreditAccount(apiAccount: ApiClientCreditAccount): ClientCreditAccount {
  return {
    clientId: String(apiAccount.client_id),
    clientName: apiAccount.client_name,
    totalDebt: Number(apiAccount.total_debt),
    totalPaid: Number(apiAccount.total_paid),
    balance: Number(apiAccount.balance),
    sales: apiAccount.sales.map(mapApiCreditSaleGroup),
  };
}

function mapApiClientWithDebts(apiClient: ApiClientWithDebts): ClientWithDebts {
  return {
    id: String(apiClient.id),
    name: apiClient.name,
    email: apiClient.email,
    phone: apiClient.phone,
    address: apiClient.address,
    rfc: apiClient.rfc,
    isActive: apiClient.is_active,
    createdAt: apiClient.created_at,
    debts: apiClient.debts.map(mapApiClientDebtToClientDebt),
    totalDebt: Number(apiClient.total_debt),
  };
}

function mapApiTopClient(apiTop: ApiTopClient): TopClient {
  return {
    id: String(apiTop.id),
    name: apiTop.name,
    email: apiTop.email,
    phone: apiTop.phone,
    totalDebt: Number(apiTop.total_debt),
    debtCount: apiTop.debt_count,
  };
}

function mapApiClientStats(apiStats: ApiClientStats): ClientStats {
  return {
    totalClients: apiStats.total_clients,
    activeClients: apiStats.active_clients,
    totalDebt: Number(apiStats.total_debt),
    clientsWithDebt: apiStats.clients_with_debt,
    topClients: apiStats.top_clients.map(mapApiTopClient),
  };
}

// ============================================================
// Query Keys
// ============================================================

export const queryKeys = {
  clients: ['clients'] as const,
  client: (id: string) => ['clients', id] as const,
  clientDebts: (id: string) => ['clients', id, 'debts'] as const,
  clientCreditAccount: (id: string) => ['clients', id, 'credit-account'] as const,
  clientStats: ['clients', 'stats'] as const,
};

// ============================================================
// Hooks de Query
// ============================================================

/**
 * Hook para obtener todos los clientes
 */
export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: async (): Promise<Client[]> => {
      const response = await api.get<ApiClient[]>('/api/clients');
      return response.data.map(mapApiClientToClient);
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener un cliente por ID
 */
export function useClient(clientId: string) {
  return useQuery({
    queryKey: queryKeys.client(clientId),
    queryFn: async (): Promise<Client> => {
      const response = await api.get<ApiClient>(`/api/clients/${clientId}`);
      return mapApiClientToClient(response.data);
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook para obtener un cliente con sus deudas
 */
export function useClientWithDebts(clientId: string) {
  return useQuery({
    queryKey: queryKeys.clientDebts(clientId),
    queryFn: async (): Promise<ClientWithDebts> => {
      const response = await api.get<ApiClientWithDebts>(`/api/clients/${clientId}/debts`);
      return mapApiClientWithDebts(response.data);
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 1, // 1 minuto
  });
}

/**
 * Hook para obtener la cuenta corriente agrupada por venta del cliente.
 */
export function useClientCreditAccount(clientId: string) {
  return useQuery({
    queryKey: queryKeys.clientCreditAccount(clientId),
    queryFn: async (): Promise<ClientCreditAccount> => {
      const response = await api.get<ApiClientCreditAccount>(`/api/clients/${clientId}/credit-account`);
      return mapApiClientCreditAccount(response.data);
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * Hook para obtener estadísticas de clientes
 */
export function useClientStats() {
  return useQuery({
    queryKey: queryKeys.clientStats,
    queryFn: async (): Promise<ClientStats> => {
      const response = await api.get<ApiClientStats>('/api/clients/stats');
      return mapApiClientStats(response.data);
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

// ============================================================
// Hooks de Mutation
// ============================================================

/**
 * Hook para crear un nuevo cliente
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClientInput): Promise<Client> => {
      const response = await api.post<ApiClient>('/api/clients', input);
      return mapApiClientToClient(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientStats });
    },
  });
}

/**
 * Hook para actualizar un cliente
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateClientInput }): Promise<Client> => {
      const response = await api.patch<ApiClient>(`/api/clients/${id}`, updates);
      return mapApiClientToClient(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      queryClient.invalidateQueries({ queryKey: queryKeys.client(data.id) });
    },
  });
}

/**
 * Hook para eliminar un cliente
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientStats });
    },
  });
}

/**
 * Hook para marcar una deuda como pagada
 */
export function useMarkDebtPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (debtId: string): Promise<void> => {
      await api.patch(`/api/clients/debts/${debtId}/pay`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientStats });
    },
  });
}

/**
 * Hook para registrar un abono en la cuenta corriente del cliente.
 */
export function useRegisterPayment(clientId: string) {
  const queryClient = useQueryClient();
  const uploadTransferProof = useUploadTransferProof();

  return useMutation({
    mutationFn: async (input: RegisterPaymentInput): Promise<DebtPayment> => {
      const response = await api.post<ApiDebtPayment>(`/api/clients/${clientId}/payments`, {
        sale_id: input.saleId ? Number(input.saleId) : null,
        amount: input.amount,
        payment_method: input.paymentMethod ?? 'cash',
        reference_note: input.paymentMethod === 'transfer' ? input.referenceNote : undefined,
        note: input.note,
      });
      const payment = mapApiDebtPayment(response.data);

      if (input.paymentMethod === 'transfer' && input.transferFile && payment.transferProofId) {
        await uploadTransferProof.mutateAsync({
          proofId: payment.transferProofId,
          file: input.transferFile,
        });
      }

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientCreditAccount(clientId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientDebts(clientId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}
