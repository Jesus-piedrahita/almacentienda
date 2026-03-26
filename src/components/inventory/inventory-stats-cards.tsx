/**
 * @fileoverview Componente de tarjetas de estadísticas del inventario.
 * Muestra: total productos, suma por categoría, valor total del inventario.
 */

import { Package, Layers, DollarSign, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InventoryStats } from '@/types/inventory';

/**
 * Formatea un número como moneda
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

/**
 * Formatea un número con separadores de miles
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-MX').format(value);
}

interface InventoryStatsCardsProps {
  stats: InventoryStats | null;
  isLoading: boolean;
}

/**
 * InventoryStatsCards - Tarjetas con estadísticas del inventario.
 *
 * Muestra:
 * - Total de productos únicos
 * - Cantidad total de unidades
 * - Valor total del inventario (precio * cantidad)
 * - Número de categorías
 *
 * @example
 * ```tsx
 * <InventoryStatsCards stats={stats} isLoading={false} />
 * ```
 */
export function InventoryStatsCards({ stats, isLoading }: InventoryStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Productos Únicos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Productos
          </CardTitle>
          <Package className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats ? formatNumber(stats.totalProducts) : '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Productos únicos
          </p>
        </CardContent>
      </Card>

      {/* Cantidad Total en Inventario */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Unidades Totales
          </CardTitle>
          <Layers className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats ? formatNumber(stats.totalQuantity) : '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            En inventario
          </p>
        </CardContent>
      </Card>

      {/* Valor Total del Inventario */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Valor Inventario
          </CardTitle>
          <DollarSign className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats ? formatCurrency(stats.totalValue) : '$0.00'}
          </div>
          <p className="text-xs text-muted-foreground">
            Precio × cantidad
          </p>
        </CardContent>
      </Card>

      {/* Número de Categorías */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Categorías
          </CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats ? stats.categorySummary.length : '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Con productos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}