import { Coins } from 'lucide-react';
import { useState } from 'react';

import { InvestmentByCategoryTable } from '@/components/inventory-investment/investment-by-category-table';
import { InvestmentByProductTable } from '@/components/inventory-investment/investment-by-product-table';
import {
  DEFAULT_INVESTMENT_PERIOD,
  InvestmentHistorySection,
} from '@/components/inventory-investment/investment-history-section';
import { InvestmentSummaryCards } from '@/components/inventory-investment/investment-summary-cards';
import { Badge } from '@/components/ui/badge';
import { useInventoryInvestment } from '@/hooks/use-reports';
import type { InvestmentPeriod } from '@/types/reports';

export function InventoryInvestmentPage() {
  const [period, setPeriod] = useState<InvestmentPeriod>(DEFAULT_INVESTMENT_PERIOD);
  const snapshotQuery = useInventoryInvestment();

  return (
    <div className="space-y-6" data-testid="inventory-investment-page">
      <header className="space-y-3">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Coins className="size-8 text-primary" />
          Inversión en inventario
        </h1>
        <p className="text-muted-foreground">
          Capital inmovilizado en stock valuado al costo de compra actual.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Calculado al costo de compra, no al precio de venta</Badge>
          <Badge variant="outline">Separado de costo de ventas, rentabilidad y cierre comercial</Badge>
        </div>
      </header>

      {snapshotQuery.isPending ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground" data-testid="inventory-investment-loading">
          Cargando inversión actual de inventario...
        </div>
      ) : null}

      {snapshotQuery.isError ? (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive"
          data-testid="inventory-investment-error"
        >
          No se pudo cargar la inversión actual de inventario.
        </div>
      ) : null}

      {snapshotQuery.data ? (
        <>
          <InvestmentSummaryCards summary={snapshotQuery.data.summary} />
          <InvestmentByCategoryTable
            rows={snapshotQuery.data.byCategory}
            totalInvestmentAtCost={snapshotQuery.data.summary.totalInvestmentAtCost}
          />
          <InvestmentByProductTable rows={snapshotQuery.data.byProduct} />
          <InvestmentHistorySection period={period} onPeriodChange={setPeriod} />
        </>
      ) : null}
    </div>
  );
}
