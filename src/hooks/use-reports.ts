import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { toApiEndDate, toApiStartDate } from '@/lib/date-utils';
import type {
  CommercialClosureCollectionSummary,
  CommercialClosureReport,
  CommercialClosureSalesSummary,
  CommercialClosureTopProduct,
  CategoryProfitItem,
  CategoryPerformanceItem,
  CreditCollectionPoint,
  CreditCollectionReport,
  CreditCollectionSummary,
  ProfitBucketPoint,
  ProfitByDimensionReport,
  ProductPerformanceItem,
  ProductProfitItem,
  ProductsPerformanceReport,
  ReportDateRangeFilter,
  ReportGroupBy,
  ReportsOverview,
  ReportsOverviewSummary,
  TopDebtorClient,
} from '@/types/reports';

interface ApiReportsOverviewSummary {
  net_revenue: number;
  collected_taxes: number;
  gross_revenue: number;
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
  total_cost: number | null;
  gross_profit: number | null;
  margin_pct: number | null;
}

interface ApiCategoryPerformanceItem {
  category_name: string;
  total_units_sold: number;
  total_revenue: number;
  total_cost: number | null;
  gross_profit: number | null;
  margin_pct: number | null;
}

interface ApiProductsPerformanceReport {
  range_start: string;
  range_end: string;
  best_seller: ApiProductPerformanceItem | null;
  top_products: ApiProductPerformanceItem[];
  top_revenue_products: ApiProductPerformanceItem[];
  low_rotation_products: ApiProductPerformanceItem[];
  categories: ApiCategoryPerformanceItem[];
  has_incomplete_cost_data: boolean;
}

interface ApiCategoryProfitItem {
  category_name: string;
  total_revenue: number;
  total_cost: number | null;
  gross_profit: number | null;
  margin_pct: number | null;
  has_incomplete_cost_data: boolean;
}

interface ApiProductProfitItem {
  product_id: number;
  product_name: string;
  category_name: string;
  total_revenue: number;
  total_cost: number | null;
  gross_profit: number | null;
  margin_pct: number | null;
  has_incomplete_cost_data: boolean;
}

interface ApiProfitBucketPoint {
  bucket_label: string;
  bucket_start: string;
  total_revenue: number;
  gross_profit: number | null;
  margin_pct: number | null;
}

interface ApiProfitByDimensionReport {
  range_start: string;
  range_end: string;
  group_by: ReportGroupBy;
  categories: ApiCategoryProfitItem[];
  top_by_profit: ApiProductProfitItem[];
  series: ApiProfitBucketPoint[];
  has_incomplete_cost_data: boolean;
}

interface ApiCommercialClosureSalesSummary {
  sales_count: number;
  units_sold: number;
  net_sold: number;
  iva_total: number;
  gross_sold: number;
  average_ticket: number;
}

interface ApiCommercialClosureCollectionSummary {
  cash_collected: number;
  transfer_confirmed_collected: number;
  total_effectively_collected: number;
  credit_generated: number;
  outstanding_balance: number;
}

interface ApiCommercialClosureTopProduct {
  product_id: number;
  product_name: string;
  total_units_sold: number;
  total_revenue: number;
}

interface ApiCommercialClosureResponse {
  range_start: string;
  range_end: string;
  sales_summary: ApiCommercialClosureSalesSummary;
  collection_summary: ApiCommercialClosureCollectionSummary;
  top_products: ApiCommercialClosureTopProduct[];
}

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
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
    netRevenue: Number(summary.net_revenue),
    collectedTaxes: Number(summary.collected_taxes),
    grossRevenue: Number(summary.gross_revenue),
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
    totalCost: item.total_cost !== null ? Number(item.total_cost) : null,
    grossProfit: item.gross_profit !== null ? Number(item.gross_profit) : null,
    marginPct: item.margin_pct !== null ? Number(item.margin_pct) : null,
  };
}

function mapApiCategoryPerformanceItem(item: ApiCategoryPerformanceItem): CategoryPerformanceItem {
  return {
    categoryName: item.category_name,
    totalUnitsSold: item.total_units_sold,
    totalRevenue: Number(item.total_revenue),
    totalCost: item.total_cost !== null ? Number(item.total_cost) : null,
    grossProfit: item.gross_profit !== null ? Number(item.gross_profit) : null,
    marginPct: item.margin_pct !== null ? Number(item.margin_pct) : null,
  };
}

function mapApiCategoryProfitItem(item: ApiCategoryProfitItem): CategoryProfitItem {
  return {
    categoryName: item.category_name,
    totalRevenue: Number(item.total_revenue),
    totalCost: item.total_cost !== null ? Number(item.total_cost) : null,
    grossProfit: item.gross_profit !== null ? Number(item.gross_profit) : null,
    marginPct: item.margin_pct !== null ? Number(item.margin_pct) : null,
    hasIncompleteCostData: item.has_incomplete_cost_data,
  };
}

