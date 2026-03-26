/**
 * @fileoverview Componente de gráfico de distribución por categoría.
 * Muestra visualmente la cantidad de productos por categoría usando barras horizontales.
 */

import { cn } from '@/lib/utils';
import type { CategorySummary } from '@/types/inventory';

interface CategoryChartProps {
  categories: CategorySummary[];
}

/**
 * Obtiene un color basado en el índice de la categoría
 */
function getCategoryColor(index: number): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500',
  ];
  return colors[index % colors.length];
}

/**
 * Formatea un número como moneda
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * CategoryChart - Gráfico de distribución por categoría.
 *
 * Muestra barras horizontales con:
 * - Nombre de la categoría
 * - Cantidad de productos
 * - Valor total de esa categoría
 *
 * @example
 * ```tsx
 * <CategoryChart categories={[{ categoryId: '1', categoryName: 'Electrónica', productCount: 10, totalValue: 5000, totalQuantity: 50 }]} />
 * ```
 */
export function CategoryChart({ categories }: CategoryChartProps) {
  if (categories.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        No hay categorías con productos
      </div>
    );
  }

  // Encontrar el máximo para las barras
  const maxCount = Math.max(...categories.map((c) => c.productCount));
  const maxValue = Math.max(...categories.map((c) => c.totalValue));

  return (
    <div className="space-y-4">
      {categories.map((category, index) => {
        const percentage = maxCount > 0 ? (category.productCount / maxCount) * 100 : 0;
        const valuePercentage = maxValue > 0 ? (category.totalValue / maxValue) * 100 : 0;

        return (
          <div key={category.categoryId} className="space-y-2">
            {/* Nombre y valores */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{category.categoryName}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{category.productCount} producto{category.productCount !== 1 ? 's' : ''}</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(category.totalValue)}
                </span>
              </div>
            </div>

            {/* Barra de cantidad de productos */}
            <div className="relative h-6 overflow-hidden rounded-md bg-muted">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-md transition-all duration-500',
                  getCategoryColor(index)
                )}
                style={{ width: `${percentage}%` }}
              >
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white drop-shadow-md">
                  {category.productCount}
                </span>
              </div>
            </div>

            {/* Barra de valor (más pequeña) */}
            <div className="relative h-3 overflow-hidden rounded-full bg-muted/50">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-all duration-500 opacity-60',
                  getCategoryColor(index)
                )}
                style={{ width: `${valuePercentage}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* Resumen total */}
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">
            {categories.reduce((sum, c) => sum + c.productCount, 0)} productos en{' '}
            {categories.length} categoría{categories.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}