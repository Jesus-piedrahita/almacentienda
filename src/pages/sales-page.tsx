/**
 * @fileoverview Página del Punto de Venta (POS) — integración con API de ventas.
 *
 * Layout de dos columnas:
 * - Columna izquierda (2/3): `ProductSearchPanel` — búsqueda de productos
 * - Columna derecha (1/3): `CartPanel` — carrito, totales y cobro
 *
 * El `PaymentDialog` se monta aquí y se controla a través del estado
 * `checkoutPhase` del `useSalesStore`. El botón "Cobrar" en `CartPanel`
 * llama a `openCheckout()`, que setea `checkoutPhase = 'payment'`.
 *
 * La persistencia de ventas al backend se delega a `useCreateSale` en
 * `@/hooks/use-sales`, invocado desde `PaymentDialog.handleConfirm`.
 *
 * @example
 * ```tsx
 * <SalesPage />
 * ```
 */

import { ShoppingCart } from 'lucide-react';

import { ProductSearchPanel } from '@/components/sales/product-search-panel';
import { CartPanel } from '@/components/sales/cart-panel';
import { PaymentDialog } from '@/components/sales/payment-dialog';
import { useSalesStore } from '@/stores/sales-store';

/**
 * SalesPage — Página principal del módulo de ventas POS.
 *
 * Compone `ProductSearchPanel` (búsqueda), `CartPanel` (carrito) y
 * `PaymentDialog` (cobro) en el layout split-panel 2/3 + 1/3.
 *
 * El diálogo se abre cuando `checkoutPhase === 'payment'` y se cierra
 * al completar la venta (API confirma) o cancelar, reseteando el estado del store.
 */
export function SalesPage() {
  const checkoutPhase = useSalesStore((s) => s.checkoutPhase);
  const resetCheckout = useSalesStore((s) => s.resetCheckout);

  const isPaymentOpen = checkoutPhase === 'payment';

  function handlePaymentOpenChange(open: boolean) {
    if (!open) {
      resetCheckout();
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="size-8 text-primary" />
          Punto de Venta
        </h1>
        <p className="text-muted-foreground">
          Buscá productos, armá el carrito y cobrá
        </p>
      </div>

      {/* POS layout: search left (2/3) + cart right (1/3) */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Panel izquierdo: búsqueda de productos */}
        <div className="col-span-2 rounded-lg border bg-card p-4 flex flex-col min-h-0">
          <ProductSearchPanel />
        </div>

        {/* Panel derecho: carrito */}
        <div className="col-span-1 min-h-0">
          <CartPanel />
        </div>
      </div>

      {/* Diálogo de pago — controlado por checkoutPhase del store */}
      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={handlePaymentOpenChange}
      />
    </div>
  );
}
