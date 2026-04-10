/**
 * @fileoverview Fila de ítem del carrito en el POS.
 * Muestra nombre, controles de cantidad +/-, subtotal por línea y botón de eliminar.
 *
 * @example
 * ```tsx
 * <CartItemRow
 *   item={cartItem}
 *   onUpdateQuantity={updateQuantity}
 *   onRemove={removeItem}
 * />
 * ```
 */

import { Minus, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCurrency } from '@/hooks/use-currency';
import type { CartItem } from '@/types/sales';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CartItemRow — Fila individual del carrito con controles de cantidad.
 *
 * Comportamiento:
 * - Botón "–" decrementa la cantidad; si llega a 0 elimina la fila (via `onUpdateQuantity`)
 * - Botón "+" incrementa la cantidad sin límite (sin validación de stock en este mock)
 * - Botón de basura llama directamente a `onRemove`
 * - El subtotal de línea = price × quantity, se recalcula reactivamente
 */
export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const lineSubtotal = item.product.price * item.quantity;
  const { formatAmount } = useCurrency();

  function handleDecrement() {
    onUpdateQuantity(item.product.id, item.quantity - 1);
  }

  function handleIncrement() {
    onUpdateQuantity(item.product.id, item.quantity + 1);
  }

  function handleRemove() {
    onRemove(item.product.id);
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b last:border-b-0">
      {/* Info del producto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight line-clamp-1">
          {item.product.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatAmount(item.product.price)} c/u
        </p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={handleDecrement}
          aria-label={`Disminuir cantidad de ${item.product.name}`}
        >
          <Minus className="size-3" />
        </Button>

        <span className="w-7 text-center text-sm font-medium tabular-nums">
          {item.quantity}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={handleIncrement}
          aria-label={`Aumentar cantidad de ${item.product.name}`}
        >
          <Plus className="size-3" />
        </Button>
      </div>

      {/* Subtotal de línea */}
      <div className="w-20 text-right shrink-0">
        <p className="text-sm font-semibold tabular-nums">
          {formatAmount(lineSubtotal)}
        </p>
      </div>

      {/* Eliminar */}
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-destructive hover:text-destructive shrink-0"
        onClick={handleRemove}
        aria-label={`Eliminar ${item.product.name} del carrito`}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
