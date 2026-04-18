/**
 * @fileoverview Tarjeta de resultado de búsqueda de producto para el POS.
 * Muestra nombre, precio, stock y dispara `onAdd` al hacer click.
 *
 * @example
 * ```tsx
 * <ProductResultCard product={product} onAdd={addItem} />
 * ```
 */

import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/inventory';
import { getStockStatus, getStockStatusLabel, getStockStatusColor } from '@/types/inventory';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProductResultCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ProductResultCard — Tarjeta clickable para agregar un producto al carrito.
 *
 * Muestra:
 * - Nombre del producto
 * - Categoría (badge outline)
 * - Precio formateado según perfil monetario activo
 * - Stock con color de estado (bien / alerta / crítico)
 * - Botón "+ Agregar" que llama a `onAdd`
 *
 * El card completo también es clickable para una UX de POS más ágil.
 */
export function ProductResultCard({ product, onAdd }: ProductResultCardProps) {
  const stockStatus = getStockStatus(product.quantity, product.minStock);
  const stockColor = getStockStatusColor(stockStatus);
  const { formatAmount } = useCurrency();

  function handleClick() {
    onAdd(product);
  }

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-primary/30 active:scale-[0.98]"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Agregar ${product.name} al carrito`}
    >
      <CardContent className="p-3 flex flex-col gap-2">
        {/* Nombre y categoría */}
        <div className="flex items-start justify-between gap-1">
          <p className="font-medium text-sm leading-tight line-clamp-2 flex-1">
            {product.name}
          </p>
          <Badge variant="outline" className="text-xs shrink-0 ml-1">
            {product.categoryName}
          </Badge>
        </div>

        {/* Precio y stock */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatAmount(product.price)}
          </span>

          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border',
              stockColor
            )}
          >
            {getStockStatusLabel(stockStatus)}: {product.quantity}
          </span>
        </div>

        {/* Botón de agregar */}
        <Button
          size="sm"
          className="w-full gap-1.5 mt-1"
          onClick={(e) => {
            // Detener propagación para evitar doble disparo desde el card
            e.stopPropagation();
            onAdd(product);
          }}
        >
          <PlusCircle className="size-4" />
          Agregar
        </Button>
      </CardContent>
    </Card>
  );
}
