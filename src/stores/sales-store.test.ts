/**
 * @fileoverview Unit tests para useSalesStore + selectores derivados.
 *
 * Estrategia:
 * - Crear una instancia fresca del store en cada test usando `getInitialState()`
 *   a través del API del store (act directo sobre las acciones exportadas).
 * - No montar ningún componente — todas las aserciones son sobre estado puro.
 * - Los selectores derivados se prueban por separado pasándoles el state directamente.
 *
 * Cobertura:
 * - addItem: agregar nuevo producto, merge de duplicados (quantity++)
 * - updateQuantity: incrementar, decrementar, eliminar al llegar a 0
 * - removeItem: eliminar por id
 * - clearCart: vaciar carrito y resetear estado de pago
 * - completeSale: reset completo, phase='completed'
 * - resetCheckout: phase='idle', amountReceived=0, items se preservan
 * - selectSubtotal, selectItemTax, selectTaxTotal, selectTotal: derivados dinámicos
 * - selectChange: cambio al cliente (0 si insuficiente)
 * - selectItemCount: suma de quantities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  useSalesStore,
  selectSubtotal,
  selectItemTax,
  selectAppliedTaxRates,
  selectTaxTotal,
  selectTotal,
  selectChange,
  selectItemCount,
} from './sales-store';
import type { Product } from '@/types/inventory';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeProduct(overrides?: Partial<Product>): Product {
  return {
    id: 'prod-1',
    barcode: '7501234567890',
    name: 'Coca Cola 600ml',
    description: 'Refresco',
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
    ...overrides,
  };
}

const productA = makeProduct({ id: 'prod-1', price: 10.00, name: 'Producto A' });
const productB = makeProduct({ id: 'prod-2', price: 20.00, name: 'Producto B' });

// ── Store reset helper ────────────────────────────────────────────────────────

/**
 * Resetea el store a estado inicial antes de cada test.
 * Llama a clearCart() que devuelve items=[], amountReceived=0,
 * paymentMethod='cash', checkoutPhase='idle'.
 */
function resetStore() {
  useSalesStore.getState().clearCart();
}

// ── Tests: addItem ────────────────────────────────────────────────────────────

describe('useSalesStore: addItem', () => {
  beforeEach(resetStore);

  it('agrega un producto nuevo al carrito con quantity 1', () => {
    useSalesStore.getState().addItem(productA);

    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe('prod-1');
    expect(items[0].quantity).toBe(1);
  });

  it('agrega múltiples productos distintos como filas separadas', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().addItem(productB);

    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(2);
  });

  it('incrementa la cantidad en 1 si el producto ya existe (no duplica fila)', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().addItem(productA);

    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('merge solo afecta al producto duplicado, los demás quedan intactos', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().addItem(productB);
    useSalesStore.getState().addItem(productA);

    const { items } = useSalesStore.getState();
    const a = items.find((i) => i.product.id === 'prod-1')!;
    const b = items.find((i) => i.product.id === 'prod-2')!;
    expect(a.quantity).toBe(2);
    expect(b.quantity).toBe(1);
  });
});

describe('useSalesStore: selectAppliedTaxRates', () => {
  beforeEach(resetStore);

  it('returns unique sorted effective taxed rates from cart items', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().addItem(
      makeProduct({
        id: 'prod-3',
        name: 'Producto C',
        price: 15,
        effectiveTaxRate: 0.09,
        effectiveTaxMode: 'taxed',
      })
    );
    useSalesStore.getState().addItem(
      makeProduct({
        id: 'prod-4',
        name: 'Producto D',
        price: 8,
        effectiveTaxRate: 0.16,
        effectiveTaxMode: 'taxed',
      })
    );

    const state = useSalesStore.getState();
    expect(selectAppliedTaxRates(state)).toEqual([0.09, 0.16]);
  });

  it('ignores exempt and non-taxable items', () => {
    useSalesStore.getState().addItem(
      makeProduct({
        id: 'prod-5',
        name: 'Producto Exento',
        effectiveTaxMode: 'exempt',
        effectiveTaxRate: 0,
      })
    );
    useSalesStore.getState().addItem(
      makeProduct({
        id: 'prod-6',
        name: 'Producto No Gravado',
        effectiveTaxMode: 'non_taxable',
        effectiveTaxRate: null,
      })
    );

    const state = useSalesStore.getState();
    expect(selectAppliedTaxRates(state)).toEqual([]);
  });
});

// ── Tests: updateQuantity ────────────────────────────────────────────────────

