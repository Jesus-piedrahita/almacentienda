import { BarChart3, CreditCard, Package, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Local outline class composition that avoids buttonVariants whitespace-nowrap.
// Do NOT switch back to buttonVariants — it breaks multi-line labels on narrow columns.
const outlineActionClasses =
  'inline-flex h-auto w-full min-w-0 items-start justify-start whitespace-normal rounded-md border border-input bg-background px-4 py-3 text-left text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

const quickActions = [
  {
    label: 'Ir a Ventas',
    description: 'Registrar ventas y revisar operación diaria.',
    to: '/sales',
    icon: ShoppingCart,
  },
  {
    label: 'Ir a Inventario',
    description: 'Controlar stock, categorías y vencimientos.',
    to: '/inventory',
    icon: Package,
  },
  {
    label: 'Ir a Clientes',
    description: 'Revisar deuda, cuentas corrientes y abonos.',
    to: '/clients',
    icon: CreditCard,
  },
  {
    label: 'Ir a Reportes',
    description: 'Profundizar en métricas y análisis del negocio.',
    to: '/reports',
    icon: BarChart3,
  },
] as const;

export function DashboardQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.to}
              to={action.to}
              className={cn(outlineActionClasses)}
            >
              <div className="flex w-full min-w-0 items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="flex min-w-0 flex-1 flex-col space-y-0.5 whitespace-normal">
                  <span className="block break-words text-sm font-medium leading-snug text-foreground">{action.label}</span>
                  <span className="block break-words text-xs leading-snug text-muted-foreground">{action.description}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
