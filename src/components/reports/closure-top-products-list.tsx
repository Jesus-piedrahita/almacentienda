import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/hooks/use-currency';
import type { CommercialClosureTopProduct } from '@/types/reports';

interface ClosureTopProductsListProps {
  products: CommercialClosureTopProduct[];
}

export function ClosureTopProductsList({ products }: ClosureTopProductsListProps) {
  const { formatAmount } = useCurrency();

  return (
    <Card data-testid="closure-top-products-list">
      <CardHeader>
        <CardTitle>Top productos</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hubo ventas para rankear productos.</p>
        ) : (
          <ul className="space-y-2">
            {products.map((product, index) => (
              <li
                key={product.productId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-xs text-muted-foreground">#{index + 1}</p>
                  <p className="font-medium">{product.productName}</p>
                </div>
                <div className="text-right text-sm">
                  <p>{product.totalUnitsSold} unid.</p>
                  <p className="text-muted-foreground">{formatAmount(product.totalRevenue)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
