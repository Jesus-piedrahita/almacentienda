/**
 * @fileoverview Contract tests para hooks públicos del dominio reports.
 *
 * Protegen el borde frontend↔backend en reportes con payloads anidados y
 * semántica de negocio sensible:
 * - credit collection con top debtors
 * - commercial closure con sold vs collected
 * - inventory investment con series + entries históricas
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import api from '@/lib/api';
import {
  useCommercialClosureReport,
  useCreditCollectionReport,
  useInventoryInvestment,
} from './use-reports';

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('reports contract hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useCreditCollectionReport mantiene contrato camelCase con series y topDebtors', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: {
        range_start: '2026-05-01T00:00:00Z',
        range_end: '2026-05-31T23:59:59Z',
        group_by: 'week',
        summary: {
          total_credit_sales: 850,
          total_collected: 300,
          outstanding_balance: 550,
          credit_sales_count: 7,
          open_credit_sales_count: 4,
          closed_credit_sales_count: 3,
        },
        series: [
          {
            bucket_label: 'Semana 1',
            bucket_start: '2026-05-01T00:00:00Z',
            total_sold: 250,
            total_paid: 90,
            outstanding_balance: 160,
          },
        ],
        top_debtors: [
          {
            client_id: 18,
            client_name: 'María Gómez',
            credit_sales_count: 3,
            total_sold: 400,
            total_paid: 120,
            outstanding_balance: 280,
            last_activity_at: '2026-05-10T14:00:00Z',
          },
        ],
      },
    });

    const queryClient = makeQueryClient();
    const { result } = renderHook(
      () =>
        useCreditCollectionReport({
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          groupBy: 'week',
        }),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      rangeStart: '2026-05-01T00:00:00Z',
      rangeEnd: '2026-05-31T23:59:59Z',
      groupBy: 'week',
      summary: {
        totalCreditSales: 850,
        totalCollected: 300,
        outstandingBalance: 550,
        creditSalesCount: 7,
        openCreditSalesCount: 4,
        closedCreditSalesCount: 3,
      },
      series: [
        {
          bucketLabel: 'Semana 1',
          bucketStart: '2026-05-01T00:00:00Z',
          totalSold: 250,
          totalPaid: 90,
          outstandingBalance: 160,
        },
      ],
      topDebtors: [
        {
          clientId: '18',
          clientName: 'María Gómez',
          creditSalesCount: 3,
          totalSold: 400,
          totalPaid: 120,
          outstandingBalance: 280,
          lastActivityAt: '2026-05-10T14:00:00Z',
        },
      ],
    });
  });

  it('useCommercialClosureReport mantiene semántica sold vs collected', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: {
        range_start: '2026-05-20T00:00:00Z',
        range_end: '2026-05-20T23:59:59Z',
        sales_summary: {
          sales_count: 5,
          units_sold: 12,
          net_sold: 500,
          iva_total: 80,
          gross_sold: 580,
          average_ticket: 116,
        },
        collection_summary: {
          cash_collected: 200,
          transfer_confirmed_collected: 150,
          total_effectively_collected: 350,
          credit_generated: 180,
          outstanding_balance: 60,
        },
        top_products: [
          {
            product_id: 9,
            product_name: 'Aceite 1L',
            total_units_sold: 4,
            total_revenue: 200,
          },
        ],
      },
    });

    const queryClient = makeQueryClient();
    const { result } = renderHook(
      () =>
        useCommercialClosureReport({
          startDate: '2026-05-20',
          endDate: '2026-05-20',
        }),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      rangeStart: '2026-05-20T00:00:00Z',
      rangeEnd: '2026-05-20T23:59:59Z',
      salesSummary: {
        salesCount: 5,
        unitsSold: 12,
        netSold: 500,
        ivaTotal: 80,
        grossSold: 580,
        averageTicket: 116,
      },
      collectionSummary: {
        cashCollected: 200,
        transferConfirmedCollected: 150,
        totalEffectivelyCollected: 350,
        creditGenerated: 180,
        outstandingBalance: 60,
      },
      topProducts: [
        {
          productId: '9',
          productName: 'Aceite 1L',
          totalUnitsSold: 4,
          totalRevenue: 200,
        },
      ],
    });
  });

  it('useInventoryInvestment mantiene contrato histórico con series y entries', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: {
        generated_at: '2026-05-21T10:30:00Z',
        summary: {
          total_investment_at_cost: 900,
          total_products: 3,
          total_quantity: 27,
        },
        by_category: [
          {
            category_id: 4,
            category_name: 'Despensa',
            product_count: 2,
            total_quantity: 20,
            investment_at_cost: 600,
          },
        ],
        by_product: [
          {
            product_id: 15,
            product_name: 'Arroz 1kg',
            barcode: '7501000000015',
            category_name: 'Despensa',
            quantity: 10,
            unit_cost: 30,
            investment_at_cost: 300,
          },
        ],
        period: 'month',
        period_start: '2026-05-01T00:00:00Z',
        period_end: '2026-05-31T23:59:59Z',
        series: [
          {
            bucket_label: 'Semana 1',
            bucket_start: '2026-05-01T00:00:00Z',
            total_invested: 250,
            entries_count: 2,
          },
        ],
        entries: [
          {
            entry_id: 71,
            product_id: 15,
            product_name: 'Arroz 1kg',
            category_name: 'Despensa',
            quantity_added: 10,
            unit_cost: 30,
            total_cost: 300,
            entered_at: '2026-05-02T09:15:00Z',
            source: 'product_update',
          },
        ],
      },
    });

    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useInventoryInvestment('month'), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      generatedAt: '2026-05-21T10:30:00Z',
      summary: {
        totalInvestmentAtCost: 900,
        totalProducts: 3,
        totalQuantity: 27,
      },
      byCategory: [
        {
          categoryId: '4',
          categoryName: 'Despensa',
          productCount: 2,
          totalQuantity: 20,
          investmentAtCost: 600,
        },
      ],
      byProduct: [
        {
          productId: '15',
          productName: 'Arroz 1kg',
          barcode: '7501000000015',
          categoryName: 'Despensa',
          quantity: 10,
          unitCost: 30,
          investmentAtCost: 300,
        },
      ],
      period: 'month',
      periodStart: '2026-05-01T00:00:00Z',
      periodEnd: '2026-05-31T23:59:59Z',
      series: [
        {
          bucketLabel: 'Semana 1',
          bucketStart: '2026-05-01T00:00:00Z',
          totalInvested: 250,
          entriesCount: 2,
        },
      ],
      entries: [
        {
          entryId: '71',
          productId: '15',
          productName: 'Arroz 1kg',
          categoryName: 'Despensa',
          quantityAdded: 10,
          unitCost: 30,
          totalCost: 300,
          enteredAt: '2026-05-02T09:15:00Z',
          source: 'product_update',
        },
      ],
    });
    expect(mockedApiGet).toHaveBeenCalledWith('/api/reports/inventory-investment', {
      params: { period: 'month' },
    });
  });
});
