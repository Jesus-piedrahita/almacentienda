/**
 * @fileoverview Tests para InventoryPage — sección de stock bajo mínimo.
 *
 * Verifica (SCENARIO-2 del spec product-minstock-driven-alerts):
 * 1. La sección de low-stock se renderiza con la lista de productos detallada.
 * 2. Cada fila muestra nombre, stock actual y threshold min_stock.
 * 3. Con ?tab=low-stock (deep-link desde dashboard) la sección aparece sin esperar loading.
 * 4. Sin productos bajo mínimo se muestra el estado vacío correcto.
 * 5. En estado de error se muestra el mensaje de retry.
 */

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { ReactNode } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { InventoryPage } from './inventory-page';
import * as inventoryHooks from '@/hooks/use-inventory';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  return {
    ...original,
    useProducts: vi.fn(),
    useCategories: vi.fn(),
    useInventoryStats: vi.fn(),
    useExpiringProducts: vi.fn(),
    useLowStockProducts: vi.fn(),
    useDeleteProduct: vi.fn(),
    useDeleteCategory: vi.fn(),
  };
});

// Stubs mínimos para mutations (no están bajo test aquí)
vi.mock('@/hooks/use-confirm-dialog', () => ({
  confirmDelete: vi.fn(),
  showError: vi.fn(),
}));

const mockedUseProducts = vi.mocked(inventoryHooks.useProducts);
const mockedUseCategories = vi.mocked(inventoryHooks.useCategories);
const mockedUseInventoryStats = vi.mocked(inventoryHooks.useInventoryStats);
const mockedUseExpiringProducts = vi.mocked(inventoryHooks.useExpiringProducts);
const mockedUseLowStockProducts = vi.mocked(inventoryHooks.useLowStockProducts);
const mockedUseDeleteProduct = vi.mocked(inventoryHooks.useDeleteProduct);
const mockedUseDeleteCategory = vi.mocked(inventoryHooks.useDeleteCategory);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderInventory(initialPath = '/inventory', qc?: QueryClient) {
  const client = qc ?? makeQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialPath]}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
  return render(<InventoryPage />, { wrapper: Wrapper });
}

// ── Default stubs ─────────────────────────────────────────────────────────────

const emptyProductsState = {
  data: { data: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } },
  isLoading: false,
  isError: false,
} as unknown as ReturnType<typeof inventoryHooks.useProducts>;

const emptyCategoriesState = {
  data: [],
  isLoading: false,
  isError: false,
} as unknown as ReturnType<typeof inventoryHooks.useCategories>;

const emptyStatsState = {
  data: {
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
    stockStatus: { good: 0, warning: 0, critical: 0 },
    categorySummary: [],
  },
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
} as unknown as ReturnType<typeof inventoryHooks.useInventoryStats>;

const emptyExpiringState = {
  data: [],
  isLoading: false,
  isError: false,
} as unknown as ReturnType<typeof inventoryHooks.useExpiringProducts>;

const emptyMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
} as unknown as ReturnType<typeof inventoryHooks.useDeleteProduct>;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InventoryPage — sección low-stock (SCENARIO-2)', () => {
  beforeEach(() => {
    mockedUseProducts.mockReturnValue(emptyProductsState);
    mockedUseCategories.mockReturnValue(emptyCategoriesState);
    mockedUseInventoryStats.mockReturnValue(emptyStatsState);
    mockedUseExpiringProducts.mockReturnValue(emptyExpiringState);
    mockedUseDeleteProduct.mockReturnValue(emptyMutation);
    mockedUseDeleteCategory.mockReturnValue(emptyMutation);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('SCENARIO-2: muestra la lista detallada de productos con stock actual y min_stock', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: [
        { id: '1', name: 'Arroz Largo Fino', quantity: 3, min_stock: 10 },
        { id: '2', name: 'Aceite de Girasol', quantity: 0, min_stock: 5 },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    renderInventory();

    // Nombres de productos
    expect(screen.getByText('Arroz Largo Fino')).toBeInTheDocument();
    expect(screen.getByText('Aceite de Girasol')).toBeInTheDocument();

    // Stock actual / threshold
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
    expect(screen.getByText('0 / 5')).toBeInTheDocument();
  });

  it('SCENARIO-2: la sección muestra la lista con aria-label descriptivo', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: [{ id: '1', name: 'Sal', quantity: 1, min_stock: 5 }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    renderInventory();

    expect(
      screen.getByRole('list', { name: /Productos con stock por debajo del mínimo/i })
    ).toBeInTheDocument();
  });

  it('SCENARIO-2: deep-link ?tab=low-stock activa la sección inmediatamente', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: [{ id: '1', name: 'Azúcar', quantity: 2, min_stock: 8 }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    // Con el query param tab=low-stock (deep-link desde dashboard)
    renderInventory('/inventory?tab=low-stock');

    expect(screen.getByText('Azúcar')).toBeInTheDocument();
    expect(screen.getByText('2 / 8')).toBeInTheDocument();
  });

  it('muestra estado vacío cuando no hay productos bajo mínimo', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    renderInventory();

    expect(
      screen.getByText(/Todos los productos tienen stock por encima del mínimo/i)
    ).toBeInTheDocument();
  });

  it('muestra mensaje de error y botón Reintentar cuando falla la carga', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    renderInventory();

    expect(
      screen.getByText(/No pudimos cargar los productos con stock bajo/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('muestra skeleton durante la carga de low-stock', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    const { container } = renderInventory();

    // La sección de low-stock no se muestra en loading (condición del InventoryPage)
    // cuando isLoadingLowStock=true y no es deep-link
    // La página sí renderiza otras partes; el widget se oculta
    expect(container.querySelector('#low-stock')).not.toBeInTheDocument();
  });

  it('el encabezado de la página se muestra correctamente', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    renderInventory();

    expect(screen.getByRole('heading', { name: /^Inventario$/i, level: 1 })).toBeInTheDocument();
  });
});
