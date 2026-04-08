/**
 * @fileoverview Test de integración para DashboardPage con BarcodeSearchWidget.
 * Verifica que el widget está presente, arranca en idle, y que una búsqueda
 * completa pasa por el hook de inventario y alcanza la capa de HTTP (api.get).
 *
 * Estrategia de mocking:
 * - Para tests de presencia/estado inicial: mock de `useSearchProducts` (rápido).
 * - Para el test de boundary de API: mock de `@/lib/api` (axios) en lugar del hook,
 *   de modo que la cadena real DashboardPage → BarcodeSearchWidget → useSearchProducts
 *   → api.get se ejecuta y podemos verificar la URL del endpoint.
 */

import { render, screen, act, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DashboardPage } from './dashboard-page';
import * as inventoryHooks from '@/hooks/use-inventory';
import api from '@/lib/api';

// ── Mocks ────────────────────────────────────────────────────────────────────

// vi.hoisted() se ejecuta ANTES del hoisting de vi.mock, permitiendo
// capturar la implementación real del hook para el test de boundary.
const realHooks = vi.hoisted(() => ({
  useSearchProducts: undefined as undefined | ((...args: unknown[]) => unknown),
}));

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  realHooks.useSearchProducts = original.useSearchProducts as (...args: unknown[]) => unknown;
  return {
    ...original,
    useSearchProducts: vi.fn(),
  };
});

// Mock del cliente axios para el test que ejerce la capa real del hook
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (s: { user: { email: string } | null }) => unknown) =>
    selector({ user: { email: 'test@example.com' } }),
}));

const mockedUseSearchProducts = vi.mocked(inventoryHooks.useSearchProducts);
const mockedApiGet = vi.mocked(api.get);

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderDashboard(queryClient?: QueryClient) {
  const qc = queryClient ?? makeQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { ...render(<DashboardPage />, { wrapper: Wrapper }), qc };
}

const idleState = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: vi.fn(),
} as unknown as ReturnType<typeof inventoryHooks.useSearchProducts>;

// mockProducts con forma ApiProduct (para el test de boundary que usa api.get real)
const mockApiProducts = [
  {
    id: 1,
    barcode: '7501234567890',
    name: 'Coca Cola 600ml',
    description: 'Refresco',
    category_id: 2,
    category_name: 'Bebidas',
    price: 18.5,
    cost: 12,
    quantity: 50,
    min_stock: 10,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    stock_status: 'good' as const,
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DashboardPage integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedUseSearchProducts.mockReturnValue(idleState);
    mockedApiGet.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders the DashboardPage with the BarcodeSearchWidget present', () => {
    renderDashboard();

    expect(screen.getByTestId('barcode-search-widget')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /dashboard/i })
    ).toBeInTheDocument();
  });

  it('widget starts in idle-ready state: input available and idle hint shown', () => {
    renderDashboard();

    expect(screen.getByTestId('barcode-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('barcode-search-idle')).toBeInTheDocument();
  });

  it('input field is ready for keyboard/scanner entry on load', () => {
    renderDashboard();

    const input = screen.getByTestId('barcode-search-input');
    expect(input).not.toBeDisabled();
  });

  it('shows welcome message with user email', () => {
    renderDashboard();

    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
  });

  it('keeps manual input on regular keys and clears it only after Enter scanner submission', () => {
    renderDashboard();

    const input = screen.getByTestId('barcode-search-input') as HTMLInputElement;

    act(() => {
      fireEvent.change(input, { target: { value: '7501234567890' } });
    });
    expect(input.value).toBe('7501234567890');

    act(() => {
      fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });
    });
    expect(input.value).toBe('7501234567890');

    act(() => {
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });
    expect(input.value).toBe('');

    act(() => {
      fireEvent.change(input, { target: { value: '999888777666' } });
    });
    expect(input.value).toBe('999888777666');
  });

  it('does NOT render the old "Información del Sistema" static card', () => {
    renderDashboard();

    expect(
      screen.queryByText(/Información del Sistema/i)
    ).not.toBeInTheDocument();
  });

  /**
   * Test de boundary de integración real:
   * Verifica que la cadena DashboardPage → BarcodeSearchWidget → useSearchProducts (real hook)
   * → api.get alcanza el endpoint correcto `/api/inventory/products/search`.
   *
   * A diferencia del test anterior que mockeaba useSearchProducts (solo probaba invocación
   * del hook), este test restaura el hook real y mockea api.get (axios) directamente.
   * Así se verifica que el path completo hasta la capa HTTP está correctamente cableado.
   */
  it('search flow reaches inventory search endpoint /api/inventory/products/search via real hook chain', async () => {
    // Usar la implementación real del hook para ejercer la cadena completa
    // (no mockRestore() que no funciona con vi.mock — usamos mockImplementation con el original)
    mockedUseSearchProducts.mockImplementation(
      realHooks.useSearchProducts as typeof inventoryHooks.useSearchProducts
    );
    mockedApiGet.mockResolvedValue({ data: mockApiProducts });

    const { qc } = renderDashboard(makeQueryClient());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const input = screen.getByTestId('barcode-search-input') as HTMLInputElement;

    // Tipeo de un query de 4+ chars via fireEvent (compatible con fake timers)
    act(() => {
      fireEvent.change(input, { target: { value: 'coca' } });
    });

    // Dejar expirar el debounce de 300ms para que submittedQuery se actualice
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Avanzar todos los timers/microtasks restantes para que React Query dispare la query
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Verificar que api.get fue llamado con la URL del endpoint de búsqueda de inventario
    expect(mockedApiGet).toHaveBeenCalledWith(
      '/api/inventory/products/search',
      { params: { q: 'coca' } }
    );

    qc.clear();
  });
});
