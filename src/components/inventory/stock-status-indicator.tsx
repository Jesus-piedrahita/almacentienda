/**
 * @fileoverview Componente indicador visual del estado del stock.
 * Muestra visualmente los productos en estado: Bien (azul), Alerta (amarillo), Crítico (rojo).
 */

import { CheckCircle, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StockStatusIndicatorProps {
  /** Productos con stock > 8 (Bien) */
  good: number;
  /** Productos con stock > 4 && <= 8 (Alerta) */
  warning: number;
  /** Productos con stock <= 4 (Crítico) */
  critical: number;
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
 * - Azul: Bien (> 8 unidades)
 * - Amarillo: Alerta (> 4 y <= 8 unidades)
 * - Rojo: Crítico (<= 4 unidades)
 *
 * También muestra las tarjetas individuales con conteos.
 *
 * @example
 * ```tsx
 * <StockStatusIndicator good={15} warning={3} critical={2} />
 * ```
 */
export function StockStatusIndicator({ good, warning, critical }: StockStatusIndicatorProps) {
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
                <p className="text-xs text-blue-600/70">{' > 8'}</p>
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
                <p className="text-xs text-yellow-600/70">{' > 4'}</p>
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
                <p className="text-xs text-red-600/70">{' ≤ 4'}</p>
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