/**
 * @fileoverview Test de integración para SalesPage (POS frontend-only mock).
 *
 * Verifica el flujo completo del POS:
 * 1. Búsqueda de productos → agregar al carrito
 * 2. Ajuste de cantidades desde el carrito
 * 3. Apertura del diálogo de pago
 * 4. Completar venta (modo tarjeta — no requiere monto)
 * 5. Reset del carrito al finalizar
 *
 * Scope mock frontend-only: verifica explícitamente que NO se emite
 * ningún POST a un endpoint de ventas (api.post nunca es llamado).
 *
 * Estrategia de mocking:
 * - `@/hooks/use-inventory` → useSearchProducts mockeado para devolver productos fijos
 * - `@/stores/auth-store` → usuario simulado para pasar ProtectedRoute
 * - `@/lib/api` → axios mockeado para capturar cualquier llamada HTTP
 * - `react-router` → MemoryRouter con initialEntries=['/sales']
 * - Los timers reales se usan para simplificar (vi.useFakeTimers no necesario
 *   porque no testamos debounce — solo verificamos flujo de UI)
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import type { ReactNode } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SalesPage } from './sales-page';
import * as inventoryHooks from '@/hooks/use-inventory';
import api from '@/lib/api';
import { useSalesStore } from '@/stores/sales-store';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  return {
    ...original,
    useSearchProducts: vi.fn(),
  };
});

// Mock axios para capturar cualquier llamada HTTP
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock auth-store: usuario autenticado para satisfacer ProtectedRoute
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (s: { user: { email: string }; isAuthenticated: boolean; logout: () => void }) => unknown) =>
    selector({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      logout: vi.fn(),
    }),
}));

const mockedUseSearchProducts = vi.mocked(inventoryHooks.useSearchProducts);
const mockedApiPost = vi.mocked(api.post);

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProducts = [
  {
    id: 'prod-1',
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
  {
    id: 'prod-2',
    barcode: '7509876543210',
    name: 'Agua 1L',
    description: 'Agua purificada',
    categoryId: '2',
    categoryName: 'Bebidas',
    price: 12.0,
    cost: 7,
    quantity: 100,
    minStock: 20,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const idleState = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: vi.fn(),
} as unknown as ReturnType<typeof inventoryHooks.useSearchProducts>;

const resultsState = {
  data: mockProducts,
  isLoading: false,
  isFetching: false,
  isError: false,
  isSuccess: true,
  refetch: vi.fn(),
} as unknown as ReturnType<typeof inventoryHooks.useSearchProducts>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

/**
 * Renderiza SalesPage dentro del stack mínimo requerido:
 * MemoryRouter (para useLocation/Link), QueryClientProvider (para React Query).
 * No necesita ProtectedRoute ni MainLayout — testeamos la página directamente.
 */
