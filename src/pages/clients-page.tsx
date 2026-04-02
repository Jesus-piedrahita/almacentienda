/**
 * @fileoverview Página de gestión de clientes.
 * Muestra lista de clientes, top deudores y permite agregar/editar/eliminar.
 */

import { useState } from 'react';
import { Users, Plus, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ClientList } from '@/components/clients/client-list';
import { ClientDialog } from '@/components/clients/client-dialog';
import { ClientDetailsDialog } from '@/components/clients/client-details-dialog';
import { TopClientsList, ClientStatsCards } from '@/components/clients/top-clients-list';
import { useClients, useClientStats, useClientWithDebts, useDeleteClient } from '@/hooks/use-clients';
import { confirmDelete, showError } from '@/hooks/use-confirm-dialog';
import type { Client } from '@/types/clients';

/**
 * ClientsPage - Página principal de gestión de clientes.
 *
 * Muestra:
 * - Estadísticas de clientes
 * - Top 10 clientes con más deuda
 * - Lista de clientes con acciones
 * - Dialog para agregar/editar cliente
 * - Dialog de detalles con deudas
 *
 * @example
 * ```tsx
 * <ClientsPage />
 * ```
 */
export function ClientsPage() {
  // Estados para dialogs
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailsClientId, setDetailsClientId] = useState<string | null>(null);

  // Queries
  const { data: clientsData, isLoading: isLoadingClients } = useClients();
  const { data: stats, isLoading: isLoadingStats } = useClientStats();
  const { data: clientWithDebts, isLoading: isLoadingDebts } = useClientWithDebts(detailsClientId || '');

  // Mutations
  const deleteClientMutation = useDeleteClient();

  // Datos
  const clients = clientsData ?? [];

  // Handlers
  const handleAddClient = () => {
    setSelectedClient(null);
    setIsClientDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsClientDialogOpen(true);
  };

  const handleDeleteClient = async (client: Client) => {
    const confirmed = await confirmDelete(client.name);

    if (confirmed) {
      try {
        await deleteClientMutation.mutateAsync(client.id);
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        await showError('Error', 'No se pudo eliminar el cliente.');
      }
    }
  };

  const handleViewDetails = (client: Client) => {
    setDetailsClientId(client.id);
    setIsDetailsDialogOpen(true);
  };

  const handleSelectTopClient = (clientId: string) => {
    setDetailsClientId(clientId);
    setIsDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = (open: boolean) => {
    setIsDetailsDialogOpen(open);
    if (!open) {
      setDetailsClientId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona tus clientes y sus deudas
          </p>
        </div>
        <Button onClick={handleAddClient} className="gap-2">
          <Plus className="size-4" />
          Agregar Cliente
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <ClientStatsCards
        stats={stats || undefined}
        isLoading={isLoadingStats}
      />

      {/* Top clientes deudores y lista de clientes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top clientes con deuda */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Top Clientes Deudores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopClientsList
              clients={stats?.topClients ?? []}
              isLoading={isLoadingStats}
              onSelectClient={handleSelectTopClient}
            />
          </CardContent>
        </Card>

        {/* Lista de clientes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Lista de Clientes
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
            </span>
          </CardHeader>
          <CardContent>
            <ClientList
              clients={clients}
              isLoading={isLoadingClients}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onViewDetails={handleViewDetails}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialog para agregar/editar cliente */}
      <ClientDialog
        open={isClientDialogOpen}
        onOpenChange={(open) => {
          setIsClientDialogOpen(open);
          if (!open) setSelectedClient(null);
        }}
        client={selectedClient}
      />

      {/* Dialog de detalles del cliente */}
      <ClientDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={handleDetailsDialogClose}
        clientData={clientWithDebts || null}
        isLoading={isLoadingDebts}
      />
    </div>
  );
}
