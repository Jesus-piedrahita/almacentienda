/**
 * @fileoverview Tests focalizados en que ProductsTable derive el estado de stock
 * usando `product.minStock` en lugar del umbral genérico por defecto.
 *
 * Escenarios clave:
 * - qty=5, minStock=10 → Crítico (con default=4 sería Alerta → diferencia observable)
 * - qty=15, minStock=10 → Alerta (con default=4 sería Bien → diferencia observable)
 * - qty=15, minStock=5  → Bien  (confirma que el umbral es per-product)
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ProductsTable } from './products-table';
import type { Product } from '@/types/inventory';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    barcode: 'BAR-001',
    name: 'Producto Test',
    categoryId: 'cat-1',
    categoryName: 'General',
    price: 10,
    cost: 5,
    quantity: 20,
    minStock: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('ProductsTable — minStock-driven stock status', () => {
  it('qty=5 minStock=10 → muestra Crítico (no Alerta como haría con default=4)', () => {
    // Con default minStock=4: qty=5 > 4*2=8 → "good"; qty=5 > 4 y ≤ 8 → "warning"
    // Con minStock=10: qty=5 ≤ 10 → "critical"
    const products = [makeProduct({ quantity: 5, minStock: 10 })];
    render(<ProductsTable products={products} isLoading={false} />);
    expect(screen.getByText(/Crítico/i)).toBeInTheDocument();
  });

  it('qty=15 minStock=10 → muestra Alerta (con default=4 sería Bien)', () => {
    // Con default minStock=4: qty=15 > 8 → "good"
    // Con minStock=10: qty=15 ≤ 20 y > 10 → "warning"
    const products = [makeProduct({ quantity: 15, minStock: 10 })];
    render(<ProductsTable products={products} isLoading={false} />);
    expect(screen.getByText(/Alerta/i)).toBeInTheDocument();
  });

  it('qty=15 minStock=5 → muestra Bien', () => {
    // Con minStock=5: umbral crítico≤5, alerta≤10, bien>10
    // qty=15 > 10 → "good"
    const products = [makeProduct({ quantity: 15, minStock: 5 })];
    render(<ProductsTable products={products} isLoading={false} />);
    expect(screen.getByText(/Bien/i)).toBeInTheDocument();
  });
});
