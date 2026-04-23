import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/hooks/use-currency';
import type { InventoryInvestmentSummary } from '@/types/reports';

interface InvestmentSummaryCardsProps {
  summary: InventoryInvestmentSummary;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value);
}

export function InvestmentSummaryCards({ summary }: InvestmentSummaryCardsProps) {
  const { formatAmount } = useCurrency();
  const averagePerUnit = summary.totalQuantity > 0 ? summary.totalInvestmentAtCost / summary.totalQuantity : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3" data-testid="investment-summary-cards">
      <Card className="border-primary/25 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Capital invertido (al costo)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tracking-tight text-primary">{formatAmount(summary.totalInvestmentAtCost)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Costo de compra × stock actual</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Productos con stock</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tracking-tight">{formatNumber(summary.totalProducts)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Productos considerados en el cálculo</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Inversión promedio por unidad</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tracking-tight">{formatAmount(averagePerUnit)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Sobre {formatNumber(summary.totalQuantity)} unidades en stock</p>
        </CardContent>
      </Card>
    </div>
  );
}
