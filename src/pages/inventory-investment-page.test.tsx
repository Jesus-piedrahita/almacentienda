import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InventoryInvestmentPage } from './inventory-investment-page';

const mockUseInventoryInvestment = vi.fn();

vi.mock('@/hooks/use-reports', () => ({
  useInventoryInvestment: (...args: unknown[]) => mockUseInventoryInvestment(...args),
}));

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number) => `$${value.toFixed(2)}`,
  }),
}));

describe('InventoryInvestmentPage', () => {
  beforeEach(() => {
    mockUseInventoryInvestment.mockReset();
  });

  it('renders loading state', () => {
    mockUseInventoryInvestment
      .mockReturnValueOnce({ isPending: true, isError: false, data: undefined })
      .mockReturnValueOnce({ isPending: true, isError: false, data: undefined });

    render(<InventoryInvestmentPage />);

    expect(screen.getByTestId('inventory-investment-loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseInventoryInvestment
      .mockReturnValueOnce({ isPending: false, isError: true, data: undefined })
      .mockReturnValueOnce({ isPending: false, isError: false, data: undefined });

    render(<InventoryInvestmentPage />);

    expect(screen.getByTestId('inventory-investment-error')).toBeInTheDocument();
  });

  it('renders snapshot and history sections', () => {
    mockUseInventoryInvestment
      .mockReturnValueOnce({
        isPending: false,
        isError: false,
        data: {
          generatedAt: '2026-04-23T10:00:00Z',
          summary: {
            totalInvestmentAtCost: 300,
            totalProducts: 2,
            totalQuantity: 15,
          },
          byCategory: [
            {
              categoryId: '10',
              categoryName: 'Despensa',
              productCount: 2,
              totalQuantity: 15,
              investmentAtCost: 300,
            },
          ],
          byProduct: [
            {
              productId: '1',
              productName: 'Arroz',
              barcode: '7501',
              categoryName: 'Despensa',
              quantity: 15,
              unitCost: 20,
              investmentAtCost: 300,
            },
          ],
        },
      })
      .mockReturnValueOnce({
        isPending: false,
        isError: false,
        data: {
          generatedAt: '2026-04-23T10:00:00Z',
          summary: {
            totalInvestmentAtCost: 300,
            totalProducts: 2,
            totalQuantity: 15,
          },
          byCategory: [],
          byProduct: [],
          period: 'week',
          periodStart: '2026-04-20T00:00:00Z',
          periodEnd: '2026-04-23T23:59:59Z',
          series: [
            {
              bucketLabel: '21 Apr',
              bucketStart: '2026-04-21T00:00:00Z',
              totalInvested: 120,
              entriesCount: 1,
            },
          ],
          entries: [
            {
              entryId: '1',
              productId: '1',
              productName: 'Arroz',
              categoryName: 'Despensa',
              quantityAdded: 6,
              unitCost: 20,
              totalCost: 120,
              enteredAt: '2026-04-21T10:00:00Z',
              source: 'migration_opening',
            },
          ],
        },
      });

    render(<InventoryInvestmentPage />);

    expect(screen.getByTestId('inventory-investment-page')).toBeInTheDocument();
    expect(screen.getByText(/Inversión en inventario/i)).toBeInTheDocument();
    expect(screen.getByTestId('investment-summary-cards')).toBeInTheDocument();
    expect(screen.getByTestId('investment-by-category-table')).toBeInTheDocument();
    expect(screen.getByTestId('investment-by-product-table')).toBeInTheDocument();
    expect(screen.getByTestId('investment-history-section')).toBeInTheDocument();
    expect(screen.getAllByText(/Saldo inicial/i).length).toBeGreaterThan(0);
  });
});
