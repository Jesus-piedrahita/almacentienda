/**
 * @fileoverview Componente indicador visual del estado del stock.
 * Muestra visualmente los productos en estado: Bien (azul), Alerta (amarillo), Crítico (rojo).
 * Los umbrales reflejan el min_stock por producto: crítico ≤ min_stock, alerta ≤ min_stock×2.
 * Soporta estado de carga (skeleton), estado de error con retry y el estado vacío real.
 */

import { CheckCircle, AlertTriangle, XCircle, TrendingDown, RefreshCw } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StockStatusIndicatorProps {
  /** Productos con stock > min_stock×2 (Bien) */
  good: number;
  /** Productos con stock > min_stock && ≤ min_stock×2 (Alerta) */
  warning: number;
  /** Productos con stock ≤ min_stock (Crítico) */
  critical: number;
  /** Indica si los datos están siendo cargados por primera vez */
  isLoading: boolean;
  /** Indica si la carga de datos falló */
  isError?: boolean;
  /** Callback para reintentar la carga de datos */
  onRetry?: () => void;
}

/**
 * Obtiene el porcentaje relativo de cada estado
 */
function getPercentages(good: number, warning: number, critical: number) {
  const total = good + warning + critical;
  if (total === 0) return { good: 0, warning: 0, critical: 0 };
  return {
    good: (good / total) * 100,
    warning: (warning / total) * 100,
    critical: (critical / total) * 100,
  };
}

/**
 * StockStatusIndicator - Indicador visual del estado del stock.
 *
 * Muestra una barra visual con colores:
 * - Azul: Bien (stock > min_stock×2)
 * - Amarillo: Alerta (stock > min_stock y ≤ min_stock×2)
 * - Rojo: Crítico (stock ≤ min_stock)
 *
 * También muestra las tarjetas individuales con conteos.
 * Durante la carga inicial muestra un skeleton placeholder.
 * Ante errores muestra un mensaje con botón de retry.
 *
 * @example
 * ```tsx
 * <StockStatusIndicator good={15} warning={3} critical={2} isLoading={false} />
 * ```
 */
export function StockStatusIndicator({
  good,
  warning,
  critical,
  isLoading,
  isError = false,
  onRetry,
}: StockStatusIndicatorProps) {
  // Estado de carga inicial: mostrar skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Barra de progreso skeleton */}
        <div className="h-4 w-full animate-pulse rounded-full bg-muted" />

        {/* Grid de 3 cards skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-6 w-8 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Línea contextual skeleton */}
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  // Estado de error: mostrar mensaje con retry
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <XCircle className="size-8 text-red-500" />
        <div>
          <p className="text-sm font-medium text-red-600">
            No se pudieron cargar las estadísticas
          </p>
          <p className="text-xs text-muted-foreground">
            Ocurrió un error al obtener el estado del stock
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  const percentages = getPercentages(good, warning, critical);
  const total = good + warning + critical;

  return (
    <div className="space-y-4">
      {/* Barra visual progresiva */}
      {total > 0 && (
        <div className="flex h-4 overflow-hidden rounded-full bg-muted">
          {/* Bien - Azul */}
          <div
            className="bg-blue-500 transition-all duration-300"
            style={{ width: `${percentages.good}%` }}
            title={`Bien: ${good} productos`}
          />
          {/* Alerta - Amarillo */}
          <div
            className="bg-yellow-500 transition-all duration-300"
            style={{ width: `${percentages.warning}%` }}
            title={`Alerta: ${warning} productos`}
          />
          {/* Crítico - Rojo */}
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${percentages.critical}%` }}
            title={`Crítico: ${critical} productos`}
          />
        </div>
      )}

      {/* Leyenda y conteos */}
      <div className="grid grid-cols-3 gap-3">
        {/* Bien - Azul */}
        <Card className={cn(
          "border-l-4 border-l-blue-500",
          "bg-blue-50/50 dark:bg-blue-950/20"
        )}>
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Bien
                </p>
                <p className="text-xs text-blue-600/70">{'> min×2'}</p>
              </div>
            </div>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
              {good}
            </span>
          </CardContent>
        </Card>

        {/* Alerta - Amarillo */}
        <Card className={cn(
          "border-l-4 border-l-yellow-500",
          "bg-yellow-50/50 dark:bg-yellow-950/20"
        )}>
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  Alerta
                </p>
                <p className="text-xs text-yellow-600/70">{'> min'}</p>
              </div>
            </div>
            <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
              {warning}
            </span>
          </CardContent>
        </Card>

        {/* Crítico - Rojo */}
        <Card className={cn(
          "border-l-4 border-l-red-500",
          "bg-red-50/50 dark:bg-red-950/20"
        )}>
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <XCircle className="size-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Crítico
                </p>
                <p className="text-xs text-red-600/70">{'≤ min'}</p>
              </div>
            </div>
            <span className="text-lg font-bold text-red-700 dark:text-red-400">
              {critical}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Mensaje contextual */}
      {total === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No hay productos en el inventario
        </p>
      ) : critical > 0 ? (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <TrendingDown className="size-4" />
          <span>
            <strong>{critical}</strong> producto{critical !== 1 ? 's' : ''} en estado crítico
          </span>
        </div>
      ) : warning > 0 ? (
        <div className="flex items-center gap-2 text-sm text-yellow-600">
          <AlertTriangle className="size-4" />
          <span>
            <strong>{warning}</strong> producto{warning !== 1 ? 's' : ''} en estado de alerta
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <CheckCircle className="size-4" />
          <span>Todos los productos tienen stock adecuado</span>
        </div>
      )}
    </div>
  );
}