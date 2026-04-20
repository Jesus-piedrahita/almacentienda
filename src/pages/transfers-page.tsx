import { Landmark } from 'lucide-react';

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

      <TransferValidationPanel />
    </div>
  );
}
