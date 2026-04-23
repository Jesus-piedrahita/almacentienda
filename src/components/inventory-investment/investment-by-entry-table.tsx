import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrency } from '@/hooks/use-currency';
import type { InventoryInvestmentEntry } from '@/types/reports';

interface InvestmentByEntryTableProps {
  entries: InventoryInvestmentEntry[];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function sourceLabel(source: string): string {
  if (source === 'migration_opening') {
    return 'Saldo inicial';
  }
  if (source === 'product_create') {
    return 'Alta producto';
  }
  if (source === 'product_update') {
    return 'Ajuste stock';
  }
  return source;
}

export function InvestmentByEntryTable({ entries }: InvestmentByEntryTableProps) {
  const { formatAmount } = useCurrency();

  return (
    <div className="rounded-xl border bg-card p-4" data-testid="investment-by-entry-table">
      <h3 className="mb-3 text-base font-semibold">Entradas de stock registradas</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Unidades</TableHead>
            <TableHead className="text-right">Costo unitario</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Origen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                Sin entradas de stock en este período.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.entryId}>
                <TableCell>{formatDate(entry.enteredAt)}</TableCell>
                <TableCell className="font-medium">{entry.productName}</TableCell>
                <TableCell>{entry.categoryName}</TableCell>
                <TableCell className="text-right">{entry.quantityAdded}</TableCell>
                <TableCell className="text-right">{formatAmount(entry.unitCost)}</TableCell>
                <TableCell className="text-right">{formatAmount(entry.totalCost)}</TableCell>
                <TableCell>
                  <Badge variant={entry.source === 'migration_opening' ? 'secondary' : 'outline'}>
                    {sourceLabel(entry.source)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
