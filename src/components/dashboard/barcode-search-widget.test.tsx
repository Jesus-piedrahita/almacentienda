/**
 * @fileoverview Tests para BarcodeSearchWidget.
 * Cubre los 5 estados de UI + debounce 300ms + Enter-key inmediato.
 *
 * Estrategia:
 * - Para cambios de input usamos `fireEvent.change` (sincrónico con React).
 * - Para KeyDown usamos `fireEvent.keyDown`.
 * - Para fake timers usamos `vi.useFakeTimers` + `act(() => vi.advanceTimersByTime())`.
 * - Para acciones de click (retry) usamos `userEvent` con real timers.
 */

import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BarcodeSearchWidget } from './barcode-search-widget';
import * as inventoryHooks from '@/hooks/use-inventory';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  return {
    ...original,
    useSearchProducts: vi.fn(),
  };
});

const mockedUseSearchProducts = vi.mocked(inventoryHooks.useSearchProducts);

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function renderWidget(queryClient?: QueryClient) {
  const qc = queryClient ?? makeQueryClient();
  const Wrapper = makeWrapper(qc);
  return render(<BarcodeSearchWidget />, { wrapper: Wrapper });
}

/** Cambia el valor del input usando fireEvent.change (compatible con React state) */
function typeInInput(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
}

/** Presiona Enter en el input */
function pressEnter(input: HTMLElement) {
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', bubbles: true });
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const idleState = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: vi.fn(),
} as unknown as ReturnType<typeof inventoryHooks.useSearchProducts>;

const loadingState = {
  ...idleState,
  isLoading: true,
  isFetching: true,
} as unknown as ReturnType<typeof inventoryHooks.useSearchProducts>;

const errorState = {
  ...idleState,
  isError: true,
} as unknown as ReturnType<typeof inventoryHooks.useSearchProducts>;

