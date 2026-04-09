/**
 * @fileoverview Tests unitarios para ExpiringProductsCard.
 *
 * Verifica:
 * 1. Retorna null cuando la lista de productos está vacía.
 * 2. Renderiza la lista de productos cuando hay datos.
 * 3. El badge simple muestra `Vencido` o `Con fecha`.
 * 4. La cardinalidad del badge de conteo coincide con el total de productos.
 *
 * No requiere mocks de red. El componente es puramente presentacional.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExpiringProductsCard } from './expiring-products-card';
import type { ExpiringProduct } from '@/types/inventory';

// ── Helpers de fixtures ────────────────────────────────────────────────────────

function makeProduct(overrides: Partial<ExpiringProduct> = {}): ExpiringProduct {
  return {
    id: '1',
    name: 'Producto Test',
    expiration_date: '2026-05-01',
    days_remaining: 20,
    quantity: 10,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ExpiringProductsCard — lista vacía', () => {
  it('retorna null (no renderiza nada) cuando products=[]', () => {
    const { container } = render(<ExpiringProductsCard products={[]} />);
    // El componente devuelve null → el container está vacío
    expect(container.firstChild).toBeNull();
  });

  it('no muestra el título "Productos con Fecha de Vencimiento" con lista vacía', () => {
    render(<ExpiringProductsCard products={[]} />);
    expect(screen.queryByText(/Productos con Fecha de Vencimiento/i)).not.toBeInTheDocument();
  });
});

describe('ExpiringProductsCard — con productos', () => {
  it('renderiza el título de la tarjeta cuando hay productos', () => {
    const products = [makeProduct()];
    render(<ExpiringProductsCard products={products} />);
    expect(screen.getByText(/Productos con Fecha de Vencimiento/i)).toBeInTheDocument();
  });

  it('muestra el nombre del producto en la lista', () => {
    const products = [makeProduct({ name: 'Leche UHT' })];
    render(<ExpiringProductsCard products={products} />);
    expect(screen.getByText('Leche UHT')).toBeInTheDocument();
  });

  it('muestra la cantidad del producto', () => {
    const products = [makeProduct({ quantity: 5 })];
    render(<ExpiringProductsCard products={products} />);
    expect(screen.getByText(/5 unidades en stock/i)).toBeInTheDocument();
  });

  it('muestra "1 unidad en stock" en singular cuando quantity=1', () => {
    const products = [makeProduct({ quantity: 1 })];
    render(<ExpiringProductsCard products={products} />);
    expect(screen.getByText(/1 unidad en stock/i)).toBeInTheDocument();
  });

  it('el badge de conteo muestra el total correcto', () => {
    const products = [makeProduct({ id: '1' }), makeProduct({ id: '2' })];
    render(<ExpiringProductsCard products={products} />);
    // El badge en el header debe mostrar "2"
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renderiza múltiples productos en la lista', () => {
    const products = [
      makeProduct({ id: '1', name: 'Producto A' }),
      makeProduct({ id: '2', name: 'Producto B' }),
      makeProduct({ id: '3', name: 'Producto C' }),
    ];
    render(<ExpiringProductsCard products={products} />);
    expect(screen.getByText('Producto A')).toBeInTheDocument();
    expect(screen.getByText('Producto B')).toBeInTheDocument();
    expect(screen.getByText('Producto C')).toBeInTheDocument();
  });
});

describe('ExpiringProductsCard — etiquetas de días restantes', () => {
  it('muestra la fecha formateada para el producto', () => {
    const products = [makeProduct({ expiration_date: '2026-12-25' })];
    render(<ExpiringProductsCard products={products} />);
    expect(screen.getByText(/Vence el 25\/12\/2026/i)).toBeInTheDocument();
  });

  it('muestra "Con fecha" para un producto no vencido', () => {
    const products = [makeProduct({ expiration_date: '2999-12-31', days_remaining: 999 })];
    render(<ExpiringProductsCard products={products} />);
    expect(screen.getByText('Con fecha')).toBeInTheDocument();
  });

  it('muestra "Vencido" para un producto con fecha pasada', () => {
    const products = [makeProduct({ expiration_date: '2000-01-01', days_remaining: -3 })];
    render(<ExpiringProductsCard products={products} />);
    expect(screen.getByText('Vencido')).toBeInTheDocument();
  });
});

describe('ExpiringProductsCard — accesibilidad', () => {
  it('la lista tiene role="list" y aria-label descriptivo', () => {
    const products = [makeProduct()];
    render(<ExpiringProductsCard products={products} />);
    const list = screen.getByRole('list', { name: /Productos con fecha de vencimiento/i });
    expect(list).toBeInTheDocument();
  });
});
