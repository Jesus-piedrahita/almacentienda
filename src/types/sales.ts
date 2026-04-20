/**
 * @fileoverview Tipos TypeScript para el módulo de ventas (POS).
 *
 * Tipos de dominio exportados para contratos con el backend:
 * - `SaleItem`, `Sale`, `SalesPagination`, `CreateSaleInput`
 *
 * Tipos de estado local del POS (efímeros, Zustand):
 * - `CartItem`, `SalesState`, `SalesActions`, `PaymentMethod`, `CheckoutPhase`
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
 * Métodos de pago soportados
 */
export const PAYMENT_METHOD = {
  CASH: 'cash',
  CREDIT: 'credit',
  TRANSFER: 'transfer',
} as const;

export const TRANSFER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export type TransferStatus = (typeof TRANSFER_STATUS)[keyof typeof TRANSFER_STATUS];

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
  /** Cliente seleccionado para venta fiada */
  selectedClientId: string | null;
  /** Archivo temporal del comprobante de transferencia */
  transferFile: File | null;
  /** Referencia opcional de transferencia */
  transferReferenceNote: string;
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
  /** Establece el cliente seleccionado para venta fiada */
  setSelectedClientId: (clientId: string | null) => void;
  /** Establece archivo temporal de transferencia */
  setTransferFile: (file: File | null) => void;
  /** Establece referencia de transferencia */
  setTransferReferenceNote: (referenceNote: string) => void;
  /** Establece el monto recibido del cliente */
  setAmountReceived: (amount: number) => void;
  /** Abre la fase de pago (solo si hay items) */
  openCheckout: () => void;
  /** Confirma la venta y resetea el estado */
  completeSale: () => void;
  /** Resetea la fase de checkout sin limpiar el carrito */
  resetCheckout: () => void;
}

// ============================================================
// Tipos de dominio — contratos con el backend (persistencia)
// ============================================================

/**
 * Item de una venta persistida en el backend.
 * Los IDs son strings (mapeados desde number en la API).
 */
export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number | null;
  subtotal: number;
}

/**
 * Venta persistida en el backend.
 */
export interface Sale {
  id: string;
  userId: string;
  clientId: string | null;
  clientName: string | null;
  state: 'completed' | 'cancelled';
  paymentMethod: PaymentMethod;
  transferProofId: string | null;
  transferStatus: TransferStatus | null;
  transferProofUrl: string | null;
  referenceNote: string | null;
  subtotal: number;
  total: number;
  createdAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  items: SaleItem[];
}

/**
 * Paginación de la lista de ventas.
 */
export interface SalesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Input para crear una nueva venta en el backend.
 */
export interface CreateSaleInput {
  paymentMethod: PaymentMethod;
  clientId?: string | null;
  referenceNote?: string;
  transferFile?: File | null;
  items: Array<{ productId: string; quantity: number }>;
}
