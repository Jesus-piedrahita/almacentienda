/**
 * @fileoverview Página principal del dashboard.
 * Pantalla de inicio después del login exitoso.
 */

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarcodeSearchWidget } from "@/components/dashboard/barcode-search-widget";
import { useCurrency } from "@/hooks/use-currency";

/**
 * DashboardPage - Página principal del sistema.
 *
 * Es la pantalla que se muestra después de un login exitoso.
 * Muestra información general del sistema y un mensaje de bienvenida.
 *
 * @example
 * ```tsx
 * <DashboardPage />
 * ```
 */
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { formatAmount } = useCurrency();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido{user?.email ? `, ${user.email}` : ""}
        </p>
      </div>

      {/* Grid de tarjetas de información */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              En inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(0)}</div>
            <p className="text-xs text-muted-foreground">
              Ingresos del día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Por procesar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Widget de búsqueda por código de barras */}
      <BarcodeSearchWidget />
    </div>
  );
}
