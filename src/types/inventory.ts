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
  quantity: number;
  minStock: number; // Stock mínimo para alerta
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
  quantity: number;
  minStock: number;
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
  quantity?: number;
  minStock?: number;
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