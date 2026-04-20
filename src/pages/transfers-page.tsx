import { Landmark } from 'lucide-react';

import { TransferHistoryPanel } from '@/components/transfers/transfer-history-panel';
import { TransferValidationPanel } from '@/components/transfers/transfer-validation-panel';

export function TransfersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Landmark className="size-8 text-primary" />
          Transferencias
        </h1>
        <p className="text-muted-foreground">
          Revisá, confirmá o rechazá comprobantes pendientes.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <section className="space-y-3" aria-labelledby="pending-transfers-heading">
          <div>
            <h2 id="pending-transfers-heading" className="text-lg font-semibold">
              Pendientes por validar
            </h2>
            <p className="text-sm text-muted-foreground">
              Confirmá o rechazá comprobantes nuevos sin perder el contexto de la venta.
            </p>
          </div>

          <TransferValidationPanel />
        </section>

        <section className="space-y-3" aria-labelledby="transfer-history-heading">
          <div>
            <h2 id="transfer-history-heading" className="text-lg font-semibold">
              Historial reciente
            </h2>
            <p className="text-sm text-muted-foreground">
              Consultá transferencias procesadas con filtros y carga perezosa en la misma vista.
            </p>
          </div>

          <TransferHistoryPanel />
        </section>
      </div>
    </div>
  );
}
