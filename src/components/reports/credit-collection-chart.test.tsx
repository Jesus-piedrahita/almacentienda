import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { CreditCollectionChart } from './credit-collection-chart';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="mock-credit-responsive-container">{children}</div>
    ),
  };
});

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number) => `money:${value}`,
  }),
}));

const summary = {
  totalCreditSales: 300,
  totalCollected: 120,
  outstandingBalance: 180,
  creditSalesCount: 3,
  openCreditSalesCount: 2,
  closedCreditSalesCount: 1,
};

describe('CreditCollectionChart', () => {
  it('renders summary and time buckets', () => {
    render(
      <CreditCollectionChart
        summary={summary}
        series={[
          {
            bucketLabel: '01 Apr',
            bucketStart: '2026-04-01T00:00:00Z',
            totalSold: 100,
            totalPaid: 40,
            outstandingBalance: 60,
          },
        ]}
      />
    );

    expect(screen.getByTestId('reports-credit-section')).toBeInTheDocument();
    expect(screen.getByTestId('mock-credit-responsive-container')).toBeInTheDocument();
    expect(screen.getByText('Evolución temporal')).toBeInTheDocument();
    expect(screen.getAllByText('Fiado').length).toBeGreaterThan(0);
    expect(screen.getByText('01 Apr')).toBeInTheDocument();
    expect(screen.getByText('Abiertas: 2')).toBeInTheDocument();
    expect(screen.getByText('Cerradas: 1')).toBeInTheDocument();
  });

  it('renders empty bucket state', () => {
    render(<CreditCollectionChart summary={summary} series={[]} />);

    expect(screen.getByText(/Sin buckets temporales/i)).toBeInTheDocument();
  });
});
