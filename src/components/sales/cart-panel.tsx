/**
 * @fileoverview Panel del carrito de compras del POS.
 * Muestra filas de ítems, resumen de subtotal/IVA/total, conteo y botón "Cobrar".
 * Lee y acciona sobre `useSalesStore` directamente.
 *
 * No recibe props — usa el store internamente.
 *
 * @example
 * ```tsx
 * <CartPanel />
 * ```
 */

import { ShoppingCart, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  useSalesStore,
  selectSubtotal,
  selectTax,
  selectTotal,
  selectItemCount,
} from '@/stores/sales-store';
import { useCurrency } from '@/hooks/use-currency';
import { CartItemRow } from './cart-item-row';
import { EmptyCart } from './empty-cart';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CartPanel — Panel derecho del POS.
 *
 * Estructura:
 * - Header con título "Carrito" e ítem count badge
 * - Lista scrolleable de `CartItemRow` (o `EmptyCart`)
 * - Sección de totales: Subtotal, IVA 16%, Total
 * - Footer: botón "Limpiar" (ghost) + botón "Cobrar" (primary)
 *
 * El botón "Cobrar" llama a `openCheckout()` del store.
 * Está deshabilitado cuando el carrito está vacío.
 */
export function CartPanel() {
  const { items, updateQuantity, removeItem, clearCart, openCheckout } = useSalesStore(
    useShallow((s) => ({
      items: s.items,
      updateQuantity: s.updateQuantity,
      removeItem: s.removeItem,
      clearCart: s.clearCart,
      openCheckout: s.openCheckout,
    }))
  );

  // Derivados calculados desde el store state
  const storeState = useSalesStore();
  const subtotal = selectSubtotal(storeState);
  const tax = selectTax(storeState);
  const total = selectTotal(storeState);
  const itemCount = selectItemCount(storeState);

  const { formatAmount } = useCurrency();

  const isEmpty = items.length === 0;

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="size-4" />
            Carrito
            {itemCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                {itemCount}
              </span>
            )}
          </CardTitle>

          {!isEmpty && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-muted-foreground hover:text-destructive"
              onClick={clearCart}
              aria-label="Limpiar carrito"
            >
              <Trash2 className="size-3.5" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Lista de ítems */}
      <CardContent className="flex-1 overflow-y-auto min-h-0 py-0 px-4">
        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div>
            {items.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Totales */}
      {!isEmpty && (
        <>
          <Separator className="mx-4" />
          <div className="px-4 py-3 space-y-1.5 shrink-0">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatAmount(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>IVA (16%)</span>
              <span className="tabular-nums">{formatAmount(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums text-primary">{formatAmount(total)}</span>
            </div>
          </div>
        </>
      )}

      {/* Footer: botón Cobrar */}
      <CardFooter className="pt-0 pb-4 px-4 shrink-0">
        <Button
          className="w-full"
          size="lg"
          disabled={isEmpty}
          onClick={openCheckout}
        >
          Cobrar
          {!isEmpty && (
            <span className="ml-2 tabular-nums opacity-90">
              {formatAmount(total)}
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
