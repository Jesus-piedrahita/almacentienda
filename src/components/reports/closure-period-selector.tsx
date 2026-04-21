import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type ClosurePreset = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

interface ClosurePeriodSelectorProps {
  preset: ClosurePreset;
  startDate: string;
  endDate: string;
  onPresetChange: (preset: ClosurePreset) => void;
  onCustomRangeChange: (range: { startDate: string; endDate: string }) => void;
}

const PRESET_LABELS: Array<{ preset: ClosurePreset; label: string }> = [
  { preset: 'today', label: 'Hoy' },
  { preset: 'yesterday', label: 'Ayer' },
  { preset: 'week', label: 'Esta semana' },
  { preset: 'month', label: 'Este mes' },
  { preset: 'custom', label: 'Rango custom' },
];

export function ClosurePeriodSelector({
  preset,
  startDate,
  endDate,
  onPresetChange,
  onCustomRangeChange,
}: ClosurePeriodSelectorProps) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4" data-testid="closure-period-selector">
      <div>
        <h2 className="text-base font-semibold">Período del cierre</h2>
        <p className="text-sm text-muted-foreground">
          Elegí un preset o definí un rango personalizado para sincronizar resumen y detalle.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESET_LABELS.map((item) => (
          <Button
            key={item.preset}
            type="button"
            variant={preset === item.preset ? 'default' : 'outline'}
            onClick={() => onPresetChange(item.preset)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Desde</span>
          <Input
            type="date"
            value={startDate}
            disabled={preset !== 'custom'}
            onChange={(event) =>
              onCustomRangeChange({
                startDate: event.target.value,
                endDate,
              })
            }
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Hasta</span>
          <Input
            type="date"
            value={endDate}
            disabled={preset !== 'custom'}
            onChange={(event) =>
              onCustomRangeChange({
                startDate,
                endDate: event.target.value,
              })
            }
          />
        </label>
      </div>
    </section>
  );
}
