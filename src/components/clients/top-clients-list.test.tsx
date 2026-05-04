import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TopClientsList } from './top-clients-list';

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (amount: number) => `$${amount.toFixed(2)}`,
  }),
}));

describe('TopClientsList', () => {
  it('muestra el conteo como ventas fiadas', () => {
    render(
      <TopClientsList
        clients={[
          {
            id: '1',
            name: 'Ana',
            email: 'ana@test.com',
            phone: null,
            totalDebt: 120,
            debtCount: 2,
          },
        ]}
        isLoading={false}
        onSelectClient={vi.fn()}
      />
    );

    expect(screen.getByText('2 ventas fiadas')).toBeInTheDocument();
  });
});
