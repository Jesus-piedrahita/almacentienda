import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CurrencyCode, ExchangeRateItem, MonetaryProfile } from '@/types/monetary';

interface MonetaryState {
  profile: MonetaryProfile | null;
  exchangeRates: ExchangeRateItem[];
  displayCurrencyOverride: CurrencyCode | null;
  isInitialized: boolean;
  setProfile: (profile: MonetaryProfile) => void;
  setExchangeRates: (rates: ExchangeRateItem[]) => void;
  setDisplayCurrencyOverride: (currency: CurrencyCode) => void;
  initialize: () => void;
  resetRuntimeData: () => void;
}

export const useMonetaryStore = create<MonetaryState>()(
  persist(
      (set) => ({
        profile: null,
        exchangeRates: [],
        displayCurrencyOverride: null,
        isInitialized: false,

      setProfile: (profile) =>
        set((state) => ({
          profile,
          displayCurrencyOverride:
            state.displayCurrencyOverride && profile.allowedCurrencies.includes(state.displayCurrencyOverride)
              ? state.displayCurrencyOverride
              : profile.defaultDisplayCurrency,
          isInitialized: true,
        })),

      setExchangeRates: (exchangeRates) => set({ exchangeRates }),

      resetRuntimeData: () =>
        set({
          profile: null,
          exchangeRates: [],
        }),

      setDisplayCurrencyOverride: (currency) =>
        set((state) => {
          if (!state.profile) {
            return state;
          }

          if (!state.profile.allowedCurrencies.includes(currency)) {
            return state;
          }

          return {
            displayCurrencyOverride: currency,
          };
        }),

      initialize: () => set({ isInitialized: true }),
    }),
    {
      name: 'monetary-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        displayCurrencyOverride: state.displayCurrencyOverride,
      }),
    }
  )
);

export function selectEffectiveDisplayCurrency(state: MonetaryState): CurrencyCode | null {
  if (!state.profile) {
    return null;
  }

  if (
    state.displayCurrencyOverride &&
    state.profile.allowedCurrencies.includes(state.displayCurrencyOverride)
  ) {
    return state.displayCurrencyOverride;
  }

  return state.profile.defaultDisplayCurrency;
}