describe('useSalesStore: updateQuantity', () => {
  beforeEach(resetStore);

  it('actualiza la cantidad de un producto existente', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().updateQuantity('prod-1', 5);

    const { items } = useSalesStore.getState();
    expect(items[0].quantity).toBe(5);
  });

  it('elimina la fila cuando quantity llega a 0', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().updateQuantity('prod-1', 0);

    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(0);
  });

  it('elimina la fila cuando quantity es negativa', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().updateQuantity('prod-1', -1);

    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(0);
  });

  it('solo afecta al producto especificado, otros quedan intactos', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().addItem(productB);
    useSalesStore.getState().updateQuantity('prod-1', 3);

    const { items } = useSalesStore.getState();
    const b = items.find((i) => i.product.id === 'prod-2')!;
    expect(b.quantity).toBe(1); // productB no cambió
  });
});

// ── Tests: removeItem ────────────────────────────────────────────────────────

describe('useSalesStore: removeItem', () => {
  beforeEach(resetStore);

  it('elimina un producto del carrito por id', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().addItem(productB);
    useSalesStore.getState().removeItem('prod-1');

    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe('prod-2');
  });

  it('no falla si se intenta eliminar un id inexistente', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().removeItem('no-existe');

    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(1);
  });
});

// ── Tests: clearCart ─────────────────────────────────────────────────────────

describe('useSalesStore: clearCart', () => {
  beforeEach(resetStore);

  it('vacía todos los items del carrito', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().addItem(productB);
    useSalesStore.getState().clearCart();

    const { items } = useSalesStore.getState();
    expect(items).toHaveLength(0);
  });

  it('resetea amountReceived a 0', () => {
    useSalesStore.getState().setAmountReceived(500);
    useSalesStore.getState().clearCart();

    expect(useSalesStore.getState().amountReceived).toBe(0);
  });

  it('resetea paymentMethod a "cash"', () => {
    useSalesStore.getState().setPaymentMethod('credit');
    useSalesStore.getState().clearCart();

    expect(useSalesStore.getState().paymentMethod).toBe('cash');
  });

  it('resetea selectedClientId a null', () => {
    useSalesStore.getState().setSelectedClientId('client-1');
    useSalesStore.getState().clearCart();

    expect(useSalesStore.getState().selectedClientId).toBeNull();
  });

  it('resetea transferFile y transferReferenceNote', () => {
    const file = new File(['proof'], 'proof.png', { type: 'image/png' });
    useSalesStore.getState().setTransferFile(file);
    useSalesStore.getState().setTransferReferenceNote('REF-1');
    useSalesStore.getState().clearCart();

    expect(useSalesStore.getState().transferFile).toBeNull();
    expect(useSalesStore.getState().transferReferenceNote).toBe('');
  });

  it('resetea checkoutPhase a "idle"', () => {
    useSalesStore.getState().openCheckout(); // pasa a 'payment'
    useSalesStore.getState().clearCart();

    expect(useSalesStore.getState().checkoutPhase).toBe('idle');
  });
});

// ── Tests: completeSale ──────────────────────────────────────────────────────

describe('useSalesStore: completeSale', () => {
  beforeEach(resetStore);

  it('limpia el carrito después de completar la venta', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().completeSale();

    expect(useSalesStore.getState().items).toHaveLength(0);
  });

  it('resetea amountReceived y paymentMethod', () => {
    useSalesStore.getState().setPaymentMethod('credit');
    useSalesStore.getState().setAmountReceived(200);
    useSalesStore.getState().completeSale();

    const state = useSalesStore.getState();
    expect(state.amountReceived).toBe(0);
    expect(state.paymentMethod).toBe('cash');
  });

  it('resetea selectedClientId al completar venta', () => {
    useSalesStore.getState().setSelectedClientId('client-1');
    useSalesStore.getState().completeSale();

    expect(useSalesStore.getState().selectedClientId).toBeNull();
  });

  it('establece checkoutPhase="completed" después de completar', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().openCheckout();
    useSalesStore.getState().completeSale();

    expect(useSalesStore.getState().checkoutPhase).toBe('completed');
  });
});

// ── Tests: resetCheckout ─────────────────────────────────────────────────────

describe('useSalesStore: resetCheckout', () => {
  beforeEach(resetStore);

  it('resetea phase a "idle" sin limpiar el carrito', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().openCheckout();
    useSalesStore.getState().resetCheckout();

    const state = useSalesStore.getState();
    expect(state.checkoutPhase).toBe('idle');
    expect(state.items).toHaveLength(1); // carrito intacto
  });

  it('resetea amountReceived a 0', () => {
    useSalesStore.getState().setAmountReceived(150);
    useSalesStore.getState().resetCheckout();

    expect(useSalesStore.getState().amountReceived).toBe(0);
  });

  it('resetea selectedClientId a null', () => {
    useSalesStore.getState().setSelectedClientId('client-1');
    useSalesStore.getState().resetCheckout();

    expect(useSalesStore.getState().selectedClientId).toBeNull();
  });
});

