import { Activity, Clock3, History, MonitorSmartphone } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSessionTraceDetail, useSessionTraces } from '@/hooks/use-auth';

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Sin dato';
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

export function SessionTraceabilityPage() {
  const tracesQuery = useSessionTraces();
  const traces = tracesQuery.data ?? [];
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const effectiveSessionId = selectedSessionId ?? traces[0]?.sessionId ?? null;
  const traceDetailQuery = useSessionTraceDetail(effectiveSessionId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <History className="size-8 text-primary" />
          Trazabilidad de sesiones
        </h1>
        <p className="text-muted-foreground">
          Mirá quién abrió sesión, cuánto duró, qué pantallas visitó y cuándo fue reemplazada.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sesiones registradas</CardTitle>
          </CardHeader>
          <CardContent>
            {tracesQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando sesiones...</p>
            ) : traces.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay sesiones persistidas.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Última actividad</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {traces.map((trace) => (
                    <TableRow key={trace.sessionId}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{trace.userEmail}</p>
                          <p className="text-xs text-muted-foreground">{trace.sessionId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <p>{trace.isActive ? 'Activa' : 'Finalizada'}</p>
                          <p className="text-muted-foreground">{trace.endReason ?? 'sin cierre explícito'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDuration(trace.durationSeconds)}</TableCell>
                      <TableCell>{formatDateTime(trace.latestActivityAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant={trace.sessionId === effectiveSessionId ? 'default' : 'outline'}
                          onClick={() => setSelectedSessionId(trace.sessionId)}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="xl:max-h-[calc(100vh-12rem)]">
          <CardHeader>
            <CardTitle>Detalle de sesión</CardTitle>
          </CardHeader>
          <CardContent
            className="space-y-4 xl:max-h-[calc(100vh-16rem)] xl:overflow-y-auto"
            data-testid="session-detail-scroll-container"
          >
            {!effectiveSessionId ? (
              <p className="text-sm text-muted-foreground">Seleccioná una sesión para inspeccionarla.</p>
            ) : traceDetailQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando detalle...</p>
            ) : !traceDetailQuery.data ? (
              <p className="text-sm text-muted-foreground">No se pudo cargar la sesión seleccionada.</p>
            ) : (
              <>
                <div className="grid gap-3">
                  <div className="rounded-lg border p-4">
                    <p className="flex items-center gap-2 text-sm font-medium"><Clock3 className="size-4" /> Duración</p>
                    <p className="mt-2 text-2xl font-semibold">{formatDuration(traceDetailQuery.data.durationSeconds)}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="flex items-center gap-2 text-sm font-medium"><Activity className="size-4" /> Última actividad</p>
                    <p className="mt-2 text-sm">{formatDateTime(traceDetailQuery.data.latestActivityAt)}</p>
                    <p className="text-xs text-muted-foreground">{traceDetailQuery.data.latestActivityType ?? 'sin eventos'}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="flex items-center gap-2 text-sm font-medium"><MonitorSmartphone className="size-4" /> Reemplazo / estado</p>
                    <p className="mt-2 text-sm">{traceDetailQuery.data.isActive ? 'Sesión activa actual' : 'Sesión cerrada'}</p>
                    <p className="text-xs text-muted-foreground">
                      {traceDetailQuery.data.replacedBySessionId
                        ? `Reemplazada por ${traceDetailQuery.data.replacedBySessionId}`
                        : traceDetailQuery.data.endReason ?? 'sin reemplazo'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border p-4">
                  <h2 className="font-medium">Pantallas visitadas</h2>
                  {traceDetailQuery.data.visitedRoutes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay page views registrados todavía.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {traceDetailQuery.data.visitedRoutes.map((route) => (
                        <span key={route} className="rounded-full border px-3 py-1 text-xs">
                          {route}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 rounded-lg border p-4">
                  <h2 className="font-medium">Línea de tiempo</h2>
                  {traceDetailQuery.data.activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay actividad persistida para esta sesión.</p>
                  ) : (
                    <div className="space-y-3">
                      {traceDetailQuery.data.activities.map((activity) => (
                        <div key={activity.id} className="rounded-md border bg-muted/30 p-3 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-medium">{activity.eventType}</span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(activity.occurredAt)}</span>
                          </div>
                          <p className="mt-1 text-muted-foreground">{activity.route ?? 'sin ruta'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
