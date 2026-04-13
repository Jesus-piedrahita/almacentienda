import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OverviewSummaryCards } from './overview-summary-cards';

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number) => `money:${value}`,
  }),
}));

describe('OverviewSummaryCards', () => {
  it('renders executive metrics', () => {
    render(
      <OverviewSummaryCards
        summary={{
          totalSales: 1000,
          creditSales: 300,
          totalCollected: 120,
          outstandingBalance: 180,
          activeDebtors: 2,
          closedDebts: 1,
          averageTicket: 100,
        }}
      />
    );

    expect(screen.getByTestId('reports-overview-section')).toBeInTheDocument();
    expect(screen.getByText('Resumen ejecutivo')).toBeInTheDocument();
    expect(screen.getByText('money:1000')).toBeInTheDocument();
    expect(screen.getByText('money:180')).toBeInTheDocument();
    expect(screen.getByText('money:300')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/Los KPIs más rápidos para entender ventas/i)).toBeInTheDocument();
  });
});
