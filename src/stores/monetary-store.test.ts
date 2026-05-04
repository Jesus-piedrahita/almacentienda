import { beforeEach, describe, expect, it } from 'vitest';

import { CURRENCY_CODE, type MonetaryProfile } from '@/types/monetary';
import { selectEffectiveDisplayCurrency, useMonetaryStore } from './monetary-store';

const baseProfile: MonetaryProfile = {
  countryCode: 'CO',
  countryLocked: true,
  baseCurrency: 'COP',
  allowedCurrencies: ['COP', 'USD'],
  defaultDisplayCurrency: 'COP',
  exchangeRateProvider: 'open_exchange_rates',
  lastRatesSyncAt: '2026-04-10T18:30:00Z',
  ratesStatus: 'healthy',
};

function resetStore() {
  useMonetaryStore.setState({
    profile: null,
    exchangeRates: [],
    displayCurrencyOverride: null,
    isInitialized: false,
  });
}

describe('useMonetaryStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('setProfile inicializa el store y usa defaultDisplayCurrency si no había override válido', () => {
    useMonetaryStore.getState().setProfile(baseProfile);

    const state = useMonetaryStore.getState();
    expect(state.profile).toEqual(baseProfile);
    expect(state.displayCurrencyOverride).toBe('COP');
    expect(state.isInitialized).toBe(true);
  });

  it('setProfile conserva un override existente si sigue permitido', () => {
    useMonetaryStore.setState({ displayCurrencyOverride: 'USD' });

    useMonetaryStore.getState().setProfile(baseProfile);

    expect(useMonetaryStore.getState().displayCurrencyOverride).toBe('USD');
  });

  it('setProfile resetea override inválido al defaultDisplayCurrency nuevo', () => {
    useMonetaryStore.setState({ displayCurrencyOverride: 'VES' });

    useMonetaryStore.getState().setProfile(baseProfile);

    expect(useMonetaryStore.getState().displayCurrencyOverride).toBe('COP');
  });

  it('setDisplayCurrencyOverride ignora cambios si no hay profile cargado', () => {
    useMonetaryStore.getState().setDisplayCurrencyOverride('USD');

    expect(useMonetaryStore.getState().displayCurrencyOverride).toBeNull();
  });

  it('setDisplayCurrencyOverride solo acepta monedas permitidas', () => {
    useMonetaryStore.getState().setProfile(baseProfile);

    useMonetaryStore.getState().setDisplayCurrencyOverride('USD');
    expect(useMonetaryStore.getState().displayCurrencyOverride).toBe('USD');

    useMonetaryStore.getState().setDisplayCurrencyOverride('VES');
    expect(useMonetaryStore.getState().displayCurrencyOverride).toBe('USD');
  });

  it('resetRuntimeData limpia profile y rates pero conserva override persistido', () => {
    useMonetaryStore.setState({
      profile: baseProfile,
      exchangeRates: [
        {
          baseCurrency: CURRENCY_CODE.COP,
          targetCurrency: CURRENCY_CODE.USD,
          rate: 0.00025,
          source: 'open_exchange_rates',
          fetchedAt: '2026-04-10T18:30:00Z',
        },
      ],
      displayCurrencyOverride: 'USD',
      isInitialized: true,
    });

    useMonetaryStore.getState().resetRuntimeData();

    const state = useMonetaryStore.getState();
    expect(state.profile).toBeNull();
    expect(state.exchangeRates).toEqual([]);
    expect(state.displayCurrencyOverride).toBe('USD');
    expect(state.isInitialized).toBe(true);
  });

  it('initialize solo marca isInitialized=true', () => {
    useMonetaryStore.getState().initialize();

    expect(useMonetaryStore.getState().isInitialized).toBe(true);
    expect(useMonetaryStore.getState().profile).toBeNull();
  });
});

describe('selectEffectiveDisplayCurrency', () => {
  it('devuelve null si no hay profile', () => {
    expect(
      selectEffectiveDisplayCurrency({
        profile: null,
        exchangeRates: [],
        displayCurrencyOverride: null,
        isInitialized: false,
        setProfile: () => {},
        setExchangeRates: () => {},
        setDisplayCurrencyOverride: () => {},
        initialize: () => {},
        resetRuntimeData: () => {},
      })
    ).toBeNull();
  });

  it('devuelve override si está permitido por el profile actual', () => {
    expect(
      selectEffectiveDisplayCurrency({
        profile: baseProfile,
        exchangeRates: [],
        displayCurrencyOverride: 'USD',
        isInitialized: true,
        setProfile: () => {},
        setExchangeRates: () => {},
        setDisplayCurrencyOverride: () => {},
        initialize: () => {},
        resetRuntimeData: () => {},
      })
    ).toBe('USD');
  });

  it('cae al defaultDisplayCurrency si override no está permitido', () => {
    expect(
      selectEffectiveDisplayCurrency({
        profile: baseProfile,
        exchangeRates: [],
        displayCurrencyOverride: 'VES',
        isInitialized: true,
        setProfile: () => {},
        setExchangeRates: () => {},
        setDisplayCurrencyOverride: () => {},
        initialize: () => {},
        resetRuntimeData: () => {},
      })
    ).toBe('COP');
  });
});
