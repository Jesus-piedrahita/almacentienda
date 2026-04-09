/**
 * @fileoverview Tests unitarios para useExpiringProducts — graceful degradation.
 *
 * Verifica (REQ-4 / SCENARIO-3):
 * 1. El hook devuelve un array vacío cuando el backend responde 404.
 * 2. El hook devuelve un array vacío cuando el backend responde 501.
 * 3. El hook re-lanza errores inesperados (ej. 500).
 * 4. El hook devuelve los productos mapeados correctamente cuando el backend funciona.
 *
 * Estrategia de mocking:
 * - `@/lib/api` (instancia axios) se mockea con `vi.mock` para controlar las respuestas.
 * - `@tanstack/react-query` se usa con un QueryClient configurado con retry:false
 *   para evitar timeouts en los tests de error.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { useExpiringProducts } from './use-inventory';

// ── Mock de la instancia axios ────────────────────────────────────────────────

const mockGet = vi.fn();

vi.mock('@/lib/api', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

// ── Helper: error de Axios simulado ──────────────────────────────────────────

/**
 * Crea un error compatible con `isAxiosError` para simular respuestas HTTP.
 * isAxiosError verifica la propiedad `isAxiosError: true` en el objeto.
 */
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
        retry: false,       // No reintentar en tests
        gcTime: 0,          // Liberar caché inmediatamente
      },
    },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useExpiringProducts — graceful degradation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve [] cuando el backend responde 404 (endpoint no implementado)', async () => {
    mockGet.mockRejectedValueOnce(makeAxiosError(404));

    const qc = makeQueryClient();
    const { result } = renderHook(() => useExpiringProducts(), {
      wrapper: makeWrapper(qc),
    });

    // Esperar a que el query se resuelva
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('devuelve [] cuando el backend responde 501 (no implementado)', async () => {
    mockGet.mockRejectedValueOnce(makeAxiosError(501));

    const qc = makeQueryClient();
    const { result } = renderHook(() => useExpiringProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('re-lanza errores inesperados (500 Internal Server Error)', async () => {
    mockGet.mockRejectedValueOnce(makeAxiosError(500));

    const qc = makeQueryClient();
    const { result } = renderHook(() => useExpiringProducts(), {
      wrapper: makeWrapper(qc),
    });

    // El hook debe marcar el error sin swallow
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });

  it('re-lanza errores de red (sin response)', async () => {
    // Error de red puro: isAxiosError=true pero sin response
    const networkErr = new Error('Network Error') as Error & { isAxiosError: boolean };
    networkErr.isAxiosError = true;

    mockGet.mockRejectedValueOnce(networkErr);

    const qc = makeQueryClient();
    const { result } = renderHook(() => useExpiringProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });

  it('devuelve los productos mapeados cuando el backend funciona (200)', async () => {
    const apiResponse = {
      data: [
        {
          id: 42,
          name: 'Yogur Natural',
          expiration_date: '2026-04-15',
          days_remaining: 6,
          quantity: 3,
        },
      ],
    };
    mockGet.mockResolvedValueOnce(apiResponse);

    const qc = makeQueryClient();
    const { result } = renderHook(() => useExpiringProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      {
        id: '42',          // string (mapeado desde number)
        name: 'Yogur Natural',
        expiration_date: '2026-04-15',
        days_remaining: 6,
        quantity: 3,
      },
    ]);
  });

  it('devuelve [] cuando el backend devuelve una lista vacía (200 vacío)', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    const qc = makeQueryClient();
    const { result } = renderHook(() => useExpiringProducts(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});
