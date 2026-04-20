import { useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';

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
import { useCurrency } from '@/hooks/use-currency';
import { useRegisterPayment } from '@/hooks/use-clients';
import { TransferFields } from '@/components/sales/transfer-fields';

interface RegisterPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  saleId: string | null;
  saleLabel: string;
  maxAmount: number;
}

export function RegisterPaymentModal({
  open,
  onOpenChange,
  clientId,
  saleId,
  saleLabel,
  maxAmount,
}: RegisterPaymentModalProps) {
  const registerPayment = useRegisterPayment(clientId);
  const { formatAmount } = useCurrency();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [referenceNote, setReferenceNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const numericAmount = Number(amount);
  const isValidAmount = numericAmount > 0 && numericAmount <= maxAmount;

  async function handleSubmit() {
    if (!isValidAmount) {
      setError('Ingresá un monto válido que no supere el saldo pendiente.');
      return;
    }

    try {
      setError(null);
        await registerPayment.mutateAsync({
          saleId,
          amount: numericAmount,
          paymentMethod,
          transferFile,
          referenceNote: paymentMethod === 'transfer' ? referenceNote.trim() || undefined : undefined,
          note: note.trim() || undefined,
        });
        setAmount('');
        setNote('');
        setPaymentMethod('cash');
        setTransferFile(null);
        setReferenceNote('');
        onOpenChange(false);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } } };
      setError(apiError?.response?.data?.detail ?? 'No se pudo registrar el abono.');
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setAmount('');
      setNote('');
      setPaymentMethod('cash');
      setTransferFile(null);
      setReferenceNote('');
      setError(null);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            Registrar abono
          </DialogTitle>
          <DialogDescription>
            {saleLabel}. Saldo pendiente: {formatAmount(maxAmount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')}>
                Efectivo
              </Button>
              <Button type="button" variant={paymentMethod === 'transfer' ? 'default' : 'outline'} onClick={() => setPaymentMethod('transfer')}>
                Transferencia
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-amount">Monto del abono</Label>
            <Input
              id="payment-amount"
              type="number"
              min="0.01"
              max={maxAmount}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(maxAmount)}
            />
            <p className="text-xs text-muted-foreground">
               Podés registrar hasta {formatAmount(maxAmount)} en este abono.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-note">Nota</Label>
            <Input
              id="payment-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Efectivo, transferencia, referencia..."
            />
          </div>

          {paymentMethod === 'transfer' && (
            <TransferFields
              file={transferFile}
              referenceNote={referenceNote}
              onFileChange={setTransferFile}
              onReferenceNoteChange={setReferenceNote}
              fileInputId="register-payment-transfer-file"
              referenceInputId="register-payment-transfer-reference"
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={registerPayment.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValidAmount || registerPayment.isPending}>
            {registerPayment.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Guardar abono'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
