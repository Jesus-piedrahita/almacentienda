import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InvestmentSeriesChart } from './investment-series-chart';

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number) => `$${value.toFixed(2)}`,
  }),
}));

describe('InvestmentSeriesChart', () => {
  it('renders composed chart when there is historical series data', () => {
    render(
      <InvestmentSeriesChart
        series={[
          {
            bucketLabel: 'Semana actual',
            bucketStart: '2026-04-21T00:00:00Z',
            totalInvested: 120,
            entriesCount: 3,
          },
        ]}
      />
    );

    expect(screen.getByTestId('investment-series-chart')).toBeInTheDocument();
  });

  it('renders empty state when there is no historical series data', () => {
    render(<InvestmentSeriesChart series={[]} />);

    expect(screen.getByTestId('investment-series-empty')).toBeInTheDocument();
  });
});
