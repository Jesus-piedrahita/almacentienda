export const REPORT_GROUP_BY = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const;

export const INVESTMENT_PERIOD = {
  TODAY: 'today',
  WEEK: 'week',
  BIWEEKLY: 'biweekly',
  MONTH: 'month',
} as const;

export type ReportGroupBy = (typeof REPORT_GROUP_BY)[keyof typeof REPORT_GROUP_BY];
export type InvestmentPeriod = (typeof INVESTMENT_PERIOD)[keyof typeof INVESTMENT_PERIOD];

export interface ReportDateRangeFilter {
  startDate: string;
  endDate: string;
  groupBy?: ReportGroupBy;
}

export interface ReportsOverviewSummary {
  netRevenue: number;
  collectedTaxes: number;
  grossRevenue: number;
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

export interface CommercialClosureSalesSummary {
  salesCount: number;
  unitsSold: number;
  netSold: number;
  ivaTotal: number;
  grossSold: number;
  averageTicket: number;
}

export interface CommercialClosureCollectionSummary {
  cashCollected: number;
  transferConfirmedCollected: number;
  totalEffectivelyCollected: number;
  creditGenerated: number;
  outstandingBalance: number;
}

export interface CommercialClosureTopProduct {
  productId: string;
  productName: string;
  totalUnitsSold: number;
  totalRevenue: number;
}

export interface CommercialClosureReport {
  rangeStart: string;
  rangeEnd: string;
  salesSummary: CommercialClosureSalesSummary;
  collectionSummary: CommercialClosureCollectionSummary;
  topProducts: CommercialClosureTopProduct[];
}

export interface InventoryInvestmentProductItem {
  productId: string;
  productName: string;
  barcode: string;
  categoryName: string;
  quantity: number;
  unitCost: number;
  investmentAtCost: number;
}

export interface InventoryInvestmentCategoryItem {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalQuantity: number;
  investmentAtCost: number;
}

export interface InventoryInvestmentSummary {
  totalInvestmentAtCost: number;
  totalProducts: number;
  totalQuantity: number;
}

export interface InventoryInvestmentEntry {
  entryId: string;
  productId: string;
  productName: string;
  categoryName: string;
  quantityAdded: number;
  unitCost: number;
  totalCost: number;
  enteredAt: string;
  source: 'product_create' | 'product_update' | 'migration_opening' | string;
}

export interface InventoryInvestmentPeriodBucket {
  bucketLabel: string;
  bucketStart: string;
  totalInvested: number;
  entriesCount: number;
}

export interface InventoryInvestment {
  generatedAt: string;
  summary: InventoryInvestmentSummary;
  byCategory: InventoryInvestmentCategoryItem[];
  byProduct: InventoryInvestmentProductItem[];
  period?: InvestmentPeriod;
  periodStart?: string;
  periodEnd?: string;
  series?: InventoryInvestmentPeriodBucket[];
  entries?: InventoryInvestmentEntry[];
}
