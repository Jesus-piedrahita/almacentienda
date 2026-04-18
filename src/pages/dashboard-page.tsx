/**
 * @fileoverview Página principal del dashboard.
 * Pantalla de inicio después del login exitoso.
 */

import { AlertTriangle, BarChart3, CreditCard, Package } from 'lucide-react';

import { DashboardAlertSummaryCard } from '@/components/dashboard/dashboard-alert-summary-card';
import { BarcodeSearchWidget } from '@/components/dashboard/barcode-search-widget';
import { DashboardKpiCard } from '@/components/dashboard/dashboard-kpi-card';
import { DashboardQuickActions } from '@/components/dashboard/dashboard-quick-actions';
import { DashboardSectionHeader } from '@/components/dashboard/dashboard-section-header';
import { ExpiringProductsCard } from '@/components/inventory/expiring-products-card';
import { LowStockProductsCard } from '@/components/inventory/low-stock-products-card';
import { ReportsVisualState } from '@/components/reports/reports-visual-state';
import { Button } from '@/components/ui/button';
import { useClientStats } from '@/hooks/use-clients';
import { useCurrency } from '@/hooks/use-currency';
import { useExpiringProducts, useInventoryStats } from '@/hooks/use-inventory';
import { getDefaultReportFilters, useReportsOverview } from '@/hooks/use-reports';
import { useAuthStore } from '@/stores/auth-store';
import { getStockStatusLabel } from '@/types/inventory';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value);
}

function DashboardInlineState({
  title,
  description,
  variant,
}: {
  title: string;
  description: string;
  variant: 'loading' | 'empty' | 'error';
}) {
  return (
    <ReportsVisualState
      title={title}
      description={description}
      variant={variant}
    />
  );
}

