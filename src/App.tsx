import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { useEffect } from "react"

import { AuthPage } from "./pages/auth-page"
import { SessionActivityTracker } from "./components/auth/session-activity-tracker"
import { DashboardPage } from "./pages/dashboard-page"
import { InventoryPage } from "./pages/inventory-page"
import { ClientsPage } from "./pages/clients-page"
import { SalesPage } from "./pages/sales-page"
import { SettingsPage } from "./pages/settings-page"
import { ReportsPage } from "./pages/reports-page"
import { CommercialClosurePage } from "./pages/commercial-closure-page"
import { SessionTraceabilityPage } from "./pages/session-traceability-page"
import { TransfersPage } from "./pages/transfers-page"
import { MainLayout } from "./components/layout/main-layout"
import { AuthInitializingShell } from "./components/auth/auth-initializing-shell"
import { ProtectedRoute } from "./components/auth/protected-route"
import { ConfirmDialogHost } from "./components/ui/confirm-dialog-host"
import { useAuthStore } from "./stores/auth-store"
import { useAppMonetary } from "./hooks/use-app-monetary"
import { useTheme } from "./hooks/use-theme"

/**
 * Componente para redirigir a / si ya está autenticado.
 * Se aplica a nivel de la layout route de autenticación, una sola vez
 * para ambas rutas /login y /register.
 */
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  if (!isInitialized) {
    return <AuthInitializingShell />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useAppMonetary()
  useTheme()
  
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
                <AuthPage />
              </AuthRedirect>
            }
            path="/:authMode"
          />

          {/* Rutas protegidas con MainLayout */}
          <Route
            element={
              <ProtectedRoute>
                <>
                  <SessionActivityTracker />
                  <MainLayout />
                </>
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/transfers" element={<TransfersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/commercial-closure" element={<CommercialClosurePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/session-traceability" element={<SessionTraceabilityPage />} />
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
