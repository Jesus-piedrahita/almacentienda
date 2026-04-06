/**
 * @fileoverview Tests para el hook useSearchProducts.
 * Cubre: no dispara petición bajo el threshold, dispara con >=3 chars,
 * mapea correctamente ApiProduct -> Product.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSearchProducts, queryKeys } from './use-inventory';
import api from '@/lib/api';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Crea un QueryClient fresco sin retries para tests más rápidos */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

/** Wrapper que provee el QueryClient al hook */
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

const mockApiProduct = {
  id: 1,
  barcode: '7501234567890',
  name: 'Coca Cola 600ml',
  description: 'Refresco de cola',
  category_id: 2,
  category_name: 'Bebidas',
  price: 18.5,
  cost: 12.0,
  quantity: 50,
  min_stock: 10,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
  stock_status: 'good' as const,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useSearchProducts', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  it('does NOT call the API when query is shorter than 3 characters', async () => {
    const { result } = renderHook(
      () => useSearchProducts('ab'),
      { wrapper: makeWrapper(queryClient) }
    );

    // El hook queda en idle — fetchStatus = 'idle', status = 'pending'
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedApiGet).not.toHaveBeenCalled();
  });

  it('does NOT call the API for empty string', () => {
    renderHook(
      () => useSearchProducts(''),
      { wrapper: makeWrapper(queryClient) }
    );

    expect(mockedApiGet).not.toHaveBeenCalled();
  });

  it('does NOT call the API for exactly 2 characters', () => {
    renderHook(
      () => useSearchProducts('co'),
      { wrapper: makeWrapper(queryClient) }
    );

    expect(mockedApiGet).not.toHaveBeenCalled();
  });

  it('calls the API when query has exactly 3 characters', async () => {
    mockedApiGet.mockResolvedValueOnce({ data: [] });

    renderHook(
      () => useSearchProducts('coc'),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(mockedApiGet).toHaveBeenCalledWith(
        '/api/inventory/products/search',
        { params: { q: 'coc' } }
      );
    });
  });

  it('calls the API when query has more than 3 characters', async () => {
    mockedApiGet.mockResolvedValueOnce({ data: [] });

    renderHook(
      () => useSearchProducts('coca cola'),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(mockedApiGet).toHaveBeenCalledWith(
        '/api/inventory/products/search',
        { params: { q: 'coca cola' } }
      );
    });
  });

  it('maps ApiProduct[] to Product[] correctly', async () => {
    mockedApiGet.mockResolvedValueOnce({ data: [mockApiProduct] });

    const { result } = renderHook(
      () => useSearchProducts('coca'),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [product] = result.current.data!;
    expect(product.id).toBe('1');
    expect(product.barcode).toBe('7501234567890');
    expect(product.name).toBe('Coca Cola 600ml');
    expect(product.categoryId).toBe('2');
    expect(product.categoryName).toBe('Bebidas');
    expect(product.price).toBe(18.5);
    expect(product.cost).toBe(12.0);
    expect(product.quantity).toBe(50);
    expect(product.minStock).toBe(10);
    expect(product.createdAt).toBe('2026-01-01T00:00:00Z');
    expect(product.updatedAt).toBe('2026-01-02T00:00:00Z');
  });

  it('returns empty array when API returns no results', async () => {
    mockedApiGet.mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(
      () => useSearchProducts('xyz'),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('uses the correct query key for caching', () => {
    const key = queryKeys.search('coca');
    expect(key).toEqual(['products', 'search', 'coca']);
  });

  it('is in error state when API fails', async () => {
    mockedApiGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(
      () => useSearchProducts('coca'),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