function mapApiProductProfitItem(item: ApiProductProfitItem): ProductProfitItem {
  return {
    productId: String(item.product_id),
    productName: item.product_name,
    categoryName: item.category_name,
    totalRevenue: Number(item.total_revenue),
    totalCost: item.total_cost !== null ? Number(item.total_cost) : null,
    grossProfit: item.gross_profit !== null ? Number(item.gross_profit) : null,
    marginPct: item.margin_pct !== null ? Number(item.margin_pct) : null,
    hasIncompleteCostData: item.has_incomplete_cost_data,
  };
}

function mapApiProfitBucketPoint(item: ApiProfitBucketPoint): ProfitBucketPoint {
  return {
    bucketLabel: item.bucket_label,
    bucketStart: item.bucket_start,
    totalRevenue: Number(item.total_revenue),
    grossProfit: item.gross_profit !== null ? Number(item.gross_profit) : null,
    marginPct: item.margin_pct !== null ? Number(item.margin_pct) : null,
  };
}

function mapApiCommercialClosureSalesSummary(
  summary: ApiCommercialClosureSalesSummary
): CommercialClosureSalesSummary {
  return {
    salesCount: summary.sales_count,
    unitsSold: summary.units_sold,
    netSold: Number(summary.net_sold),
    ivaTotal: Number(summary.iva_total),
    grossSold: Number(summary.gross_sold),
    averageTicket: Number(summary.average_ticket),
  };
}

function mapApiCommercialClosureCollectionSummary(
  summary: ApiCommercialClosureCollectionSummary
): CommercialClosureCollectionSummary {
  return {
    cashCollected: Number(summary.cash_collected),
    transferConfirmedCollected: Number(summary.transfer_confirmed_collected),
    totalEffectivelyCollected: Number(summary.total_effectively_collected),
    creditGenerated: Number(summary.credit_generated),
    outstandingBalance: Number(summary.outstanding_balance),
  };
}

function mapApiCommercialClosureTopProduct(
  item: ApiCommercialClosureTopProduct
): CommercialClosureTopProduct {
  return {
    productId: String(item.product_id),
    productName: item.product_name,
    totalUnitsSold: item.total_units_sold,
    totalRevenue: Number(item.total_revenue),
  };
}

export function mapApiCommercialClosureReport(
  apiReport: ApiCommercialClosureResponse
): CommercialClosureReport {
  return {
    rangeStart: apiReport.range_start,
    rangeEnd: apiReport.range_end,
    salesSummary: mapApiCommercialClosureSalesSummary(apiReport.sales_summary),
    collectionSummary: mapApiCommercialClosureCollectionSummary(
      apiReport.collection_summary
    ),
    topProducts: apiReport.top_products.map(mapApiCommercialClosureTopProduct),
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
    hasIncompleteCostData: apiReport.has_incomplete_cost_data,
  };
}

export function mapApiProfitByDimensionReport(apiReport: ApiProfitByDimensionReport): ProfitByDimensionReport {
  return {
    rangeStart: apiReport.range_start,
    rangeEnd: apiReport.range_end,
    groupBy: apiReport.group_by,
    categories: apiReport.categories.map(mapApiCategoryProfitItem),
    topByProfit: apiReport.top_by_profit.map(mapApiProductProfitItem),
    series: apiReport.series.map(mapApiProfitBucketPoint),
    hasIncompleteCostData: apiReport.has_incomplete_cost_data,
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
  commercialClosure: (filters: ReportDateRangeFilter) =>
    ['reports', 'commercial-closure', filters.startDate, filters.endDate] as const,
  profitByDimension: (filters: ReportDateRangeFilter) => [
    'reports',
    'profit-by-dimension',
    filters.startDate,
    filters.endDate,
    filters.groupBy ?? 'auto',
  ] as const,
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

export function useCommercialClosureReport(filters: ReportDateRangeFilter) {
  return useQuery({
    queryKey: reportsQueryKeys.commercialClosure(filters),
    queryFn: async (): Promise<CommercialClosureReport> => {
      const response = await api.get<ApiCommercialClosureResponse>(
        '/api/reports/commercial-closure',
        {
          params: {
            start: toApiStartDate(filters.startDate),
            end: toApiEndDate(filters.endDate),
          },
        }
      );
      return mapApiCommercialClosureReport(response.data);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useProfitByDimensionReport(filters: ReportDateRangeFilter, enabled: boolean = true) {
  return useQuery({
    queryKey: reportsQueryKeys.profitByDimension(filters),
    queryFn: async (): Promise<ProfitByDimensionReport> => {
      const response = await api.get<ApiProfitByDimensionReport>('/api/reports/profit-by-dimension', {
        params: buildReportParams(filters),
      });
      return mapApiProfitByDimensionReport(response.data);
    },
    staleTime: 1000 * 60 * 2,
    enabled,
  });
}