const mockProducts = [
  {
    id: '1',
    barcode: '7501234567890',
    name: 'Coca Cola 600ml',
    description: 'Refresco',
    categoryId: '2',
    categoryName: 'Bebidas',
    price: 18.5,
    cost: 12,
    quantity: 50,
    minStock: 10,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

function resultsState(products = mockProducts) {
  return {
    ...idleState,
    data: products,
    isSuccess: true,
  } as unknown as ReturnType<typeof inventoryHooks.useSearchProducts>;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BarcodeSearchWidget', () => {
  beforeEach(() => {
    mockedUseSearchProducts.mockReturnValue(idleState);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Estado: idle ────────────────────────────────────────────────────────────

  it('renders in idle state on initial mount', () => {
    renderWidget();

    expect(screen.getByTestId('barcode-search-widget')).toBeInTheDocument();
    expect(screen.getByTestId('barcode-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('barcode-search-idle')).toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-results')).not.toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-empty')).not.toBeInTheDocument();
  });

  it('calls useSearchProducts with empty string on mount (below threshold)', () => {
    renderWidget();

    expect(mockedUseSearchProducts).toHaveBeenLastCalledWith('');
  });

  // ── Estado: loading ─────────────────────────────────────────────────────────

  it('shows loading indicator when hook returns loading state for active query', () => {
    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return loadingState;
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');
    typeInInput(input, 'coc');
    pressEnter(input);

    expect(screen.getByTestId('barcode-search-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-idle')).not.toBeInTheDocument();
  });

  // ── Estado: results ─────────────────────────────────────────────────────────

  it('shows results list when hook returns products for active query', () => {
    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return resultsState();
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');
    typeInInput(input, 'coc');
    pressEnter(input);

    expect(screen.getByTestId('barcode-search-results')).toBeInTheDocument();
    expect(screen.getByText('Coca Cola 600ml')).toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-idle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-error')).not.toBeInTheDocument();
  });

  it('renders product details: name, barcode, category, price', () => {
    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return resultsState();
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');
    typeInInput(input, 'coc');
    pressEnter(input);

    expect(screen.getByText('Coca Cola 600ml')).toBeInTheDocument();
    expect(screen.getByText(/7501234567890/)).toBeInTheDocument();
    expect(screen.getByText(/Bebidas/)).toBeInTheDocument();
  });

  // ── Estado: empty ────────────────────────────────────────────────────────────

  it('shows empty message when hook returns empty array', () => {
    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return resultsState([]);
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');
    typeInInput(input, 'xyz');
    pressEnter(input);

    expect(screen.getByTestId('barcode-search-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-results')).not.toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-idle')).not.toBeInTheDocument();
  });

  // ── Estado: error ─────────────────────────────────────────────────────────

  it('shows error state when hook returns isError', () => {
    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return errorState;
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');
    typeInInput(input, 'err');
    pressEnter(input);

    expect(screen.getByTestId('barcode-search-error')).toBeInTheDocument();
    expect(screen.getByText(/Error al buscar productos/i)).toBeInTheDocument();
    expect(screen.queryByTestId('barcode-search-idle')).not.toBeInTheDocument();
  });

  it('shows retry button in error state that calls refetch', async () => {
    const refetchMock = vi.fn();
    const errorWithRefetch = {
      ...errorState,
      refetch: refetchMock,
    } as unknown as ReturnType<typeof inventoryHooks.useSearchProducts>;

    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return errorWithRefetch;
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');
    typeInInput(input, 'err');
    pressEnter(input);

    const retryBtn = screen.getByText(/Intentar nuevamente/i);
    await userEvent.click(retryBtn);
    expect(refetchMock).toHaveBeenCalled();
  });

  // ── Debounce: 300ms ──────────────────────────────────────────────────────────

  it('does NOT pass qualifying query to hook before 300ms debounce expires', () => {
    vi.useFakeTimers();

    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return resultsState();
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');

    // Cambiar valor del input (onChange activa el debounce)
    act(() => {
      typeInInput(input, 'coc');
    });

    // Solo 299ms — debounce NO expiró
    act(() => {
      vi.advanceTimersByTime(299);
    });

    // La query enviada al hook sigue siendo '' (debouncedValue aún no propagó)
    const calls = mockedUseSearchProducts.mock.calls;
    const lastQuery = calls[calls.length - 1][0];
    expect(lastQuery).toBe('');

    vi.useRealTimers();
  });

  it('passes qualifying query to hook after 300ms debounce expires', () => {
    vi.useFakeTimers();

    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return resultsState();
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');

    act(() => {
      typeInInput(input, 'coc');
    });

    // 300ms completos — el debounce expira y debouncedQuery = 'coc'
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const calls = mockedUseSearchProducts.mock.calls;
    const hasQualifying = calls.some(([q]) => q.length >= 3);
    expect(hasQualifying).toBe(true);

    vi.useRealTimers();
  });

  // ── Enter key: trigger inmediato ─────────────────────────────────────────────

  it('triggers search immediately on Enter without waiting for debounce', () => {
    vi.useFakeTimers();

    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return resultsState();
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');

    // Escribir valor en el input (activa debounce pero NO lo deja expirar)
    act(() => {
      typeInInput(input, 'coc');
    });

    // Solo 10ms — debounce NO expiró
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Verificar que aún no hay query activa
    const callsBeforeEnter = mockedUseSearchProducts.mock.calls;
    const lastBeforeEnter = callsBeforeEnter[callsBeforeEnter.length - 1][0];
    expect(lastBeforeEnter).toBe('');

    // Enter key — debe setear debouncedQuery = 'coc' inmediatamente
    act(() => {
      pressEnter(input);
    });

    const callsAfterEnter = mockedUseSearchProducts.mock.calls;
    const hasQualifying = callsAfterEnter.some(([q]) => q.length >= 3);
    expect(hasQualifying).toBe(true);

    vi.useRealTimers();
  });

  it('returns to idle state when input is cleared after search', async () => {
    vi.useFakeTimers();

    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return resultsState();
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');

    // Paso 1: escribir en el input
    act(() => {
      typeInInput(input, 'coc');
    });

    // Paso 2: presionar Enter (lee inputValue = 'coc' actualizado)
    act(() => {
      pressEnter(input);
    });

    expect(screen.getByTestId('barcode-search-results')).toBeInTheDocument();

    // Paso 3: limpiar el input — el onChange reseteará submittedQuery inmediatamente
    // sin esperar el debounce de 300ms (el widget detecta val === '' en el handler).
    act(() => {
      typeInInput(input, '');
    });

    // El widget debería volver a idle inmediatamente al vaciarse el input
    expect(screen.getByTestId('barcode-search-idle')).toBeInTheDocument();

    vi.useRealTimers();
  });

  // ── Regression: stale query on Enter after previous search ──────────────────

  it('regression: Enter with same-length new query sends new query, not previous one', () => {
    // Verifica que la query anterior no "contamina" una búsqueda nueva por Enter
    // cuando el nuevo query tiene la misma longitud que el anterior.
    // Esto fue el bug central reportado en verify-report.md (High severity).
    vi.useFakeTimers();

    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return resultsState();
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');

    // Paso 1: búsqueda inicial por debounce ('coc' → 3 chars)
    act(() => {
      typeInInput(input, 'coc');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Confirmar que se llamó con 'coc'
    expect(mockedUseSearchProducts.mock.calls.some(([q]) => q === 'coc')).toBe(true);

    // Paso 2: cambiar input a otro query de IGUAL longitud ('xyz')
    act(() => {
      typeInInput(input, 'xyz');
    });

    // Solo 10ms — debounce NO expiró para 'xyz'
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Paso 3: presionar Enter — debe enviar 'xyz', NO reutilizar 'coc'
    act(() => {
      pressEnter(input);
    });

    const calls = mockedUseSearchProducts.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toBe('xyz');

    vi.useRealTimers();
  });

  it('regression: Enter with shorter new query sends new query immediately', () => {
    // Verifica que pressing Enter con un query MÁS CORTO que el anterior debounced
    // envía el nuevo query, no deja el viejo activo.
    vi.useFakeTimers();

    mockedUseSearchProducts.mockImplementation((query: string) => {
      if (query.length >= 3) return resultsState();
      return idleState;
    });

    renderWidget();

    const input = screen.getByTestId('barcode-search-input');

    // Paso 1: búsqueda inicial por debounce con query largo ('cocacola' → 8 chars)
    act(() => {
      typeInInput(input, 'cocacola');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockedUseSearchProducts.mock.calls.some(([q]) => q === 'cocacola')).toBe(true);

    // Paso 2: cambiar a query MÁS CORTO ('agu' → 3 chars)
    act(() => {
      typeInInput(input, 'agu');
    });

    // Solo 10ms — debounce NO expiró para 'agu'
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Paso 3: Enter — debe enviar 'agu', NO 'cocacola'
    act(() => {
      pressEnter(input);
    });

    const calls = mockedUseSearchProducts.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toBe('agu');

    vi.useRealTimers();
  });
});
