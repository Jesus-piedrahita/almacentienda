import { RefreshCcw, Settings2 } from 'lucide-react';
import { useState } from 'react';

import type { AxiosError } from 'axios';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useMonetaryProfile,
  useExchangeRateStatus,
  useSyncExchangeRates,
  useUpdateMonetaryProfile,
} from '@/hooks/use-monetary';
import { formatExchangeRate } from '@/lib/currency';
import { useMonetaryStore, selectEffectiveDisplayCurrency } from '@/stores/monetary-store';
import { useThemeStore } from '@/stores/theme-store';
import type { CurrencyCode } from '@/types/monetary';
import type { ThemePreference } from '@/lib/theme';

function formatSyncDate(value: string | null): string {
  if (!value) {
    return 'Nunca';
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function SettingsPage() {
  const [syncError, setSyncError] = useState<string | null>(null);
  const themePreference = useThemeStore((state) => state.themePreference);
  const effectiveTheme = useThemeStore((state) => state.effectiveTheme);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);
  const profile = useMonetaryStore((state) => state.profile);
  const exchangeRates = useMonetaryStore((state) => state.exchangeRates);
  const effectiveDisplayCurrency = useMonetaryStore(selectEffectiveDisplayCurrency);
  const setDisplayCurrencyOverride = useMonetaryStore((state) => state.setDisplayCurrencyOverride);

  const profileQuery = useMonetaryProfile();
  const exchangeRateStatusQuery = useExchangeRateStatus();
  const syncRates = useSyncExchangeRates();
  const updateMonetaryProfile = useUpdateMonetaryProfile();

  const isLoading = (profileQuery.isPending && !profile) || exchangeRateStatusQuery.isPending;

  async function handleDisplayCurrencyChange(currency: CurrencyCode) {
    if (!profile) {
      return;
    }

    await updateMonetaryProfile.mutateAsync({
      defaultDisplayCurrency: currency,
    });
    setDisplayCurrencyOverride(currency);
  }

  async function handleSyncRates() {
    try {
      setSyncError(null);
      await syncRates.mutateAsync();
    } catch (error) {
      const apiError = error as AxiosError<{ detail?: string }>;
      setSyncError(apiError.response?.data?.detail ?? 'No se pudo sincronizar las tasas en este momento.');
    }
  }

  function handleThemePreferenceChange(preference: ThemePreference) {
    setThemePreference(preference);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Cargando perfil monetario...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-destructive">
            No se pudo cargar el perfil monetario. Verificá tu sesión y reintentá.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings2 className="size-8 text-primary" />
          Configuración
        </h1>
        <p className="text-muted-foreground">
          Perfil monetario global del sistema según país de operación
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tema global</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preferencia visual</Label>
            <div className="flex flex-wrap gap-2">
              {(['light', 'dark', 'system'] as ThemePreference[]).map((preference) => {
                const isActive = themePreference === preference;

                return (
                  <Button
                    key={preference}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => handleThemePreferenceChange(preference)}
                  >
                    {preference === 'light'
                      ? 'Claro'
                      : preference === 'dark'
                        ? 'Oscuro'
                        : 'Sistema'}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              El tema efectivo actual es <span className="font-medium">{effectiveTheme}</span>.
              {themePreference === 'system' ? ' Se sincroniza con la preferencia del sistema operativo.' : ''}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perfil monetario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>País de operación</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {profile.countryCode}
                {profile.countryLocked ? ' · Bloqueado tras setup inicial' : ''}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Moneda base</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {profile.baseCurrency}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Monedas permitidas</Label>
            <div className="flex flex-wrap gap-2">
              {profile.allowedCurrencies.map((currency) => {
                const isActive = effectiveDisplayCurrency === currency;

                return (
                  <Button
                    key={currency}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => handleDisplayCurrencyChange(currency)}
                    disabled={updateMonetaryProfile.isPending}
                  >
                    {currency}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Solo podés elegir monedas permitidas por el perfil país configurado.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Moneda de visualización activa</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {effectiveDisplayCurrency}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Proveedor de tasas</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {profile.exchangeRateProvider}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado de tasas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Estado</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {exchangeRateStatusQuery.data?.ratesStatus ?? profile.ratesStatus}
              </div>
            </div>
            <div className="space-y-1">
                <Label>Última sincronización</Label>
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  {formatSyncDate(exchangeRateStatusQuery.data?.lastRatesSyncAt ?? profile.lastRatesSyncAt)}
                </div>
              </div>
            <div className="space-y-1">
              <Label>Pares disponibles</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {exchangeRateStatusQuery.isError
                  ? 'No se pudo cargar el estado de tasas'
                  : exchangeRateStatusQuery.data?.availablePairs?.join(', ') || 'Sin pares disponibles'}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleSyncRates}
            disabled={syncRates.isPending}
          >
            <RefreshCcw className="size-4" />
            {syncRates.isPending ? 'Sincronizando...' : 'Sincronizar tasas'}
          </Button>

          {syncError && <p className="text-sm text-destructive">{syncError}</p>}

          <div className="space-y-2">
            <Label>Tasas activas persistidas</Label>

            {exchangeRates.length === 0 ? (
              <div className="rounded-md border bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
                No hay tasas activas cargadas todavía.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Par</TableHead>
                    <TableHead>Relación activa</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Obtenida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exchangeRates.map((rate) => (
                    <TableRow key={`${rate.baseCurrency}-${rate.targetCurrency}`}>
                      <TableCell className="font-medium">
                        {rate.baseCurrency}/{rate.targetCurrency}
                      </TableCell>
                      <TableCell>
                        1 {rate.baseCurrency} = {formatExchangeRate(rate.rate, rate.targetCurrency)}{' '}
                        {rate.targetCurrency}
                      </TableCell>
                      <TableCell>{rate.source}</TableCell>
                      <TableCell>{formatSyncDate(rate.fetchedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
