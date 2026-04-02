/**
 * @fileoverview React Query hooks para el módulo de clientes.
 * Proporciona fetching, caching y mutaciones para clientes y deudas.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Client, CreateClientInput, UpdateClientInput, ClientWithDebts, ClientStats, TopClient, ClientDebt } from '@/types/clients';

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
    quantity: apiDebt.quantity,
    unitPrice: Number(apiDebt.unit_price),
    total: Number(apiDebt.total),
    isPaid: apiDebt.is_paid,
    createdAt: apiDebt.created_at,
    updatedAt: apiDebt.updated_at,
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
