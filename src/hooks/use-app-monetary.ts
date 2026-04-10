import { useEffect } from 'react';

import { useExchangeRateStatus, useExchangeRates, useMonetaryProfile } from '@/hooks/use-monetary';
import { useAuthStore } from '@/stores/auth-store';
import { useMonetaryStore } from '@/stores/monetary-store';

export function useAppMonetary() {
  const initialize = useMonetaryStore((state) => state.initialize);
  const setProfile = useMonetaryStore((state) => state.setProfile);
  const setExchangeRates = useMonetaryStore((state) => state.setExchangeRates);
  const resetRuntimeData = useMonetaryStore((state) => state.resetRuntimeData);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const shouldFetchMonetary = isAuthInitialized && isAuthenticated;

  const profileQuery = useMonetaryProfile(shouldFetchMonetary);
  const rateStatusQuery = useExchangeRateStatus(shouldFetchMonetary);
  const exchangeRatesQuery = useExchangeRates(shouldFetchMonetary);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data);
    }
  }, [profileQuery.data, setProfile]);

  useEffect(() => {
    if (exchangeRatesQuery.data) {
      setExchangeRates(exchangeRatesQuery.data);
    }
  }, [exchangeRatesQuery.data, setExchangeRates]);

  useEffect(() => {
    if (isAuthInitialized && !isAuthenticated) {
      resetRuntimeData();
    }
  }, [isAuthInitialized, isAuthenticated, resetRuntimeData]);

  return {
    profileQuery,
    rateStatusQuery,
    exchangeRatesQuery,
  };
}
