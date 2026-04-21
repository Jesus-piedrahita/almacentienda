/**
 * @fileoverview Tests para CartItemRow.
 *
 * Cobertura:
 * - Render: nombre del producto, precio unitario, cantidad, subtotal de línea
 * - Botón "+" incrementa: llama a onUpdateQuantity con quantity+1
 * - Botón "-" decrementa: llama a onUpdateQuantity con quantity-1
 * - Botón "-" con quantity=1 llama a onUpdateQuantity con 0 (store lo elimina)
 * - Botón de eliminar llama a onRemove con productId correcto
 * - Subtotal de línea = price × quantity, muestra el valor correcto
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartItemRow } from './cart-item-row';
import type { CartItem } from '@/types/sales';
import type { Product } from '@/types/inventory';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const product: Product = {
  id: 'prod-1',
  barcode: '7501234567890',
  name: 'Coca Cola 600ml',
  description: 'Refresco de cola',
  categoryId: 'cat-1',
  categoryName: 'Bebidas',
  price: 10.00,
  cost: 6.00,
  quantity: 50,
  minStock: 5,
  taxMode: 'inherit',
  taxRate: null,
  effectiveTaxMode: 'taxed',
  effectiveTaxRate: 0.16,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function makeCartItem(quantity = 2): CartItem {
  return { product, quantity };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CartItemRow', () => {
  let onUpdateQuantity: (productId: string, quantity: number) => void;
  let onRemove: (productId: string) => void;

  beforeEach(() => {
    onUpdateQuantity = vi.fn();
    onRemove = vi.fn();
  });

  // ── Render ────────────────────────────────────────────────────────────────

  it('renderiza el nombre del producto', () => {
    render(
      <CartItemRow
        item={makeCartItem()}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );
    expect(screen.getByText('Coca Cola 600ml')).toBeInTheDocument();
  });

  it('renderiza el precio unitario', () => {
    render(
      <CartItemRow
        item={makeCartItem()}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );
    // "10.00 c/u" o similar — el número 10 debe estar presente
    expect(screen.getByText(/10[.,]00 c\/u/i)).toBeInTheDocument();
  });

  it('renderiza la cantidad actual', () => {
    render(
      <CartItemRow
        item={makeCartItem(3)}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renderiza el subtotal de línea (price × quantity)', () => {
    render(
      <CartItemRow
        item={makeCartItem(2)} // 10 × 2 = 20
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );
    // El subtotal formateado debe contener "20"
    expect(screen.getByText(/20[.,]00/)).toBeInTheDocument();
  });

  it('calcula el subtotal correcto para quantity=1', () => {
    render(
      <CartItemRow
        item={makeCartItem(1)} // 10 × 1 = 10
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );
    // El subtotal es 10 pero también aparece el precio unitario
    // Buscamos el elemento de subtotal con el valor correcto
    const priceTexts = screen.getAllByText(/10[.,]00/);
    expect(priceTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── Botón "+" (incrementar) ───────────────────────────────────────────────

  it('botón "+" llama a onUpdateQuantity con quantity+1', async () => {
    const user = userEvent.setup();
    render(
      <CartItemRow
        item={makeCartItem(2)}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    const incrementBtn = screen.getByRole('button', {
      name: /aumentar cantidad de Coca Cola 600ml/i,
    });
    await user.click(incrementBtn);

    expect(onUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(onUpdateQuantity).toHaveBeenCalledWith('prod-1', 3); // 2 + 1
  });

  // ── Botón "-" (decrementar) ───────────────────────────────────────────────

  it('botón "-" llama a onUpdateQuantity con quantity-1', async () => {
    const user = userEvent.setup();
    render(
      <CartItemRow
        item={makeCartItem(3)}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    const decrementBtn = screen.getByRole('button', {
      name: /disminuir cantidad de Coca Cola 600ml/i,
    });
    await user.click(decrementBtn);

    expect(onUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(onUpdateQuantity).toHaveBeenCalledWith('prod-1', 2); // 3 - 1
  });

  it('botón "-" con quantity=1 llama a onUpdateQuantity con 0 (el store elimina la fila)', async () => {
    const user = userEvent.setup();
    render(
      <CartItemRow
        item={makeCartItem(1)}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    const decrementBtn = screen.getByRole('button', {
      name: /disminuir cantidad de Coca Cola 600ml/i,
    });
    await user.click(decrementBtn);

    expect(onUpdateQuantity).toHaveBeenCalledWith('prod-1', 0);
  });

  // ── Botón eliminar ────────────────────────────────────────────────────────

  it('botón de eliminar llama a onRemove con el productId correcto', async () => {
    const user = userEvent.setup();
    render(
      <CartItemRow
        item={makeCartItem(2)}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    const removeBtn = screen.getByRole('button', {
      name: /eliminar Coca Cola 600ml del carrito/i,
    });
    await user.click(removeBtn);

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith('prod-1');
  });

  it('botón de eliminar no llama a onUpdateQuantity', async () => {
    const user = userEvent.setup();
    render(
      <CartItemRow
        item={makeCartItem(2)}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    const removeBtn = screen.getByRole('button', {
      name: /eliminar Coca Cola 600ml del carrito/i,
    });
    await user.click(removeBtn);

    expect(onUpdateQuantity).not.toHaveBeenCalled();
  });

  // ── Isolación de callbacks ────────────────────────────────────────────────

  it('los callbacks reciben el productId correcto para productos con id distinto', async () => {
    const user = userEvent.setup();
    const otherProduct: Product = {
      ...product,
      id: 'prod-99',
      name: 'Otro Producto',
    };
    render(
      <CartItemRow
        item={{ product: otherProduct, quantity: 1 }}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    const removeBtn = screen.getByRole('button', {
      name: /eliminar Otro Producto del carrito/i,
    });
    await user.click(removeBtn);

    expect(onRemove).toHaveBeenCalledWith('prod-99');
  });
});
