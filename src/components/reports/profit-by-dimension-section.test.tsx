import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProfitByDimensionSection } from './profit-by-dimension-section';

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number) => `$${value.toFixed(2)}`,
  }),
}));

const report = {
  rangeStart: '2026-04-01T00:00:00Z',
  rangeEnd: '2026-04-30T23:59:59Z',
  groupBy: 'week' as const,
  hasIncompleteCostData: true,
  categories: [
    {
      categoryName: 'Despensa',
      totalRevenue: 300,
      totalCost: null,
      grossProfit: null,
      marginPct: null,
      hasIncompleteCostData: true,
    },
  ],
  topByProfit: [
    {
      productId: '1',
      productName: 'Arroz',
      categoryName: 'Despensa',
      totalRevenue: 200,
      totalCost: 120,
      grossProfit: 80,
      marginPct: 40,
      hasIncompleteCostData: false,
    },
  ],
  series: [
    {
      bucketLabel: '01 Apr - 07 Apr',
      bucketStart: '2026-04-01T00:00:00Z',
      totalRevenue: 300,
      grossProfit: null,
      marginPct: null,
    },
  ],
};

describe('ProfitByDimensionSection', () => {
  it('renders warning banner for incomplete cost data', () => {
    render(<ProfitByDimensionSection report={report} />);

    expect(screen.getByTestId('profit-warning-banner')).toBeInTheDocument();
  });

  it('renders empty state when there is no profitability data', () => {
    render(
      <ProfitByDimensionSection
        report={{
          ...report,
          hasIncompleteCostData: false,
          categories: [],
          topByProfit: [],
          series: [],
        }}
      />
    );

    expect(screen.getByText(/Sin datos de rentabilidad/i)).toBeInTheDocument();
  });

  it('renders em dash for null profitability fields', () => {
    render(<ProfitByDimensionSection report={report} />);

    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
