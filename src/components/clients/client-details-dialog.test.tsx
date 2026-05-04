import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientDetailsDialog } from './client-details-dialog';

const mutateAsyncMock = vi.fn();

vi.mock('@/hooks/use-clients', () => ({
  useMarkDebtPaid: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

describe('ClientDetailsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usa el shortcut legacy pasando debtId y clientId al hacer click en Marcar pagado', async () => {
    const user = userEvent.setup();

    render(
      <ClientDetailsDialog
        open
        onOpenChange={() => {}}
        isLoading={false}
        clientData={{
          id: '1',
          name: 'Ana López',
          email: 'ana@test.com',
          isActive: 1,
          createdAt: '2026-04-01T00:00:00Z',
          totalDebt: 45,
          debts: [
            {
              id: '15',
              clientId: '1',
              productId: '5',
              productName: 'Arroz',
              quantity: 1,
              unitPrice: 45,
              total: 45,
              isPaid: 0,
              createdAt: '2026-04-01T00:00:00Z',
            },
          ],
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: /marcar pagado/i }));

    expect(mutateAsyncMock).toHaveBeenCalledWith({ debtId: '15', clientId: '1' });
  });
});
