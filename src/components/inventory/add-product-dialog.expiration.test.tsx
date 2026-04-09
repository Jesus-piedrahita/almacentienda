/**
 * @fileoverview Tests de integración para AddProductDialog — campo expiration_date.
 *
 * Verifica (REQ-3 / SCENARIO-4):
 * 1. El payload enviado al hook incluye `expiration_date` cuando el usuario llena el campo.
 * 2. El payload enviado al hook tiene `expiration_date: undefined` cuando el campo está vacío.
 *
 * Estrategia:
 * - `useAddProduct` se mockea con `vi.mock` para capturar el payload sin hacer peticiones HTTP.
 * - Se usa `userEvent` para llenar el formulario de forma realista.
 * - Se verifica que `mutateAsync` fue llamado con el payload correcto.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AddProductDialog } from './add-product-dialog';
import * as inventoryHooks from '@/hooks/use-inventory';

// ── Mock de useAddProduct ─────────────────────────────────────────────────────

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  return {
    ...original,
    useAddProduct: vi.fn(),
  };
});

const mockedUseAddProduct = vi.mocked(inventoryHooks.useAddProduct);

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

function renderDialog(open = true, onOpenChange = vi.fn()) {
  const qc = makeQueryClient();
  return render(
    <AddProductDialog
      open={open}
      onOpenChange={onOpenChange}
      categories={defaultCategories}
    />,
    { wrapper: makeWrapper(qc) }
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AddProductDialog — expiration_date en el payload de submit', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAddProduct.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof inventoryHooks.useAddProduct>);
    mockMutateAsync.mockResolvedValue(undefined);
  });

  it('incluye expiration_date en el payload cuando el usuario llena el campo de fecha', async () => {
    const user = userEvent.setup();
    renderDialog();

    // Llenar campos obligatorios
    await user.type(screen.getByLabelText(/Código de Barras/i), '7501000000099');
    await user.type(screen.getByLabelText(/Nombre/i), 'Yogur Natural');
    await user.selectOptions(screen.getByLabelText(/Categoría/i), '1');
    await user.type(screen.getByLabelText(/Precio/i), '15.50');

    // Llenar fecha de vencimiento
    const dateInput = screen.getByLabelText(/Fecha de Vencimiento/i);
    await user.type(dateInput, '2026-12-31');

    // Enviar formulario
    await user.click(screen.getByRole('button', { name: /Agregar Producto/i }));

    expect(mockMutateAsync).toHaveBeenCalledOnce();
    const payload = mockMutateAsync.mock.calls[0][0];
    expect(payload.expiration_date).toBe('2026-12-31');
  });

  it('envía expiration_date como undefined cuando el campo está vacío', async () => {
    const user = userEvent.setup();
    renderDialog();

    // Llenar campos obligatorios sin fecha
    await user.type(screen.getByLabelText(/Código de Barras/i), '7501000000099');
    await user.type(screen.getByLabelText(/Nombre/i), 'Yogur Natural');
    await user.selectOptions(screen.getByLabelText(/Categoría/i), '1');
    await user.type(screen.getByLabelText(/Precio/i), '15.50');

    // No llenar la fecha de vencimiento (campo vacío)

    // Enviar formulario
    await user.click(screen.getByRole('button', { name: /Agregar Producto/i }));

    expect(mockMutateAsync).toHaveBeenCalledOnce();
    const payload = mockMutateAsync.mock.calls[0][0];
    // Campo vacío → debe normalizarse a undefined
    expect(payload.expiration_date).toBeUndefined();
  });
});
