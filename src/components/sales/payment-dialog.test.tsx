/**
 * @fileoverview Tests de integración para PaymentDialog.
 *
 * Cobertura:
 * - Flujo efectivo exitoso: llama API → muestra éxito → limpia carrito
 * - Selección de tarjeta: bloqueado con advertencia, sin POST a API
 * - Fallo de API: muestra error inline, preserva carrito
 *
 * ```mermaid
 * flowchart TD
 *     A[Test: efectivo exitoso] --> B[POST /api/sales resuelve]
 *     B --> C[Carrito limpio]
 *     D[Test: tarjeta bloqueada] --> E[Advertencia visible]
 *     D --> F[Confirmar deshabilitado]
 *     D --> G[Sin POST]
 *     H[Test: error API] --> I[POST /api/sales falla]
 *     I --> J[Error inline visible]
 *     I --> K[Carrito preservado]
 * ```
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { PaymentDialog } from './payment-dialog';
import api from '@/lib/api';
import { useSalesStore } from '@/stores/sales-store';
import type { Product } from '@/types/inventory';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApiPost = vi.mocked(api.post);

// ── Fixtures ──────────────────────────────────────────────────────────────────

// Use numeric-parseable id ('1') so Number(product.id) = 1 in the mapper
const mockProduct: Product = {
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
};

const mockApiSaleResponse = {
  id: 1,
  user_id: 5,
  state: 'completed' as const,
  payment_method: 'cash' as const,
  subtotal: 18.5,
  total: 21.46,
  created_at: '2026-04-09T12:00:00Z',
  cancelled_at: null,
  cancel_reason: null,
  items: [
    {
      id: 10,
      product_id: 1,
      product_name: 'Coca Cola 600ml',
      quantity: 1,
      unit_price: 18.5,
      subtotal: 18.5,
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderDialog(
  props: { open?: boolean; onOpenChange?: (open: boolean) => void } = {},
  queryClient?: QueryClient
) {
  const qc = queryClient ?? makeQueryClient();
  const onOpenChange = props.onOpenChange ?? vi.fn();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );

  return {
    ...render(
      <PaymentDialog open={props.open ?? true} onOpenChange={onOpenChange} />,
      { wrapper: Wrapper }
    ),
    onOpenChange,
    queryClient: qc,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PaymentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Cargar 1 producto en el carrito para todos los tests
    useSalesStore.getState().clearCart();
    useSalesStore.getState().addItem(mockProduct);
    // Efectivo por defecto; ingresar monto suficiente
    useSalesStore.getState().setAmountReceived(50);
  });

  afterEach(() => {
    useSalesStore.getState().clearCart();
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  it('renderiza el diálogo con título "Cobrar venta"', () => {
    renderDialog();
    expect(screen.getByRole('heading', { name: /cobrar venta/i })).toBeInTheDocument();
  });

  it('renderiza el botón "Confirmar" habilitado con efectivo y monto suficiente', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /confirmar/i })).not.toBeDisabled();
  });

  // ── Flujo efectivo exitoso ─────────────────────────────────────────────────

  it('llama POST /api/sales con payload correcto al confirmar con efectivo', async () => {
    mockedApiPost.mockResolvedValueOnce({ data: mockApiSaleResponse });
    const onOpenChange = vi.fn();
    renderDialog({ onOpenChange });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    });

    expect(mockedApiPost).toHaveBeenCalledWith('/api/sales', {
      payment_method: 'cash',
      items: [{ product_id: 1, quantity: 1 }],
    });

    // Esperar a que el timer de 800ms del estado de éxito se resuelva
    // para no contaminar los tests siguientes con completeSale()
    await act(async () => {
      await new Promise<void>((r) => setTimeout(r, 900));
    });
  });

  it('muestra estado de éxito después de que la API resuelve', async () => {
    mockedApiPost.mockResolvedValueOnce({ data: mockApiSaleResponse });
    renderDialog();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('¡Venta completada!')).toBeInTheDocument();
    });

    // Esperar a que el timer de 800ms se resuelva dentro de este test
    // para que completeSale() no contamine los tests siguientes
    await act(async () => {
      await new Promise<void>((r) => setTimeout(r, 900));
    });
  });

  it('limpia el carrito solo después de que la API resuelve exitosamente', async () => {
    vi.useFakeTimers();
    mockedApiPost.mockResolvedValueOnce({ data: mockApiSaleResponse });
    renderDialog();

    // Carrito tiene producto antes de confirmar
    expect(useSalesStore.getState().items).toHaveLength(1);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    });

    // La API resolvió → mostrar éxito → avanzar 800ms → completeSale()
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(useSalesStore.getState().items).toHaveLength(0);
    });
  });

  // ── Tarjeta bloqueada ──────────────────────────────────────────────────────

  it('muestra advertencia al seleccionar tarjeta', async () => {
    renderDialog();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /tarjeta/i }));
    });

    expect(
      screen.getByText(/pago con tarjeta no disponible aún/i)
    ).toBeInTheDocument();
  });

  it('deshabilita el botón Confirmar cuando se selecciona tarjeta', async () => {
    renderDialog();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /tarjeta/i }));
    });

    expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled();
  });

  it('el carrito permanece intacto al seleccionar tarjeta', async () => {
    renderDialog();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /tarjeta/i }));
    });

    expect(useSalesStore.getState().items).toHaveLength(1);
    expect(mockedApiPost).not.toHaveBeenCalled();
  });

  // ── Error de API ───────────────────────────────────────────────────────────

  it('muestra mensaje de error inline cuando la API falla', async () => {
    mockedApiPost.mockRejectedValueOnce({
      response: { data: { detail: 'Stock insuficiente para Coca Cola 600ml' } },
    });
    renderDialog();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/stock insuficiente para coca cola 600ml/i)
      ).toBeInTheDocument();
    });
  });

  it('muestra mensaje genérico si la API falla sin detail', async () => {
    mockedApiPost.mockRejectedValueOnce(new Error('Network error'));
    renderDialog();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/error al procesar la venta/i)
      ).toBeInTheDocument();
    });
  });

  it('preserva el carrito cuando la API falla', async () => {
    mockedApiPost.mockRejectedValueOnce({
      response: { data: { detail: 'Stock insuficiente' } },
    });
    renderDialog();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/stock insuficiente/i)).toBeInTheDocument();
    });

    // Carrito NO fue limpiado
    expect(useSalesStore.getState().items).toHaveLength(1);
  });

  it('resetea el estado de procesamiento a idle tras un error', async () => {
    mockedApiPost.mockRejectedValueOnce({
      response: { data: { detail: 'Error de stock' } },
    });
    renderDialog();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    });

    await waitFor(() => {
      // El botón Confirmar vuelve a estar habilitado (processing=idle, método=cash, monto suficiente)
      expect(screen.getByRole('button', { name: /confirmar/i })).not.toBeDisabled();
    });
  });
});
