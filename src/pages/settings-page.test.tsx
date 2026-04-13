import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { AxiosError } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SettingsPage } from './settings-page';
import { useMonetaryStore } from '@/stores/monetary-store';
import { useThemeStore } from '@/stores/theme-store';

const syncRatesMutateAsync = vi.fn();

vi.mock('@/hooks/use-monetary', () => ({
  useMonetaryProfile: () => ({
    data: {
      countryCode: 'CO',
      countryLocked: true,
      baseCurrency: 'COP',
      allowedCurrencies: ['COP', 'USD'],
      defaultDisplayCurrency: 'COP',
      exchangeRateProvider: 'open_exchange_rates',
      lastRatesSyncAt: '2026-04-10T18:30:00Z',
      ratesStatus: 'healthy',
    },
    isPending: false,
    isError: false,
  }),
  useExchangeRateStatus: () => ({
    data: {
      provider: 'open_exchange_rates',
      baseCurrency: 'COP',
      ratesStatus: 'healthy',
      lastRatesSyncAt: '2026-04-10T18:30:00Z',
      availablePairs: ['COP/USD', 'USD/COP'],
    },
    isLoading: false,
  }),
  useSyncExchangeRates: () => ({
    mutateAsync: syncRatesMutateAsync,
    isPending: false,
  }),
  useUpdateMonetaryProfile: () => ({
    mutateAsync: vi.fn(async (input) => ({
      countryCode: 'CO',
      countryLocked: true,
      baseCurrency: 'COP',
      allowedCurrencies: ['COP', 'USD'],
      defaultDisplayCurrency: input.defaultDisplayCurrency ?? 'COP',
      exchangeRateProvider: 'open_exchange_rates',
      lastRatesSyncAt: '2026-04-10T18:30:00Z',
      ratesStatus: 'healthy',
    })),
    isPending: false,
  }),
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

describe('SettingsPage', () => {
  beforeEach(() => {
    syncRatesMutateAsync.mockReset();
    syncRatesMutateAsync.mockResolvedValue({});

    useThemeStore.setState({
      themePreference: 'system',
      effectiveTheme: 'light',
    });

    useMonetaryStore.setState({
      profile: {
        countryCode: 'CO',
        countryLocked: true,
        baseCurrency: 'COP',
        allowedCurrencies: ['COP', 'USD'],
        defaultDisplayCurrency: 'COP',
        exchangeRateProvider: 'open_exchange_rates',
        lastRatesSyncAt: '2026-04-10T18:30:00Z',
        ratesStatus: 'healthy',
      },
      exchangeRates: [],
      displayCurrencyOverride: 'COP',
      isInitialized: true,
    });
  });

  it('renders monetary profile information', () => {
    render(
      <QueryClientProvider client={makeQueryClient()}>
        <SettingsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByText(/CO · Bloqueado tras setup inicial/i)).toBeInTheDocument();
    expect(screen.getByText('Tema global')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Claro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Oscuro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sistema' })).toBeInTheDocument();
    expect(screen.getByText('Monedas permitidas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'COP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'USD' })).toBeInTheDocument();
    expect(screen.getByText('No hay tasas activas cargadas todavía.')).toBeInTheDocument();
  });

  it('allows switching display currency within allowed currencies', async () => {
    render(
      <QueryClientProvider client={makeQueryClient()}>
        <SettingsPage />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'USD' }));

    await waitFor(() => {
      expect(useMonetaryStore.getState().displayCurrencyOverride).toBe('USD');
    });
  });

  it('allows switching global theme preference', async () => {
    render(
      <QueryClientProvider client={makeQueryClient()}>
        <SettingsPage />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Oscuro' }));

    await waitFor(() => {
      expect(useThemeStore.getState().themePreference).toBe('dark');
    });
  });

  it('renders active persisted exchange rates when present', () => {
    useMonetaryStore.setState({
      exchangeRates: [
        {
          baseCurrency: 'COP',
          targetCurrency: 'USD',
          rate: 0.00025,
          source: 'open_exchange_rates',
          fetchedAt: '2026-04-10T18:30:00Z',
        },
      ],
    });

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <SettingsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Tasas activas persistidas')).toBeInTheDocument();
    expect(screen.getByText('COP/USD')).toBeInTheDocument();
    expect(screen.getByText(/1 COP =/)).toBeInTheDocument();
    expect(screen.getAllByText('open_exchange_rates')).toHaveLength(2);
  });

  it('shows backend sync error message when rate sync fails', async () => {
    syncRatesMutateAsync.mockRejectedValue({
      response: {
        data: {
          detail: 'exchange rate provider unavailable: OPEN_EXCHANGE_RATES_API_KEY no configurada',
        },
      },
    } satisfies Partial<AxiosError<{ detail?: string }>>);

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <SettingsPage />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sincronizar tasas/i }));

    expect(
      await screen.findByText(
        'exchange rate provider unavailable: OPEN_EXCHANGE_RATES_API_KEY no configurada'
      )
    ).toBeInTheDocument();
  });
});
