import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProductsTable } from './products-table';
import type { Product } from '@/types/inventory';

function makeProduct(id: string, name: string): Product {
  return {
    id,
    barcode: `BAR-${id}`,
    name,
    categoryId: '1',
    categoryName: 'General',
    price: 10,
    cost: 5,
    quantity: 20,
    minStock: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('ProductsTable selection', () => {
  it('selects visible rows from header checkbox', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const products = [makeProduct('1', 'Producto 1'), makeProduct('2', 'Producto 2')];

    render(
      <ProductsTable
        products={products}
        isLoading={false}
        selectedIds={new Set()}
        onSelectionChange={onSelectionChange}
      />
    );

    await user.click(screen.getByLabelText(/Seleccionar productos visibles/i));

    expect(onSelectionChange).toHaveBeenCalledOnce();
    const nextSelection = onSelectionChange.mock.calls[0][0] as Set<string>;
    expect(Array.from(nextSelection)).toEqual(['1', '2']);
  });

  it('toggles an individual row selection', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const products = [makeProduct('1', 'Producto 1')];

    render(
      <ProductsTable
        products={products}
        isLoading={false}
        selectedIds={new Set()}
        onSelectionChange={onSelectionChange}
      />
    );

    await user.click(screen.getByLabelText(/Seleccionar Producto 1/i));

    const nextSelection = onSelectionChange.mock.calls[0][0] as Set<string>;
    expect(Array.from(nextSelection)).toEqual(['1']);
  });
});
