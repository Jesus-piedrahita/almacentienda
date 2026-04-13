import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportsSectionHeader } from '@/components/reports/reports-section-header';
import { ReportsVisualState } from '@/components/reports/reports-visual-state';
import { useCurrency } from '@/hooks/use-currency';
import type { ProductsPerformanceReport, ProductPerformanceItem } from '@/types/reports';

interface ProductsPerformanceSectionProps {
  report: ProductsPerformanceReport;
}

interface ProductTableProps {
  title: string;
  items: ProductPerformanceItem[];
  accentClassName: string;
}

function ProductTable({ title, items, accentClassName }: ProductTableProps) {
  const { formatAmount } = useCurrency();
  const maxUnits = Math.max(1, ...items.map((item) => item.totalUnitsSold));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <ReportsVisualState
            variant="empty"
            title="Sin datos comparativos"
            description="No hay datos suficientes para mostrar este bloque en el período."
          />
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.productId} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">#{index + 1}</p>
                    <p className="font-semibold">{item.productName}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{item.totalUnitsSold} unidades</p>
                    <p>{formatAmount(item.totalRevenue)}</p>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${accentClassName}`}
                    style={{ width: `${(item.totalUnitsSold / maxUnits) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProductsPerformanceSection({ report }: ProductsPerformanceSectionProps) {
  const { formatAmount } = useCurrency();
  const maxCategoryUnits = Math.max(1, ...report.categories.map((category) => category.totalUnitsSold));

  return (
    <section className="space-y-4" data-testid="reports-products-section">
      <ReportsSectionHeader
        title="Ventas y productos"
        description="Qué empuja ingresos, qué rota lento y qué categorías concentran volumen. La idea es detectar ganadores y fricciones rápido."
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Producto destacado</CardTitle>
          </CardHeader>
          <CardContent>
            {report.bestSeller ? (
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Más vendido por unidades</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-primary">{report.bestSeller.productName}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{report.bestSeller.totalUnitsSold} unidades</span>
                  <span>{formatAmount(report.bestSeller.totalRevenue)} de ingreso</span>
                </div>
              </div>
            ) : (
              <ReportsVisualState
                variant="empty"
                title="Sin producto líder"
                description="Todavía no hay ventas para destacar un producto líder en el período."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            {report.categories.length === 0 ? (
              <ReportsVisualState
                variant="empty"
                title="Sin categorías activas"
                description="No hay categorías con actividad en el período."
              />
            ) : (
              <div className="space-y-3">
                {report.categories.map((category) => (
                  <div key={category.categoryName} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{category.categoryName}</p>
                      <p className="text-sm text-muted-foreground">{category.totalUnitsSold} unidades</p>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(category.totalUnitsSold / maxCategoryUnits) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{formatAmount(category.totalRevenue)} de ingreso</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ProductTable title="Top por unidades" items={report.topProducts} accentClassName="bg-primary" />
        <ProductTable title="Top por ingreso" items={report.topRevenueProducts} accentClassName="bg-emerald-500" />
        <ProductTable title="Menor rotación" items={report.lowRotationProducts} accentClassName="bg-amber-500" />
      </div>
    </section>
  );
}
