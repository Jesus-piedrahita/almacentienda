/**
 * @fileoverview Tests para useLowStockProducts — success, empty y error states.
 *
 * Verifica:
 * 1. Devuelve los productos mapeados correctamente cuando el backend funciona (200).
 * 2. Devuelve [] cuando el backend devuelve lista vacía.
 * 3. Devuelve [] cuando el backend responde 404 (graceful degradation).
 * 4. Devuelve [] cuando el backend responde 501.
 * 5. Re-lanza errores inesperados (500).
 * 6. Re-lanza errores de red (sin response).
 * 7. Usa el query key correcto para caché.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { useLowStockProducts, queryKeys } from './use-inventory';

// ── Mock de la instancia axios ────────────────────────────────────────────────

const mockGet = vi.fn();

vi.mock('@/lib/api', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

// ── Helper: error de Axios simulado ──────────────────────────────────────────

function makeAxiosError(status: number): Error & { isAxiosError: boolean; response: { status: number } } {
  const err = new Error(`Request failed with status code ${status}`) as Error & {
    isAxiosError: boolean;
    response: { status: number };
  };
  err.isAxiosError = true;
  err.response = { status };
  return err;
}

// ── Helpers de test ───────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// ── Fixture ───────────────────────────────────────────────────────────────────

const mockApiLowStockProduct = {
  id: 7,
  name: 'Arroz Largo Fino',
  quantity: 3,
  min_stock: 10,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useLowStockProducts — success states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve los productos mapeados cuando el backend responde 200', async () => {
    mockGet.mockResolvedValueOnce({ data: [mockApiLowStockProduct] });

    const qc = makeQueryClient();
    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      {
        id: '7',
        name: 'Arroz Largo Fino',
        quantity: 3,
        min_stock: 10,
      },
    ]);
  });

  it('mapea id numérico a string', async () => {
    mockGet.mockResolvedValueOnce({ data: [mockApiLowStockProduct] });

    const qc = makeQueryClient();
    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(typeof result.current.data![0].id).toBe('string');
  });

  it('devuelve [] cuando el backend devuelve lista vacía (200)', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    const qc = makeQueryClient();
    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('usa el query key correcto para caché', () => {
    expect(queryKeys.lowStock).toEqual(['inventory-low-stock']);
  });
});

describe('useLowStockProducts — graceful degradation (404/501)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve [] cuando el backend responde 404 (endpoint no disponible)', async () => {
    mockGet.mockRejectedValueOnce(makeAxiosError(404));

    const qc = makeQueryClient();
    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('devuelve [] cuando el backend responde 501 (no implementado)', async () => {
    mockGet.mockRejectedValueOnce(makeAxiosError(501));

    const qc = makeQueryClient();
    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});

describe('useLowStockProducts — error states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('re-lanza errores inesperados (500 Internal Server Error)', async () => {
    mockGet.mockRejectedValueOnce(makeAxiosError(500));

    const qc = makeQueryClient();
    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });

  it('re-lanza errores de red sin response', async () => {
    const networkErr = new Error('Network Error') as Error & { isAxiosError: boolean };
    networkErr.isAxiosError = true;

    mockGet.mockRejectedValueOnce(networkErr);

    const qc = makeQueryClient();
    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });

  it('devuelve isLoading=true en la carga inicial', () => {
    // Delay de resolución para capturar estado de loading
    mockGet.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 500))
    );

    const qc = makeQueryClient();
    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: makeWrapper(qc),
    });

    // Inmediatamente debería estar en loading
    expect(result.current.isLoading).toBe(true);
  });
});
