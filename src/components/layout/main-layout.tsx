/**
 * @fileoverview Layout principal con sidebar.
 * Envuelve el contenido de las páginas con el sidebar de navegación.
 */

import { Outlet } from "react-router";

import { Sidebar } from "./sidebar";

/**
 * MainLayout - Layout contenedor de la aplicación.
 *
 * Proporciona la estructura base con el sidebar de navegación
 * fijo en el lado izquierdo y el contenido de las páginas
 * renderizado en el área principal mediante Outlet.
 *
 * @example
 * ```tsx
 * <MainLayout>
 *   <DashboardPage />
 * </MainLayout>
 * ```
 */
export function MainLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto bg-background p-6">
        <Outlet />
      </main>
    </div>
  );
}
