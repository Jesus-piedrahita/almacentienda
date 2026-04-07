/**
 * @fileoverview Estado vacío del carrito en el POS.
 * Muestra un ícono y mensaje cuando no hay ítems en el carrito.
 *
 * @example
 * ```tsx
 * <EmptyCart />
 * ```
 */

import { ShoppingCart } from 'lucide-react';

/**
 * EmptyCart — Estado vacío visual del carrito de compras.
 *
 * Muestra:
 * - Ícono de carrito en tono apagado
 * - Mensaje principal "El carrito está vacío"
 * - Hint de cómo agregar productos
 */
export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground select-none">
      <div className="rounded-full bg-muted p-4">
        <ShoppingCart className="size-8 opacity-50" />
      </div>
      <div>
        <p className="text-sm font-medium">El carrito está vacío</p>
        <p className="text-xs mt-1 opacity-70">
          Agregá productos para empezar
        </p>
      </div>
    </div>
  );
}
