import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import api from '@/lib/api';

import {
  getDefaultReportFilters,
  mapApiCreditCollectionReport,
  mapApiProfitByDimensionReport,
  mapApiProductsPerformanceReport,
  mapApiReportsOverview,
  reportsQueryKeys,
  useCreditCollectionReport,
  useProfitByDimensionReport,
  useProductsPerformanceReport,
  useReportsOverview,
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
      queries: { retry: false },
    },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('use-reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps overview payload from snake_case to camelCase', () => {
    const result = mapApiReportsOverview({
      range_start: '2026-04-01T00:00:00Z',
      range_end: '2026-04-30T23:59:59Z',
      summary: {
        net_revenue: 820,
        collected_taxes: 180,
        gross_revenue: 1000,
        total_sales: 1000,
        credit_sales: 300,
        total_collected: 120,
        outstanding_balance: 180,
        active_debtors: 2,
        closed_debts: 1,
        average_ticket: 100,
      },
    });

    expect(result.summary.totalSales).toBe(1000);
    expect(result.summary.netRevenue).toBe(820);
    expect(result.summary.collectedTaxes).toBe(180);
    expect(result.summary.grossRevenue).toBe(1000);
    expect(result.summary.creditSales).toBe(300);
    expect(result.summary.activeDebtors).toBe(2);
  });

  it('maps credit collection payload including top debtors', () => {
    const result = mapApiCreditCollectionReport({
      range_start: '2026-04-01T00:00:00Z',
      range_end: '2026-04-30T23:59:59Z',
      group_by: 'day',
      summary: {
        total_credit_sales: 300,
        total_collected: 120,
        outstanding_balance: 180,
        credit_sales_count: 3,
        open_credit_sales_count: 2,
        closed_credit_sales_count: 1,
      },
      series: [
        {
          bucket_label: '01 Apr',
          bucket_start: '2026-04-01T00:00:00Z',
          total_sold: 100,
          total_paid: 40,
          outstanding_balance: 60,
        },
      ],
      top_debtors: [
        {
          client_id: 8,
          client_name: 'Juan',
          credit_sales_count: 2,
          total_sold: 200,
          total_paid: 40,
          outstanding_balance: 160,
          last_activity_at: '2026-04-10T10:00:00Z',
        },
      ],
    });

    expect(result.groupBy).toBe('day');
    expect(result.series[0].bucketLabel).toBe('01 Apr');
    expect(result.topDebtors[0].clientId).toBe('8');
  });

  it('maps products performance payload including top revenue products', () => {
    const result = mapApiProductsPerformanceReport({
      range_start: '2026-04-01T00:00:00Z',
      range_end: '2026-04-30T23:59:59Z',
      best_seller: {
        product_id: 1,
        product_name: 'Arroz',
        total_units_sold: 10,
        total_revenue: 200,
        total_cost: 120,
        gross_profit: 80,
        margin_pct: 40,
      },
      top_products: [],
      top_revenue_products: [
        {
          product_id: 2,
          product_name: 'Aceite',
          total_units_sold: 5,
          total_revenue: 300,
          total_cost: null,
          gross_profit: null,
          margin_pct: null,
        },
      ],
      low_rotation_products: [],
      categories: [],
      has_incomplete_cost_data: true,
    });

    expect(result.bestSeller?.productId).toBe('1');
    expect(result.bestSeller?.grossProfit).toBe(80);
    expect(result.topRevenueProducts[0].productName).toBe('Aceite');
    expect(result.topRevenueProducts[0].totalCost).toBeNull();
    expect(result.hasIncompleteCostData).toBe(true);
  });

  it('preserves real zero cost/profit values instead of coercing to null', () => {
    const result = mapApiProductsPerformanceReport({
      range_start: '2026-04-01T00:00:00Z',
      range_end: '2026-04-30T23:59:59Z',
      best_seller: {
        product_id: 1,
        product_name: 'Promo Sticker',
        total_units_sold: 10,
        total_revenue: 50,
        total_cost: 0,
        gross_profit: 50,
        margin_pct: 100,
      },
      top_products: [],
      top_revenue_products: [],
      low_rotation_products: [],
      categories: [],
      has_incomplete_cost_data: false,
    });

    expect(result.bestSeller?.totalCost).toBe(0);
    expect(result.bestSeller?.grossProfit).toBe(50);
    expect(result.bestSeller?.marginPct).toBe(100);
  });

  it('maps profit-by-dimension payload preserving nulls and warning flag', () => {
    const result = mapApiProfitByDimensionReport({
      range_start: '2026-04-01T00:00:00Z',
      range_end: '2026-04-30T23:59:59Z',
      group_by: 'week',
      categories: [
        {
          category_name: 'Despensa',
          total_revenue: 300,
          total_cost: null,
          gross_profit: null,
          margin_pct: null,
          has_incomplete_cost_data: true,
        },
      ],
      top_by_profit: [
        {
          product_id: 1,
          product_name: 'Arroz',
          category_name: 'Despensa',
          total_revenue: 200,
          total_cost: 120,
          gross_profit: 80,
          margin_pct: 40,
          has_incomplete_cost_data: false,
        },
      ],
      series: [
        {
          bucket_label: '01 Apr - 07 Apr',
          bucket_start: '2026-04-01T00:00:00Z',
          total_revenue: 300,
          gross_profit: null,
          margin_pct: null,
        },
      ],
      has_incomplete_cost_data: true,
    });

    expect(result.groupBy).toBe('week');
    expect(result.categories[0].grossProfit).toBeNull();
    expect(result.topByProfit[0].grossProfit).toBe(80);
    expect(result.hasIncompleteCostData).toBe(true);
  });

  it('builds default report filters with a 30-day window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-30T12:00:00Z'));

    const result = getDefaultReportFilters();

    expect(result).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      groupBy: 'day',
    });

    vi.useRealTimers();
  });

  it('builds profit-by-dimension query key with shared filters and grouping', () => {
    expect(
      reportsQueryKeys.profitByDimension({
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        groupBy: 'week',
      })
    ).toEqual(['reports', 'profit-by-dimension', '2026-04-01', '2026-04-30', 'week']);
  });

  it('fetches overview report with mapped params', async () => {
    const queryClient = makeQueryClient();
    mockedApiGet.mockResolvedValueOnce({
      data: {
        range_start: '2026-04-01T00:00:00Z',
        range_end: '2026-04-30T23:59:59Z',
        summary: {
          net_revenue: 820,
          collected_taxes: 180,
          gross_revenue: 1000,
          total_sales: 1000,
          credit_sales: 300,
          total_collected: 120,
          outstanding_balance: 180,
          active_debtors: 2,
          closed_debts: 1,
          average_ticket: 100,
        },
      },
    });

    const { result } = renderHook(
      () =>
        useReportsOverview({
          startDate: '2026-04-01',
          endDate: '2026-04-30',
          groupBy: 'day',
        }),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiGet).toHaveBeenCalledWith('/api/reports/overview', {
      params: {
        start: '2026-04-01T00:00:00',
        end: '2026-04-30T23:59:59',
        group_by: 'day',
      },
    });
    expect(result.current.data?.summary.totalSales).toBe(1000);
  });

  it('fetches credit collection report with grouping param', async () => {
    const queryClient = makeQueryClient();
    mockedApiGet.mockResolvedValueOnce({
      data: {
        range_start: '2026-04-01T00:00:00Z',
        range_end: '2026-04-30T23:59:59Z',
        group_by: 'week',
        summary: {
          total_credit_sales: 300,
          total_collected: 120,
          outstanding_balance: 180,
          credit_sales_count: 3,
          open_credit_sales_count: 2,
          closed_credit_sales_count: 1,
        },
        series: [],
        top_debtors: [],
      },
    });

    const { result } = renderHook(
      () =>
        useCreditCollectionReport({
          startDate: '2026-04-01',
          endDate: '2026-04-30',
          groupBy: 'week',
        }),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiGet).toHaveBeenCalledWith('/api/reports/credit-collection', {
      params: {
        start: '2026-04-01T00:00:00',
        end: '2026-04-30T23:59:59',
        group_by: 'week',
      },
    });
    expect(result.current.data?.groupBy).toBe('week');
  });

  it('fetches products performance report and maps best seller', async () => {
    const queryClient = makeQueryClient();
    mockedApiGet.mockResolvedValueOnce({
      data: {
        range_start: '2026-04-01T00:00:00Z',
        range_end: '2026-04-30T23:59:59Z',
        best_seller: {
          product_id: 1,
          product_name: 'Arroz',
          total_units_sold: 10,
          total_revenue: 200,
          total_cost: 120,
          gross_profit: 80,
          margin_pct: 40,
        },
        top_products: [],
        top_revenue_products: [],
        low_rotation_products: [],
        categories: [],
        has_incomplete_cost_data: false,
      },
    });

    const { result } = renderHook(
      () =>
        useProductsPerformanceReport({
          startDate: '2026-04-01',
          endDate: '2026-04-30',
          groupBy: 'day',
        }),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiGet).toHaveBeenCalledWith('/api/reports/products-performance', {
      params: {
        start: '2026-04-01T00:00:00',
        end: '2026-04-30T23:59:59',
        group_by: 'day',
      },
    });
    expect(result.current.data?.bestSeller?.productName).toBe('Arroz');
    expect(result.current.data?.bestSeller?.marginPct).toBe(40);
    expect(result.current.data?.hasIncompleteCostData).toBe(false);
  });

  it('fetches profit-by-dimension report only when enabled', async () => {
    const queryClient = makeQueryClient();

    const { result } = renderHook(
      () =>
        useProfitByDimensionReport(
          {
            startDate: '2026-04-01',
            endDate: '2026-04-30',
            groupBy: 'week',
          },
          false
        ),
      { wrapper: makeWrapper(queryClient) }
    );

    expect(mockedApiGet).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('fetches profit-by-dimension report with mapped params', async () => {
    const queryClient = makeQueryClient();
    mockedApiGet.mockResolvedValueOnce({
      data: {
        range_start: '2026-04-01T00:00:00Z',
        range_end: '2026-04-30T23:59:59Z',
        group_by: 'week',
        categories: [],
        top_by_profit: [],
        series: [],
        has_incomplete_cost_data: false,
      },
    });

    const { result } = renderHook(
      () =>
        useProfitByDimensionReport({
          startDate: '2026-04-01',
          endDate: '2026-04-30',
          groupBy: 'week',
        }),
      { wrapper: makeWrapper(queryClient) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiGet).toHaveBeenCalledWith('/api/reports/profit-by-dimension', {
      params: {
        start: '2026-04-01T00:00:00',
        end: '2026-04-30T23:59:59',
        group_by: 'week',
      },
    });
    expect(result.current.data?.groupBy).toBe('week');
  });
});
