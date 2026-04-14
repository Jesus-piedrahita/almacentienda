import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { EditProductDialog } from './edit-product-dialog';
import * as inventoryHooks from '@/hooks/use-inventory';
import type { Product } from '@/types/inventory';

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
    useUpdateProduct: vi.fn(),
  };
});

const mockedUseUpdateProduct = vi.mocked(inventoryHooks.useUpdateProduct);

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

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '42',
    barcode: '7501000000042',
    name: 'Leche Entera 1L',
    description: 'Leche pasteurizada',
    categoryId: '1',
    categoryName: 'Alimentos',
    price: 130,
    cost: 100,
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

describe('EditProductDialog — markup UI', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseUpdateProduct.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof inventoryHooks.useUpdateProduct>);
    mockMutateAsync.mockResolvedValue(undefined);
  });

  it('preloads markup derived from product cost and price', () => {
    renderDialog(makeProduct({ cost: 100, price: 130 }));

    const markupInput = screen.getByLabelText(/Markup/i) as HTMLInputElement;
    expect(markupInput.value).toBe('30');
  });

  it('preloads persisted markup when product provides it', () => {
    renderDialog(makeProduct({ cost: 100, price: 130, markupPct: 35 }));

    const markupInput = screen.getByLabelText(/Markup/i) as HTMLInputElement;
    expect(markupInput.value).toBe('35');
  });

  it('recalculates price when markup changes', async () => {
    const user = userEvent.setup();
    renderDialog(makeProduct({ cost: 100, price: 130 }));

    const markupInput = screen.getByLabelText(/Markup/i);
    const priceInput = screen.getByLabelText(/Precio/i) as HTMLInputElement;

    await user.clear(markupInput);
    await user.type(markupInput, '50');

    expect(priceInput.value).toBe('150');
  });

  it('recalculates markup when user edits price manually', async () => {
    const user = userEvent.setup();
    renderDialog(makeProduct({ cost: 100, price: 130 }));

    const markupInput = screen.getByLabelText(/Markup/i) as HTMLInputElement;
    const priceInput = screen.getByLabelText(/Precio/i);

    await user.clear(priceInput);
    await user.type(priceInput, '140');

    expect(markupInput.value).toBe('40');
  });

  it('allows manual price when cost is zero and keeps markup empty', async () => {
    const user = userEvent.setup();
    renderDialog(makeProduct({ cost: 0, price: 10 }));

    const markupInput = screen.getByLabelText(/Markup/i) as HTMLInputElement;
    const priceInput = screen.getByLabelText(/Precio/i) as HTMLInputElement;

    expect(markupInput.value).toBe('');

    await user.clear(priceInput);
    await user.type(priceInput, '55');

    expect(priceInput.value).toBe('55');
    expect(markupInput.value).toBe('');
  });

  it('submits updates with persisted markupPct', async () => {
    const user = userEvent.setup();
    const product = makeProduct({ cost: 100, price: 130 });
    renderDialog(product);

    const markupInput = screen.getByLabelText(/Markup/i);
    await user.clear(markupInput);
    await user.type(markupInput, '25');

    await user.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(mockMutateAsync).toHaveBeenCalledOnce();
    const { updates } = mockMutateAsync.mock.calls[0][0] as { updates: Record<string, unknown> };

    expect(updates.price).toBe(125);
    expect(updates.cost).toBe(100);
    expect(updates.markupPct).toBe(25);
  });
});
