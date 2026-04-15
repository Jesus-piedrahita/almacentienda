import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';

import { ReportsPage } from './reports-page';

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number) => `$${value.toFixed(2)}`,
  }),
}));

vi.mock('@/hooks/use-reports', () => ({
  getDefaultReportFilters: () => ({ startDate: '2026-04-01', endDate: '2026-04-30', groupBy: 'day' }),
  useReportsOverview: vi.fn(),
  useCreditCollectionReport: vi.fn(),
  useProductsPerformanceReport: vi.fn(),
  useProfitByDimensionReport: vi.fn(),
}));

import * as reportsHooks from '@/hooks/use-reports';

const mockedUseReportsOverview = vi.mocked(reportsHooks.useReportsOverview);
const mockedUseCreditCollectionReport = vi.mocked(reportsHooks.useCreditCollectionReport);
const mockedUseProductsPerformanceReport = vi.mocked(reportsHooks.useProductsPerformanceReport);
const mockedUseProfitByDimensionReport = vi.mocked(reportsHooks.useProfitByDimensionReport);

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseProfitByDimensionReport.mockReturnValue({ isPending: false, isError: false, data: undefined } as never);
  });

  it('renders loading state', () => {
    mockedUseReportsOverview.mockReturnValue({ isPending: true, data: undefined, isError: false } as never);
    mockedUseCreditCollectionReport.mockReturnValue({ isPending: true, data: undefined, isError: false } as never);
    mockedUseProductsPerformanceReport.mockReturnValue({ isPending: true, data: undefined, isError: false } as never);

    render(<ReportsPage />);

    expect(screen.getByTestId('reports-page-loading')).toBeInTheDocument();
  });

  it('renders blocking error state', () => {
    mockedUseReportsOverview.mockReturnValue({ isPending: false, data: undefined, isError: true } as never);
    mockedUseCreditCollectionReport.mockReturnValue({ isPending: false, data: undefined, isError: true } as never);
    mockedUseProductsPerformanceReport.mockReturnValue({ isPending: false, data: undefined, isError: true } as never);

    render(<ReportsPage />);

    expect(screen.getByTestId('reports-page-error')).toBeInTheDocument();
  });

  it('renders page-level empty state when no section returns data', () => {
    mockedUseReportsOverview.mockReturnValue({ isPending: false, data: undefined, isError: false } as never);
    mockedUseCreditCollectionReport.mockReturnValue({ isPending: false, data: undefined, isError: false } as never);
    mockedUseProductsPerformanceReport.mockReturnValue({ isPending: false, data: undefined, isError: false } as never);

    render(<ReportsPage />);

    expect(screen.getByTestId('reports-page-empty')).toBeInTheDocument();
    expect(
      screen.getByText(/No hay datos suficientes para mostrar reportes en el período seleccionado/i)
    ).toBeInTheDocument();
  });

  it('renders recoverable section error when only one report query fails', () => {
    mockedUseReportsOverview.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        rangeStart: '2026-04-01T00:00:00',
        rangeEnd: '2026-04-30T23:59:59',
        summary: {
          totalSales: 1000,
          creditSales: 300,
          totalCollected: 120,
          outstandingBalance: 180,
          activeDebtors: 2,
          closedDebts: 1,
          averageTicket: 100,
        },
      },
    } as never);
    mockedUseCreditCollectionReport.mockReturnValue({ isPending: false, isError: true, data: undefined } as never);
    mockedUseProductsPerformanceReport.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        rangeStart: '2026-04-01T00:00:00',
        rangeEnd: '2026-04-30T23:59:59',
        bestSeller: null,
        topProducts: [],
        topRevenueProducts: [],
        lowRotationProducts: [],
        categories: [],
      },
    } as never);

    render(<ReportsPage />);

    expect(screen.getByTestId('reports-page-success')).toBeInTheDocument();
    expect(screen.getByTestId('reports-overview-section')).toBeInTheDocument();
    expect(screen.getByText(/No se pudo cargar crédito y cobranza/i)).toBeInTheDocument();
  });

  it('renders all report sections on success', () => {
    mockedUseReportsOverview.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        rangeStart: '2026-04-01T00:00:00',
        rangeEnd: '2026-04-30T23:59:59',
        summary: {
          totalSales: 1000,
          creditSales: 300,
          totalCollected: 120,
          outstandingBalance: 180,
          activeDebtors: 2,
          closedDebts: 1,
          averageTicket: 100,
        },
      },
    } as never);
    mockedUseCreditCollectionReport.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        rangeStart: '2026-04-01T00:00:00',
        rangeEnd: '2026-04-30T23:59:59',
        groupBy: 'day',
        summary: {
          totalCreditSales: 300,
          totalCollected: 120,
          outstandingBalance: 180,
          creditSalesCount: 3,
          openCreditSalesCount: 2,
          closedCreditSalesCount: 1,
        },
        series: [
          {
            bucketLabel: '01 Apr',
            bucketStart: '2026-04-01T00:00:00',
            totalSold: 100,
            totalPaid: 40,
            outstandingBalance: 60,
          },
        ],
        topDebtors: [
          {
            clientId: '1',
            clientName: 'Ana',
            creditSalesCount: 2,
            totalSold: 200,
            totalPaid: 40,
            outstandingBalance: 160,
            lastActivityAt: '2026-04-10T10:00:00',
          },
        ],
      },
    } as never);
    mockedUseProductsPerformanceReport.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        rangeStart: '2026-04-01T00:00:00',
        rangeEnd: '2026-04-30T23:59:59',
        bestSeller: {
          productId: '1',
          productName: 'Arroz',
          totalUnitsSold: 10,
          totalRevenue: 200,
        },
        topProducts: [],
        topRevenueProducts: [],
        lowRotationProducts: [],
        categories: [
          {
            categoryName: 'Despensa',
            totalUnitsSold: 10,
            totalRevenue: 200,
          },
        ],
      },
    } as never);

    render(<ReportsPage />);

    expect(screen.getByTestId('reports-page-success')).toBeInTheDocument();
    expect(screen.getByTestId('reports-filters')).toBeInTheDocument();
    expect(screen.getByTestId('reports-overview-section')).toBeInTheDocument();
    expect(screen.getByTestId('reports-credit-section')).toBeInTheDocument();
    expect(screen.getByTestId('reports-top-debtors-section')).toBeInTheDocument();
    expect(screen.getByTestId('reports-products-section')).toBeInTheDocument();
  });

  it('toggles to profitability view and enables the profitability query', async () => {
    const user = userEvent.setup();

    mockedUseReportsOverview.mockReturnValue({ isPending: false, isError: false, data: undefined } as never);
    mockedUseCreditCollectionReport.mockReturnValue({ isPending: false, isError: false, data: undefined } as never);
    mockedUseProductsPerformanceReport.mockReturnValue({ isPending: false, isError: false, data: undefined } as never);
    mockedUseProfitByDimensionReport.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        rangeStart: '2026-04-01T00:00:00Z',
        rangeEnd: '2026-04-30T23:59:59Z',
        groupBy: 'day',
        hasIncompleteCostData: false,
        categories: [],
        topByProfit: [],
        series: [],
      },
    } as never);

    render(<ReportsPage />);

    expect(mockedUseProfitByDimensionReport).toHaveBeenCalledWith(
      { startDate: '2026-04-01', endDate: '2026-04-30', groupBy: 'day' },
      false
    );

    await user.click(screen.getByRole('button', { name: /Rentabilidad/i }));

    expect(screen.getByTestId('profit-by-dimension-section')).toBeInTheDocument();
  });

  it('reuses shared filters for profitability after changing the group by selector', async () => {
    const user = userEvent.setup();

    mockedUseReportsOverview.mockReturnValue({ isPending: false, isError: false, data: undefined } as never);
    mockedUseCreditCollectionReport.mockReturnValue({ isPending: false, isError: false, data: undefined } as never);
    mockedUseProductsPerformanceReport.mockReturnValue({ isPending: false, isError: false, data: undefined } as never);
    mockedUseProfitByDimensionReport.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        rangeStart: '2026-04-01T00:00:00Z',
        rangeEnd: '2026-04-30T23:59:59Z',
        groupBy: 'week',
        hasIncompleteCostData: false,
        categories: [],
        topByProfit: [],
        series: [],
      },
    } as never);

    render(<ReportsPage />);

    await user.selectOptions(screen.getByRole('combobox'), 'week');
    await user.click(screen.getByRole('button', { name: /Rentabilidad/i }));

    expect(mockedUseProfitByDimensionReport).toHaveBeenLastCalledWith(
      { startDate: '2026-04-01', endDate: '2026-04-30', groupBy: 'week' },
      true
    );
  });
});
