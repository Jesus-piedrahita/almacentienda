import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useAppMonetary } from './use-app-monetary';
import { useAuthStore } from '@/stores/auth-store';
import { useMonetaryStore } from '@/stores/monetary-store';

const monetaryMocks = vi.hoisted(() => ({
  useMonetaryProfile: vi.fn(),
  useExchangeRateStatus: vi.fn(),
  useExchangeRates: vi.fn(),
}));

vi.mock('@/hooks/use-monetary', () => ({
  useMonetaryProfile: monetaryMocks.useMonetaryProfile,
  useExchangeRateStatus: monetaryMocks.useExchangeRateStatus,
  useExchangeRates: monetaryMocks.useExchangeRates,
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function TestComponent() {
  useAppMonetary();
  return null;
}

describe('useAppMonetary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: true,
    });
    useMonetaryStore.setState({
      profile: null,
      exchangeRates: [],
      displayCurrencyOverride: null,
      isInitialized: false,
    });

    monetaryMocks.useMonetaryProfile.mockReturnValue({ data: undefined });
    monetaryMocks.useExchangeRateStatus.mockReturnValue({ data: undefined });
    monetaryMocks.useExchangeRates.mockReturnValue({ data: undefined });
  });

  it('disables monetary queries when user is not authenticated', () => {
    render(
      <QueryClientProvider client={makeQueryClient()}>
        <TestComponent />
      </QueryClientProvider>
    );

    expect(monetaryMocks.useMonetaryProfile).toHaveBeenCalledWith(false);
    expect(monetaryMocks.useExchangeRateStatus).toHaveBeenCalledWith(false);
    expect(monetaryMocks.useExchangeRates).toHaveBeenCalledWith(false);
  });

  it('enables monetary queries when auth is initialized and authenticated', () => {
    useAuthStore.setState({
      user: { id: 1, email: 'user@test.com', is_active: true, created_at: '2026-01-01T00:00:00Z' },
      token: 'token',
      isAuthenticated: true,
      isInitialized: true,
    });

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <TestComponent />
      </QueryClientProvider>
    );

    expect(monetaryMocks.useMonetaryProfile).toHaveBeenCalledWith(true);
    expect(monetaryMocks.useExchangeRateStatus).toHaveBeenCalledWith(true);
    expect(monetaryMocks.useExchangeRates).toHaveBeenCalledWith(true);
  });
});
