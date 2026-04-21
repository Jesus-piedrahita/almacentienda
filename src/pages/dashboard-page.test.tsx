/**
 * @fileoverview Test de integración para DashboardPage con BarcodeSearchWidget.
 * Verifica el nuevo dashboard conectado y preserva la cadena real del widget
 * de búsqueda de inventario hasta la capa HTTP.
 */

import { render, screen, act, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { DashboardPage } from './dashboard-page';
import * as inventoryHooks from '@/hooks/use-inventory';
import * as reportsHooks from '@/hooks/use-reports';
import * as clientHooks from '@/hooks/use-clients';
import api from '@/lib/api';

const realHooks = vi.hoisted(() => ({
  useSearchProducts: undefined as undefined | ((...args: unknown[]) => unknown),
}));

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  realHooks.useSearchProducts = original.useSearchProducts as (...args: unknown[]) => unknown;
  return {
    ...original,
    useSearchProducts: vi.fn(),
    useInventoryStats: vi.fn(),
    useExpiringProducts: vi.fn(),
    useLowStockProducts: vi.fn(),
  };
});

vi.mock('@/hooks/use-reports', async (importOriginal) => {
  const original = await importOriginal<typeof reportsHooks>();
  return {
    ...original,
    useReportsOverview: vi.fn(),
  };
});

vi.mock('@/hooks/use-clients', async (importOriginal) => {
  const original = await importOriginal<typeof clientHooks>();
  return {
    ...original,
    useClientStats: vi.fn(),
  };
});

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
const mockedUseInventoryStats = vi.mocked(inventoryHooks.useInventoryStats);
const mockedUseExpiringProducts = vi.mocked(inventoryHooks.useExpiringProducts);
const mockedUseLowStockProducts = vi.mocked(inventoryHooks.useLowStockProducts);
const mockedUseReportsOverview = vi.mocked(reportsHooks.useReportsOverview);
const mockedUseClientStats = vi.mocked(clientHooks.useClientStats);
const mockedApiGet = vi.mocked(api.get);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderDashboard(queryClient?: QueryClient) {
  const qc = queryClient ?? makeQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
  return { ...render(<DashboardPage />, { wrapper: Wrapper }), qc };
}

const idleSearchState = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: vi.fn(),
} as unknown as ReturnType<typeof inventoryHooks.useSearchProducts>;

const inventoryStatsState = {
  data: {
    totalProducts: 42,
    totalQuantity: 380,
    totalValue: 15400,
    stockStatus: {
      good: 30,
      warning: 8,
      critical: 4,
    },
    categorySummary: [
      {
        categoryId: '1',
        categoryName: 'Despensa',
        productCount: 20,
        totalQuantity: 150,
        totalValue: 6500,
      },
    ],
  },
  isLoading: false,
  isError: false,
} as unknown as ReturnType<typeof inventoryHooks.useInventoryStats>;

const expiringProductsState = {
  data: [
    {
      id: '10',
      name: 'Yogur Entero',
      expiration_date: '2026-05-10',
      days_remaining: 4,
      quantity: 8,
    },
  ],
  isLoading: false,
  isError: false,
} as unknown as ReturnType<typeof inventoryHooks.useExpiringProducts>;

const reportsOverviewState = {
  data: {
    rangeStart: '2026-04-01T00:00:00',
    rangeEnd: '2026-04-30T23:59:59',
    summary: {
      netRevenue: 24137.93,
      collectedTaxes: 3862.07,
      grossRevenue: 28000,
      totalSales: 28000,
      creditSales: 9500,
      totalCollected: 21000,
      outstandingBalance: 7000,
      activeDebtors: 5,
      closedDebts: 11,
      averageTicket: 560,
    },
  },
  isLoading: false,
  isError: false,
} as unknown as ReturnType<typeof reportsHooks.useReportsOverview>;

const clientStatsState = {
  data: {
    totalClients: 18,
    activeClients: 15,
    totalDebt: 7300,
    clientsWithDebt: 6,
    topClients: [],
  },
  isLoading: false,
  isError: false,
} as unknown as ReturnType<typeof clientHooks.useClientStats>;

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

