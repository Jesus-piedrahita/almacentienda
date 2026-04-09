/**
 * @fileoverview Tests de integración para EditProductDialog — campo expiration_date.
 *
 * Verifica (REQ-3 / SCENARIO-5):
 * 1. El formulario se pre-carga con la expiration_date del producto recibido.
 * 2. El payload de submit incluye la expiration_date pre-cargada.
 * 3. El payload de submit incluye una nueva expiration_date si el usuario la cambia.
 * 4. El payload de submit tiene expiration_date: undefined cuando el campo se vacía.
 *
 * Estrategia:
 * - `useUpdateProduct` se mockea con `vi.mock` para capturar el payload sin peticiones HTTP.
 * - Se usa `userEvent` para interactuar con el formulario.
 * - El componente usa `key={product.id}` en el padre para remontarse al cambiar producto;
 *   aquí el test proporciona directamente el producto al renderizar.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { EditProductDialog } from './edit-product-dialog';
import * as inventoryHooks from '@/hooks/use-inventory';
import type { Product } from '@/types/inventory';

// ── Mock de useUpdateProduct ──────────────────────────────────────────────────

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  return {
    ...original,
    useUpdateProduct: vi.fn(),
  };
});

const mockedUseUpdateProduct = vi.mocked(inventoryHooks.useUpdateProduct);

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const defaultCategories = [{ id: '1', name: 'Alimentos', description: undefined }];

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '42',
    barcode: '7501000000042',
    name: 'Leche Entera 1L',
    description: 'Leche pasteurizada',
    categoryId: '1',
    categoryName: 'Alimentos',
    price: 22.0,
    cost: 15.0,
    quantity: 30,
    minStock: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    ...overrides,
  };
}

function renderDialog(product: Product, open = true, onOpenChange = vi.fn()) {
  const qc = makeQueryClient();
  return render(
    <EditProductDialog
      key={product.id}
      open={open}
      onOpenChange={onOpenChange}
      categories={defaultCategories}
      product={product}
    />,
    { wrapper: makeWrapper(qc) }
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EditProductDialog — expiration_date en el payload de submit', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseUpdateProduct.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof inventoryHooks.useUpdateProduct>);
    mockMutateAsync.mockResolvedValue(undefined);
  });

  it('pre-carga el campo de fecha con la expiration_date del producto', () => {
    const product = makeProduct({ expiration_date: '2026-09-15' });
    renderDialog(product);

    const dateInput = screen.getByLabelText(/Fecha de Vencimiento/i) as HTMLInputElement;
    expect(dateInput.value).toBe('2026-09-15');
  });

  it('incluye expiration_date pre-cargada en el payload de submit sin cambios', async () => {
    const user = userEvent.setup();
    const product = makeProduct({ expiration_date: '2026-09-15' });
    renderDialog(product);

    // Enviar sin modificar la fecha
    await user.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(mockMutateAsync).toHaveBeenCalledOnce();
    const { updates } = mockMutateAsync.mock.calls[0][0];
    expect(updates.expiration_date).toBe('2026-09-15');
  });

  it('incluye la nueva expiration_date en el payload cuando el usuario la cambia', async () => {
    const user = userEvent.setup();
    const product = makeProduct({ expiration_date: '2026-09-15' });
    renderDialog(product);

    // Limpiar y escribir nueva fecha
    const dateInput = screen.getByLabelText(/Fecha de Vencimiento/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2027-03-01');

    await user.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(mockMutateAsync).toHaveBeenCalledOnce();
    const { updates } = mockMutateAsync.mock.calls[0][0];
    expect(updates.expiration_date).toBe('2027-03-01');
  });

  it('envía expiration_date como undefined cuando se vacía el campo', async () => {
    const user = userEvent.setup();
    const product = makeProduct({ expiration_date: '2026-09-15' });
    renderDialog(product);

    // Limpiar el campo de fecha
    const dateInput = screen.getByLabelText(/Fecha de Vencimiento/i);
    await user.clear(dateInput);

    await user.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(mockMutateAsync).toHaveBeenCalledOnce();
    const { updates } = mockMutateAsync.mock.calls[0][0];
    // Campo vacío → debe normalizarse a undefined
    expect(updates.expiration_date).toBeUndefined();
  });

  it('el campo de fecha está vacío si el producto no tiene expiration_date', () => {
    const product = makeProduct({ expiration_date: undefined });
    renderDialog(product);

    const dateInput = screen.getByLabelText(/Fecha de Vencimiento/i) as HTMLInputElement;
    expect(dateInput.value).toBe('');
  });
});
