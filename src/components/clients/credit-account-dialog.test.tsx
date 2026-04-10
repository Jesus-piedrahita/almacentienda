import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { CreditAccountDialog } from './credit-account-dialog';

describe('CreditAccountDialog', () => {
  it('renderiza grupos por venta y bloque legado', () => {
    render(
      <CreditAccountDialog
        open
        onOpenChange={() => {}}
        isLoading={false}
        clientId="1"
        accountData={{
          clientId: '1',
          clientName: 'Juan Pérez',
          totalDebt: 300,
          totalPaid: 100,
          balance: 200,
          sales: [
            {
              saleId: '10',
              saleDate: '2026-04-10T14:30:00Z',
              items: [{ productName: 'Arroz', quantity: 2, unitPrice: 25, total: 50 }],
              totalSale: 200,
              totalPaid: 100,
              balance: 100,
              status: 'partial',
              payments: [],
            },
            {
              saleId: null,
              saleDate: null,
              label: 'Consumos anteriores (sin ticket)',
              items: [{ productName: 'Azúcar', quantity: 1, unitPrice: 30, total: 30 }],
              totalSale: 100,
              totalPaid: 0,
              balance: 100,
              status: 'unpaid',
              payments: [],
            },
          ],
        }}
      />
    );

    expect(screen.getByText(/juan pérez/i)).toBeInTheDocument();
    expect(screen.getByText(/consumos anteriores/i)).toBeInTheDocument();
    expect(screen.getAllByText(/registrar abono/i).length).toBeGreaterThan(0);
  });
});
