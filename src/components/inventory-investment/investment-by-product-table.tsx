import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrency } from '@/hooks/use-currency';
import type { InventoryInvestmentProductItem } from '@/types/reports';

interface InvestmentByProductTableProps {
  rows: InventoryInvestmentProductItem[];
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value);
}

export function InvestmentByProductTable({ rows }: InvestmentByProductTableProps) {
  const { formatAmount } = useCurrency();

  return (
    <section className="rounded-xl border bg-card p-4" data-testid="investment-by-product-table">
      <h2 className="mb-3 text-lg font-semibold">Detalle por producto</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Costo unitario</TableHead>
            <TableHead className="text-right">Inversión</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                No hay productos con stock positivo para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.productId}>
                <TableCell className="font-medium">{row.productName}</TableCell>
                <TableCell>{row.barcode}</TableCell>
                <TableCell>{row.categoryName}</TableCell>
                <TableCell className="text-right">{formatNumber(row.quantity)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.unitCost)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.investmentAtCost)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
