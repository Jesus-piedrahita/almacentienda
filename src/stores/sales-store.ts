/**
 * @fileoverview Zustand store para el POS de ventas (frontend-only mock).
 * Gestiona el carrito, método de pago y fase de checkout sin persistencia.
 * Los valores derivados (subtotal, IVA, total, cambio) se exponen como
 * selectores para evitar almacenar datos redundantes.
 */

import { create } from 'zustand';

import type { Product } from '@/types/inventory';
import type {
  CartItem,
  CheckoutPhase,
  PaymentMethod,
  SalesActions,
  SalesState,
} from '@/types/sales';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const TAX_RATE = 0.16; // IVA 16%

const INITIAL_STATE: SalesState = {
  items: [],
  paymentMethod: 'cash',
  amountReceived: 0,
  checkoutPhase: 'idle',
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

type SalesStore = SalesState & SalesActions;

/**
 * Store Zustand para el módulo de ventas POS.
 * Sin persist middleware — el carrito es efímero por diseño.
 *
 * @example
 * ```tsx
 * const { items, addItem, total } = useSalesStore(
 *   useShallow((s) => ({ items: s.items, addItem: s.addItem, total: selectTotal(s) }))
 * );
 * ```
 */
export const useSalesStore = create<SalesStore>((set) => ({
  // ─── Estado inicial ───────────────────────────────────────────────────────
  ...INITIAL_STATE,

  // ─── Acciones de carrito ──────────────────────────────────────────────────

  /**
   * Agrega un producto al carrito.
   * Si el producto ya existe, incrementa su cantidad en 1.
   */
  addItem: (product: Product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { product, quantity: 1 }],
      };
    }),

  /**
   * Elimina un producto del carrito por id.
   */
  removeItem: (productId: string) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  /**
   * Actualiza la cantidad de un producto.
   * Si quantity <= 0, elimina la fila del carrito.
   */
  updateQuantity: (productId: string, quantity: number) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((i) => i.product.id !== productId),
        };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        ),
      };
    }),

  /**
   * Limpia todos los items del carrito y resetea el estado de pago.
   */
  clearCart: () =>
    set({
      items: [],
      amountReceived: 0,
      paymentMethod: 'cash',
      checkoutPhase: 'idle',
    }),

  // ─── Acciones de pago ─────────────────────────────────────────────────────

  /**
   * Establece el método de pago seleccionado.
   */
  setPaymentMethod: (method: PaymentMethod) =>
    set({ paymentMethod: method }),

  /**
   * Establece el monto recibido del cliente (modo efectivo).
   */
  setAmountReceived: (amount: number) =>
    set({ amountReceived: amount }),

  /**
   * Abre la fase de pago. Solo hace efecto si hay items en el carrito.
   */
  openCheckout: () =>
    set((state) => {
      if (state.items.length === 0) return state;
      return { checkoutPhase: 'payment' as CheckoutPhase };
    }),

  /**
   * Confirma la venta mock y resetea todo el estado.
   * No realiza ninguna llamada a la API.
   */
  completeSale: () =>
    set({
      ...INITIAL_STATE,
      checkoutPhase: 'completed' as CheckoutPhase,
    }),

  /**
   * Resetea la fase de checkout a 'idle' sin limpiar el carrito.
   * Útil para cancelar el diálogo de pago.
   */
  resetCheckout: () =>
    set({
      checkoutPhase: 'idle',
      amountReceived: 0,
    }),
}));

// ---------------------------------------------------------------------------
// Selectores derivados (no almacenados en el store)
// ---------------------------------------------------------------------------

/**
 * Suma de (precio × cantidad) para todos los items del carrito.
 */
export const selectSubtotal = (state: SalesState): number =>
  state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

/**
 * IVA (16%) calculado sobre el subtotal.
 */
export const selectTax = (state: SalesState): number =>
  selectSubtotal(state) * TAX_RATE;

/**
 * Total a cobrar (subtotal + IVA).
 */
export const selectTotal = (state: SalesState): number =>
  selectSubtotal(state) + selectTax(state);

/**
 * Cambio al cliente en modo efectivo.
 * Devuelve 0 si el monto recibido no cubre el total.
 */
export const selectChange = (state: SalesState): number =>
  Math.max(0, state.amountReceived - selectTotal(state));

/**
 * Número total de unidades en el carrito (suma de cantidades).
 */
export const selectItemCount = (state: SalesState): number =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

// ---------------------------------------------------------------------------
// Re-export de tipos útiles para consumidores del store
// ---------------------------------------------------------------------------

export type { CartItem, CheckoutPhase, PaymentMethod, SalesState, SalesActions };
