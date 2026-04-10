import { describe, expect, it } from 'vitest';

import type { ExchangeRateItem, MonetaryProfile } from '@/types/monetary';

import { convertMoney, formatExchangeRate, formatMoney, formatMoneyFromProfile } from './currency';

const profile: MonetaryProfile = {
  countryCode: 'CO',
  countryLocked: true,
  baseCurrency: 'COP',
  allowedCurrencies: ['COP', 'USD'],
  defaultDisplayCurrency: 'COP',
  exchangeRateProvider: 'open_exchange_rates',
  lastRatesSyncAt: '2026-04-10T18:30:00Z',
  ratesStatus: 'healthy',
};

const exchangeRates: ExchangeRateItem[] = [
  {
    baseCurrency: 'COP',
    targetCurrency: 'USD',
    rate: 0.00025,
    source: 'open_exchange_rates',
    fetchedAt: '2026-04-10T18:30:00Z',
  },
  {
    baseCurrency: 'USD',
    targetCurrency: 'COP',
    rate: 4000,
    source: 'open_exchange_rates',
    fetchedAt: '2026-04-10T18:30:00Z',
  },
];

describe('currency helpers', () => {
  it('converts money using direct active rate', () => {
    expect(convertMoney(4000, 'COP', 'USD', exchangeRates)).toBe(1);
  });

  it('converts money using inverse active rate when direct pair is missing', () => {
    expect(
      convertMoney(1, 'USD', 'COP', [
        {
          baseCurrency: 'COP',
          targetCurrency: 'USD',
          rate: 0.00025,
          source: 'open_exchange_rates',
          fetchedAt: '2026-04-10T18:30:00Z',
        },
      ])
    ).toBe(4000);
  });

  it('returns null when no active rate exists for the pair', () => {
    expect(convertMoney(100, 'VES', 'USD', exchangeRates)).toBeNull();
  });

  it('falls back to source currency formatting when conversion is unavailable', () => {
    expect(formatMoneyFromProfile(100, profile, 'USD', [], 'COP')).toBe(formatMoney(100, 'COP'));
  });

  it('formats active exchange rates with precision', () => {
    expect(formatExchangeRate(0.00025, 'USD')).toContain('0.00025');
  });
});
