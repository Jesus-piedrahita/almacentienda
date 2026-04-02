/**
 * @fileoverview Componente de ruta protegida que verifica autenticación.
 * Redirige a /login si el usuario no está autenticado.
 */

import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Props del componente ProtectedRoute
 */
interface ProtectedRouteProps {
  /** children se renderiza si el usuario está autenticado */
  children: React.ReactNode;
}

/**
 * ProtectedRoute - Componente de orden superior que protege rutas.
 *
 * Verifica el estado de autenticación del usuario utilizando el Zustand store.
 * Si el usuario no está autenticado, redirige a /login.
 * Si está autenticado, renderiza los children.
 *
 * @param props - Props del componente
 * @param props.children - Contenido a renderizar si está autenticado
 *
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const location = useLocation();

  // Si no está inicializado, no mostrar nada aún (evitar flash)
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    // Redirigir a /login pero guardar la ubicación actual
    // para poder redirigir de vuelta después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