describe('useSalesStore: selectedClientId', () => {
  beforeEach(resetStore);

  it('permite setear selectedClientId', () => {
    useSalesStore.getState().setSelectedClientId('client-99');
    expect(useSalesStore.getState().selectedClientId).toBe('client-99');
  });

  it('permite setear transferFile y transferReferenceNote', () => {
    const file = new File(['proof'], 'proof.png', { type: 'image/png' });
    useSalesStore.getState().setTransferFile(file);
    useSalesStore.getState().setTransferReferenceNote('REF-99');

    expect(useSalesStore.getState().transferFile).toBe(file);
    expect(useSalesStore.getState().transferReferenceNote).toBe('REF-99');
  });

  it('limpia selectedClientId al cambiar paymentMethod fuera de credit', () => {
    useSalesStore.getState().setPaymentMethod('credit');
    useSalesStore.getState().setSelectedClientId('client-99');
    useSalesStore.getState().setPaymentMethod('cash');

    expect(useSalesStore.getState().selectedClientId).toBeNull();
  });
});

// ── Tests: openCheckout ──────────────────────────────────────────────────────

describe('useSalesStore: openCheckout', () => {
  beforeEach(resetStore);

  it('cambia checkoutPhase a "payment" cuando hay items', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().openCheckout();

    expect(useSalesStore.getState().checkoutPhase).toBe('payment');
  });

  it('NO cambia checkoutPhase si el carrito está vacío', () => {
    useSalesStore.getState().openCheckout();

    expect(useSalesStore.getState().checkoutPhase).toBe('idle');
  });
});

// ── Tests: Selectores derivados ───────────────────────────────────────────────

describe('selectores derivados', () => {
  beforeEach(resetStore);

  it('selectSubtotal: devuelve 0 para carrito vacío', () => {
    const state = useSalesStore.getState();
    expect(selectSubtotal(state)).toBe(0);
  });

  it('selectSubtotal: suma correctamente price × quantity para múltiples items', () => {
    useSalesStore.getState().addItem(productA); // 10 × 1 = 10
    useSalesStore.getState().addItem(productB); // 20 × 1 = 20
    useSalesStore.getState().updateQuantity('prod-1', 3); // 10 × 3 = 30

    const state = useSalesStore.getState();
    expect(selectSubtotal(state)).toBeCloseTo(30 + 20); // 50
  });

  it('selectItemTax: calcula impuesto por item', () => {
    useSalesStore.getState().addItem(productA); // subtotal = 10
    const state = useSalesStore.getState();

    expect(selectItemTax(state.items[0])).toBeCloseTo(1.6);
  });

  it('selectTaxTotal: suma impuestos de carrito mixto', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().addItem({
      ...productB,
      taxMode: 'exempt',
      taxRate: null,
      effectiveTaxMode: 'exempt',
      effectiveTaxRate: 0,
    });
    const state = useSalesStore.getState();

    expect(selectTaxTotal(state)).toBeCloseTo(1.6);
  });

  it('selectTotal: subtotal + IVA', () => {
    useSalesStore.getState().addItem(productA); // price = 10
    const state = useSalesStore.getState();

    expect(selectTotal(state)).toBeCloseTo(11.6); // 10 + impuesto dinámico
  });

  it('selectChange: devuelve 0 si amountReceived < total', () => {
    useSalesStore.getState().addItem(productA); // total ≈ 11.6
    useSalesStore.getState().setAmountReceived(5);

    const state = useSalesStore.getState();
    expect(selectChange(state)).toBe(0);
  });

  it('selectChange: devuelve amountReceived - total si cubre', () => {
    useSalesStore.getState().addItem(productA); // total ≈ 11.6
    useSalesStore.getState().setAmountReceived(20);

    const state = useSalesStore.getState();
    expect(selectChange(state)).toBeCloseTo(20 - 11.6);
  });

  it('selectChange: devuelve 0 exacto cuando amountReceived = total', () => {
    useSalesStore.getState().addItem(productA); // total ≈ 11.6
    const total = selectTotal(useSalesStore.getState());
    useSalesStore.getState().setAmountReceived(total);

    const state = useSalesStore.getState();
    expect(selectChange(state)).toBeCloseTo(0);
  });

  it('selectItemCount: devuelve 0 para carrito vacío', () => {
    const state = useSalesStore.getState();
    expect(selectItemCount(state)).toBe(0);
  });

  it('selectItemCount: suma todas las quantities', () => {
    useSalesStore.getState().addItem(productA);
    useSalesStore.getState().updateQuantity('prod-1', 3);
    useSalesStore.getState().addItem(productB);

    const state = useSalesStore.getState();
    expect(selectItemCount(state)).toBe(4); // 3 + 1
  });

  it('los selectores se recalculan reactivamente con cada cambio', () => {
    useSalesStore.getState().addItem(productA); // price = 10

    const state1 = useSalesStore.getState();
    expect(selectSubtotal(state1)).toBeCloseTo(10);

    useSalesStore.getState().updateQuantity('prod-1', 2);
    const state2 = useSalesStore.getState();
    expect(selectSubtotal(state2)).toBeCloseTo(20);
  });
});
