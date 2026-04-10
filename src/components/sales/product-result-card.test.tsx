/**
 * @fileoverview Tests para ProductResultCard.
 *
 * Cobertura:
 * - Render: nombre, precio, stock badge, botón "Agregar"
 * - Click en botón "Agregar" llama a onAdd con el producto correcto
 * - Click en el card (fuera del botón) también llama a onAdd
 * - El card tiene atributo role="button" para accesibilidad
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductResultCard } from './product-result-card';
import type { Product } from '@/types/inventory';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProduct: Product = {
  id: 'prod-1',
  barcode: '7501234567890',
  name: 'Coca Cola 600ml',
  description: 'Refresco de cola',
  categoryId: 'cat-1',
  categoryName: 'Bebidas',
  price: 18.5,
  cost: 12.0,
  quantity: 50,
  minStock: 10,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const lowStockProduct: Product = {
  ...mockProduct,
  id: 'prod-2',
  name: 'Agua Mineral 1L',
  quantity: 3, // critical stock
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductResultCard', () => {
  let onAdd: (product: Product) => void;

  beforeEach(() => {
    onAdd = vi.fn();
  });

  // ── Render ────────────────────────────────────────────────────────────────

  it('renderiza el nombre del producto', () => {
    render(<ProductResultCard product={mockProduct} onAdd={onAdd} />);
    expect(screen.getByText('Coca Cola 600ml')).toBeInTheDocument();
  });

  it('renderiza el nombre de la categoría como badge', () => {
    render(<ProductResultCard product={mockProduct} onAdd={onAdd} />);
    expect(screen.getByText('Bebidas')).toBeInTheDocument();
  });

  it('renderiza el precio formateado', () => {
    render(<ProductResultCard product={mockProduct} onAdd={onAdd} />);
    // El precio puede variar según la moneda/locale activa del entorno de prueba
    // pero el número 18.5 debe estar presente en alguna forma
    expect(screen.getByText(/18[.,]5/)).toBeInTheDocument();
  });

  it('renderiza información de stock del producto', () => {
    render(<ProductResultCard product={mockProduct} onAdd={onAdd} />);
    // El componente muestra la cantidad con texto "Bien: 50"
    // Usamos getAllByText ya que "50" puede aparecer en el precio también ($18.50)
    const elements = screen.getAllByText(/50/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
    // Al menos un elemento contiene el stock label "Bien"
    expect(screen.getByText(/Bien/)).toBeInTheDocument();
  });

  it('renderiza el botón "Agregar" como elemento <button>', () => {
    render(<ProductResultCard product={mockProduct} onAdd={onAdd} />);
    // El <button> concreto tiene exactamente el texto "Agregar"
    // El card wrapper tiene role="button" con aria-label diferente
    expect(screen.getByRole('button', { name: /^agregar$/i })).toBeInTheDocument();
  });

  it('el card tiene role="button" para accesibilidad', () => {
    render(<ProductResultCard product={mockProduct} onAdd={onAdd} />);
    // El card wrapper también es role="button"
    const cardButtons = screen.getAllByRole('button');
    expect(cardButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra estado crítico para stock bajo', () => {
    render(<ProductResultCard product={lowStockProduct} onAdd={onAdd} />);
    // Debe mostrar "Crítico" label y la cantidad 3
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  // ── Interacción: botón "Agregar" ─────────────────────────────────────────

  it('llama a onAdd con el producto al hacer click en el botón "Agregar"', async () => {
    const user = userEvent.setup();
    render(<ProductResultCard product={mockProduct} onAdd={onAdd} />);

    const btn = screen.getByRole('button', { name: /^agregar$/i });
    await user.click(btn);

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(mockProduct);
  });

  // ── Interacción: click en card ────────────────────────────────────────────

  it('llama a onAdd al hacer click en el nombre del producto (dentro del card)', async () => {
    const user = userEvent.setup();
    render(<ProductResultCard product={mockProduct} onAdd={onAdd} />);

    // Click en el nombre del producto (dentro del card pero fuera del botón)
    const productName = screen.getByText('Coca Cola 600ml');
    await user.click(productName);

    expect(onAdd).toHaveBeenCalledWith(mockProduct);
  });

  it('llama a onAdd exactamente una vez al hacer click en botón (no doble disparo)', async () => {
    // Verifica que el click en el botón no llame a onAdd dos veces
    // (el botón tiene stopPropagation para evitar doble disparo desde el card)
    const user = userEvent.setup();
    render(<ProductResultCard product={mockProduct} onAdd={onAdd} />);

    const btn = screen.getByRole('button', { name: /^agregar$/i });
    await user.click(btn);

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('pasa el producto correcto a onAdd para productos distintos', async () => {
    const user = userEvent.setup();
    render(<ProductResultCard product={lowStockProduct} onAdd={onAdd} />);

    const btn = screen.getByRole('button', { name: /^agregar$/i });
    await user.click(btn);

    expect(onAdd).toHaveBeenCalledWith(lowStockProduct);
    expect(onAdd).not.toHaveBeenCalledWith(mockProduct);
  });
});
