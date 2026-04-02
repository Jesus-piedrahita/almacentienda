import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { useEffect } from "react"

import { LoginPage } from "./pages/login-page"
import { RegisterPage } from "./pages/register-page"
import { DashboardPage } from "./pages/dashboard-page"
import { InventoryPage } from "./pages/inventory-page"
import { ClientsPage } from "./pages/clients-page"
import { MainLayout } from "./components/layout/main-layout"
import { ProtectedRoute } from "./components/auth/protected-route"
import { useAuthStore } from "./stores/auth-store"

/**
 * Componente para redirigir a / si ya está autenticado
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
  
  // Inicializar estado de auth desde localStorage al cargar la app
  useEffect(() => {
    initialize()
  }, [initialize])
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas con redirect si ya está autenticado */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <RegisterPage />
            </AuthRedirect>
          }
        />

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
        </Route>

        {/* Redirect raíz a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
