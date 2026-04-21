import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { CategoryDialog } from './category-dialog';
import * as inventoryHooks from '@/hooks/use-inventory';
import { CATEGORY_TAX_MODE, type Category } from '@/types/inventory';

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  return {
    ...original,
    useAddCategory: vi.fn(),
    useUpdateCategory: vi.fn(),
  };
});

const mockedUseAddCategory = vi.mocked(inventoryHooks.useAddCategory);
const mockedUseUpdateCategory = vi.mocked(inventoryHooks.useUpdateCategory);

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

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: '1',
    name: 'Abarrotes',
    description: 'Categoría de prueba',
    defaultTaxMode: CATEGORY_TAX_MODE.TAXED,
    defaultTaxRate: 0.16,
    ...overrides,
  };
}

function renderDialog(category = makeCategory()) {
  const queryClient = makeQueryClient();

  return render(
    <CategoryDialog open onOpenChange={vi.fn()} category={category} />,
    { wrapper: makeWrapper(queryClient) }
  );
}

describe('CategoryDialog — tax mode behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAddCategory.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof inventoryHooks.useAddCategory>);

    mockedUseUpdateCategory.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof inventoryHooks.useUpdateCategory>);
  });

  it('allows switching from taxed to exempt without crashing and hides tax rate', async () => {
    const user = userEvent.setup();
    renderDialog();

    const taxModeSelect = screen.getByLabelText(/modo de impuesto/i);
    expect(screen.getByLabelText(/tasa iva/i)).toBeInTheDocument();

    await user.selectOptions(taxModeSelect, CATEGORY_TAX_MODE.EXEMPT);

    expect(screen.queryByLabelText(/tasa iva/i)).not.toBeInTheDocument();
  });

  it('allows switching to non-taxable and back to taxed', async () => {
    const user = userEvent.setup();
    renderDialog();

    const taxModeSelect = screen.getByLabelText(/modo de impuesto/i);

    await user.selectOptions(taxModeSelect, CATEGORY_TAX_MODE.NON_TAXABLE);
    expect(screen.queryByLabelText(/tasa iva/i)).not.toBeInTheDocument();

    await user.selectOptions(taxModeSelect, CATEGORY_TAX_MODE.TAXED);
    expect(screen.getByLabelText(/tasa iva/i)).toBeInTheDocument();
  });
});
