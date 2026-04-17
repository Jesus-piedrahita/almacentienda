/**
 * @fileoverview Componente de lista de clientes.
 * Muestra los clientes registrados con opciones de editar, eliminar y ver detalles.
 */

import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Client } from '@/types/clients';

interface ClientListProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onViewDetails: (client: Client) => void;
}

/**
 * ClientList - Lista de clientes con acciones.
 *
 * Muestra:
 * - Nombre del cliente
 * - Email
 * - Teléfono
 * - Estado (activo/inactivo)
 * - Botones de acción
 *
 * @example
 * ```tsx
 * <ClientList
 *   clients={clients}
 *   isLoading={isLoading}
 *   onEdit={handleEditClient}
 *   onDelete={handleDeleteClient}
 *   onViewDetails={handleViewDetails}
 * />
 * ```
 */
export function ClientList({
  clients,
  isLoading,
  onEdit,
  onDelete,
  onViewDetails,
}: ClientListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center text-muted-foreground">
        No hay clientes registrados. Agrega tu primer cliente.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clients.map((client) => (
        <div
          key={client.id}
          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{client.name}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  client.isActive === 1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {client.isActive === 1 ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{client.email}</p>
            {client.phone && (
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onViewDetails(client)}
              title="Ver detalles y deudas"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onEdit(client)}
            >
              <Edit className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(client)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
