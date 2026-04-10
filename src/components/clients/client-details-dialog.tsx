/**
 * @fileoverview Dialog para ver detalles de un cliente y sus deudas.
 * Muestra información del cliente y lista de productos fiados pendientes.
 */

import { Users, Phone, MapPin, FileText, Loader2 } from 'lucide-react';

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
import { useCurrency } from '@/hooks/use-currency';
import type { ClientWithDebts, ClientDebt } from '@/types/clients';
import { useMarkDebtPaid } from '@/hooks/use-clients';

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientData: ClientWithDebts | null;
  isLoading: boolean;
}

/**
 * ClientDetailsDialog - Muestra detalles del cliente y sus deudas.
 *
 * Incluye:
 * - Información del cliente
 * - Lista de productos fiados pendientes
 * - Total de deuda
 * - Opción de marcar deuda como pagada
 *
 * @example
 * ```tsx
 * <ClientDetailsDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   clientData={clientWithDebts}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function ClientDetailsDialog({
  open,
  onOpenChange,
  clientData,
  isLoading,
}: ClientDetailsDialogProps) {
  const markDebtPaidMutation = useMarkDebtPaid();
  const { formatAmount } = useCurrency();

  const handleMarkPaid = async (debtId: string) => {
    try {
      await markDebtPaidMutation.mutateAsync(debtId);
      // El query se invalidará automáticamente
    } catch (error) {
      console.error('Error al marcar deuda como pagada:', error);
    }
  };

  if (!clientData) {
    return null;
  }

  const debts = clientData.debts || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Detalles del Cliente
          </DialogTitle>
          <DialogDescription>
            Información del cliente y sus productos fiados
          </DialogDescription>
        </DialogHeader>

        {/* Información del cliente */}
        <div className="space-y-4 border-b pb-4">
          <div>
            <h3 className="text-lg font-semibold">{clientData.name}</h3>
            <Badge variant={clientData.isActive === 1 ? 'default' : 'secondary'}>
              {clientData.isActive === 1 ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">Email:</span> {clientData.email}
            </div>
            {clientData.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" />
                <span>{clientData.phone}</span>
              </div>
            )}
            {clientData.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span>{clientData.address}</span>
              </div>
            )}
            {clientData.rfc && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="size-4" />
                <span>RFC: {clientData.rfc}</span>
              </div>
            )}
          </div>
        </div>

        {/* Deudas del cliente */}
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Productos Fiados</h4>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total pendiente</p>
              <p className="text-xl font-bold text-destructive">
                {formatAmount(clientData.totalDebt)}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : debts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Este cliente no tiene productos fiados pendientes.
            </div>
          ) : (
            <div className="space-y-2">
              {debts.map((debt) => (
                <DebtItem
                  key={debt.id}
                  debt={debt}
                  formatCurrency={formatAmount}
                  onMarkPaid={handleMarkPaid}
                  isMarkingPaid={markDebtPaidMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Componente individual para cada deuda
 */
function DebtItem({
  debt,
  formatCurrency,
  onMarkPaid,
  isMarkingPaid,
}: {
  debt: ClientDebt;
  formatCurrency: (value: number) => string;
  onMarkPaid: (debtId: string) => void;
  isMarkingPaid: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex-1">
        <p className="font-medium">{debt.productName}</p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Cantidad: {debt.quantity}</span>
          <span>Unit: {formatCurrency(debt.unitPrice)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-bold">{formatCurrency(debt.total)}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onMarkPaid(debt.id)}
          disabled={isMarkingPaid}
        >
          Marcar pagado
        </Button>
      </div>
    </div>
  );
}
