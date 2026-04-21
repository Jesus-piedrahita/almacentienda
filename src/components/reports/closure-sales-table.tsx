import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrency } from '@/hooks/use-currency';
import type { Sale, SalesPagination } from '@/types/sales';

interface ClosureSalesTableProps {
  sales: Sale[];
  pagination: SalesPagination;
  onPageChange: (page: number) => void;
}

export function ClosureSalesTable({ sales, pagination, onPageChange }: ClosureSalesTableProps) {
  const { formatAmount } = useCurrency();

  return (
    <section className="space-y-3" data-testid="closure-sales-table">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Detalle de ventas del período</h2>
        <p className="text-sm text-muted-foreground">{pagination.total} ventas</p>
      </div>

      <div className="rounded-xl border bg-card p-2">
        <div
          className="max-h-[28rem] overflow-y-auto"
          data-testid="closure-sales-table-scroll-container"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay ventas en el rango seleccionado.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{sale.clientName ?? 'Consumidor final'}</TableCell>
                    <TableCell className="capitalize">{sale.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge variant={sale.state === 'completed' ? 'secondary' : 'destructive'}>
                        {sale.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatAmount(sale.total)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
        >
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {pagination.page} de {Math.max(1, pagination.totalPages)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages || pagination.totalPages === 0}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </section>
  );
}
