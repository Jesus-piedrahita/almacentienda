import * as React from 'react';
import type { ComponentProps } from 'react';
import {
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

import { cn } from '@/lib/utils';

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('Chart components must be used inside ChartContainer');
  }
  return context;
}

interface ChartContainerProps {
  config: ChartConfig;
  className?: string;
  children: React.ReactNode;
}

export function ChartContainer({ config, className, children }: ChartContainerProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn('h-[280px] w-full', className)}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsTooltip;

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    name?: string;
    value?: string | number;
  }>;
  label?: string;
  valueFormatter?: (value: string | number, key: string) => string;
}

export function ChartTooltipContent({ active, payload, label, valueFormatter }: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="min-w-[180px] rounded-lg border bg-background p-3 text-sm shadow-md">
      {label ? <p className="mb-2 font-medium text-foreground">{label}</p> : null}
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? 'value');
          const item = config[key];
          const labelText = item?.label ?? String(entry.name ?? key);
          const valueText = valueFormatter
            ? valueFormatter(entry.value ?? 0, key)
            : String(entry.value ?? 0);

          return (
            <div key={`${key}-${labelText}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: entry.color ?? item?.color ?? 'currentColor' }}
                />
                <span>{labelText}</span>
              </div>
              <span className="font-medium text-foreground">{valueText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ChartLegend = RechartsLegend;

type RechartsLegendPayloadItem = {
  color?: string;
  dataKey?: string | number;
  value?: string;
};

interface ChartLegendContentProps {
  payload?: RechartsLegendPayloadItem[];
}

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
      {payload.map((entry) => {
        const key = String(entry.dataKey ?? entry.value ?? 'value');
        const item = config[key];

        return (
          <div key={`${key}-${entry.value ?? ''}`} className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: entry.color ?? item?.color ?? 'currentColor' }}
            />
            <span>{item?.label ?? entry.value ?? key}</span>
          </div>
        );
      })}
    </div>
  );
}

export type ChartProps = ComponentProps<typeof RechartsTooltip>;
