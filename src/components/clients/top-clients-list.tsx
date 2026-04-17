/**
 * @fileoverview Componente de top clientes deudores.
 * Muestra el ranking de clientes con más deuda.
 */

import { Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/use-currency';
import type { TopClient } from '@/types/clients';

interface TopClientsListProps {
  clients: TopClient[];
  isLoading: boolean;
  onSelectClient: (clientId: string) => void;
}

/**
 * TopClientsList - Lista de clientes con más deuda.
 *
 * Muestra ranking con:
 * - Posición
 * - Nombre del cliente
 * - Total de deuda
 * - Número de productos fiados
 *
 * @example
 * ```tsx
 * <TopClientsList
 *   clients={topClients}
 *   isLoading={isLoading}
 *   onSelectClient={handleSelectClient}
 * />
 * ```
 */
export function TopClientsList({
  clients,
  isLoading,
  onSelectClient,
}: TopClientsListProps) {
  const { formatAmount } = useCurrency();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center text-muted-foreground">
        No hay clientes con deudas pendientes.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {clients.map((client, index) => (
        <div
          key={client.id}
          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
          onClick={() => onSelectClient(client.id)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${
                index === 0
                  ? 'bg-yellow-500'
                  : index === 1
                  ? 'bg-gray-400'
                  : index === 2
                  ? 'bg-amber-600'
                  : 'bg-primary'
              }`}
            >
              {index + 1}
            </div>
            <div>
              <p className="font-medium">{client.name}</p>
              <p className="text-xs text-muted-foreground">
                {client.debtCount} producto{client.debtCount !== 1 ? 's' : ''} fiado{client.debtCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
              <p className="font-bold text-destructive">{formatAmount(client.totalDebt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Componente de estadísticas rápidas de clientes
 */
export function ClientStatsCards({
  stats,
  isLoading,
}: {
  stats?: {
    totalClients: number;
    activeClients: number;
    totalDebt: number;
    clientsWithDebt: number;
  };
  isLoading: boolean;
}) {
  const { formatAmount } = useCurrency();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeClients} activos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
          <DollarSign className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatAmount(stats.totalDebt)}
          </div>
          <p className="text-xs text-muted-foreground">
            En productos fiados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes con Deuda</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.clientsWithDebt}</div>
          <p className="text-xs text-muted-foreground">
            Con productos fiados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
