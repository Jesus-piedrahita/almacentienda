import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BulkMarkupDialog } from './bulk-markup-dialog';
import * as inventoryHooks from '@/hooks/use-inventory';

vi.mock('@/hooks/use-inventory', async (importOriginal) => {
  const original = await importOriginal<typeof inventoryHooks>();
  return {
    ...original,
    useBulkMarkup: vi.fn(),
  };
});

const mockedUseBulkMarkup = vi.mocked(inventoryHooks.useBulkMarkup);

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('BulkMarkupDialog', () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockResolvedValue({ updatedCount: 1, skippedCount: 0, updatedProducts: [] });
    mockedUseBulkMarkup.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof inventoryHooks.useBulkMarkup>);
  });

  it('shows selected count and submits selected scope', async () => {
    const user = userEvent.setup();
    const qc = makeQueryClient();
    const onSuccess = vi.fn();

    render(
      <BulkMarkupDialog
        open
        onOpenChange={vi.fn()}
        categories={[{ id: '1', name: 'Alimentos' }]}
        selectedIds={new Set(['10', '11'])}
        onSuccess={onSuccess}
      />,
      { wrapper: makeWrapper(qc) }
    );

    expect(screen.getByText(/Seleccionados \(2\)/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Markup \(%\)/i), '30');
    await user.click(screen.getByRole('button', { name: /Aplicar markup/i }));

    expect(mutateAsync).toHaveBeenCalledWith({
      scope: 'selected',
      productIds: ['10', '11'],
      markupPct: 30,
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('requires category selection for category scope', async () => {
    const user = userEvent.setup();
    const qc = makeQueryClient();

    render(
      <BulkMarkupDialog
        open
        onOpenChange={vi.fn()}
        categories={[{ id: '1', name: 'Alimentos' }]}
        selectedIds={new Set()}
      />,
      { wrapper: makeWrapper(qc) }
    );

    await user.click(screen.getByLabelText(/Categoría/i, { selector: 'input[type="radio"]' }));
    await user.type(screen.getByLabelText(/Markup \(%\)/i), '15');

    expect(screen.getByRole('button', { name: /Aplicar markup/i })).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(/^Categoría$/i, { selector: 'select' }), '1');
    expect(screen.getByRole('button', { name: /Aplicar markup/i })).not.toBeDisabled();
  });

  it('requires explicit confirmation for all scope', async () => {
    const user = userEvent.setup();
    const qc = makeQueryClient();

    render(
      <BulkMarkupDialog
        open
        onOpenChange={vi.fn()}
        categories={[]}
        selectedIds={new Set()}
      />,
      { wrapper: makeWrapper(qc) }
    );

    await user.click(screen.getByLabelText(/Todos los productos/i, { selector: 'input[type="radio"]' }));
    await user.type(screen.getByLabelText(/Markup \(%\)/i), '20');

    expect(screen.getByText(/actualizará TODO el catálogo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aplicar markup/i })).toBeDisabled();

    await user.click(screen.getByLabelText(/Confirmo que quiero actualizar todos los productos/i));
    expect(screen.getByRole('button', { name: /Aplicar markup/i })).not.toBeDisabled();
  });
});
