/**
 * @fileoverview Tests unitarios para mapApiProductToProduct — campo expiration_date.
 *
 * Verifica que el mapper pase correctamente el campo opcional `expiration_date`
 * desde el payload de la API hasta el tipo `Product` del dominio.
 *
 * Estrategia: Se usa `useSearchProducts` como proxy público del mapper porque
 * `mapApiProductToProduct` es una función privada del módulo. La cobertura es
 * equivalente ya que el mapper es llamado directamente por el hook.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { useSearchProducts } from './use-inventory';

// ── Mock de la instancia axios ────────────────────────────────────────────────

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '@/lib/api';
const mockedApiGet = vi.mocked(api.get);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
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

/** Fixture base de ApiProduct sin expiration_date */
const baseApiProduct = {
  id: 10,
  barcode: '7501000000001',
  name: 'Leche Entera 1L',
  description: 'Leche pasteurizada',
  category_id: 3,
  category_name: 'Lácteos',
  price: 22.0,
  cost: 15.0,
  quantity: 30,
  min_stock: 5,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-16T00:00:00Z',
  stock_status: 'good' as const,
};

// ── Tests: mapApiProductToProduct — expiration_date ───────────────────────────

describe('mapApiProductToProduct — campo expiration_date', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  it('incluye expiration_date en el producto mapeado cuando la API lo devuelve', async () => {
    const apiProductWithDate = {
      ...baseApiProduct,
      expiration_date: '2026-09-30',
    };
    mockedApiGet.mockResolvedValueOnce({ data: [apiProductWithDate] });

    const { result } = renderHook(
      () => useSearchProducts('leche'),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [product] = result.current.data!;
    expect(product.expiration_date).toBe('2026-09-30');
  });

  it('deja expiration_date como undefined cuando la API no lo devuelve', async () => {
    // Sin campo expiration_date en el objeto de la API
    mockedApiGet.mockResolvedValueOnce({ data: [baseApiProduct] });

    const { result } = renderHook(
      () => useSearchProducts('leche'),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [product] = result.current.data!;
    expect(product.expiration_date).toBeUndefined();
  });

  it('mantiene todos los demás campos correctamente al mapear con expiration_date', async () => {
    const apiProductWithDate = {
      ...baseApiProduct,
      expiration_date: '2026-12-01',
    };
    mockedApiGet.mockResolvedValueOnce({ data: [apiProductWithDate] });

    const { result } = renderHook(
      () => useSearchProducts('leche'),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [product] = result.current.data!;
    // Campos existentes no deben verse afectados
    expect(product.id).toBe('10');
    expect(product.barcode).toBe('7501000000001');
    expect(product.name).toBe('Leche Entera 1L');
    expect(product.categoryId).toBe('3');
    expect(product.price).toBe(22.0);
    expect(product.quantity).toBe(30);
    // Campo nuevo
    expect(product.expiration_date).toBe('2026-12-01');
  });
});
