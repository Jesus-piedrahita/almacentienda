import { InvestmentByEntryTable } from '@/components/inventory-investment/investment-by-entry-table';
import { InvestmentPeriodSelector } from '@/components/inventory-investment/investment-period-selector';
import { InvestmentSeriesChart } from '@/components/inventory-investment/investment-series-chart';
import { useInventoryInvestment } from '@/hooks/use-reports';
import { INVESTMENT_PERIOD, type InvestmentPeriod } from '@/types/reports';

interface InvestmentHistorySectionProps {
  period: InvestmentPeriod;
  onPeriodChange: (period: InvestmentPeriod) => void;
}

function formatDate(value?: string): string {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(value));
}

export function InvestmentHistorySection({ period, onPeriodChange }: InvestmentHistorySectionProps) {
  const historyQuery = useInventoryInvestment(period);
  const hasSyntheticOpening = (historyQuery.data?.entries ?? []).some(
    (entry) => entry.source === 'migration_opening'
  );

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4" data-testid="investment-history-section">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Historial de inversión (entradas de stock)</h2>
        <p className="text-sm text-muted-foreground">
          Este bloque usa entradas de stock registradas. No representa costo de ventas, margen ni cierre comercial.
        </p>
      </div>

      <InvestmentPeriodSelector period={period} onChange={onPeriodChange} />

      {historyQuery.isPending ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Cargando historial de inversión...
        </div>
      ) : null}

      {historyQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          No pudimos cargar el historial para este período.
        </div>
      ) : null}

      {historyQuery.data ? (
        <>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
            <p>
              Período consultado: <strong>{formatDate(historyQuery.data.periodStart)}</strong> a{' '}
              <strong>{formatDate(historyQuery.data.periodEnd)}</strong>
            </p>
            {hasSyntheticOpening ? (
              <p className="mt-1 text-muted-foreground">
                Incluye registros de <strong>Saldo inicial</strong> creados por migración para establecer punto de partida histórico.
              </p>
            ) : null}
          </div>

          <InvestmentSeriesChart series={historyQuery.data.series ?? []} />
          <InvestmentByEntryTable entries={historyQuery.data.entries ?? []} />
        </>
      ) : null}
    </section>
  );
}

export const DEFAULT_INVESTMENT_PERIOD = INVESTMENT_PERIOD.WEEK;
