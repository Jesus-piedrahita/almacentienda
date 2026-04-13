import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TopDebtorsSection } from './top-debtors-section';

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number) => `money:${value}`,
  }),
}));

describe('TopDebtorsSection', () => {
  it('renders empty state when no debtors exist', () => {
    render(<TopDebtorsSection clients={[]} />);

    expect(screen.getByText(/Sin clientes deudores/i)).toBeInTheDocument();
  });

  it('renders debtor ranking rows', () => {
    render(
      <TopDebtorsSection
        clients={[
          {
            clientId: '1',
            clientName: 'Ana',
            creditSalesCount: 2,
            totalSold: 200,
            totalPaid: 40,
            outstandingBalance: 160,
            lastActivityAt: '2026-04-10T10:00:00Z',
          },
        ]}
      />
    );

    expect(screen.getByTestId('reports-top-debtors-section')).toBeInTheDocument();
    expect(screen.getAllByText('Ana')).toHaveLength(2);
    expect(screen.getAllByText('money:160')).toHaveLength(2);
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('2 ventas fiadas')).toBeInTheDocument();
  });
});
