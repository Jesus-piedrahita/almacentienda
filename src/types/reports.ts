export const REPORT_GROUP_BY = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const;

export type ReportGroupBy = (typeof REPORT_GROUP_BY)[keyof typeof REPORT_GROUP_BY];

export interface ReportDateRangeFilter {
  startDate: string;
  endDate: string;
  groupBy?: ReportGroupBy;
}

export interface ReportsOverviewSummary {
  totalSales: number;
  creditSales: number;
  totalCollected: number;
  outstandingBalance: number;
  activeDebtors: number;
  closedDebts: number;
  averageTicket: number;
}

export interface ReportsOverview {
  rangeStart: string;
  rangeEnd: string;
  summary: ReportsOverviewSummary;
}

export interface CreditCollectionSummary {
  totalCreditSales: number;
  totalCollected: number;
  outstandingBalance: number;
  creditSalesCount: number;
  openCreditSalesCount: number;
  closedCreditSalesCount: number;
}

export interface CreditCollectionPoint {
  bucketLabel: string;
  bucketStart: string;
  totalSold: number;
  totalPaid: number;
  outstandingBalance: number;
}

export interface TopDebtorClient {
  clientId: string;
  clientName: string;
  creditSalesCount: number;
  totalSold: number;
  totalPaid: number;
  outstandingBalance: number;
  lastActivityAt: string | null;
}

export interface CreditCollectionReport {
  rangeStart: string;
  rangeEnd: string;
  groupBy: ReportGroupBy;
  summary: CreditCollectionSummary;
  series: CreditCollectionPoint[];
  topDebtors: TopDebtorClient[];
}

export interface ProductPerformanceItem {
  productId: string;
  productName: string;
  totalUnitsSold: number;
  totalRevenue: number;
  totalCost: number | null;
  grossProfit: number | null;
  marginPct: number | null;
}

export interface CategoryPerformanceItem {
  categoryName: string;
  totalUnitsSold: number;
  totalRevenue: number;
  totalCost: number | null;
  grossProfit: number | null;
  marginPct: number | null;
}

export interface ProductsPerformanceReport {
  rangeStart: string;
  rangeEnd: string;
  bestSeller: ProductPerformanceItem | null;
  topProducts: ProductPerformanceItem[];
  topRevenueProducts: ProductPerformanceItem[];
  lowRotationProducts: ProductPerformanceItem[];
  categories: CategoryPerformanceItem[];
  hasIncompleteCostData: boolean;
}

export interface CategoryProfitItem {
  categoryName: string;
  totalRevenue: number;
  totalCost: number | null;
  grossProfit: number | null;
  marginPct: number | null;
  hasIncompleteCostData: boolean;
}

export interface ProductProfitItem {
  productId: string;
  productName: string;
  categoryName: string;
  totalRevenue: number;
  totalCost: number | null;
  grossProfit: number | null;
  marginPct: number | null;
  hasIncompleteCostData: boolean;
}

export interface ProfitBucketPoint {
  bucketLabel: string;
  bucketStart: string;
  totalRevenue: number;
  grossProfit: number | null;
  marginPct: number | null;
}

export interface ProfitByDimensionReport {
  rangeStart: string;
  rangeEnd: string;
  groupBy: ReportGroupBy;
  categories: CategoryProfitItem[];
  topByProfit: ProductProfitItem[];
  series: ProfitBucketPoint[];
  hasIncompleteCostData: boolean;
}
