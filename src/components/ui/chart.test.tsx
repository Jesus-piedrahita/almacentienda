import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Area, AreaChart } from 'recharts';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-responsive-container">{children}</div>
    ),
  };
});

import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from './chart';

const config = {
  sold: { label: 'Fiado', color: '#2563eb' },
};

describe('chart ui primitive', () => {
  it('renders chart container children', () => {
    render(
      <ChartContainer config={config}>
        <AreaChart data={[{ name: 'A', sold: 10 }]}>
          <Area dataKey="sold" />
        </AreaChart>
      </ChartContainer>
    );

    expect(screen.getByTestId('mock-responsive-container')).toBeInTheDocument();
  });

  it('renders tooltip content from chart config', () => {
    render(
      <ChartContainer config={config}>
        <div>
          <ChartTooltipContent
            active
            label="01 Apr"
            payload={[{ dataKey: 'sold', name: 'sold', value: 120, color: '#2563eb' }]}
          />
        </div>
      </ChartContainer>
    );

    expect(screen.getByText('01 Apr')).toBeInTheDocument();
    expect(screen.getByText('Fiado')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('renders legend content from chart config', () => {
    render(
      <ChartContainer config={config}>
        <div>
          <ChartLegendContent payload={[{ dataKey: 'sold', value: 'sold', color: '#2563eb' }]} />
        </div>
      </ChartContainer>
    );

    expect(screen.getByText('Fiado')).toBeInTheDocument();
  });
});
