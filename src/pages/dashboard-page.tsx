/**
 * @fileoverview Página principal del dashboard.
 * Pantalla de inicio después del login exitoso.
 */

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <div className="text-2xl font-bold">$0.00</div>
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

      {/* Sección de información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Este es el panel principal de AlmacenTienda. Utilice el menú
            lateral para navegar entre las diferentes secciones del sistema:
          </p>
          <ul className="mt-4 list-inside list-disc text-sm text-muted-foreground space-y-1">
            <li><strong>Inventario</strong> - Gestione sus productos</li>
            <li><strong>Ventas</strong> - Controle las ventas del día</li>
            <li><strong>Reportes</strong> - Vea estadísticas y análisis</li>
            <li><strong>Configuración</strong> - Ajuste las opciones del sistema</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
