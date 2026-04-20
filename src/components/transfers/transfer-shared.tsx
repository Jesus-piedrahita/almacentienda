import type { TransferProofSummary } from '@/types/transfers';

export function formatTransferAmount(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTransferDate(dateIso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateIso));
}

export function TransferContextBlock({ transfer }: { transfer: TransferProofSummary }) {
  const saleContext = transfer.saleContext;
  const hasSaleContext = saleContext !== null;

  return (
    <div className="space-y-1">
      <p>Cliente: {transfer.clientName || '—'}</p>

      {hasSaleContext ? (
        <>
          <p>
            Venta #{saleContext.saleId} · {formatTransferDate(saleContext.createdAt)}
          </p>
          <p>Total venta: {formatTransferAmount(saleContext.total)}</p>

          <div className="rounded-md border p-2">
            <p className="mb-1 font-medium">Ítems de la venta</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {saleContext.items.map((item, index) => (
                <li key={`${transfer.id}-item-${index}`} className="flex items-center justify-between gap-2">
                  <span>
                    {item.productName} × {item.quantity} · Unitario: {formatTransferAmount(item.unitPrice)}
                  </span>
                  <span>Subtotal: {formatTransferAmount(item.subtotal)}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : transfer.debtPaymentId ? (
        <p className="text-muted-foreground">Pago de deuda · Sin venta asociada</p>
      ) : (
        <p className="text-muted-foreground">Sin contexto de venta</p>
      )}
    </div>
  );
}
