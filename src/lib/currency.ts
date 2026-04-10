import type { CurrencyCode, ExchangeRateItem, MonetaryProfile } from '@/types/monetary';

const CURRENCY_LOCALE_MAP: Record<CurrencyCode, string> = {
  COP: 'es-CO',
  USD: 'en-US',
  VES: 'es-VE',
};

function getLocaleForCurrency(currency: CurrencyCode): string {
  return CURRENCY_LOCALE_MAP[currency];
}

function findDirectRate(
  exchangeRates: ExchangeRateItem[],
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number | null {
  const directRate = exchangeRates.find(
    (rate) => rate.baseCurrency === fromCurrency && rate.targetCurrency === toCurrency
  );

  if (directRate) {
    return directRate.rate;
  }

  const inverseRate = exchangeRates.find(
    (rate) => rate.baseCurrency === toCurrency && rate.targetCurrency === fromCurrency
  );

  if (inverseRate && inverseRate.rate > 0) {
    return 1 / inverseRate.rate;
  }

  return null;
}

export function convertMoney(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  exchangeRates: ExchangeRateItem[]
): number | null {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = findDirectRate(exchangeRates, fromCurrency, toCurrency);
  if (!rate) {
    return null;
  }

  return amount * rate;
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(getLocaleForCurrency(currency), {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatExchangeRate(rate: number, targetCurrency: CurrencyCode): string {
  return new Intl.NumberFormat(getLocaleForCurrency(targetCurrency), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(rate);
}

export function formatMoneyFromProfile(
  amount: number,
  profile: MonetaryProfile | null,
  displayCurrency: CurrencyCode | null,
  exchangeRates: ExchangeRateItem[],
  sourceCurrency?: CurrencyCode
): string {
  if (!profile || !displayCurrency) {
    return formatMoney(amount, 'COP');
  }

  const effectiveSourceCurrency = sourceCurrency ?? profile.baseCurrency;
  const converted = convertMoney(amount, effectiveSourceCurrency, displayCurrency, exchangeRates);
  if (converted === null) {
    return formatMoney(amount, effectiveSourceCurrency);
  }
  return formatMoney(converted, displayCurrency);
}