/**
 * DashboardPage - Página principal del sistema.
 *
 * Es la pantalla que se muestra después de un login exitoso.
 * Muestra información general del sistema y un mensaje de bienvenida.
 */
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { formatAmount } = useCurrency();
  const defaultFilters = getDefaultReportFilters();

  const inventoryStatsQuery = useInventoryStats();
  const reportsOverviewQuery = useReportsOverview(defaultFilters);
  const clientStatsQuery = useClientStats();
  const expiringProductsQuery = useExpiringProducts();

  const inventoryStats = inventoryStatsQuery.data;
  const reportsOverview = reportsOverviewQuery.data;
  const clientStats = clientStatsQuery.data;
  const expiringProducts = expiringProductsQuery.data ?? [];

  const stockWarningCount = inventoryStats
    ? inventoryStats.stockStatus.warning + inventoryStats.stockStatus.critical
    : 0;
  const stockCriticalCount = inventoryStats?.stockStatus.critical ?? 0;
  const expiringCount = expiringProducts.length;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido{user?.email ? `, ${user.email}` : ''}. Acá tenés un resumen rápido del negocio y lo que requiere atención hoy.
        </p>
      </div>

      <section className="space-y-4" aria-labelledby="kpis-heading">
        <DashboardSectionHeader
          id="kpis-heading"
          title="Resumen del negocio"
          description="Indicadores principales con período base de 30 días para métricas derivadas de reportes."
          aside={
            <Button variant="outline" size="sm" disabled>
              Últimos 30 días
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardKpiCard
            title="Ventas (30 días)"
            value={reportsOverview ? formatAmount(reportsOverview.summary.totalSales) : formatAmount(0)}
            description="Facturación del período base del dashboard."
            icon={<BarChart3 className="size-4" />}
            tone={reportsOverviewQuery.isError ? 'warning' : 'default'}
            isLoading={reportsOverviewQuery.isLoading}
          />
          <DashboardKpiCard
            title="Ticket promedio"
            value={reportsOverview ? formatAmount(reportsOverview.summary.averageTicket) : formatAmount(0)}
            description="Promedio por venta dentro del mismo período."
            icon={<BarChart3 className="size-4" />}
            tone={reportsOverviewQuery.isError ? 'warning' : 'default'}
            isLoading={reportsOverviewQuery.isLoading}
          />
          <DashboardKpiCard
            title="Total productos"
            value={inventoryStats ? formatNumber(inventoryStats.totalProducts) : '0'}
            description="Productos únicos actualmente cargados."
            icon={<Package className="size-4" />}
            tone={inventoryStatsQuery.isError ? 'warning' : 'default'}
            isLoading={inventoryStatsQuery.isLoading}
          />
          <DashboardKpiCard
            title="Saldo pendiente"
            value={clientStats ? formatAmount(clientStats.totalDebt) : formatAmount(0)}
            description="Monto total actualmente adeudado por clientes."
            icon={<CreditCard className="size-4" />}
            tone={clientStatsQuery.isError ? 'warning' : 'default'}
            isLoading={clientStatsQuery.isLoading}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <DashboardSectionHeader
            title="Alertas operativas"
            description="Lo que conviene revisar primero para evitar problemas de stock, vencimiento o cobranza."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <DashboardAlertSummaryCard
              title="Stock en alerta"
              value={formatNumber(stockWarningCount)}
              description={
                stockCriticalCount > 0
                  ? `${formatNumber(stockCriticalCount)} producto${stockCriticalCount !== 1 ? 's' : ''} en estado crítico y requiere revisión inmediata.`
                  : 'Hay productos en observación, pero ninguno en estado crítico por ahora.'
              }
              icon={<AlertTriangle className="size-4" />}
              severity={stockCriticalCount > 0 ? 'danger' : stockWarningCount > 0 ? 'warning' : 'neutral'}
              footer={<span className="text-xs font-medium text-muted-foreground">Inventario</span>}
            />
            <DashboardAlertSummaryCard
              title="Clientes con deuda"
              value={clientStats ? formatNumber(clientStats.clientsWithDebt) : '0'}
              description={
                clientStats && clientStats.clientsWithDebt > 0
                  ? `${formatAmount(clientStats.totalDebt)} pendientes de cobro acumulados.`
                  : 'No hay clientes con saldo pendiente registrado en este momento.'
              }
              icon={<CreditCard className="size-4" />}
              severity={clientStats && clientStats.clientsWithDebt > 0 ? 'warning' : 'neutral'}
              footer={<span className="text-xs font-medium text-muted-foreground">Clientes</span>}
            />
          </div>

          {inventoryStatsQuery.isError ? (
            <DashboardInlineState
              title="No pudimos cargar el estado de stock"
              description="El resto del dashboard sigue disponible, pero conviene revisar inventario más tarde."
              variant="error"
            />
          ) : null}

          {clientStatsQuery.isError ? (
            <DashboardInlineState
              title="No pudimos cargar el resumen de clientes"
              description="La deuda pendiente y los clientes con saldo pueden no estar actualizados ahora mismo."
              variant="error"
            />
          ) : null}

          {expiringProductsQuery.isLoading ? (
            <DashboardInlineState
              title="Cargando vencimientos"
              description="Estamos revisando si hay productos con fecha de vencimiento cercana."
              variant="loading"
            />
          ) : expiringProductsQuery.isError ? (
            <DashboardInlineState
              title="No pudimos revisar vencimientos"
              description="El resto del dashboard sigue operativo aunque esta alerta no esté disponible."
              variant="error"
            />
          ) : expiringCount > 0 ? (
            <ExpiringProductsCard products={expiringProducts} />
          ) : (
            <DashboardInlineState
              title="Sin alertas de vencimiento"
              description="No hay productos con fecha de vencimiento para revisar por ahora."
              variant="empty"
            />
          )}

          {/* Widget de stock bajo mínimo — la tarjeta maneja todos los estados: loading, error, vacío y poblado */}
          <LowStockProductsCard />
        </div>

        <div className="space-y-4">
          <DashboardSectionHeader
            title="Herramientas y próximas acciones"
            description="Accesos rápidos para pasar del resumen a la acción concreta."
          />

          <BarcodeSearchWidget />
          <DashboardQuickActions />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-labelledby="inventory-summary-heading">
        <DashboardKpiCard
          title="Valor inventario"
          value={inventoryStats ? formatAmount(inventoryStats.totalValue) : formatAmount(0)}
          description="Valor estimado a precio de venta por cantidad disponible."
          icon={<Package className="size-4" />}
          tone={inventoryStatsQuery.isError ? 'warning' : 'default'}
          isLoading={inventoryStatsQuery.isLoading}
        />
        <DashboardKpiCard
          title="Unidades totales"
          value={inventoryStats ? formatNumber(inventoryStats.totalQuantity) : '0'}
          description="Cantidad total de unidades actualmente en inventario."
          icon={<Package className="size-4" />}
          tone={inventoryStatsQuery.isError ? 'warning' : 'default'}
          isLoading={inventoryStatsQuery.isLoading}
        />
        <DashboardKpiCard
          title="Estado dominante de stock"
          value={inventoryStats ? getStockStatusLabel(
            inventoryStats.stockStatus.critical > 0
              ? 'critical'
              : inventoryStats.stockStatus.warning > 0
                ? 'warning'
                : 'good'
          ) : 'Bien'}
          description="Lectura rápida del estado general de abastecimiento."
          icon={<AlertTriangle className="size-4" />}
          tone={stockCriticalCount > 0 ? 'danger' : stockWarningCount > 0 ? 'warning' : 'default'}
          isLoading={inventoryStatsQuery.isLoading}
        />
      </section>
    </div>
  );
}
