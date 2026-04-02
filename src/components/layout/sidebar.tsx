/**
 * @fileoverview Componente Sidebar con navegación lateral.
 * Muestra el menú de navegación y la información del usuario.
 */

import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Store,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Definición de elementos de navegación
 */
const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Inventario",
    href: "/inventory",
    icon: Package,
  },
  {
    label: "Clientes",
    href: "/clients",
    icon: Users,
  },
  {
    label: "Ventas",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    label: "Reportes",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Configuración",
    href: "/settings",
    icon: Settings,
  },
];

/**
 * Sidebar - Componente de navegación lateral.
 *
 * Muestra un menú de navegación con enlaces a las diferentes secciones
 * del sistema. También muestra la información del usuario actual y
 * proporciona un botón para cerrar sesión.
 *
 * @example
 * ```tsx
 * <Sidebar />
 * ```
 */
export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo / Título */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Store className="size-6 text-primary" />
        <span className="text-lg font-semibold">AlmacenTienda</span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Información del usuario y logout */}
      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">
              {user?.email || "Usuario"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
