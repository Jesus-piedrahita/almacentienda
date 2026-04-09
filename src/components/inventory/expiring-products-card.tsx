/**
 * @fileoverview Tarjeta de productos con fecha de vencimiento.
 * Muestra una lista compacta simple y mock-friendly de productos que traen
 * `expiration_date` desde el backend.
 */

import { Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExpiringProduct } from '@/types/inventory';
import {
  getExpirationDisplayLabel,
  getExpirationDisplayStatus,
  getExpirationDisplayStatusColor,
} from '@/types/inventory';
import { cn } from '@/lib/utils';

interface ExpiringProductsCardProps {
  products: ExpiringProduct[];
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return '—';

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

/**
 * ExpiringProductsCard — Tarjeta simple de vencimientos.
 *
 * Renderiza una tarjeta con la lista de productos que tienen fecha de vencimiento.
 * Si la lista está vacía, retorna null (oculto sin espacio).
 *
 * @example
 * ```tsx
 * <ExpiringProductsCard products={expiringProducts} />
 * ```
 */
export function ExpiringProductsCard({ products }: ExpiringProductsCardProps) {
  // Hidden when backend is not yet implemented or no products were returned.
  if (products.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5 text-orange-500" />
          Productos con Fecha de Vencimiento
          <span className="ml-auto rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
            {products.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2" role="list" aria-label="Productos con fecha de vencimiento">
          {products.map((product) => {
            const status = getExpirationDisplayStatus(product.expiration_date);
            const colorClasses = getExpirationDisplayStatusColor(status);

            return (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2 text-sm"
              >
                {/* Nombre + cantidad */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Vence el {formatDate(product.expiration_date)} · {product.quantity} unidad{product.quantity !== 1 ? 'es' : ''} en stock
                  </p>
                </div>

                {/* Badge simple de estado */}
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    colorClasses
                  )}
                >
                  {getExpirationDisplayLabel(status)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
