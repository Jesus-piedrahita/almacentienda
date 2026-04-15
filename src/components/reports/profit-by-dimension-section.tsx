import { AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportsSectionHeader } from '@/components/reports/reports-section-header';
import { ReportsVisualState } from '@/components/reports/reports-visual-state';
import { useCurrency } from '@/hooks/use-currency';
import type { ProfitByDimensionReport } from '@/types/reports';

interface ProfitByDimensionSectionProps {
  report?: ProfitByDimensionReport;
  isLoading?: boolean;
  isError?: boolean;
}

function formatMetric(value: number | null, formatter: (value: number) => string) {
  return value === null ? '—' : formatter(value);
}

function formatPercent(value: number | null) {
  return value === null ? '—' : `${value.toFixed(2)}%`;
}

export function ProfitByDimensionSection({ report, isLoading = false, isError = false }: ProfitByDimensionSectionProps) {
  const { formatAmount } = useCurrency();

  if (isLoading) {
    return (
      <section data-testid="profit-by-dimension-section">
        <ReportsVisualState
          variant="loading"
          title="Cargando rentabilidad"
          description="Estamos calculando ganancias históricas por período, categoría y producto."
        />
      </section>
    );
  }

  if (isError) {
    return (
      <section data-testid="profit-by-dimension-section">
        <ReportsVisualState
          variant="error"
          title="No se pudo cargar la rentabilidad"
          description="No pudimos calcular la vista de ganancias para el período seleccionado."
        />
      </section>
    );
  }

  if (!report || (report.categories.length === 0 && report.topByProfit.length === 0 && report.series.length === 0)) {
    return (
      <section data-testid="profit-by-dimension-section">
        <ReportsVisualState
          variant="empty"
          title="Sin datos de rentabilidad"
          description="No hay ventas suficientes para calcular ganancias en el período seleccionado."
        />
      </section>
    );
  }

  const maxSeriesRevenue = Math.max(1, ...report.series.map((point) => point.totalRevenue));

  return (
    <section className="space-y-4" data-testid="profit-by-dimension-section">
      <ReportsSectionHeader
        title="Rentabilidad"
        description="Ganancia bruta histórica por período, categoría y producto usando el costo registrado al momento de vender."
      />

      {report.hasIncompleteCostData ? (
        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
          data-testid="profit-warning-banner"
          role="status"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-700">Rentabilidad incompleta</p>
              <p className="text-muted-foreground">
                Algunas ventas no tienen costo unitario registrado al momento de la venta. La ganancia bruta de esas líneas no está incluida en los totales.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Ganancia por período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.series.map((point) => (
              <div key={`${point.bucketStart}-${point.bucketLabel}`} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{point.bucketLabel}</p>
                    <p className="text-sm text-muted-foreground">Ingresos: {formatAmount(point.totalRevenue)}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{formatMetric(point.grossProfit, formatAmount)}</p>
                    <p>{formatPercent(point.marginPct)}</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted" title={point.grossProfit === null ? 'Sin costo registrado para este período' : undefined}>
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${(point.totalRevenue / maxSeriesRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ganancia por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.categories.map((category) => (
                <div key={category.categoryName} className="rounded-lg border p-3" data-testid="profit-category-row">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{category.categoryName}</p>
                      {category.hasIncompleteCostData ? <p className="text-xs text-amber-600">Costo incompleto</p> : null}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Ingreso: {formatAmount(category.totalRevenue)}</p>
                      <p>Costo: {formatMetric(category.totalCost, formatAmount)}</p>
                      <p>Ganancia: {formatMetric(category.grossProfit, formatAmount)}</p>
                      <p>Margen: {formatPercent(category.marginPct)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top productos por ganancia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.topByProfit.map((product) => (
                <div key={product.productId} className="rounded-lg border p-3" data-testid="profit-product-row">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                      {product.hasIncompleteCostData ? <p className="text-xs text-amber-600">Costo incompleto</p> : null}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Ingreso: {formatAmount(product.totalRevenue)}</p>
                      <p>Costo: {formatMetric(product.totalCost, formatAmount)}</p>
                      <p>Ganancia: {formatMetric(product.grossProfit, formatAmount)}</p>
                      <p>Margen: {formatPercent(product.marginPct)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
