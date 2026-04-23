import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useCurrency } from '@/hooks/use-currency';
import type { InventoryInvestmentPeriodBucket } from '@/types/reports';

interface InvestmentSeriesChartProps {
  series: InventoryInvestmentPeriodBucket[];
}

const chartConfig = {
  totalInvested: {
    label: 'Inversión',
    color: '#2563eb',
  },
  entriesCount: {
    label: 'Entradas',
    color: '#16a34a',
  },
} satisfies ChartConfig;

export function InvestmentSeriesChart({ series }: InvestmentSeriesChartProps) {
  const { formatAmount } = useCurrency();

  if (series.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground" data-testid="investment-series-empty">
        No hay entradas de stock para graficar en este período.
      </div>
    );
  }

  return (
    <div data-testid="investment-series-chart">
      <ChartContainer config={chartConfig} className="h-[280px]">
        <ComposedChart data={series} accessibilityLayer margin={{ left: 12, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="bucketLabel" tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis tickLine={false} axisLine={false} tickMargin={10} width={72} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                valueFormatter={(value, name) =>
                  name === 'entriesCount' ? `${Number(value)} entradas` : formatAmount(Number(value))
                }
              />
            }
          />
          <Bar dataKey="totalInvested" fill={chartConfig.totalInvested.color} radius={[6, 6, 0, 0]} />
          <Line
            type="monotone"
            dataKey="entriesCount"
            stroke={chartConfig.entriesCount.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}
