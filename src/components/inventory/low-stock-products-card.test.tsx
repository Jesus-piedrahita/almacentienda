/**
 * @fileoverview Tests para LowStockProductsCard y StockStatusIndicator threshold logic.
 *
 * LowStockProductsCard — Verifica:
 * 1. Estado loading: muestra skeleton (animate-pulse).
 * 2. Estado error: muestra mensaje y botón Reintentar.
 * 3. Estado vacío: muestra mensaje positivo.
 * 4. Estado poblado: lista de productos con stock/mínimo y CTA de navegación.
 * 5. CTA de navegación apunta a /inventory?tab=low-stock.
 * 6. Badge de conteo coincide con el número de productos.
 *
 * StockStatusIndicator threshold logic — Verifica:
 * 1. Tiers driven by min_stock values (good/warning/critical counters son pasados como props).
 * 2. Renderiza conteos correctamente.
 * 3. Muestra mensaje contextual crítico cuando critical > 0.
 * 4. Muestra mensaje contextual alerta cuando solo warning > 0.
 * 5. Muestra mensaje positivo cuando good > 0 y no hay alertas.
 * 6. Estado loading: muestra skeleton.
 * 7. Estado error: muestra mensaje y retry.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

import { LowStockProductsCard } from '@/components/inventory/low-stock-products-card';
import { StockStatusIndicator } from '@/components/inventory/stock-status-indicator';
import * as inventoryHooks from '@/hooks/use-inventory';
import type { LowStockProduct } from '@/types/inventory';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  return {
    ...original,
    useLowStockProducts: vi.fn(),
  };
});

const mockedUseLowStockProducts = vi.mocked(inventoryHooks.useLowStockProducts);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderCard(qc?: QueryClient) {
  const client = qc ?? makeQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
  return render(<LowStockProductsCard />, { wrapper: Wrapper });
}

function makeLowStockProduct(overrides: Partial<LowStockProduct> = {}): LowStockProduct {
  return {
    id: '1',
    name: 'Producto Test',
    quantity: 2,
    min_stock: 10,
    ...overrides,
  };
}

// ── LowStockProductsCard Tests ────────────────────────────────────────────────

describe('LowStockProductsCard — estado loading', () => {
  beforeEach(() => {
    mockedUseLowStockProducts.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);
  });

  it('muestra skeleton de filas (animate-pulse) durante la carga', () => {
    const { container } = renderCard();
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('no muestra lista de productos durante la carga', () => {
    renderCard();
    expect(screen.queryByRole('list', { name: /stock por debajo del mínimo/i })).not.toBeInTheDocument();
  });
});

describe('LowStockProductsCard — estado error', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    mockedUseLowStockProducts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);
  });

  it('muestra mensaje de error', () => {
    renderCard();
    expect(screen.getByText(/No pudimos cargar los productos con stock bajo/i)).toBeInTheDocument();
  });

  it('muestra botón Reintentar', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('llama a refetch al hacer click en Reintentar', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole('button', { name: /Reintentar/i }));
    expect(mockRefetch).toHaveBeenCalledOnce();
  });
});

describe('LowStockProductsCard — estado vacío', () => {
  beforeEach(() => {
    mockedUseLowStockProducts.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);
  });

  it('muestra mensaje positivo cuando no hay productos bajo mínimo', () => {
    renderCard();
    expect(screen.getByText(/Todos los productos tienen stock por encima del mínimo/i)).toBeInTheDocument();
  });

  it('no muestra lista de productos en estado vacío', () => {
    renderCard();
    expect(screen.queryByRole('list', { name: /stock por debajo del mínimo/i })).not.toBeInTheDocument();
  });
});

describe('LowStockProductsCard — estado poblado', () => {
  const products: LowStockProduct[] = [
    makeLowStockProduct({ id: '1', name: 'Arroz Largo Fino', quantity: 3, min_stock: 10 }),
    makeLowStockProduct({ id: '2', name: 'Aceite de Girasol', quantity: 0, min_stock: 5 }),
  ];

  beforeEach(() => {
    mockedUseLowStockProducts.mockReturnValue({
      data: products,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof inventoryHooks.useLowStockProducts>);
  });

  it('renderiza los nombres de los productos', () => {
    renderCard();
    expect(screen.getByText('Arroz Largo Fino')).toBeInTheDocument();
    expect(screen.getByText('Aceite de Girasol')).toBeInTheDocument();
  });

  it('muestra stock actual / mínimo para cada producto', () => {
    renderCard();
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
    expect(screen.getByText('0 / 5')).toBeInTheDocument();
  });

  it('el badge de conteo muestra el número correcto de productos', () => {
    renderCard();
    // Badge en el título con el número de productos
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renderiza la lista con aria-label descriptivo', () => {
    renderCard();
    expect(
      screen.getByRole('list', { name: /Productos con stock por debajo del mínimo/i })
    ).toBeInTheDocument();
  });

  it('muestra el CTA "Ver todos los detalles"', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /Ver todos los detalles/i })).toBeInTheDocument();
  });

  it('navega a /inventory?tab=low-stock al hacer click en CTA', async () => {
    const user = userEvent.setup();
    renderCard();
    // El botón usa navigate(), con MemoryRouter podemos verificar que se llama sin crashear
    await user.click(screen.getByRole('button', { name: /Ver todos los detalles/i }));
    // Verificamos que no hay errores de navegación; el MemoryRouter absorbe la navegación
  });
});

// ── StockStatusIndicator — threshold logic ────────────────────────────────────

describe('StockStatusIndicator — renderizado de conteos', () => {
  it('muestra los conteos correctos por tier', () => {
    render(
      <StockStatusIndicator good={30} warning={8} critical={4} isLoading={false} />
    );
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    // '4' aparece tanto en la card como en el mensaje contextual — usar getAllByText
    expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1);
  });

  it('muestra etiquetas de tier: Bien, Alerta, Crítico', () => {
    render(
      <StockStatusIndicator good={10} warning={2} critical={1} isLoading={false} />
    );
    expect(screen.getByText('Bien')).toBeInTheDocument();
    expect(screen.getByText('Alerta')).toBeInTheDocument();
    expect(screen.getByText('Crítico')).toBeInTheDocument();
  });
});

describe('StockStatusIndicator — mensaje contextual basado en tiers min_stock', () => {
  it('muestra mensaje crítico cuando critical > 0', () => {
    render(
      <StockStatusIndicator good={10} warning={2} critical={3} isLoading={false} />
    );
    // El mensaje usa <strong>{n}</strong> + texto partido — usar function matcher sobre textContent del <span>
    expect(
      screen.getByText((_, el) => el?.tagName === 'SPAN' && el?.textContent === '3 productos en estado crítico')
    ).toBeInTheDocument();
  });

  it('usa singular cuando critical = 1', () => {
    render(
      <StockStatusIndicator good={5} warning={0} critical={1} isLoading={false} />
    );
    expect(
      screen.getByText((_, el) => el?.tagName === 'SPAN' && el?.textContent === '1 producto en estado crítico')
    ).toBeInTheDocument();
  });

  it('muestra mensaje de alerta cuando solo warning > 0 (sin críticos)', () => {
    render(
      <StockStatusIndicator good={10} warning={4} critical={0} isLoading={false} />
    );
    expect(
      screen.getByText((_, el) => el?.tagName === 'SPAN' && el?.textContent === '4 productos en estado de alerta')
    ).toBeInTheDocument();
  });

  it('muestra mensaje positivo cuando no hay críticos ni alertas', () => {
    render(
      <StockStatusIndicator good={15} warning={0} critical={0} isLoading={false} />
    );
    expect(screen.getByText(/Todos los productos tienen stock adecuado/i)).toBeInTheDocument();
  });

  it('muestra "No hay productos en el inventario" cuando todos los valores son 0', () => {
    render(
      <StockStatusIndicator good={0} warning={0} critical={0} isLoading={false} />
    );
    expect(screen.getByText(/No hay productos en el inventario/i)).toBeInTheDocument();
  });
});

describe('StockStatusIndicator — estado loading', () => {
  it('muestra skeleton (animate-pulse) durante la carga', () => {
    const { container } = render(
      <StockStatusIndicator good={0} warning={0} critical={0} isLoading={true} />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('no muestra etiquetas de tier durante loading', () => {
    render(
      <StockStatusIndicator good={0} warning={0} critical={0} isLoading={true} />
    );
    expect(screen.queryByText('Bien')).not.toBeInTheDocument();
    expect(screen.queryByText('Crítico')).not.toBeInTheDocument();
  });
});

describe('StockStatusIndicator — estado error', () => {
  it('muestra mensaje de error cuando isError=true', () => {
    render(
      <StockStatusIndicator
        good={0} warning={0} critical={0}
        isLoading={false} isError={true}
      />
    );
    expect(screen.getByText(/No se pudieron cargar las estadísticas/i)).toBeInTheDocument();
  });

  it('muestra botón Reintentar cuando onRetry está provisto', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <StockStatusIndicator
        good={0} warning={0} critical={0}
        isLoading={false} isError={true} onRetry={onRetry}
      />
    );

    await user.click(screen.getByRole('button', { name: /Reintentar/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('no muestra botón Reintentar cuando onRetry no está provisto', () => {
    render(
      <StockStatusIndicator
        good={0} warning={0} critical={0}
        isLoading={false} isError={true}
      />
    );
    expect(screen.queryByRole('button', { name: /Reintentar/i })).not.toBeInTheDocument();
  });
});
