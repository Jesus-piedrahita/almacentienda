import { useMonetaryStore, selectEffectiveDisplayCurrency } from '@/stores/monetary-store';
import { formatMoneyFromProfile } from '@/lib/currency';
import type { CurrencyCode } from '@/types/monetary';

export function useCurrency() {
  const profile = useMonetaryStore((state) => state.profile);
  const exchangeRates = useMonetaryStore((state) => state.exchangeRates);
  const effectiveDisplayCurrency = useMonetaryStore(selectEffectiveDisplayCurrency);

  function formatAmount(amount: number, sourceCurrency?: CurrencyCode): string {
    return formatMoneyFromProfile(
      amount,
      profile,
      effectiveDisplayCurrency,
      exchangeRates,
      sourceCurrency
    );
  }

  return {
    profile,
    displayCurrency: effectiveDisplayCurrency,
    formatAmount,
  };
}
