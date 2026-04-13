import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReportsSectionHeader } from '@/components/reports/reports-section-header';
import { ReportsVisualState } from '@/components/reports/reports-visual-state';
import { useCurrency } from '@/hooks/use-currency';
import type { TopDebtorClient } from '@/types/reports';

interface TopDebtorsSectionProps {
  clients: TopDebtorClient[];
}

export function TopDebtorsSection({ clients }: TopDebtorsSectionProps) {
  const { formatAmount } = useCurrency();
  const maxOutstanding = Math.max(1, ...clients.map((client) => client.outstandingBalance));

  return (
    <section className="space-y-4" data-testid="reports-top-debtors-section">
      <ReportsSectionHeader
        title="Top clientes deudores"
        description="Ranking por saldo real pendiente. Acá está la exposición que importa y la magnitud relativa entre clientes."
      />

      {clients.length === 0 ? (
        <ReportsVisualState
          variant="empty"
          title="Sin clientes deudores"
          description="No hay clientes con saldo pendiente para el período seleccionado."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
          <div className="rounded-xl border bg-card p-4">
            <div className="space-y-4">
              {clients.map((client, index) => (
                <div key={client.clientId} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">#{index + 1}</p>
                      <p className="font-semibold">{client.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Saldo</p>
                      <p className="font-semibold text-amber-600">{formatAmount(client.outstandingBalance)}</p>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-amber-500"
                      style={{ width: `${(client.outstandingBalance / maxOutstanding) * 100}%` }}
                    />
                  </div>

                  <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                    <span>{client.creditSalesCount} ventas fiadas</span>
                    <span>Vendido: {formatAmount(client.totalSold)}</span>
                    <span>Abonado: {formatAmount(client.totalPaid)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ventas fiadas</TableHead>
                  <TableHead>Vendido</TableHead>
                  <TableHead>Abonado</TableHead>
                  <TableHead>Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.clientId}>
                    <TableCell className="font-medium">{client.clientName}</TableCell>
                    <TableCell>{client.creditSalesCount}</TableCell>
                    <TableCell>{formatAmount(client.totalSold)}</TableCell>
                    <TableCell>{formatAmount(client.totalPaid)}</TableCell>
                    <TableCell className="font-semibold">{formatAmount(client.outstandingBalance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </section>
  );
}
