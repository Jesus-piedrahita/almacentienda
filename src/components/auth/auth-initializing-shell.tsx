import { Skeleton } from '@/components/ui/skeleton';

/**
 * Shell neutro para la inicialización del estado de autenticación.
 * Evita el flash prematuro de login/register mientras el store hidrata la sesión.
 */
export function AuthInitializingShell() {
  return (
    <div className="grid min-h-screen md:grid-cols-2" data-testid="auth-initializing-shell">
      <aside className="hidden flex-col justify-between bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground md:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <span className="text-xl font-semibold">Almacén Tienda</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Gestiona tu inventario con facilidad</h1>
          <p className="max-w-md text-lg text-primary-foreground/80">
            La solución completa para administrar productos, ventas y clientes en una sola plataforma.
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-primary-foreground/60">
          <span>© 2026 Almacén Tienda</span>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-background p-6">
        <div className="flex min-h-[480px] w-full max-w-md items-start justify-center">
          <div className="w-full space-y-6 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-full max-w-72" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
