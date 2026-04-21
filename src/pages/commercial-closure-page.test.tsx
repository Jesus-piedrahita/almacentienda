import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CommercialClosurePage } from './commercial-closure-page';

vi.mock('@/hooks/use-reports', () => ({
  useCommercialClosureReport: vi.fn(() => ({
    isPending: false,
    isError: false,
    data: {
      rangeStart: '2026-04-01T00:00:00Z',
      rangeEnd: '2026-04-01T23:59:59Z',
      salesSummary: {
        salesCount: 3,
        unitsSold: 8,
        netSold: 200,
        ivaTotal: 32,
        grossSold: 232,
        averageTicket: 77.33,
      },
      collectionSummary: {
        cashCollected: 80,
        transferConfirmedCollected: 40,
        totalEffectivelyCollected: 120,
        creditGenerated: 90,
        outstandingBalance: 25,
      },
      topProducts: [
        {
          productId: '1',
          productName: 'Arroz',
          totalUnitsSold: 6,
          totalRevenue: 120,
        },
      ],
    },
  })),
}));

vi.mock('@/hooks/use-sales', () => ({
  useSalesFiltered: vi.fn(() => ({
    data: {
      data: [
        {
          id: '1',
          userId: '1',
          clientId: null,
          clientName: null,
          state: 'completed',
          paymentMethod: 'cash',
          transferProofId: null,
          transferStatus: null,
          transferProofUrl: null,
          referenceNote: null,
          subtotal: 100,
          taxTotal: 16,
          total: 116,
          createdAt: '2026-04-01T12:00:00Z',
          cancelledAt: null,
          cancelReason: null,
          items: [],
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    },
  })),
}));

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number) => `$${value.toFixed(2)}`,
  }),
}));

describe('CommercialClosurePage', () => {
  it('renders commercial closure dashboard sections', () => {
    render(<CommercialClosurePage />);

    expect(screen.getByTestId('commercial-closure-page')).toBeInTheDocument();
    expect(screen.getByTestId('closure-period-selector')).toBeInTheDocument();
    expect(screen.getByTestId('closure-comparative-summary')).toBeInTheDocument();
    expect(screen.getByTestId('closure-top-products-list')).toBeInTheDocument();
    expect(screen.getByTestId('closure-sales-table')).toBeInTheDocument();
    expect(screen.getByTestId('closure-sales-table-scroll-container')).toBeInTheDocument();
  });
});
