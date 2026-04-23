import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrency } from '@/hooks/use-currency';
import type { InventoryInvestmentCategoryItem } from '@/types/reports';

interface InvestmentByCategoryTableProps {
  rows: InventoryInvestmentCategoryItem[];
  totalInvestmentAtCost: number;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value);
}

export function InvestmentByCategoryTable({ rows, totalInvestmentAtCost }: InvestmentByCategoryTableProps) {
  const { formatAmount } = useCurrency();

  return (
    <section className="rounded-xl border bg-card p-4" data-testid="investment-by-category-table">
      <h2 className="mb-3 text-lg font-semibold">Inversión por categoría</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Productos</TableHead>
            <TableHead className="text-right">Unidades</TableHead>
            <TableHead className="text-right">Inversión</TableHead>
            <TableHead className="text-right">Participación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                No hay categorías con stock positivo para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const share = totalInvestmentAtCost > 0 ? (row.investmentAtCost / totalInvestmentAtCost) * 100 : 0;
              return (
                <TableRow key={row.categoryId}>
                  <TableCell className="font-medium">{row.categoryName}</TableCell>
                  <TableCell className="text-right">{formatNumber(row.productCount)}</TableCell>
                  <TableCell className="text-right">{formatNumber(row.totalQuantity)}</TableCell>
                  <TableCell className="text-right">{formatAmount(row.investmentAtCost)}</TableCell>
                  <TableCell className="text-right">{share.toFixed(2)}%</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </section>
  );
}
