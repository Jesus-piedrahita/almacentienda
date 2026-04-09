/**
 * @fileoverview Layout para páginas de autenticación.
 * Proporciona una estructura dividida en dos columnas: panel de branding (escritorio)
 * y panel de formulario (responsive). Actúa como layout route compartido — renderiza
 * el contenido hijo a través de <Outlet /> para evitar el remount del panel de branding
 * al navegar entre /login y /register.
 */

import { Outlet } from "react-router"

/**
 * Componente AuthLayout - Layout route compartido para páginas de autenticación.
 *
 * Proporciona una estructura de dos paneles:
 * - Izquierda: Panel de branding (solo desktop) con gradiente, logo y descripción.
 *   Se mantiene montado al navegar entre rutas auth (sin remount).
 * - Derecha: Panel de formulario (responsive) con Outlet donde React Router
 *   renderiza LoginPage o RegisterPage según la ruta activa.
 *
 * El área del Outlet tiene `min-h-[480px]` para prevenir CLS al cambiar entre
 * el formulario de login (más corto) y el de registro (más alto).
 * La animación `animate-auth-fade-in` aplica un fade-in suave al montar cada formulario.
 *
 * @example
 * ```tsx
 * // App.tsx — ruta layout padre que envuelve las rutas auth
 * <Route element={<AuthRedirect><AuthLayout /></AuthRedirect>}>
 *   <Route path="/login" element={<LoginPage />} />
 *   <Route path="/register" element={<RegisterPage />} />
 * </Route>
 * ```
 */
export function AuthLayout() {
  return (
    <div className="grid md:grid-cols-2 min-h-screen">
      {/* Left: Branding panel - hidden on mobile, visible on desktop */}
      <aside className="hidden md:flex bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
            <svg
              className="w-6 h-6"
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
        <img src="/undraw_authentication_1evl.svg" alt="login" className="max-w-xl" />

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Gestiona tu inventario con facilidad
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            La solución completa para administrar productos, ventas y clientes en
            una sola plataforma.
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-primary-foreground/60">
          <span>© 2026 Almacén Tienda</span>
        </div>
      </aside>

      {/* Right: Form panel — stable min-h prevents CLS between login/register */}
      <main className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md min-h-[480px] flex items-start justify-center">
          <div className="w-full animate-auth-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
