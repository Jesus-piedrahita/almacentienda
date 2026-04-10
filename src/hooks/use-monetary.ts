import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import type {
  CurrencyCode,
  ExchangeRateItem,
  ExchangeRateStatus,
  ExchangeRateSyncResult,
  MonetaryProfile,
  MonetaryProfileUpdateInput,
} from '@/types/monetary';

interface ApiMonetaryProfile {
  country_code: 'CO' | 'VE';
  country_locked: boolean;
  base_currency: 'COP' | 'VES';
  allowed_currencies: Array<'COP' | 'USD' | 'VES'>;
  default_display_currency: 'COP' | 'USD' | 'VES';
  exchange_rate_provider: 'open_exchange_rates';
  last_rates_sync_at: string | null;
  rates_status: 'never_synced' | 'healthy' | 'stale' | 'failed';
}

interface ApiExchangeRateStatus {
  provider: 'open_exchange_rates';
  base_currency: 'COP' | 'VES';
  rates_status: 'never_synced' | 'healthy' | 'stale' | 'failed';
  last_rates_sync_at: string | null;
  available_pairs: string[];
}

interface ApiExchangeRateSyncResult {
  provider: 'open_exchange_rates';
  synced_at: string;
  rates_status: 'never_synced' | 'healthy' | 'stale' | 'failed';
  pairs_updated: string[];
}

interface ApiExchangeRateItem {
  base_currency: 'COP' | 'USD' | 'VES';
  target_currency: 'COP' | 'USD' | 'VES';
  rate: number;
  source: 'open_exchange_rates';
  fetched_at: string;
}

function mapApiMonetaryProfile(apiProfile: ApiMonetaryProfile): MonetaryProfile {
  return {
    countryCode: apiProfile.country_code,
    countryLocked: apiProfile.country_locked,
    baseCurrency: apiProfile.base_currency,
    allowedCurrencies: apiProfile.allowed_currencies,
    defaultDisplayCurrency: apiProfile.default_display_currency,
    exchangeRateProvider: apiProfile.exchange_rate_provider,
    lastRatesSyncAt: apiProfile.last_rates_sync_at,
    ratesStatus: apiProfile.rates_status,
  };
}

function mapApiExchangeRateStatus(apiStatus: ApiExchangeRateStatus): ExchangeRateStatus {
  return {
    provider: apiStatus.provider,
    baseCurrency: apiStatus.base_currency,
    ratesStatus: apiStatus.rates_status,
    lastRatesSyncAt: apiStatus.last_rates_sync_at,
    availablePairs: apiStatus.available_pairs,
  };
}

function mapApiExchangeRateSyncResult(apiResult: ApiExchangeRateSyncResult): ExchangeRateSyncResult {
  return {
    provider: apiResult.provider,
    syncedAt: apiResult.synced_at,
    ratesStatus: apiResult.rates_status,
    pairsUpdated: apiResult.pairs_updated,
  };
}

function mapApiExchangeRateItem(apiRate: ApiExchangeRateItem): ExchangeRateItem {
  return {
    baseCurrency: apiRate.base_currency,
    targetCurrency: apiRate.target_currency,
    rate: apiRate.rate,
    source: apiRate.source,
    fetchedAt: apiRate.fetched_at,
  };
}

export const monetaryQueryKeys = {
  profile: ['monetary-profile'] as const,
  exchangeRateStatus: ['exchange-rate-status'] as const,
  exchangeRates: ['exchange-rates'] as const,
};

export function useMonetaryProfile(enabled = true) {
  return useQuery({
    queryKey: monetaryQueryKeys.profile,
    queryFn: async (): Promise<MonetaryProfile> => {
      const response = await api.get<ApiMonetaryProfile>('/api/settings/monetary-profile');
      return mapApiMonetaryProfile(response.data);
    },
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useExchangeRateStatus(enabled = true) {
  return useQuery({
    queryKey: monetaryQueryKeys.exchangeRateStatus,
    queryFn: async (): Promise<ExchangeRateStatus> => {
      const response = await api.get<ApiExchangeRateStatus>('/api/exchange-rates/status');
      return mapApiExchangeRateStatus(response.data);
    },
    enabled,
    retry: false,
    staleTime: 1000 * 60,
  });
}

export function useExchangeRates(enabled = true) {
  return useQuery({
    queryKey: monetaryQueryKeys.exchangeRates,
    queryFn: async (): Promise<ExchangeRateItem[]> => {
      const response = await api.get<ApiExchangeRateItem[]>('/api/exchange-rates/active');
      return response.data.map(mapApiExchangeRateItem);
    },
    enabled,
    retry: false,
    staleTime: 1000 * 60,
  });
}

export function useUpdateMonetaryProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MonetaryProfileUpdateInput): Promise<MonetaryProfile> => {
      const payload: {
        country_code?: MonetaryProfileUpdateInput['countryCode'];
        default_display_currency?: CurrencyCode;
      } = {};

      if (input.countryCode) {
        payload.country_code = input.countryCode;
      }

      if (input.defaultDisplayCurrency) {
        payload.default_display_currency = input.defaultDisplayCurrency;
      }

      const response = await api.put<ApiMonetaryProfile>('/api/settings/monetary-profile', payload);
      return mapApiMonetaryProfile(response.data);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(monetaryQueryKeys.profile, profile);
      queryClient.invalidateQueries({ queryKey: monetaryQueryKeys.profile });
      queryClient.invalidateQueries({ queryKey: monetaryQueryKeys.exchangeRateStatus });
      queryClient.invalidateQueries({ queryKey: monetaryQueryKeys.exchangeRates });
    },
  });
}

export function useSyncExchangeRates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<ExchangeRateSyncResult> => {
      const response = await api.post<ApiExchangeRateSyncResult>('/api/exchange-rates/sync');
      return mapApiExchangeRateSyncResult(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monetaryQueryKeys.profile });
      queryClient.invalidateQueries({ queryKey: monetaryQueryKeys.exchangeRateStatus });
      queryClient.invalidateQueries({ queryKey: monetaryQueryKeys.exchangeRates });
    },
  });
}
