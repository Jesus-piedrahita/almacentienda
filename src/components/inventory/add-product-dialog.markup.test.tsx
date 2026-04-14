import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { AddProductDialog } from './add-product-dialog';
import * as inventoryHooks from '@/hooks/use-inventory';

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    profile: { baseCurrency: 'COP' },
    displayCurrency: 'COP',
    formatAmount: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  return {
    ...original,
    useAddProduct: vi.fn(),
  };
});

const mockedUseAddProduct = vi.mocked(inventoryHooks.useAddProduct);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const defaultCategories = [{ id: '1', name: 'Alimentos', description: undefined }];

function renderDialog(open = true, onOpenChange = vi.fn()) {
  const qc = makeQueryClient();
  return render(
    <AddProductDialog open={open} onOpenChange={onOpenChange} categories={defaultCategories} />,
    { wrapper: makeWrapper(qc) }
  );
}

describe('AddProductDialog — markup UI', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAddProduct.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof inventoryHooks.useAddProduct>);
    mockMutateAsync.mockResolvedValue(undefined);
  });

  it('recalculates price when cost and markup change', async () => {
    const user = userEvent.setup();
    renderDialog();

    const costInput = screen.getByLabelText(/Costo/i);
    const markupInput = screen.getByLabelText(/Markup/i);
    const priceInput = screen.getByLabelText(/Precio/i) as HTMLInputElement;

    await user.type(costInput, '100');
    await user.type(markupInput, '30');

    expect(priceInput.value).toBe('130');
  });

  it('recalculates markup when user edits price manually', async () => {
    const user = userEvent.setup();
    renderDialog();

    const costInput = screen.getByLabelText(/Costo/i);
    const markupInput = screen.getByLabelText(/Markup/i) as HTMLInputElement;
    const priceInput = screen.getByLabelText(/Precio/i);

    await user.type(costInput, '100');
    await user.type(priceInput, '140');

    expect(markupInput.value).toBe('40');
  });

  it('allows manual price when cost is zero and keeps markup empty', async () => {
    const user = userEvent.setup();
    renderDialog();

    const markupInput = screen.getByLabelText(/Markup/i) as HTMLInputElement;
    const priceInput = screen.getByLabelText(/Precio/i) as HTMLInputElement;

    await user.type(priceInput, '55');

    expect(priceInput.value).toBe('55');
    expect(markupInput.value).toBe('');
  });

  it('submits payload with persisted markupPct', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/Código de Barras/i), '7501000000099');
    await user.type(screen.getByLabelText(/Nombre/i), 'Yogur Natural');
    await user.selectOptions(screen.getByLabelText(/Categoría/i), '1');
    await user.type(screen.getByLabelText(/Costo/i), '100');
    await user.type(screen.getByLabelText(/Markup/i), '25');

    await user.click(screen.getByRole('button', { name: /Agregar Producto/i }));

    expect(mockMutateAsync).toHaveBeenCalledOnce();
    const payload = mockMutateAsync.mock.calls[0][0] as Record<string, unknown>;

    expect(payload.price).toBe(125);
    expect(payload.cost).toBe(100);
    expect(payload.markupPct).toBe(25);
  });
});
