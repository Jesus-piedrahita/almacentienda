/**
 * @fileoverview Tarjeta de productos con stock por debajo del mínimo.
 * Muestra un widget compacto con los productos que tienen quantity ≤ min_stock,
 * consumiendo `useLowStockProducts()` y manejando todos los estados de UI:
 * loading, error, vacío y poblado con lista de productos.
 */

import { PackageX, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLowStockProducts } from '@/hooks/use-inventory';

/**
 * LowStockProductsCard — Widget de stock bajo para dashboard e inventario.
 *
 * Estados manejados:
 * - Loading: skeleton de filas
 * - Error: mensaje con botón de retry
 * - Vacío: mensaje positivo (ningún producto bajo stock)
 * - Poblado: lista de productos con stock/mínimo y CTA a la vista detallada
 *
 * @example
 * ```tsx
 * <LowStockProductsCard />
 * ```
 */
export function LowStockProductsCard() {
  const navigate = useNavigate();
  const { data: products = [], isLoading, isError, refetch } = useLowStockProducts();

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageX className="size-5 text-red-500" />
            <span className="h-5 w-40 animate-pulse rounded bg-muted" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageX className="size-5 text-red-500" />
            Stock bajo mínimo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              No pudimos cargar los productos con stock bajo.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="size-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Vacío ────────────────────────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageX className="size-5 text-green-500" />
            Stock bajo mínimo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Todos los productos tienen stock por encima del mínimo.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Poblado ──────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageX className="size-5 text-red-500" />
          Stock bajo mínimo
          <span className="ml-auto rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
            {products.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul
          className="space-y-2"
          role="list"
          aria-label="Productos con stock por debajo del mínimo"
        >
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2 text-sm"
            >
              {/* Nombre */}
              <p className="min-w-0 flex-1 truncate font-medium">{product.name}</p>

              {/* Stock actual / mínimo */}
              <span
                className={cn(
                  'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  product.quantity === 0
                    ? 'border-red-300 bg-red-100 text-red-700'
                    : 'border-orange-300 bg-orange-100 text-orange-700'
                )}
              >
                {product.quantity} / {product.min_stock}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA — navega a la sección de alertas de stock en inventario */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate('/inventory?tab=low-stock')}
        >
          Ver todos los detalles
        </Button>
      </CardContent>
    </Card>
  );
}
