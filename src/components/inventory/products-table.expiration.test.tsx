/**
 * @fileoverview Tests unitarios para ProductsTable — columna condicional de vencimiento.
 *
 * Verifica (REQ-2 / SCENARIO-2):
 * 1. La columna "Vencimiento" NO aparece cuando ningún producto tiene `expiration_date`.
 * 2. La columna "Vencimiento" SÍ aparece cuando al menos un producto tiene `expiration_date`.
 * 3. Los productos sin fecha muestran "Sin vencimiento" en la celda de vencimiento.
 * 4. Los productos con fecha muestran la fecha formateada en dd/mm/aaaa.
 * 5. Los productos con fecha muestran `Vencido` o `Con fecha` según corresponda.
 *
 * No se testea el buscador ni la paginación aquí — tienen su propia cobertura
 * en los tests del módulo de dashboard (barcode-search). El foco es la lógica
 * de visibilidad de la columna de vencimiento.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductsTable } from './products-table';
import type { Product } from '@/types/inventory';

// ── Helpers de fixtures ────────────────────────────────────────────────────────

let _idCounter = 0;

function makeProduct(overrides: Partial<Product> = {}): Product {
  _idCounter++;
  return {
    id: String(_idCounter),
    barcode: `BAR${_idCounter}`,
    name: `Producto ${_idCounter}`,
    categoryId: '1',
    categoryName: 'Categoría',
    price: 10,
    cost: 5,
    quantity: 20,
    minStock: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// ── Tests: visibilidad de la columna ──────────────────────────────────────────

describe('ProductsTable — columna "Vencimiento" condicional', () => {
  it('NO muestra la columna "Vencimiento" cuando ningún producto tiene expiration_date', () => {
    const products = [
      makeProduct({ expiration_date: undefined }),
      makeProduct({ expiration_date: undefined }),
    ];
    render(<ProductsTable products={products} isLoading={false} />);

    const expirationHeader = screen.queryByRole('columnheader', { name: /Vencimiento/i });
    expect(expirationHeader).not.toBeInTheDocument();
  });

  it('SÍ muestra la columna "Vencimiento" cuando al menos un producto tiene expiration_date', () => {
    const products = [
      makeProduct({ expiration_date: '2026-06-01' }),
      makeProduct({ expiration_date: undefined }),
    ];
    render(<ProductsTable products={products} isLoading={false} />);

    const expirationHeader = screen.getByRole('columnheader', { name: /Vencimiento/i });
    expect(expirationHeader).toBeInTheDocument();
  });

  it('muestra la columna cuando todos los productos tienen expiration_date', () => {
    const products = [
      makeProduct({ expiration_date: '2026-06-01' }),
      makeProduct({ expiration_date: '2026-07-15' }),
    ];
    render(<ProductsTable products={products} isLoading={false} />);

    expect(screen.getByRole('columnheader', { name: /Vencimiento/i })).toBeInTheDocument();
  });
});

// ── Tests: contenido de la celda ──────────────────────────────────────────────

describe('ProductsTable — contenido de la celda de vencimiento', () => {
  it('muestra "Sin vencimiento" para el producto sin expiration_date cuando la columna es visible', () => {
    const products = [
      makeProduct({ name: 'Con Fecha', expiration_date: '2026-06-01' }),
      makeProduct({ name: 'Sin Fecha', expiration_date: undefined }),
    ];
    render(<ProductsTable products={products} isLoading={false} />);

    // La columna está visible (al menos uno tiene fecha)
    expect(screen.getByRole('columnheader', { name: /Vencimiento/i })).toBeInTheDocument();
    expect(screen.getByText('Sin vencimiento')).toBeInTheDocument();
  });

  it('muestra la fecha formateada dd/mm/aaaa para productos con expiration_date', () => {
    const products = [makeProduct({ expiration_date: '2026-12-25' })];
    render(<ProductsTable products={products} isLoading={false} />);

    // La fecha 2026-12-25 debe mostrarse en formato local dd/mm/aaaa
    // (es-MX: día/mes/año)
    const dateText = screen.getByText(/25\/12\/2026/);
    expect(dateText).toBeInTheDocument();
  });

  it('muestra "Con fecha" para productos con fecha futura', () => {
    const products = [makeProduct({ expiration_date: '2999-12-31' })];
    render(<ProductsTable products={products} isLoading={false} />);

    expect(screen.getByText('Con fecha')).toBeInTheDocument();
  });

  it('muestra "Vencido" para productos con fecha pasada', () => {
    const products = [makeProduct({ expiration_date: '2000-01-01' })];
    render(<ProductsTable products={products} isLoading={false} />);

    expect(screen.getByText('Vencido')).toBeInTheDocument();
  });
});

// ── Tests: estados de carga y vacío ──────────────────────────────────────────

describe('ProductsTable — estados de carga y vacío', () => {
  it('muestra el estado de carga cuando isLoading=true', () => {
    render(<ProductsTable products={[]} isLoading={true} />);
    expect(screen.getByTestId('products-table-loading')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay productos y isLoading=false', () => {
    render(<ProductsTable products={[]} isLoading={false} />);
    expect(screen.getByTestId('products-table-empty')).toBeInTheDocument();
  });

  it('renderiza la tabla cuando hay productos y isLoading=false', () => {
    const products = [makeProduct()];
    render(<ProductsTable products={products} isLoading={false} />);
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });
});
