/**
 * @fileoverview Tipos TypeScript para el módulo de ventas (POS).
 * Define las interfaces para el carrito, métodos de pago y estado del checkout.
 * Frontend-only mock — no hay persistencia en backend.
 */

import type { Product } from './inventory';

/**
 * Item en el carrito de compras del POS
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Métodos de pago soportados en el mock
 */
export const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

/**
 * Fase del proceso de checkout
 */
export const CHECKOUT_PHASE = {
  IDLE: 'idle',
  PAYMENT: 'payment',
  COMPLETED: 'completed',
} as const;

export type CheckoutPhase = (typeof CHECKOUT_PHASE)[keyof typeof CHECKOUT_PHASE];

/**
 * Estado del store de ventas POS (solo cliente)
 */
export interface SalesState {
  /** Items en el carrito */
  items: CartItem[];
  /** Método de pago seleccionado */
  paymentMethod: PaymentMethod;
  /** Monto recibido del cliente (efectivo) */
  amountReceived: number;
  /** Fase actual del checkout */
  checkoutPhase: CheckoutPhase;
}

/**
 * Acciones del store de ventas POS
 */
export interface SalesActions {
  /** Agrega un producto al carrito (incrementa cantidad si ya existe) */
  addItem: (product: Product) => void;
  /** Elimina un producto del carrito por id */
  removeItem: (productId: string) => void;
  /** Actualiza la cantidad de un producto; lo elimina si qty <= 0 */
  updateQuantity: (productId: string, quantity: number) => void;
  /** Limpia todos los items del carrito */
  clearCart: () => void;
  /** Establece el método de pago */
  setPaymentMethod: (method: PaymentMethod) => void;
  /** Establece el monto recibido del cliente */
  setAmountReceived: (amount: number) => void;
  /** Abre la fase de pago (solo si hay items) */
  openCheckout: () => void;
  /** Confirma la venta mock y resetea el estado */
  completeSale: () => void;
  /** Resetea la fase de checkout sin limpiar el carrito */
  resetCheckout: () => void;
}
