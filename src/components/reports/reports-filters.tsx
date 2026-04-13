import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ReportDateRangeFilter, ReportGroupBy } from '@/types/reports';

interface ReportsFiltersProps {
  filters: ReportDateRangeFilter;
  onFiltersChange: (filters: ReportDateRangeFilter) => void;
}

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildPreset(days: number): Pick<ReportDateRangeFilter, 'startDate' | 'endDate'> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (days - 1));

  return {
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate),
  };
}

function buildCurrentMonthPreset(): Pick<ReportDateRangeFilter, 'startDate' | 'endDate'> {
  const now = new Date();
  return {
    startDate: formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: formatDateInput(now),
  };
}

export function ReportsFilters({ filters, onFiltersChange }: ReportsFiltersProps) {
  function applyPreset(nextRange: Pick<ReportDateRangeFilter, 'startDate' | 'endDate'>) {
    onFiltersChange({
      ...filters,
      ...nextRange,
    });
  }

  function handleGroupByChange(value: string) {
    onFiltersChange({
      ...filters,
      groupBy: value as ReportGroupBy,
    });
  }

  return (
    <div className="rounded-xl border bg-card p-4" data-testid="reports-filters">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium">Período</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => applyPreset(buildPreset(7))}>
              7 días
            </Button>
            <Button type="button" variant="outline" onClick={() => applyPreset(buildPreset(30))}>
              30 días
            </Button>
            <Button type="button" variant="outline" onClick={() => applyPreset(buildCurrentMonthPreset())}>
              Mes actual
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Desde</span>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(event) => onFiltersChange({ ...filters, startDate: event.target.value })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Hasta</span>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(event) => onFiltersChange({ ...filters, endDate: event.target.value })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Agrupar por</span>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.groupBy ?? 'day'}
              onChange={(event) => handleGroupByChange(event.target.value)}
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
