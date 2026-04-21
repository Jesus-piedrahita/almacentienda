import { Info } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';
import type {
  CommercialClosureCollectionSummary,
  CommercialClosureSalesSummary,
} from '@/types/reports';

type MetricTone = 'default' | 'bold' | 'muted' | 'destructive';

interface ComparativeMetric {
  label: string;
  value: string;
  tone?: MetricTone;
}

interface ComparativeRow {
  sold: ComparativeMetric;
  collected?: ComparativeMetric;
}

interface ClosureComparativeSummaryProps {
  salesSummary: CommercialClosureSalesSummary;
  collectionSummary: CommercialClosureCollectionSummary;
  isLoading?: boolean;
}

export function ClosureComparativeSummary({
  salesSummary,
  collectionSummary,
  isLoading = false,
}: ClosureComparativeSummaryProps) {
  const { formatAmount } = useCurrency();

  const soldMetrics: ComparativeMetric[] = [
    { label: 'Cantidad de ventas', value: String(salesSummary.salesCount) },
    { label: 'Unidades vendidas', value: String(salesSummary.unitsSold) },
    { label: 'Venta neta (sin IVA)', value: formatAmount(salesSummary.netSold) },
    { label: 'IVA', value: formatAmount(salesSummary.ivaTotal) },
    {
      label: 'Venta bruta (total)',
      value: formatAmount(salesSummary.grossSold),
      tone: 'bold',
    },
    { label: 'Ticket promedio', value: formatAmount(salesSummary.averageTicket) },
  ];

  const collectedMetrics: ComparativeMetric[] = [
    { label: 'Efectivo cobrado', value: formatAmount(collectionSummary.cashCollected) },
    {
      label: 'Transferencias confirmadas',
      value: formatAmount(collectionSummary.transferConfirmedCollected),
    },
    {
      label: 'Total cobrado efectivo',
      value: formatAmount(collectionSummary.totalEffectivelyCollected),
      tone: 'bold',
    },
    {
      label: 'Crédito generado',
      value: formatAmount(collectionSummary.creditGenerated),
      tone: 'muted',
    },
    {
      label: 'Saldo pendiente',
      value: formatAmount(collectionSummary.outstandingBalance),
      tone: 'destructive',
    },
  ];

  const rows: ComparativeRow[] = soldMetrics.map((soldMetric, index) => ({
    sold: soldMetric,
    collected: collectedMetrics[index],
  }));

  return (
    <Card data-testid="closure-comparative-summary">
      <CardHeader>
        <CardTitle>Resumen comparativo del período</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando resumen comparativo...</p>
        ) : null}

        <div className="rounded-xl border md:hidden">
          <MobileSummarySection title="Vendido (Devengado)" metrics={soldMetrics} />
          <MobileSummarySection title="Cobrado (Percibido)" metrics={collectedMetrics} />
        </div>

        <div className="hidden overflow-x-auto rounded-xl border md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Vendido (Devengado)</th>
                <th className="px-4 py-3 text-left font-semibold">Cobrado (Percibido)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.sold.label} className="border-t align-top">
                  <td className="px-4 py-3">
                    <MetricLine metric={row.sold} />
                  </td>
                  <td className="px-4 py-3">
                    {row.collected ? (
                      <MetricLine metric={row.collected} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            Cobrado incluye abonos registrados en el período, aunque la deuda se haya generado en
            períodos anteriores.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileSummarySectionProps {
  title: string;
  metrics: ComparativeMetric[];
}

function MobileSummarySection({ title, metrics }: MobileSummarySectionProps) {
  return (
    <section className="space-y-3 border-b p-4 last:border-b-0">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <ul className="space-y-2">
        {metrics.map((metric) => (
          <li key={metric.label} className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">{metric.label}</span>
            <span className={metricValueClassName(metric.tone)}>{metric.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface MetricLineProps {
  metric: ComparativeMetric;
}

function MetricLine({ metric }: MetricLineProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{metric.label}</span>
      <span className={metricValueClassName(metric.tone)}>{metric.value}</span>
    </div>
  );
}

function metricValueClassName(tone: MetricTone = 'default') {
  return cn('font-mono tabular-nums', {
    'font-semibold text-foreground': tone === 'bold',
    'text-muted-foreground': tone === 'muted',
    'font-semibold text-destructive': tone === 'destructive',
  });
}
