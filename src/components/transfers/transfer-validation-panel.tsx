import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TransferProofPreviewModal } from '@/components/transfers/transfer-proof-preview-modal';
import { TransferProofThumbnail } from '@/components/transfers/transfer-proof-thumbnail';
import { TransferStatusBadge } from '@/components/transfers/transfer-status-badge';
import { useTransfers, useValidateTransfer } from '@/hooks/use-transfers';
import type { TransferProofSummary } from '@/types/transfers';

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateIso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateIso));
}

function TransferContextBlock({ transfer }: { transfer: TransferProofSummary }) {
  const saleContext = transfer.saleContext;
  const hasSaleContext = saleContext !== null;

  return (
    <div className="space-y-1">
      <p>Cliente: {transfer.clientName || '—'}</p>

      {hasSaleContext ? (
        <>
          <p>
            Venta #{saleContext.saleId} · {formatDate(saleContext.createdAt)}
          </p>
          <p>Total venta: {formatAmount(saleContext.total)}</p>

          <div className="rounded-md border p-2">
            <p className="mb-1 font-medium">Ítems de la venta</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {saleContext.items.map((item, index) => (
                <li key={`${transfer.id}-item-${index}`} className="flex items-center justify-between gap-2">
                  <span>
                    {item.productName} × {item.quantity} · Unitario: {formatAmount(item.unitPrice)}
                  </span>
                  <span>Subtotal: {formatAmount(item.subtotal)}</span>
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

export function TransferValidationPanel() {
  const { data, isLoading } = useTransfers('pending');
  const validateTransfer = useValidateTransfer();
  const [rejectReasonById, setRejectReasonById] = useState<Record<string, string>>({});
  const [selectedProof, setSelectedProof] = useState<TransferProofSummary | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = (summary: TransferProofSummary) => {
    if (!summary.proofUrl) {
      return;
    }

    setSelectedProof(summary);
    setIsPreviewOpen(true);
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando transferencias pendientes...</div>;
  }

  if (!data || data.data.length === 0) {
    return <div className="text-sm text-muted-foreground">No hay transferencias pendientes.</div>;
  }

  return (
    <div className="space-y-4">
      {data.data.map((transfer) => (
        <Card key={transfer.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4 text-base">
              <span>Transferencia #{transfer.id}</span>
              <TransferStatusBadge status={transfer.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1">
              <p>Referencia: {transfer.referenceNote || 'Sin referencia'}</p>
              <TransferContextBlock transfer={transfer} />
              <TransferProofThumbnail
                summary={transfer}
                onClick={() => {
                  handleOpenPreview(transfer);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`reject-reason-${transfer.id}`}>Motivo de rechazo</Label>
              <Input
                id={`reject-reason-${transfer.id}`}
                value={rejectReasonById[transfer.id] ?? ''}
                onChange={(event) => {
                  setRejectReasonById((current) => ({
                    ...current,
                    [transfer.id]: event.target.value,
                  }));
                }}
                placeholder="Obligatorio solo si rechazás"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => validateTransfer.mutate({ proofId: transfer.id, action: 'confirm' })}
                disabled={validateTransfer.isPending}
              >
                Confirmar
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  validateTransfer.mutate({
                    proofId: transfer.id,
                    action: 'reject',
                    reason: rejectReasonById[transfer.id],
                  })
                }
                disabled={validateTransfer.isPending || !(rejectReasonById[transfer.id] ?? '').trim()}
              >
                Rechazar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <TransferProofPreviewModal
        open={isPreviewOpen}
        onOpenChange={(open) => {
          setIsPreviewOpen(open);
          if (!open) {
            setSelectedProof(null);
          }
        }}
        proof={selectedProof}
      />
    </div>
  );
}
