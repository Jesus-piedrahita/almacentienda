export const COUNTRY_CODE = {
  CO: 'CO',
  VE: 'VE',
} as const;

export type CountryCode = (typeof COUNTRY_CODE)[keyof typeof COUNTRY_CODE];

export const CURRENCY_CODE = {
  COP: 'COP',
  USD: 'USD',
  VES: 'VES',
} as const;

export type CurrencyCode = (typeof CURRENCY_CODE)[keyof typeof CURRENCY_CODE];

export type RateStatus = 'never_synced' | 'healthy' | 'stale' | 'failed';
export type RateProvider = 'open_exchange_rates';

export interface MonetaryProfile {
  countryCode: CountryCode;
  countryLocked: boolean;
  baseCurrency: Extract<CurrencyCode, 'COP' | 'VES'>;
  allowedCurrencies: CurrencyCode[];
  defaultDisplayCurrency: CurrencyCode;
  exchangeRateProvider: RateProvider;
  lastRatesSyncAt: string | null;
  ratesStatus: RateStatus;
}

export interface MonetaryProfileUpdateInput {
  countryCode?: CountryCode;
  defaultDisplayCurrency?: CurrencyCode;
}

export interface ExchangeRateStatus {
  provider: RateProvider;
  baseCurrency: Extract<CurrencyCode, 'COP' | 'VES'>;
  ratesStatus: RateStatus;
  lastRatesSyncAt: string | null;
  availablePairs: string[];
}

export interface ExchangeRateItem {
  baseCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
  rate: number;
  source: RateProvider;
  fetchedAt: string;
}

export interface ExchangeRateSyncResult {
  provider: RateProvider;
  syncedAt: string;
  ratesStatus: RateStatus;
  pairsUpdated: string[];
}
