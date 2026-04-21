import { ClipboardList } from 'lucide-react';
import { useState } from 'react';

import { ClosureComparativeSummary } from '@/components/reports/closure-comparative-summary';
import {
  ClosurePeriodSelector,
  type ClosurePreset,
} from '@/components/reports/closure-period-selector';
import { ClosureSalesTable } from '@/components/reports/closure-sales-table';
import { ClosureTopProductsList } from '@/components/reports/closure-top-products-list';
import { useCommercialClosureReport } from '@/hooks/use-reports';
import { useSalesFiltered } from '@/hooks/use-sales';

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function resolvePresetDates(preset: ClosurePreset): { startDate: string; endDate: string } {
  const today = new Date();

  if (preset === 'today') {
    const current = formatDateInput(today);
    return { startDate: current, endDate: current };
  }

  if (preset === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const value = formatDateInput(yesterday);
    return { startDate: value, endDate: value };
  }

  if (preset === 'week') {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return { startDate: formatDateInput(start), endDate: formatDateInput(today) };
  }

  if (preset === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: formatDateInput(start), endDate: formatDateInput(today) };
  }

  const current = formatDateInput(today);
  return { startDate: current, endDate: current };
}

export function CommercialClosurePage() {
  const [preset, setPreset] = useState<ClosurePreset>('today');
  const [dateRange, setDateRange] = useState(resolvePresetDates('today'));
  const [page, setPage] = useState(1);

  const closureQuery = useCommercialClosureReport({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  const salesQuery = useSalesFiltered({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    page,
  });

  function handlePresetChange(nextPreset: ClosurePreset) {
    setPreset(nextPreset);
    if (nextPreset !== 'custom') {
      setDateRange(resolvePresetDates(nextPreset));
    }
    setPage(1);
  }

  function handleCustomRangeChange(nextRange: { startDate: string; endDate: string }) {
    setPreset('custom');
    setDateRange(nextRange);
    setPage(1);
  }

  return (
    <div className="space-y-6" data-testid="commercial-closure-page">
      <div className="space-y-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <ClipboardList className="size-8 text-primary" />
            Cierre Comercial
          </h1>
          <p className="text-muted-foreground">
            Separá claramente lo vendido (devengado) de lo cobrado (percibido) en el período.
          </p>
        </div>

        <ClosurePeriodSelector
          preset={preset}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onPresetChange={handlePresetChange}
          onCustomRangeChange={handleCustomRangeChange}
        />
      </div>

      {closureQuery.isPending ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Cargando cierre comercial...
        </div>
      ) : null}

      {closureQuery.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          No pudimos cargar el cierre comercial para ese rango.
        </div>
      ) : null}

      {closureQuery.data ? (
        <>
          <ClosureComparativeSummary
            salesSummary={closureQuery.data.salesSummary}
            collectionSummary={closureQuery.data.collectionSummary}
          />

          <ClosureTopProductsList products={closureQuery.data.topProducts} />
        </>
      ) : null}

      <ClosureSalesTable
        sales={salesQuery.data?.data ?? []}
        pagination={
          salesQuery.data?.pagination ?? {
            page,
            limit: 20,
            total: 0,
            totalPages: 0,
          }
        }
        onPageChange={setPage}
      />
    </div>
  );
}