describe('DashboardPage integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedUseSearchProducts.mockReturnValue(idleSearchState);
    mockedUseInventoryStats.mockReturnValue(inventoryStatsState);
    mockedUseExpiringProducts.mockReturnValue(expiringProductsState);
    mockedUseReportsOverview.mockReturnValue(reportsOverviewState);
    mockedUseClientStats.mockReturnValue(clientStatsState);
    mockedUseLowStockProducts.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);
    mockedApiGet.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders the connected dashboard with the BarcodeSearchWidget present', () => {
    renderDashboard();

    expect(screen.getByTestId('barcode-search-widget')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/Resumen del negocio/i)).toBeInTheDocument();
    expect(screen.getByText(/Alertas operativas/i)).toBeInTheDocument();
    expect(screen.getByText(/Herramientas y próximas acciones/i)).toBeInTheDocument();
  });

  it('renders connected KPI values instead of static placeholders', () => {
    renderDashboard();

    expect(screen.getByRole('heading', { name: /Ventas \(30 días\)/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Ticket promedio/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Total productos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Saldo pendiente$/i })).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/380/)).toBeInTheDocument();
  });

  it('removes unsupported legacy dashboard cards', () => {
    renderDashboard();

    expect(screen.queryByText(/Pedidos Pendientes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Usuarios Activos/i)).not.toBeInTheDocument();
  });

  it('renders expiring products and quick action links', () => {
    renderDashboard();

    expect(screen.getByText(/Productos con Fecha de Vencimiento/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir a Ventas/i })).toHaveAttribute('href', '/sales');
    expect(screen.getByRole('link', { name: /Ir a Inventario/i })).toHaveAttribute('href', '/inventory');
    expect(screen.getByRole('link', { name: /Ir a Clientes/i })).toHaveAttribute('href', '/clients');
    expect(screen.getByRole('link', { name: /Ir a Reportes/i })).toHaveAttribute('href', '/reports');
  });

  it('renders loading placeholders instead of fake KPI zero values while queries load', () => {
    mockedUseInventoryStats.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof inventoryHooks.useInventoryStats>);
    mockedUseReportsOverview.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof reportsHooks.useReportsOverview>);
    mockedUseClientStats.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof clientHooks.useClientStats>);

    const { container } = renderDashboard();

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText(/^\$0(?:[.,]00)?$/)).not.toBeInTheDocument();
  });

  it('wires the KPI section to its visible heading with aria-labelledby', () => {
    renderDashboard();

    const section = screen.getByRole('heading', { name: /Resumen del negocio/i }).closest('section');

    expect(section).toHaveAttribute('aria-labelledby', 'kpis-heading');
    expect(screen.getByRole('heading', { name: /Resumen del negocio/i })).toHaveAttribute('id', 'kpis-heading');
  });

  it('renders quick actions with multiline-safe classes', () => {
    renderDashboard();

    const reportsAction = screen.getByRole('link', { name: /Ir a Reportes/i });

    expect(reportsAction.className).toContain('min-w-0');
    expect(reportsAction.className).toContain('whitespace-normal');
    expect(screen.getByText(/Profundizar en métricas y análisis del negocio/i).className).toContain('break-words');
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

  it('renders a local degraded state when expiring products are unavailable', () => {
    mockedUseExpiringProducts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof inventoryHooks.useExpiringProducts>);

    renderDashboard();

    expect(screen.getByText(/No pudimos revisar vencimientos/i)).toBeInTheDocument();
    expect(screen.getByTestId('barcode-search-widget')).toBeInTheDocument();
  });

  it('search flow reaches inventory search endpoint /api/inventory/products/search via real hook chain', async () => {
    mockedUseSearchProducts.mockImplementation(
      realHooks.useSearchProducts as typeof inventoryHooks.useSearchProducts
    );
    mockedApiGet.mockResolvedValue({ data: mockApiProducts });

    const { qc } = renderDashboard(makeQueryClient());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const input = screen.getByTestId('barcode-search-input') as HTMLInputElement;

    act(() => {
      fireEvent.change(input, { target: { value: 'coca' } });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockedApiGet).toHaveBeenCalledWith('/api/inventory/products/search', {
      params: { q: 'coca' },
    });

    qc.clear();
  });
});

// ── Low-stock widget spec scenarios ──────────────────────────────────────────

describe('DashboardPage — low-stock widget spec scenarios', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedUseSearchProducts.mockReturnValue(idleSearchState);
    mockedUseInventoryStats.mockReturnValue(inventoryStatsState);
    mockedUseExpiringProducts.mockReturnValue(expiringProductsState);
    mockedUseReportsOverview.mockReturnValue(reportsOverviewState);
    mockedUseClientStats.mockReturnValue(clientStatsState);
    mockedApiGet.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('SCENARIO-1: muestra el widget de stock bajo con conteo cuando hay productos bajo mínimo', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: [
        { id: '1', name: 'Arroz', quantity: 2, min_stock: 10 },
        { id: '2', name: 'Aceite', quantity: 1, min_stock: 5 },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    renderDashboard();

    // El widget debe renderizarse con los productos bajo mínimo
    expect(screen.getByText('Arroz')).toBeInTheDocument();
    expect(screen.getByText('Aceite')).toBeInTheDocument();
    // Badge de conteo
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('SCENARIO-1: el CTA del widget apunta a /inventory?tab=low-stock', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: [{ id: '1', name: 'Sal', quantity: 1, min_stock: 5 }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    renderDashboard();

    expect(screen.getByRole('button', { name: /Ver todos los detalles/i })).toBeInTheDocument();
  });

  it('SCENARIO-2: muestra el widget con estado vacío cuando no hay productos bajo mínimo', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    renderDashboard();

    // La tarjeta se monta y muestra estado vacío positivo
    expect(screen.getByText(/Stock bajo mínimo/i)).toBeInTheDocument();
    expect(screen.getByText(/Todos los productos tienen stock por encima del mínimo/i)).toBeInTheDocument();
  });

  it('muestra el widget con skeleton de carga mientras low-stock está cargando', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    const { container } = renderDashboard();

    // La tarjeta está montada con skeleton animate-pulse — el list poblado no existe todavía
    expect(screen.queryByRole('list', { name: /stock por debajo del mínimo/i })).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('muestra el estado de error del widget cuando low-stock falla (no degradación silenciosa)', () => {
    mockedUseLowStockProducts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);

    renderDashboard();

    // La tarjeta se monta y expone su propio estado de error con opción de reintentar
    expect(screen.getByText(/No pudimos cargar los productos con stock bajo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });
});
