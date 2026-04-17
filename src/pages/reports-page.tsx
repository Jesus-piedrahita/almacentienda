import { BarChart3 } from 'lucide-react';
import { useState } from 'react';

import { CreditCollectionChart } from '@/components/reports/credit-collection-chart';
import { OverviewSummaryCards } from '@/components/reports/overview-summary-cards';
import { ReportsPageSkeleton } from '@/components/reports/reports-page-skeleton';
import { ProfitByDimensionSection } from '@/components/reports/profit-by-dimension-section';
import { ProductsPerformanceSection } from '@/components/reports/products-performance-section';
import { ReportsFilters } from '@/components/reports/reports-filters';
import { TopDebtorsSection } from '@/components/reports/top-debtors-section';
import {
  getDefaultReportFilters,
  useCreditCollectionReport,
  useProfitByDimensionReport,
  useProductsPerformanceReport,
  useReportsOverview,
} from '@/hooks/use-reports';

function SectionError({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4" role="status">
      <h2 className="text-base font-semibold text-destructive">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </section>
  );
}

function ReportsViewToggle({ view, onChange }: { view: 'sales' | 'profitability'; onChange: (view: 'sales' | 'profitability') => void }) {
  return (
    <div className="flex items-center gap-2" data-testid="reports-view-toggle">
      <button
        type="button"
        className={`rounded-lg border px-3 py-2 text-sm ${view === 'sales' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
        onClick={() => onChange('sales')}
      >
        Vista actual
      </button>
      <button
        type="button"
        className={`rounded-lg border px-3 py-2 text-sm ${view === 'profitability' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
        onClick={() => onChange('profitability')}
      >
        Rentabilidad
      </button>
    </div>
  );
}

export function ReportsPage() {
  const [filters, setFilters] = useState(getDefaultReportFilters);
  const [view, setView] = useState<'sales' | 'profitability'>('sales');

  const overviewQuery = useReportsOverview(filters);
  const creditCollectionQuery = useCreditCollectionReport(filters);
  const productsPerformanceQuery = useProductsPerformanceReport(filters);
  const profitByDimensionQuery = useProfitByDimensionReport(filters, view === 'profitability');

  const isInitialLoading =
    overviewQuery.isPending &&
    creditCollectionQuery.isPending &&
    productsPerformanceQuery.isPending;

  const hasBlockingError =
    !overviewQuery.data &&
    !creditCollectionQuery.data &&
    !productsPerformanceQuery.data &&
    (overviewQuery.isError || creditCollectionQuery.isError || productsPerformanceQuery.isError);

  const hasAnySectionData =
    Boolean(overviewQuery.data) ||
    Boolean(creditCollectionQuery.data) ||
    Boolean(productsPerformanceQuery.data);

  if (isInitialLoading) {
    return <ReportsPageSkeleton />;
  }

  if (hasBlockingError) {
    return (
      <div className="space-y-6" data-testid="reports-page-error">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <BarChart3 className="size-8 text-primary" />
            Reportes
          </h1>
          <p className="text-destructive">No se pudo cargar el módulo de reportes. Reintentá cambiando el período o refrescando la vista.</p>
        </div>
      </div>
    );
  }

  if (!hasAnySectionData) {
    return (
      <div className="space-y-6" data-testid="reports-page-empty">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <BarChart3 className="size-8 text-primary" />
            Reportes
          </h1>
          <p className="text-muted-foreground">Visión ejecutiva de ventas, cobranza y performance comercial en una sola vista.</p>
        </div>

        <ReportsFilters filters={filters} onFiltersChange={setFilters} />
        <ReportsViewToggle view={view} onChange={setView} />

        {view === 'profitability' ? (
          <ProfitByDimensionSection
            report={profitByDimensionQuery.data}
            isLoading={profitByDimensionQuery.isPending}
            isError={profitByDimensionQuery.isError}
          />
        ) : null}

        {view === 'sales' ? (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No hay datos suficientes para mostrar reportes en el período seleccionado. Probá cambiar el rango para traer actividad.
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="reports-page-success">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <BarChart3 className="size-8 text-primary" />
          Reportes
        </h1>
        <p className="text-muted-foreground">Visión ejecutiva de ventas, cobranza y performance comercial en una sola vista.</p>
      </div>

      <ReportsFilters filters={filters} onFiltersChange={setFilters} />
      <ReportsViewToggle view={view} onChange={setView} />

      {view === 'profitability' ? (
        <ProfitByDimensionSection
          report={profitByDimensionQuery.data}
          isLoading={profitByDimensionQuery.isPending}
          isError={profitByDimensionQuery.isError}
        />
      ) : null}

      {view === 'sales' && overviewQuery.data ? (
        <OverviewSummaryCards summary={overviewQuery.data.summary} />
      ) : view === 'sales' && overviewQuery.isError ? (
        <SectionError
          title="No se pudo cargar el resumen ejecutivo"
          description="El resto del módulo puede seguir funcionando, pero este bloque necesita reintento o un cambio de período."
        />
      ) : null}

      {view === 'sales' && creditCollectionQuery.data ? (
        <div className="space-y-6">
          <CreditCollectionChart
            summary={creditCollectionQuery.data.summary}
            series={creditCollectionQuery.data.series}
          />
          <TopDebtorsSection clients={creditCollectionQuery.data.topDebtors} />
        </div>
      ) : view === 'sales' && creditCollectionQuery.isError ? (
        <SectionError
          title="No se pudo cargar crédito y cobranza"
          description="No pudimos obtener la serie temporal ni el ranking de deudores para este rango."
        />
      ) : null}

      {view === 'sales' && productsPerformanceQuery.data ? (
        <ProductsPerformanceSection report={productsPerformanceQuery.data} />
      ) : view === 'sales' && productsPerformanceQuery.isError ? (
        <SectionError
          title="No se pudo cargar ventas y productos"
          description="La sección de performance comercial no respondió para el período actual."
        />
      ) : null}
    </div>
  );
}
