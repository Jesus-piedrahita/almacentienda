import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from 'recharts';

import { ReportsChartCard } from '@/components/reports/reports-chart-card';
import { ReportsLegend } from '@/components/reports/reports-legend';
import { ReportsSectionHeader } from '@/components/reports/reports-section-header';
import { ReportsVisualState } from '@/components/reports/reports-visual-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useCurrency } from '@/hooks/use-currency';
import type { CreditCollectionPoint, CreditCollectionSummary } from '@/types/reports';

const creditChartConfig = {
  totalSold: {
    label: 'Fiado',
    color: '#2563eb',
  },
  totalPaid: {
    label: 'Abonado',
    color: '#10b981',
  },
  outstandingBalance: {
    label: 'Pendiente',
    color: '#f59e0b',
  },
} satisfies ChartConfig;

interface CreditCollectionChartProps {
  summary: CreditCollectionSummary;
  series: CreditCollectionPoint[];
}

export function CreditCollectionChart({ summary, series }: CreditCollectionChartProps) {
  const { formatAmount } = useCurrency();

  return (
    <section className="space-y-4" data-testid="reports-credit-section">
      <ReportsSectionHeader
        title="Crédito y cobranza"
        description="Seguimiento de fiado vendido, abonos registrados y saldo abierto. Acá tiene que leerse la película, no una lista de buckets."
        aside={
          <ReportsLegend
            items={[
              { colorClassName: 'bg-primary', label: 'Fiado' },
              { colorClassName: 'bg-emerald-500', label: 'Abonado' },
              { colorClassName: 'bg-amber-500', label: 'Pendiente' },
            ]}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <ReportsChartCard
          title="Evolución temporal"
          description="Compara lo vendido a crédito, lo recuperado y lo que todavía queda abierto." 
        >
          {series.length === 0 ? (
            <ReportsVisualState
              variant="empty"
              title="Sin buckets temporales"
              description="No hay actividad suficiente para graficar el período seleccionado."
            />
          ) : (
            <div className="space-y-4">
              <ChartContainer config={creditChartConfig} className="h-[320px]">
                <AreaChart data={series} accessibilityLayer margin={{ left: 12, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="bucketLabel"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} width={72} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent valueFormatter={(value) => formatAmount(Number(value))} />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="totalSold"
                    stroke={creditChartConfig.totalSold.color}
                    fill={creditChartConfig.totalSold.color}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalPaid"
                    stroke={creditChartConfig.totalPaid.color}
                    fill={creditChartConfig.totalPaid.color}
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="outstandingBalance"
                    stroke={creditChartConfig.outstandingBalance.color}
                    strokeWidth={2.5}
                    dot={false}
                  />
                </AreaChart>
              </ChartContainer>

              <div className="grid gap-3 sm:grid-cols-3">
                {series.map((point) => (
                  <div key={point.bucketStart} className="rounded-xl border bg-card/50 p-3 text-sm">
                    <p className="font-medium">{point.bucketLabel}</p>
                    <div className="mt-2 space-y-1 text-muted-foreground">
                      <p>Fiado: {formatAmount(point.totalSold)}</p>
                      <p>Abonado: {formatAmount(point.totalPaid)}</p>
                      <p>Pendiente: {formatAmount(point.outstandingBalance)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ReportsChartCard>

        <Card>
          <CardHeader>
            <CardTitle>Estado del ciclo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Ventas fiadas</p>
              <p className="mt-1 text-xl font-semibold text-primary">{formatAmount(summary.totalCreditSales)}</p>
              <p className="text-xs text-muted-foreground">{summary.creditSalesCount} tickets de crédito</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Abonado en el período</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600">{formatAmount(summary.totalCollected)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Saldo abierto</p>
              <p className="mt-1 text-xl font-semibold text-amber-600">{formatAmount(summary.outstandingBalance)}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Abiertas: {summary.openCreditSalesCount}</span>
                <span>Cerradas: {summary.closedCreditSalesCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
