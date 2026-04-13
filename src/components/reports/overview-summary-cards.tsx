import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportsSectionHeader } from '@/components/reports/reports-section-header';
import { useCurrency } from '@/hooks/use-currency';
import type { ReportsOverviewSummary } from '@/types/reports';

interface OverviewSummaryCardsProps {
  summary: ReportsOverviewSummary;
}

interface MetricCardProps {
  title: string;
  value: string;
  hint: string;
  accentClassName?: string;
  featured?: boolean;
}

function MetricCard({ title, value, hint, accentClassName, featured = false }: MetricCardProps) {
  return (
    <Card className={featured ? 'border-primary/30 bg-primary/5' : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold tracking-tight ${accentClassName ?? ''}`}>{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function OverviewSummaryCards({ summary }: OverviewSummaryCardsProps) {
  const { formatAmount } = useCurrency();

  return (
    <section className="space-y-4" data-testid="reports-overview-section">
      <ReportsSectionHeader
        title="Resumen ejecutivo"
        description="Los KPIs más rápidos para entender ventas, cobranza y exposición sin entrar al detalle."
      />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            title="Ventas totales"
            value={formatAmount(summary.totalSales)}
            hint="Total completado del período"
            accentClassName="text-foreground"
            featured
          />
          <MetricCard
            title="Saldo pendiente"
            value={formatAmount(summary.outstandingBalance)}
            hint="Exposición abierta del período"
            accentClassName="text-amber-600"
            featured
          />
          <MetricCard
            title="Ventas fiadas"
            value={formatAmount(summary.creditSales)}
            hint="Volumen vendido a crédito"
            accentClassName="text-primary"
          />
          <MetricCard
            title="Abonos registrados"
            value={formatAmount(summary.totalCollected)}
            hint="Cobranza dentro del período"
            accentClassName="text-emerald-600"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <MetricCard title="Clientes deudores" value={String(summary.activeDebtors)} hint="Clientes con saldo positivo" />
          <MetricCard title="Deudas cerradas" value={String(summary.closedDebts)} hint="Ventas fiadas totalmente saldadas" />
          <MetricCard title="Ticket promedio" value={formatAmount(summary.averageTicket)} hint="Promedio por venta completada" />
        </div>
      </div>
    </section>
  );
}
