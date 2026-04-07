/**
 * @fileoverview Diálogo de pago del POS (mock frontend-only).
 *
 * Flujo del diálogo de pago:
 *
 * ```mermaid
 * flowchart TD
 *     A[Cobrar] --> B[Abre diálogo]
 *     B --> C{Método de pago}
 *     C -->|Efectivo| D[Ingresar monto recibido]
 *     D --> E{¿Cubre el total?}
 *     E -->|Sí| F[Mostrar cambio]
 *     E -->|No| G[Confirmar deshabilitado]
 *     F --> H[Confirmar habilitado]
 *     C -->|Tarjeta| H
 *     H --> I[Simular procesamiento 300ms]
 *     I --> J[Estado de éxito]
 *     J --> K[Cierra y limpia carrito]
 * ```
 *
 * @example
 * ```tsx
 * <PaymentDialog open={open} onOpenChange={setOpen} />
 * ```
 */

import { useState } from 'react';
import { CreditCard, Banknote, CheckCircle2, Loader2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  useSalesStore,
  selectTotal,
  selectSubtotal,
  selectTax,
  selectChange,
} from '@/stores/sales-store';
import type { PaymentMethod } from '@/types/sales';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

type ProcessingState = 'idle' | 'processing' | 'success';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * PaymentDialog — Modal de pago del POS.
 *
 * Funciones:
 * - Muestra resumen de totales (subtotal, IVA, total)
 * - Permite seleccionar método de pago: efectivo o tarjeta
 * - Modo efectivo: campo de monto recibido con validación y cambio calculado
 * - Modo tarjeta: confirmación directa sin monto
 * - Simula procesamiento (300ms) y muestra estado de éxito antes de cerrar
 * - Al confirmar: llama a `completeSale()` que limpia el carrito
 */
export function PaymentDialog({ open, onOpenChange }: PaymentDialogProps) {
  // ─── Store ─────────────────────────────────────────────────────────────────
  const {
    paymentMethod,
    amountReceived,
    setPaymentMethod,
    setAmountReceived,
    completeSale,
    resetCheckout,
  } = useSalesStore(
    useShallow((s) => ({
      paymentMethod: s.paymentMethod,
      amountReceived: s.amountReceived,
      setPaymentMethod: s.setPaymentMethod,
      setAmountReceived: s.setAmountReceived,
      completeSale: s.completeSale,
      resetCheckout: s.resetCheckout,
    }))
  );

  // Selectores derivados desde el estado completo del store
  const storeState = useSalesStore();
  const subtotal = selectSubtotal(storeState);
  const tax = selectTax(storeState);
  const total = selectTotal(storeState);
  const change = selectChange(storeState);

  // ─── Estado local del diálogo ───────────────────────────────────────────
  const [processing, setProcessing] = useState<ProcessingState>('idle');

  // ─── Derivados de validación ────────────────────────────────────────────
  const isCash = paymentMethod === 'cash';
  const canConfirm =
    processing === 'idle' &&
    (paymentMethod === 'card' || amountReceived >= total);
  const showChange = isCash && amountReceived > 0 && amountReceived >= total;
  const showInsufficient = isCash && amountReceived > 0 && amountReceived < total;

  // ─── Handlers ────────────────────────────────────────────────────────────

  function handleMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);
    // Resetear monto al cambiar método
    if (method === 'card') {
      setAmountReceived(0);
    }
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(e.target.value);
    setAmountReceived(isNaN(value) ? 0 : value);
  }

  async function handleConfirm() {
    if (!canConfirm) return;

    // Simular procesamiento (300ms para UX — mock frontend-only)
    setProcessing('processing');
    await new Promise<void>((resolve) => setTimeout(resolve, 300));

    // Mostrar estado de éxito brevemente antes de cerrar
    setProcessing('success');
    await new Promise<void>((resolve) => setTimeout(resolve, 800));

    // Completar la venta (limpia el carrito en el store)
    completeSale();
    setProcessing('idle');
    onOpenChange(false);
  }

  function handleCancel() {
    if (processing !== 'idle') return;
    resetCheckout();
    onOpenChange(false);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && processing === 'idle') {
      resetCheckout();
    }
    if (processing !== 'idle') return; // no cerrar durante procesamiento
    onOpenChange(isOpen);
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  // Estado de éxito
  if (processing === 'success') {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[420px]" aria-describedby="payment-success-desc">
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="size-16 text-green-500" />
            <div className="text-center">
              <h2 className="text-xl font-semibold">¡Venta completada!</h2>
              <p id="payment-success-desc" className="text-sm text-muted-foreground mt-1">
                El pago fue procesado exitosamente.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            Cobrar venta
          </DialogTitle>
          <DialogDescription>
            Seleccioná el método de pago y confirmá la venta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Resumen de totales */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>IVA (16%)</span>
              <span className="tabular-nums">{formatCurrency(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="tabular-nums text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Selector de método de pago */}
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                className={cn('gap-2', paymentMethod === 'cash' && 'ring-2 ring-primary ring-offset-2')}
                onClick={() => handleMethodChange('cash')}
                disabled={processing !== 'idle'}
              >
                <Banknote className="size-4" />
                Efectivo
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                className={cn('gap-2', paymentMethod === 'card' && 'ring-2 ring-primary ring-offset-2')}
                onClick={() => handleMethodChange('card')}
                disabled={processing !== 'idle'}
              >
                <CreditCard className="size-4" />
                Tarjeta
              </Button>
            </div>
          </div>

          {/* Modo efectivo: campo de monto recibido */}
          {isCash && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="amount-received">Monto recibido (MXN)</Label>
                <Input
                  id="amount-received"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={formatCurrency(total)}
                  value={amountReceived > 0 ? amountReceived : ''}
                  onChange={handleAmountChange}
                  disabled={processing !== 'idle'}
                  className={cn(
                    'text-base',
                    showInsufficient && 'border-destructive focus-visible:ring-destructive'
                  )}
                  autoFocus
                />

                {/* Monto insuficiente */}
                {showInsufficient && (
                  <p className="text-xs text-destructive">
                    Faltan {formatCurrency(total - amountReceived)} para cubrir el total.
                  </p>
                )}
              </div>

              {/* Cambio calculado */}
              {showChange && (
                <div className="flex justify-between items-center rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-3">
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Cambio al cliente
                  </span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-400 tabular-nums">
                    {formatCurrency(change)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Modo tarjeta: info */}
          {!isCash && (
            <div className="rounded-lg bg-muted/50 border px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
              <CreditCard className="size-4 shrink-0" />
              El pago con tarjeta se procesará por {formatCurrency(total)}.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={processing !== 'idle'}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="min-w-[120px]"
          >
            {processing === 'processing' ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
