/**
 * @fileoverview Layout para páginas de autenticación.
 * Proporciona una estructura dividida en dos columnas: panel de branding (escritorio)
 * y panel de formulario (responsive).
 */

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

/**
 * Props del componente AuthLayout.
 */
interface AuthLayoutProps {
  /** Contenido a renderizar en el panel de formulario */
  children: ReactNode
  /** Clases CSS adicionales para el contenedor de formulario */
  className?: string
}

/**
 * Componente AuthLayout - Layout para páginas de autenticación.
 *
 * Proporciona una estructura de dos paneles:
 * - Izquierda: Panel de branding (solo desktop) con gradiente, logo y descripción
 * - Derecha: Panel de formulario (responsive) donde se renderiza el contenido
 *
 * El diseño es completamente responsive: en móvil solo muestra el panel de formulario,
 * en desktop muestra ambos paneles.
 *
 * @param props - Props del layout
 * @param props.children - Contenido a renderizar (típicamente una LoginForm o RegisterForm)
 * @param props.className - Clases adicionales para el contenedor de formulario
 *
 * @example
 * ```tsx
 * <AuthLayout>
 *   <LoginForm />
 * </AuthLayout>
 *
 * <AuthLayout className="custom-class">
 *   <RegisterForm />
 * </AuthLayout>
 * ```
 */
export function AuthLayout({ children, className }: AuthLayoutProps) {
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

      {/* Right: Form panel */}
      <main className="flex items-center justify-center p-6 bg-background">
        <div className={cn("w-full max-w-md", className)}>{children}</div>
      </main>
    </div>
  )
}
