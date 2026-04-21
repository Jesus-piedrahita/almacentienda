import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ClosureComparativeSummary } from './closure-comparative-summary';

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number) => `money:${value}`,
  }),
}));

describe('ClosureComparativeSummary', () => {
  it('renders vendido vs cobrado comparative structure', () => {
    render(
      <ClosureComparativeSummary
        salesSummary={{
          salesCount: 5,
          unitsSold: 20,
          netSold: 120,
          ivaTotal: 24,
          grossSold: 144,
          averageTicket: 28.8,
        }}
        collectionSummary={{
          cashCollected: 40,
          transferConfirmedCollected: 50,
          totalEffectivelyCollected: 90,
          creditGenerated: 30,
          outstandingBalance: 10,
        }}
      />
    );

    expect(screen.getByTestId('closure-comparative-summary')).toBeInTheDocument();
    expect(screen.getAllByText(/Vendido \(Devengado\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cobrado \(Percibido\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('money:144').length).toBeGreaterThan(0);
    expect(screen.getAllByText('money:90').length).toBeGreaterThan(0);
    expect(screen.getAllByText('money:10').length).toBeGreaterThan(0);
    expect(screen.getByText(/incluye abonos registrados en el período/i)).toBeInTheDocument();
  });
});
