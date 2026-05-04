/**
 * @fileoverview Contract tests para hooks públicos del dominio sales.
 *
 * Protegen el borde frontend↔backend en los casos más sensibles:
 * - listado con ventas transfer/cancelled
 * - listado filtrado con paginación camelCase
 * - createSale con flujo de upload + refresh para transferencias
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import api from '@/lib/api';
import { useCreateSale, useSales, useSalesFiltered } from './use-sales';

const uploadTransferProofMock = vi.fn();

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/hooks/use-transfers', () => ({
  useUploadTransferProof: () => ({
    mutateAsync: uploadTransferProofMock,
  }),
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const transferSaleApi = {
  id: 21,
  user_id: 9,
  client_id: null,
  client_name: null,
  state: 'completed' as const,
  payment_method: 'transfer' as const,
  transfer_proof_id: 44,
  transfer_status: 'pending' as const,
  transfer_proof_url: null,
  reference_note: 'REF-21',
  subtotal: 100,
  tax_total: 16,
  total: 116,
  created_at: '2026-05-01T12:00:00Z',
  cancelled_at: null,
  cancel_reason: null,
  items: [
    {
      id: 501,
      product_id: 12,
      product_name: 'Aceite 1L',
      quantity: 2,
      unit_price: 50,
      unit_cost: 33,
      subtotal: 100,
      tax_rate_snapshot: 0.16,
      tax_amount: 16,
    },
  ],
};

const cancelledSaleApi = {
  id: 22,
  user_id: 9,
  client_id: 3,
  client_name: 'Ana López',
  state: 'cancelled' as const,
  payment_method: 'credit' as const,
  transfer_proof_id: null,
  transfer_status: null,
  transfer_proof_url: null,
  reference_note: null,
  subtotal: 80,
  tax_total: 0,
  total: 80,
  created_at: '2026-05-01T10:00:00Z',
  cancelled_at: '2026-05-01T13:00:00Z',
  cancel_reason: 'Cliente anuló la compra',
  items: [
    {
      id: 502,
      product_id: 13,
      product_name: 'Arroz 1kg',
      quantity: 1,
      unit_price: 80,
      unit_cost: 60,
      subtotal: 80,
      tax_rate_snapshot: null,
      tax_amount: 0,
    },
  ],
};

describe('sales contract hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadTransferProofMock.mockResolvedValue({
      proof_id: 44,
      sale_id: 21,
      debt_payment_id: null,
      status: 'pending',
      proof_url: 'https://files.local/proof.png',
      proof_filename: 'proof.png',
      uploaded_at: '2026-05-01T12:05:00Z',
    });
  });

  it('useSales mantiene contrato camelCase para ventas transfer y cancelled', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: {
        data: [transferSaleApi, cancelledSaleApi],
        pagination: { page: 1, limit: 20, total: 2, total_pages: 1 },
      },
    });

    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useSales(1), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      data: [
        {
          id: '21',
          userId: '9',
          clientId: null,
          clientName: null,
          state: 'completed',
          paymentMethod: 'transfer',
          transferProofId: '44',
          transferStatus: 'pending',
          transferProofUrl: null,
          referenceNote: 'REF-21',
          subtotal: 100,
          taxTotal: 16,
          total: 116,
          createdAt: '2026-05-01T12:00:00Z',
          cancelledAt: null,
          cancelReason: null,
          items: [
            {
              id: '501',
              productId: '12',
              productName: 'Aceite 1L',
              quantity: 2,
              unitPrice: 50,
              unitCost: 33,
              subtotal: 100,
              taxRateSnapshot: 0.16,
              taxAmount: 16,
            },
          ],
        },
        {
          id: '22',
          userId: '9',
          clientId: '3',
          clientName: 'Ana López',
          state: 'cancelled',
          paymentMethod: 'credit',
          transferProofId: null,
          transferStatus: null,
          transferProofUrl: null,
          referenceNote: null,
          subtotal: 80,
          taxTotal: 0,
          total: 80,
          createdAt: '2026-05-01T10:00:00Z',
          cancelledAt: '2026-05-01T13:00:00Z',
          cancelReason: 'Cliente anuló la compra',
          items: [
            {
              id: '502',
              productId: '13',
              productName: 'Arroz 1kg',
              quantity: 1,
              unitPrice: 80,
              unitCost: 60,
              subtotal: 80,
              taxRateSnapshot: null,
              taxAmount: 0,
            },
          ],
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      },
    });
  });

  it('useSalesFiltered mantiene contrato de paginación camelCase', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: {
        data: [transferSaleApi],
        pagination: { page: 2, limit: 20, total: 21, total_pages: 2 },
      },
    });

    const queryClient = makeQueryClient();
    const { result } = renderHook(
      () => useSalesFiltered({ startDate: '2026-05-01', endDate: '2026-05-31', page: 2 }),
      {
        wrapper: makeWrapper(queryClient),
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiGet).toHaveBeenCalledWith('/api/sales', {
      params: {
        page: 2,
        limit: 20,
        start: '2026-05-01T00:00:00',
        end: '2026-05-31T23:59:59',
      },
    });
    expect(result.current.data?.pagination).toEqual({
      page: 2,
      limit: 20,
      total: 21,
      totalPages: 2,
    });
  });

  it('useCreateSale refresca y retorna contrato actualizado para transferencias con proof', async () => {
    mockedApiPost.mockResolvedValueOnce({ data: transferSaleApi });
    mockedApiGet.mockResolvedValueOnce({
      data: {
        ...transferSaleApi,
        transfer_status: 'confirmed',
        transfer_proof_url: 'https://files.local/proof-confirmed.png',
      },
    });

    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useCreateSale(), {
      wrapper: makeWrapper(queryClient),
    });
    const file = new File(['proof'], 'proof.png', { type: 'image/png' });

    const sale = await result.current.mutateAsync({
      paymentMethod: 'transfer',
      referenceNote: 'REF-21',
      transferFile: file,
      items: [{ productId: '12', quantity: 2 }],
    });

    expect(mockedApiPost).toHaveBeenCalledWith('/api/sales', {
      payment_method: 'transfer',
      reference_note: 'REF-21',
      items: [{ product_id: 12, quantity: 2 }],
    });
    expect(uploadTransferProofMock).toHaveBeenCalledWith({
      proofId: '44',
      file,
    });
    expect(mockedApiGet).toHaveBeenCalledWith('/api/sales/21');
    expect(sale).toEqual(
      expect.objectContaining({
        id: '21',
        paymentMethod: 'transfer',
        transferProofId: '44',
        transferStatus: 'confirmed',
        transferProofUrl: 'https://files.local/proof-confirmed.png',
        referenceNote: 'REF-21',
      })
    );
  });
});
