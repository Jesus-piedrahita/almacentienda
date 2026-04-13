import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import type {
  CategoryPerformanceItem,
  CreditCollectionPoint,
  CreditCollectionReport,
  CreditCollectionSummary,
  ProductPerformanceItem,
  ProductsPerformanceReport,
  ReportDateRangeFilter,
  ReportGroupBy,
  ReportsOverview,
  ReportsOverviewSummary,
  TopDebtorClient,
} from '@/types/reports';

interface ApiReportsOverviewSummary {
  total_sales: number;
  credit_sales: number;
  total_collected: number;
  outstanding_balance: number;
  active_debtors: number;
  closed_debts: number;
  average_ticket: number;
}

interface ApiReportsOverview {
  range_start: string;
  range_end: string;
  summary: ApiReportsOverviewSummary;
}

interface ApiCreditCollectionSummary {
  total_credit_sales: number;
  total_collected: number;
  outstanding_balance: number;
  credit_sales_count: number;
  open_credit_sales_count: number;
  closed_credit_sales_count: number;
}

interface ApiCreditCollectionPoint {
  bucket_label: string;
  bucket_start: string;
  total_sold: number;
  total_paid: number;
  outstanding_balance: number;
}

interface ApiTopDebtorClient {
  client_id: number;
  client_name: string;
  credit_sales_count: number;
  total_sold: number;
  total_paid: number;
  outstanding_balance: number;
  last_activity_at: string | null;
}

interface ApiCreditCollectionReport {
  range_start: string;
  range_end: string;
  group_by: ReportGroupBy;
  summary: ApiCreditCollectionSummary;
  series: ApiCreditCollectionPoint[];
  top_debtors: ApiTopDebtorClient[];
}

interface ApiProductPerformanceItem {
  product_id: number;
  product_name: string;
  total_units_sold: number;
  total_revenue: number;
}

interface ApiCategoryPerformanceItem {
  category_name: string;
  total_units_sold: number;
  total_revenue: number;
}

interface ApiProductsPerformanceReport {
  range_start: string;
  range_end: string;
  best_seller: ApiProductPerformanceItem | null;
  top_products: ApiProductPerformanceItem[];
  top_revenue_products: ApiProductPerformanceItem[];
  low_rotation_products: ApiProductPerformanceItem[];
  categories: ApiCategoryPerformanceItem[];
}

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toApiStartDate(date: string): string {
  return `${date}T00:00:00`;
}

function toApiEndDate(date: string): string {
  return `${date}T23:59:59`;
}

function buildReportParams(filters: ReportDateRangeFilter): Record<string, string> {
  const params: Record<string, string> = {
    start: toApiStartDate(filters.startDate),
    end: toApiEndDate(filters.endDate),
  };

  if (filters.groupBy) {
    params.group_by = filters.groupBy;
  }

  return params;
}

function mapApiOverviewSummary(summary: ApiReportsOverviewSummary): ReportsOverviewSummary {
  return {
    totalSales: Number(summary.total_sales),
    creditSales: Number(summary.credit_sales),
    totalCollected: Number(summary.total_collected),
    outstandingBalance: Number(summary.outstanding_balance),
    activeDebtors: summary.active_debtors,
    closedDebts: summary.closed_debts,
    averageTicket: Number(summary.average_ticket),
  };
}

export function mapApiReportsOverview(apiOverview: ApiReportsOverview): ReportsOverview {
  return {
    rangeStart: apiOverview.range_start,
    rangeEnd: apiOverview.range_end,
    summary: mapApiOverviewSummary(apiOverview.summary),
  };
}

function mapApiCreditCollectionSummary(summary: ApiCreditCollectionSummary): CreditCollectionSummary {
  return {
    totalCreditSales: Number(summary.total_credit_sales),
    totalCollected: Number(summary.total_collected),
    outstandingBalance: Number(summary.outstanding_balance),
    creditSalesCount: summary.credit_sales_count,
    openCreditSalesCount: summary.open_credit_sales_count,
    closedCreditSalesCount: summary.closed_credit_sales_count,
  };
}

function mapApiCreditCollectionPoint(point: ApiCreditCollectionPoint): CreditCollectionPoint {
  return {
    bucketLabel: point.bucket_label,
    bucketStart: point.bucket_start,
    totalSold: Number(point.total_sold),
    totalPaid: Number(point.total_paid),
    outstandingBalance: Number(point.outstanding_balance),
  };
}