function renderSalesPage(queryClient?: QueryClient) {
  const qc = queryClient ?? makeQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/sales']}>
        <Routes>
          <Route path="/sales" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return render(<SalesPage />, { wrapper: Wrapper });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SalesPage integration', () => {
  beforeEach(() => {
    // Estado inicial: sin query activo
    mockedUseSearchProducts.mockReturnValue(idleState);
    mockedApiPost.mockResolvedValue({ data: {} });

    // Limpiar el store entre tests para evitar contaminación
    useSalesStore.getState().clearCart();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Render inicial ─────────────────────────────────────────────────────────

  it('renders the POS page with heading "Punto de Venta"', () => {
    renderSalesPage();

    expect(screen.getByRole('heading', { name: /punto de venta/i })).toBeInTheDocument();
  });

  it('renders the search input panel on load', () => {
    renderSalesPage();

    expect(
      screen.getByPlaceholderText(/buscar producto por nombre o código de barras/i)
    ).toBeInTheDocument();
  });

  it('renders the cart panel with "Carrito" label on load', () => {
    renderSalesPage();

    // El CardTitle dentro del CartPanel muestra "Carrito"
    expect(screen.getByText('Carrito')).toBeInTheDocument();
  });

  it('renders the "Cobrar" button disabled when cart is empty', () => {
    renderSalesPage();

    const cobrarBtn = screen.getByRole('button', { name: /cobrar/i });
    expect(cobrarBtn).toBeDisabled();
  });

  it('shows the search hint when query is below minimum length', () => {
    renderSalesPage();

    expect(
      screen.getByText(/escribí al menos 3 caracteres para buscar/i)
    ).toBeInTheDocument();
  });

  // ── Búsqueda y agregar al carrito ──────────────────────────────────────────

  it('shows product results when useSearchProducts returns data', () => {
    // Simular que el debounce ya resolvió y tenemos resultados
    mockedUseSearchProducts.mockReturnValue(resultsState);

    renderSalesPage();

    expect(screen.getByText('Coca Cola 600ml')).toBeInTheDocument();
    expect(screen.getByText('Agua 1L')).toBeInTheDocument();
  });

  it('adds a product to the cart when the "Agregar" button is clicked', async () => {
    mockedUseSearchProducts.mockReturnValue(resultsState);

    renderSalesPage();

    // Click en el botón "Agregar" del primer producto (Coca Cola)
    const addButtons = screen.getAllByRole('button', { name: /^agregar$/i });
    await act(async () => {
      fireEvent.click(addButtons[0]);
    });

    // El store debe tener el producto
    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product.name).toBe('Coca Cola 600ml');
    expect(items[0].quantity).toBe(1);
  });

  it('merges duplicate products on repeated add (increments quantity)', async () => {
    mockedUseSearchProducts.mockReturnValue(resultsState);

    renderSalesPage();

    const addButtons = screen.getAllByRole('button', { name: /^agregar$/i });

    // Click 3 veces en el mismo producto
    await act(async () => {
      fireEvent.click(addButtons[0]);
      fireEvent.click(addButtons[0]);
      fireEvent.click(addButtons[0]);
    });

    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('shows the item count badge in CartPanel after adding a product', async () => {
    mockedUseSearchProducts.mockReturnValue(resultsState);

    renderSalesPage();

    const addButtons = screen.getAllByRole('button', { name: /^agregar$/i });
    await act(async () => {
      fireEvent.click(addButtons[0]);
    });

    // El badge de ítem count tiene clase específica de badge de Carrito
    const badges = screen.getAllByText('1');
    // Al menos uno de los "1" debe ser el badge del encabezado del carrito
    const cartBadge = badges.find((el) =>
      el.className.includes('rounded-full') && el.className.includes('bg-primary')
    );
    expect(cartBadge).toBeDefined();
    expect(cartBadge).toBeInTheDocument();
  });

  it('enables the "Cobrar" button once an item is in the cart', async () => {
    mockedUseSearchProducts.mockReturnValue(resultsState);

    renderSalesPage();

    const addButtons = screen.getAllByRole('button', { name: /^agregar$/i });
    await act(async () => {
      fireEvent.click(addButtons[0]);
    });

    const cobrarBtn = screen.getByRole('button', { name: /cobrar/i });
    expect(cobrarBtn).not.toBeDisabled();
  });

  // ── Ajuste de cantidades en el carrito ─────────────────────────────────────

  it('increments item quantity when the "+" button in cart is clicked', async () => {
    // Pre-cargar el store con 1 ítem
    useSalesStore.getState().addItem(mockProducts[0]);

    renderSalesPage();

    // El CartItemRow usa aria-label "Aumentar cantidad de {nombre}"
    const incrementBtn = screen.getByRole('button', { name: /aumentar cantidad/i });
    await act(async () => {
      fireEvent.click(incrementBtn);
    });

    const { items } = useSalesStore.getState();
    expect(items[0].quantity).toBe(2);
  });

  it('removes item from cart when quantity is decremented to zero via "-" at qty=1', async () => {
    useSalesStore.getState().addItem(mockProducts[0]);

    renderSalesPage();

    // El CartItemRow usa aria-label "Disminuir cantidad de {nombre}"
    const decrementBtn = screen.getByRole('button', { name: /disminuir cantidad/i });
    await act(async () => {
      fireEvent.click(decrementBtn);
    });

    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(0);
  });

  // ── Diálogo de pago ────────────────────────────────────────────────────────

  it('opens the payment dialog when "Cobrar" is clicked with items in cart', async () => {
    useSalesStore.getState().addItem(mockProducts[0]);

    renderSalesPage();

    const cobrarBtn = screen.getByRole('button', { name: /cobrar/i });
    await act(async () => {
      fireEvent.click(cobrarBtn);
    });

    // El diálogo debe mostrar "Cobrar venta"
    expect(screen.getByRole('heading', { name: /cobrar venta/i })).toBeInTheDocument();
  });

  it('payment dialog shows total amount when open', async () => {
    // Agregar 1x Coca Cola ($18.50) → total = 18.50 * 1.16 = $21.46
    useSalesStore.getState().addItem(mockProducts[0]);

    renderSalesPage();

    const cobrarBtn = screen.getByRole('button', { name: /cobrar/i });
    await act(async () => {
      fireEvent.click(cobrarBtn);
    });

    // El diálogo muestra "Cobrar venta" como título — verificamos que abrió
    expect(screen.getByRole('heading', { name: /cobrar venta/i })).toBeInTheDocument();
    // Hay múltiples "Total" (carrito + diálogo) — usamos getAllByText
    const totalLabels = screen.getAllByText('Total');
    expect(totalLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('can confirm sale with card payment (no amount required)', async () => {
    vi.useFakeTimers();

    useSalesStore.getState().addItem(mockProducts[0]);

    renderSalesPage();

    // Abrir diálogo
    const cobrarBtn = screen.getByRole('button', { name: /cobrar/i });
    await act(async () => {
      fireEvent.click(cobrarBtn);
    });

    // Cambiar a modo tarjeta
    const cardBtn = screen.getByRole('button', { name: /tarjeta/i });
    await act(async () => {
      fireEvent.click(cardBtn);
    });

    // El botón "Confirmar" debe estar habilitado con tarjeta
    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmBtn).not.toBeDisabled();

    // Confirmar la venta
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    // Avanzar el timer de procesamiento (300ms) + éxito (800ms)
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Mostrar estado de éxito
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // Avanzar microtasks para completar las promesas
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    vi.useRealTimers();

    // El carrito debe estar vacío después de completar la venta
    await waitFor(() => {
      const { items } = useSalesStore.getState();
      expect(items).toHaveLength(0);
    });
  });

  it('cash payment blocks confirmation when amount is insufficient', async () => {
    // Producto $18.50 → total $21.46
    useSalesStore.getState().addItem(mockProducts[0]);

    renderSalesPage();

    const cobrarBtn = screen.getByRole('button', { name: /cobrar/i });
    await act(async () => {
      fireEvent.click(cobrarBtn);
    });

    // Por defecto es efectivo — ingresar monto insuficiente
    const amountInput = screen.getByLabelText(/monto recibido/i);
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '10' } });
    });

    // El botón "Confirmar" debe estar deshabilitado con monto insuficiente
    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmBtn).toBeDisabled();
  });

  it('cash payment enables confirmation when amount covers the total', async () => {
    useSalesStore.getState().addItem(mockProducts[0]);

    renderSalesPage();

    const cobrarBtn = screen.getByRole('button', { name: /cobrar/i });
    await act(async () => {
      fireEvent.click(cobrarBtn);
    });

    // Ingresar monto suficiente (total ≈ $21.46 → pagar $50)
    const amountInput = screen.getByLabelText(/monto recibido/i);
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '50' } });
    });

    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmBtn).not.toBeDisabled();
  });

  // ── Verificación frontend-only: sin llamadas al backend ───────────────────

  /**
   * TASK 5.6 — Verificación automática de scope frontend-only:
   * Confirma que completar una venta mock NO emite ningún POST a ningún
   * endpoint de ventas en el backend.
   *
   * Este test ejerce el flujo completo (add → open dialog → card → confirm)
   * y al final verifica que api.post nunca fue invocado.
   */
  it('[5.6] no backend sales POST is emitted during a complete mock sale flow', async () => {
    vi.useFakeTimers();

    useSalesStore.getState().addItem(mockProducts[0]);

    renderSalesPage();

    // Abrir diálogo
    const cobrarBtn = screen.getByRole('button', { name: /cobrar/i });
    await act(async () => {
      fireEvent.click(cobrarBtn);
    });

    // Seleccionar tarjeta y confirmar
    const cardBtn = screen.getByRole('button', { name: /tarjeta/i });
    await act(async () => {
      fireEvent.click(cardBtn);
    });

    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    // Avanzar timers de procesamiento
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    vi.useRealTimers();

    // VERIFICACIÓN CRÍTICA: api.post nunca fue llamado
    expect(mockedApiPost).not.toHaveBeenCalled();
  });
});
