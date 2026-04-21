import { useMemo, useState } from 'react';
import { CalendarClock, ReceiptText, Wallet } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrency } from '@/hooks/use-currency';
import type { ClientCreditAccount, CreditSaleGroup } from '@/types/clients';
import { RegisterPaymentModal } from './register-payment-modal';
import { TransferStatusBadge } from '@/components/transfers/transfer-status-badge';


interface CreditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountData: ClientCreditAccount | null;
  isLoading: boolean;
  clientId: string | null;
}

function formatDateTime(value: string | null): string {
  if (!value) return 'Sin ticket';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusLabel(status: CreditSaleGroup['status']): string {
  if (status === 'paid') return 'Saldado';
  if (status === 'partial') return 'Abono parcial';
  return 'Sin abonar';
}

function statusVariant(status: CreditSaleGroup['status']): 'default' | 'secondary' | 'destructive' {
  if (status === 'paid') return 'default';
  if (status === 'partial') return 'secondary';
  return 'destructive';
}

export function CreditAccountDialog({
  open,
  onOpenChange,
  accountData,
  isLoading,
  clientId,
}: CreditAccountDialogProps) {
  const [selectedGroup, setSelectedGroup] = useState<CreditSaleGroup | null>(null);
  const { formatAmount } = useCurrency();

  const saleLabel = useMemo(() => {
    if (!selectedGroup) return '';
    if (selectedGroup.saleId === null) return selectedGroup.label ?? 'Consumos anteriores (sin ticket)';
    return `Venta del ${formatDateTime(selectedGroup.saleDate)}`;
  }, [selectedGroup]);

  if (!accountData && !isLoading) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[760px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptText className="size-5 text-primary" />
              Cuenta corriente del cliente
            </DialogTitle>
            <DialogDescription>
              Historial fiado agrupado por venta, con abonos y saldo pendiente.
            </DialogDescription>
          </DialogHeader>

          {isLoading || !accountData ? (
            <div className="py-10 text-center text-muted-foreground">Cargando cuenta corriente...</div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{accountData.clientName}</h3>
                <p className="text-sm text-muted-foreground">Cliente #{accountData.clientId}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Deuda total</p>
                  <p className="text-xl font-bold text-destructive">{formatAmount(accountData.totalDebt)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Abonado</p>
                  <p className="text-xl font-bold text-primary">{formatAmount(accountData.totalPaid)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Saldo pendiente</p>
                  <p className="text-xl font-bold">{formatAmount(accountData.balance)}</p>
                </div>
              </div>

              {accountData.sales.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Este cliente no tiene historial fiado registrado.
                </div>
              ) : (
                <div className="space-y-4">
                  {accountData.sales.map((sale) => (
                    <div key={sale.saleId ?? 'legacy'} className="rounded-lg border p-4 space-y-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="size-4 text-muted-foreground" />
                            <p className="font-medium">
                              {sale.saleId === null ? sale.label ?? 'Consumos anteriores (sin ticket)' : formatDateTime(sale.saleDate)}
                            </p>
                          </div>
                          {sale.saleId !== null && (
                            <p className="text-xs text-muted-foreground">Venta #{sale.saleId}</p>
                          )}
                        </div>
                        <Badge variant={statusVariant(sale.status)}>{statusLabel(sale.status)}</Badge>
                      </div>

                      <div className="space-y-2">
                        {sale.items.map((item, index) => (
                          <div key={`${sale.saleId ?? 'legacy'}-${index}`} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-muted-foreground">
                                 Cantidad: {item.quantity} · Unit: {formatAmount(item.unitPrice)}
                              </p>
                            </div>
                             <p className="font-semibold">{formatAmount(item.total)}</p>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="grid gap-2 md:grid-cols-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total vendido</p>
                           <p className="font-semibold">{formatAmount(sale.totalSale)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total abonado</p>
                           <p className="font-semibold text-primary">{formatAmount(sale.totalPaid)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Saldo</p>
                           <p className="font-semibold">{formatAmount(sale.balance)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Abonos registrados</p>
                        {sale.payments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Todavía no hay abonos para este grupo.</p>
                        ) : (
                          <div className="space-y-2">
                            {sale.payments.map((payment) => (
                              <div key={payment.id} className="rounded-md bg-muted/50 p-3 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex flex-col gap-1">
                                    <span>{formatDateTime(payment.createdAt)}</span>
                                    {payment.paymentMethod === 'transfer' && payment.transferStatus && (
                                      <TransferStatusBadge status={payment.transferStatus} />
                                    )}
                                  </div>
                                  <span className="font-semibold text-primary">{formatAmount(payment.amount)}</span>
                                </div>
                                <p className="mt-1 text-muted-foreground">
                                  Método: {payment.paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo'}
                                </p>
                                {payment.referenceNote && (
                                  <p className="mt-1 text-muted-foreground">Referencia: {payment.referenceNote}</p>
                                )}
                                {payment.transferProofUrl && (
                                  <a
                                    href={payment.transferProofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 inline-flex text-primary underline underline-offset-2"
                                  >
                                    Ver comprobante
                                  </a>
                                )}
                                {payment.note && (
                                  <p className="mt-1 text-muted-foreground">{payment.note}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {sale.balance > 0 && clientId && (
                        <Button variant="outline" className="gap-2" onClick={() => setSelectedGroup(sale)}>
                          <Wallet className="size-4" />
                          Registrar abono
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {clientId && selectedGroup && (
        <RegisterPaymentModal
          open={!!selectedGroup}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setSelectedGroup(null);
          }}
          clientId={clientId}
          saleId={selectedGroup.saleId}
          saleLabel={saleLabel}
          maxAmount={selectedGroup.balance}
        />
      )}
    </>
  );
}