function mapApiTopDebtorClient(client: ApiTopDebtorClient): TopDebtorClient {
  return {
    clientId: String(client.client_id),
    clientName: client.client_name,
    creditSalesCount: client.credit_sales_count,
    totalSold: Number(client.total_sold),
    totalPaid: Number(client.total_paid),
    outstandingBalance: Number(client.outstanding_balance),
    lastActivityAt: client.last_activity_at,
  };
}

export function mapApiCreditCollectionReport(apiReport: ApiCreditCollectionReport): CreditCollectionReport {
  return {
    rangeStart: apiReport.range_start,
    rangeEnd: apiReport.range_end,
    groupBy: apiReport.group_by,
    summary: mapApiCreditCollectionSummary(apiReport.summary),
    series: apiReport.series.map(mapApiCreditCollectionPoint),
    topDebtors: apiReport.top_debtors.map(mapApiTopDebtorClient),
  };
}

function mapApiProductPerformanceItem(item: ApiProductPerformanceItem): ProductPerformanceItem {
  return {
    productId: String(item.product_id),
    productName: item.product_name,
    totalUnitsSold: item.total_units_sold,
    totalRevenue: Number(item.total_revenue),
  };
}

function mapApiCategoryPerformanceItem(item: ApiCategoryPerformanceItem): CategoryPerformanceItem {
  return {
    categoryName: item.category_name,
    totalUnitsSold: item.total_units_sold,
    totalRevenue: Number(item.total_revenue),
  };
}

export function mapApiProductsPerformanceReport(apiReport: ApiProductsPerformanceReport): ProductsPerformanceReport {
  return {
    rangeStart: apiReport.range_start,
    rangeEnd: apiReport.range_end,
    bestSeller: apiReport.best_seller ? mapApiProductPerformanceItem(apiReport.best_seller) : null,
    topProducts: apiReport.top_products.map(mapApiProductPerformanceItem),
    topRevenueProducts: apiReport.top_revenue_products.map(mapApiProductPerformanceItem),
    lowRotationProducts: apiReport.low_rotation_products.map(mapApiProductPerformanceItem),
    categories: apiReport.categories.map(mapApiCategoryPerformanceItem),
  };
}

export const reportsQueryKeys = {
  all: ['reports'] as const,
  overview: (filters: ReportDateRangeFilter) => ['reports', 'overview', filters.startDate, filters.endDate] as const,
  creditCollection: (filters: ReportDateRangeFilter) => [
    'reports',
    'credit-collection',
    filters.startDate,
    filters.endDate,
    filters.groupBy ?? 'auto',
  ] as const,
  productsPerformance: (filters: ReportDateRangeFilter) => ['reports', 'products-performance', filters.startDate, filters.endDate] as const,
};

export function getDefaultReportFilters(): ReportDateRangeFilter {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 29);

  return {
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate),
    groupBy: 'day',
  };
}

export function useReportsOverview(filters: ReportDateRangeFilter) {
  return useQuery({
    queryKey: reportsQueryKeys.overview(filters),
    queryFn: async (): Promise<ReportsOverview> => {
      const response = await api.get<ApiReportsOverview>('/api/reports/overview', {
        params: buildReportParams(filters),
      });
      return mapApiReportsOverview(response.data);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreditCollectionReport(filters: ReportDateRangeFilter) {
  return useQuery({
    queryKey: reportsQueryKeys.creditCollection(filters),
    queryFn: async (): Promise<CreditCollectionReport> => {
      const response = await api.get<ApiCreditCollectionReport>('/api/reports/credit-collection', {
        params: buildReportParams(filters),
      });
      return mapApiCreditCollectionReport(response.data);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useProductsPerformanceReport(filters: ReportDateRangeFilter) {
  return useQuery({
    queryKey: reportsQueryKeys.productsPerformance(filters),
    queryFn: async (): Promise<ProductsPerformanceReport> => {
      const response = await api.get<ApiProductsPerformanceReport>('/api/reports/products-performance', {
        params: buildReportParams(filters),
      });
      return mapApiProductsPerformanceReport(response.data);
    },
    staleTime: 1000 * 60 * 2,
  });
}
