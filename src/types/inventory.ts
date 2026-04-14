/**
 * @fileoverview Tipos TypeScript para el módulo de inventario.
 * Define las interfaces para productos, categorías y estadísticas.
 */

/**
 * Categoría de producto
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
}

/**
 * Datos para crear una nueva categoría
 */
export interface CreateCategoryInput {
  name: string;
  description?: string;
}

/**
 * Estado del stock de un producto
 */
export type StockStatus = 'good' | 'warning' | 'critical';

/**
 * Producto en el inventario
 */
export interface Product {
  id: string;
  barcode: string; // Código de barras (obligatorio, único)
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  price: number;
  cost: number;
  markupPct?: number;
  quantity: number;
  minStock: number; // Stock mínimo para alerta
  /** Fecha de vencimiento en formato ISO-8601 (YYYY-MM-DD). Opcional. */
  expiration_date?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Resumen de categoría para estadísticas
 */
export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalValue: number;
  totalQuantity: number;
}

/**
 * Estadísticas globales del inventario
 */
export interface InventoryStats {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  categorySummary: CategorySummary[];
  stockStatus: {
    good: number; // stock > 8
    warning: number; // stock > 4 && stock <= 8
    critical: number; // stock <= 4
  };
}

/**
 * Datos para crear un nuevo producto
 */
export interface CreateProductInput {
  barcode: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  cost: number;
  markupPct?: number;
  quantity: number;
  minStock: number;
  /** Fecha de vencimiento en formato ISO-8601 (YYYY-MM-DD). Opcional. */
  expiration_date?: string;
}

/**
 * Datos para actualizar un producto
 */
export interface UpdateProductInput {
  barcode?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  cost?: number;
  markupPct?: number;
  quantity?: number;
  minStock?: number;
  /** Fecha de vencimiento en formato ISO-8601 (YYYY-MM-DD). Opcional. */
  expiration_date?: string;
}

export type BulkMarkupScope = 'selected' | 'category' | 'all';

export interface BulkMarkupSelectedInput {
  scope: 'selected';
  productIds: string[];
  markupPct: number;
}

export interface BulkMarkupCategoryInput {
  scope: 'category';
  categoryId: number;
  markupPct: number;
}

export interface BulkMarkupAllInput {
  scope: 'all';
  markupPct: number;
}

export type BulkMarkupInput =
  | BulkMarkupSelectedInput
  | BulkMarkupCategoryInput
  | BulkMarkupAllInput;

export interface BulkMarkupResult {
  updatedCount: number;
  skippedCount: number;
  updatedProducts: Product[];
}

/**
 * Función helper para determinar el estado del stock
 * @param quantity - Cantidad actual del producto
 * @returns Estado del stock
 */
export function getStockStatus(quantity: number): StockStatus {
  if (quantity > 8) return 'good';
  if (quantity > 4) return 'warning';
  return 'critical';
}

/**
 * Función helper para obtener el color del estado del stock
 * @param status - Estado del stock
 * @returns Color CSS compatible con Tailwind
 */
export function getStockStatusColor(status: StockStatus): string {
  switch (status) {
    case 'good':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

/**
 * Función helper para obtener el texto del estado del stock
 * @param status - Estado del stock
 * @returns Texto descriptivo
 */
export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case 'good':
      return 'Bien';
    case 'warning':
      return 'Alerta';
    case 'critical':
      return 'Crítico';
  }
}

// ============================================================
// Expiration types + helpers
// ============================================================

/**
 * Const map de estados de visualización de vencimiento.
 *
 * Esta UI usa la opción simple aprobada por producto:
 * - `Vencido`
 * - `Con fecha`
 * - `Sin vencimiento`
 */
export const EXPIRATION_DISPLAY_STATUS = {
  EXPIRED: 'expired',
  HAS_DATE: 'has_date',
  NONE: 'none',
} as const;

/**
 * Estado de visualización de vencimiento derivado de `EXPIRATION_DISPLAY_STATUS`.
 */
export type ExpirationDisplayStatus =
  (typeof EXPIRATION_DISPLAY_STATUS)[keyof typeof EXPIRATION_DISPLAY_STATUS];

/**
 * Producto próximo a vencer tal como lo devuelve el endpoint de alertas.
 */
export interface ExpiringProduct {
  id: string;
  name: string;
  /** Fecha de vencimiento en formato ISO-8601 (YYYY-MM-DD). */
  expiration_date: string;
  /** Días restantes hasta el vencimiento (negativo si ya venció). */
  days_remaining: number;
  quantity: number;
}

function parseExpirationDate(isoDate: string | undefined): Date | null {
  if (!isoDate) return null;

  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return null;

  const parsedDate = new Date(year, month - 1, day);
  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
}

/**
 * Determina el estado simple de vencimiento a partir de una fecha opcional.
 *
 * @param expirationDate - Fecha de vencimiento en formato ISO-8601 (YYYY-MM-DD)
 * @returns Estado de visualización para UI simple
 */
export function getExpirationDisplayStatus(
  expirationDate: string | undefined
): ExpirationDisplayStatus {
  const parsedDate = parseExpirationDate(expirationDate);
  if (!parsedDate) return EXPIRATION_DISPLAY_STATUS.NONE;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return parsedDate.getTime() < today.getTime()
    ? EXPIRATION_DISPLAY_STATUS.EXPIRED
    : EXPIRATION_DISPLAY_STATUS.HAS_DATE;
}

/**
 * Devuelve una etiqueta legible para el estado simple de vencimiento.
 */
export function getExpirationDisplayLabel(status: ExpirationDisplayStatus): string {
  switch (status) {
    case EXPIRATION_DISPLAY_STATUS.EXPIRED:
      return 'Vencido';
    case EXPIRATION_DISPLAY_STATUS.HAS_DATE:
      return 'Con fecha';
    case EXPIRATION_DISPLAY_STATUS.NONE:
      return 'Sin vencimiento';
  }
}

/**
 * Devuelve clases Tailwind para el estado simple de vencimiento.
 */
export function getExpirationDisplayStatusColor(
  status: ExpirationDisplayStatus
): string {
  switch (status) {
    case EXPIRATION_DISPLAY_STATUS.EXPIRED:
      return 'text-red-700 bg-red-100 border-red-300';
    case EXPIRATION_DISPLAY_STATUS.HAS_DATE:
      return 'text-slate-700 bg-slate-100 border-slate-300';
    case EXPIRATION_DISPLAY_STATUS.NONE:
      return 'text-muted-foreground bg-muted border-border';
  }
}
