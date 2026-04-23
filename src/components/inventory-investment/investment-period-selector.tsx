import { INVESTMENT_PERIOD, type InvestmentPeriod } from '@/types/reports';

interface InvestmentPeriodSelectorProps {
  period: InvestmentPeriod;
  onChange: (period: InvestmentPeriod) => void;
}

const PERIOD_LABELS: Record<InvestmentPeriod, string> = {
  [INVESTMENT_PERIOD.TODAY]: 'Hoy',
  [INVESTMENT_PERIOD.WEEK]: 'Semana',
  [INVESTMENT_PERIOD.BIWEEKLY]: 'Quincena',
  [INVESTMENT_PERIOD.MONTH]: 'Mes',
};

const PERIOD_ORDER: InvestmentPeriod[] = [
  INVESTMENT_PERIOD.TODAY,
  INVESTMENT_PERIOD.WEEK,
  INVESTMENT_PERIOD.BIWEEKLY,
  INVESTMENT_PERIOD.MONTH,
];

export function InvestmentPeriodSelector({ period, onChange }: InvestmentPeriodSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="investment-period-selector">
      {PERIOD_ORDER.map((candidate) => {
        const isActive = candidate === period;
        return (
          <button
            key={candidate}
            type="button"
            onClick={() => onChange(candidate)}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
              isActive ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'
            }`}
          >
            {PERIOD_LABELS[candidate]}
          </button>
        );
      })}
    </div>
  );
}
