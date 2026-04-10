import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { useEffect } from "react"

import { LoginPage } from "./pages/login-page"
import { RegisterPage } from "./pages/register-page"
import { DashboardPage } from "./pages/dashboard-page"
import { InventoryPage } from "./pages/inventory-page"
import { ClientsPage } from "./pages/clients-page"
import { SalesPage } from "./pages/sales-page"
import { SettingsPage } from "./pages/settings-page"
import { MainLayout } from "./components/layout/main-layout"
import { AuthLayout } from "./components/auth/auth-layout"
import { ProtectedRoute } from "./components/auth/protected-route"
import { ConfirmDialogHost } from "./components/ui/confirm-dialog-host"
import { useAuthStore } from "./stores/auth-store"
import { useAppMonetary } from "./hooks/use-app-monetary"

/**
 * Componente para redirigir a / si ya está autenticado.
 * Se aplica a nivel de la layout route de autenticación, una sola vez
 * para ambas rutas /login y /register.
 */
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useAppMonetary()
  
  // Inicializar estado de auth desde localStorage al cargar la app
  useEffect(() => {
    initialize()
  }, [initialize])
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Auth layout route — AuthLayout se mantiene montado al navegar entre
              /login y /register, evitando el remount del panel de branding.
              AuthRedirect aplica una sola vez para ambas rutas hijas. */}
          <Route
            element={
              <AuthRedirect>
                <AuthLayout />
              </AuthRedirect>
            }
          >
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Rutas protegidas con MainLayout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all — redirige rutas no reconocidas al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      <ConfirmDialogHost />
    </>
  )
}

export default App
