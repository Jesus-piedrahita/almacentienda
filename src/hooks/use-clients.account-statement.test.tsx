import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import api from '@/lib/api';
import { invalidateOperationalQueries } from '@/lib/query-invalidation';
import { useClientCreditAccount, useMarkDebtPaid, useRegisterPayment } from './use-clients';

vi.mock('@/lib/query-invalidation', () => ({
  invalidateOperationalQueries: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);
const mockedApiPatch = vi.mocked(api.patch);
const mockedInvalidateOperationalQueries = vi.mocked(invalidateOperationalQueries);

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

describe('client credit account hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mapea cuenta corriente agrupada por venta', async () => {
    const queryClient = makeQueryClient();
    mockedApiGet.mockResolvedValueOnce({
      data: {
        client_id: 1,
        client_name: 'Juan Pérez',
        total_debt: 200,
        total_paid: 50,
        balance: 150,
        sales: [
          {
            sale_id: 10,
            sale_date: '2026-04-10T14:30:00Z',
            items: [{ product_name: 'Arroz', quantity: 2, unit_price: 25, total: 50 }],
            total_sale: 200,
            total_paid: 50,
            balance: 150,
            status: 'partial',
            payments: [{ id: 1, client_id: 1, sale_id: 10, amount: 50, payment_method: 'cash', created_at: '2026-04-10T15:00:00Z' }],
          },
        ],
      },
    });

    const { result } = renderHook(() => useClientCreditAccount('1'), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.clientId).toBe('1');
    expect(result.current.data?.sales[0].saleId).toBe('10');
    expect(result.current.data?.sales[0].items[0].productName).toBe('Arroz');
  });

  it('envía abono con sale_id nullable', async () => {
    const queryClient = makeQueryClient();
    mockedApiPost.mockResolvedValueOnce({
      data: {
        id: 1,
        client_id: 1,
      sale_id: null,
      amount: 100,
      payment_method: 'cash',
      note: 'Efectivo',
      created_at: '2026-04-10T15:00:00Z',
      },
    });

    const { result } = renderHook(() => useRegisterPayment('1'), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync({ saleId: null, amount: 100, note: 'Efectivo' });

    expect(mockedApiPost).toHaveBeenCalledWith('/api/clients/1/payments', {
      sale_id: null,
      amount: 100,
      payment_method: 'cash',
      reference_note: undefined,
      note: 'Efectivo',
    });
  });

  it('usa el shortcut legacy para marcar una deuda puntual como pagada', async () => {
    const queryClient = makeQueryClient();
    mockedApiPatch.mockResolvedValueOnce({ data: { message: 'Deuda marcada como pagada', debt_id: 15 } });

    const { result } = renderHook(() => useMarkDebtPaid(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync({ debtId: '15', clientId: '1' });

    expect(mockedApiPatch).toHaveBeenCalledWith('/api/clients/debts/15/pay');
    expect(mockedInvalidateOperationalQueries).toHaveBeenCalledWith(queryClient, {
      includeClients: true,
      includeReports: true,
      includeInventory: false,
      includeSales: false,
      clientId: '1',
    });
  });
});
