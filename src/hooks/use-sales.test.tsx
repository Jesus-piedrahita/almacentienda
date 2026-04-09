/**
 * @fileoverview Tests para los hooks de ventas.
 *
 * Cobertura:
 * - Mappers: conversión de types ApiSale* → Sale (number→string ids, Decimal→number, null handling)
 * - salesQueryKeys: estructura y forma de las claves
 * - useCreateSale: mutation dispara POST correcto e invalida caches
 * - useSales: query fetches GET /api/sales paginado
 * - useSale: query fetches GET /api/sales/:id, deshabilitada si id es falsy
 *
 * ```mermaid
 * flowchart TD
 *     A[Test: mappers] --> B[Conversión snake_case → camelCase]
 *     A --> C[number ids → string ids]
 *     A --> D[Decimal subtotals → number]
 *     A --> E[null cancelled_at → null cancelledAt]
 *     F[Test: query keys] --> G[salesQueryKeys shape]
 *     H[Test: useCreateSale] --> I[POST /api/sales]
 *     H --> J[invalidate sales + products + inventory-stats]
 *     K[Test: useSales] --> L[GET /api/sales con page param]
 *     M[Test: useSale] --> N[GET /api/sales/:id]
 *     M --> O[deshabilitada con id vacío]
 * ```
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { useCreateSale, useSales, useSale, salesQueryKeys, mapApiSaleToSale } from './use-sales';
import api from '@/lib/api';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockApiSaleItem = {
  id: 10,
  product_id: 99,
  product_name: 'Coca Cola 600ml',
  quantity: 2,
  unit_price: 18.5,
  subtotal: 37.0,
};

const mockApiSale = {
  id: 1,
  user_id: 5,
  state: 'completed' as const,
  payment_method: 'cash' as const,
  subtotal: 37.0,
  total: 42.92,
  created_at: '2026-04-09T12:00:00Z',
  cancelled_at: null,
  cancel_reason: null,
  items: [mockApiSaleItem],
};

const mockApiSalesListResponse = {
  data: [mockApiSale],
  pagination: {
    page: 1,
    limit: 20,
    total: 1,
    total_pages: 1,
  },
};

// ── Tests: Mappers ────────────────────────────────────────────────────────────

describe('mapApiSaleToSale', () => {
  it('convierte id numérico a string', () => {
    const sale = mapApiSaleToSale(mockApiSale);
    expect(sale.id).toBe('1');
  });

  it('convierte user_id numérico a string userId', () => {
    const sale = mapApiSaleToSale(mockApiSale);
    expect(sale.userId).toBe('5');
  });

  it('convierte subtotales Decimal (number) a number', () => {
    const sale = mapApiSaleToSale(mockApiSale);
    expect(sale.subtotal).toBe(37.0);
    expect(sale.total).toBe(42.92);
  });

  it('preserva campos null de cancelación', () => {
    const sale = mapApiSaleToSale(mockApiSale);
    expect(sale.cancelledAt).toBeNull();
    expect(sale.cancelReason).toBeNull();
  });

  it('mapea items correctamente con ids como string', () => {
    const sale = mapApiSaleToSale(mockApiSale);
    const item = sale.items[0];
    expect(item.id).toBe('10');
    expect(item.productId).toBe('99');
    expect(item.productName).toBe('Coca Cola 600ml');
    expect(item.quantity).toBe(2);
    expect(item.unitPrice).toBe(18.5);
    expect(item.subtotal).toBe(37.0);
  });

  it('mapea campos snake_case a camelCase correctamente', () => {
    const sale = mapApiSaleToSale(mockApiSale);
    expect(sale.paymentMethod).toBe('cash');
    expect(sale.createdAt).toBe('2026-04-09T12:00:00Z');
    expect(sale.state).toBe('completed');
  });

  it('mapea campos de cancelación cuando están presentes', () => {
    const cancelledSale = {
      ...mockApiSale,
      state: 'cancelled' as const,
      cancelled_at: '2026-04-09T13:00:00Z',
      cancel_reason: 'Stock insuficiente',
    };
    const sale = mapApiSaleToSale(cancelledSale);
    expect(sale.state).toBe('cancelled');
    expect(sale.cancelledAt).toBe('2026-04-09T13:00:00Z');
    expect(sale.cancelReason).toBe('Stock insuficiente');
  });
});

// ── Tests: Query Keys ─────────────────────────────────────────────────────────

describe('salesQueryKeys', () => {
  it('all es el array base ["sales"]', () => {
    expect(salesQueryKeys.all).toEqual(['sales']);
  });

  it('list incluye page en la key', () => {
    expect(salesQueryKeys.list(1)).toEqual(['sales', 'list', 1]);
    expect(salesQueryKeys.list(3)).toEqual(['sales', 'list', 3]);
  });

  it('detail incluye id en la key', () => {
    expect(salesQueryKeys.detail('42')).toEqual(['sales', '42']);
  });
});

// ── Tests: useCreateSale ──────────────────────────────────────────────────────

describe('useCreateSale', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  it('llama a POST /api/sales con payload snake_case correcto', async () => {
    mockedApiPost.mockResolvedValueOnce({ data: mockApiSale });

    const { result } = renderHook(() => useCreateSale(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync({
      paymentMethod: 'cash',
      items: [{ productId: '99', quantity: 2 }],
    });

    expect(mockedApiPost).toHaveBeenCalledWith('/api/sales', {
      payment_method: 'cash',
      items: [{ product_id: 99, quantity: 2 }],
    });
  });

  it('retorna Sale mapeado en camelCase después de mutación exitosa', async () => {
    mockedApiPost.mockResolvedValueOnce({ data: mockApiSale });

    const { result } = renderHook(() => useCreateSale(), {
      wrapper: makeWrapper(queryClient),
    });

    const sale = await result.current.mutateAsync({
      paymentMethod: 'cash',
      items: [{ productId: '99', quantity: 2 }],
    });

    expect(sale.id).toBe('1');
    expect(sale.paymentMethod).toBe('cash');
    expect(sale.total).toBe(42.92);
  });

  it('invalida salesQueryKeys.all en onSuccess', async () => {
    mockedApiPost.mockResolvedValueOnce({ data: mockApiSale });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateSale(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync({
      paymentMethod: 'cash',
      items: [{ productId: '99', quantity: 2 }],
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['sales'] })
    );
  });

  it('invalida ["products"] e ["inventory-stats"] en onSuccess', async () => {
    mockedApiPost.mockResolvedValueOnce({ data: mockApiSale });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateSale(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync({
      paymentMethod: 'cash',
      items: [{ productId: '99', quantity: 2 }],
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['products'] })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['inventory-stats'] })
    );
  });
});

// ── Tests: useSales ───────────────────────────────────────────────────────────

describe('useSales', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  it('llama a GET /api/sales con page y limit correctos', async () => {
    mockedApiGet.mockResolvedValueOnce({ data: mockApiSalesListResponse });

    renderHook(() => useSales(1), { wrapper: makeWrapper(queryClient) });

    await waitFor(() => expect(mockedApiGet).toHaveBeenCalled());

    expect(mockedApiGet).toHaveBeenCalledWith('/api/sales', {
      params: { page: 1, limit: 20 },
    });
  });

  it('mapea correctamente la respuesta paginada', async () => {
    mockedApiGet.mockResolvedValueOnce({ data: mockApiSalesListResponse });

    const { result } = renderHook(() => useSales(1), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].id).toBe('1');
    expect(result.current.data?.pagination.total).toBe(1);
    expect(result.current.data?.pagination.totalPages).toBe(1);
  });
});

// ── Tests: useSale ────────────────────────────────────────────────────────────

describe('useSale', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  it('llama a GET /api/sales/:id con el id correcto', async () => {
    mockedApiGet.mockResolvedValueOnce({ data: mockApiSale });

    renderHook(() => useSale('1'), { wrapper: makeWrapper(queryClient) });

    await waitFor(() => expect(mockedApiGet).toHaveBeenCalled());

    expect(mockedApiGet).toHaveBeenCalledWith('/api/sales/1');
  });

  it('retorna Sale mapeado en camelCase', async () => {
    mockedApiGet.mockResolvedValueOnce({ data: mockApiSale });

    const { result } = renderHook(() => useSale('1'), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe('1');
    expect(result.current.data?.userId).toBe('5');
  });

  it('NO llama a la API cuando id es string vacío', () => {
    renderHook(() => useSale(''), { wrapper: makeWrapper(queryClient) });

    expect(mockedApiGet).not.toHaveBeenCalled();
  });

  it('queda en fetchStatus idle cuando id es falsy', () => {
    const { result } = renderHook(() => useSale(''), {
      wrapper: makeWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
