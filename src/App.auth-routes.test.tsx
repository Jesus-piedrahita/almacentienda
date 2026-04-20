/**
 * @fileoverview Test de integración para el sistema de rutas de auth en App.tsx.
 *
 * Verifica:
 * 1. Usuarios NO autenticados pueden acceder a /login y /register.
 * 2. Usuarios autenticados son redirigidos a / desde /login y /register.
 * 3. La lógica de auth pública usa una sola ruta parametrizada `/:authMode`.
 *
 * Estrategia de mocking:
 * - `@/stores/auth-store` → controlamos isAuthenticated dinámicamente.
 * - MemoryRouter con initialEntries para simular navegación a rutas específicas.
 * - Mockeamos LoginPage y RegisterPage como stubs mínimos para aislar el test
 *   de la lógica de formularios (evitar dependencias de hooks de API).
 * - Mockeamos DashboardPage y MainLayout para aislar el árbol de rutas protegidas.
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { AuthInitializingShell } from '@/components/auth/auth-initializing-shell';
import { AuthPage } from '@/pages/auth-page';
import { useAuthStore } from '@/stores/auth-store';

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Controlamos el estado de auth directamente con el store real de Zustand.
// Esto nos permite alternar entre autenticado/no autenticado en cada test.
vi.mock('@/hooks/use-auth', () => ({
  useLogin: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false }),
  useRegister: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false }),
}));

// Stubs mínimos para aislar los formularios en estos tests de routing
vi.mock('@/components/auth/login-form', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form Stub</div>,
}));

vi.mock('@/components/auth/register-form', () => ({
  RegisterForm: () => <div data-testid="register-form">Register Form Stub</div>,
}));

// ── Inline AuthRedirect (igual al de App.tsx) ─────────────────────────────────

/**
 * Copia local de AuthRedirect para testear el contrato de routing sin
 * necesidad de montar el BrowserRouter completo de App.tsx.
 */
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <AuthInitializingShell />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

// ── Stubs de páginas ──────────────────────────────────────────────────────────

function LoginPage() {
  return <div data-testid="login-form">Login Form Stub</div>;
}

function RegisterPage() {
  return <div data-testid="register-form">Register Form Stub</div>;
}

function DashboardPage() {
  return <div data-testid="dashboard">Dashboard</div>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Renderiza el árbol de rutas públicas auth equivalente al fragmento relevante de App.tsx.
 */
function renderAuthRoutes(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          element={
            <AuthRedirect>
              <AuthPage />
            </AuthRedirect>
          }
          path="/:authMode"
        />

        {/* Ruta destino de redirección para usuarios autenticados */}
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('App auth routes — AuthRedirect con ruta auth unificada', () => {
  afterEach(() => {
    // Limpiar el store de auth entre tests para evitar contaminación
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      token: null,
      sessionId: null,
      isInitialized: true,
    });
    vi.clearAllMocks();
  });

  // ── Usuarios NO autenticados ────────────────────────────────────────────────

  it('usuario no autenticado puede acceder a /login', () => {
    useAuthStore.setState({ isAuthenticated: false, isInitialized: true });

    renderAuthRoutes('/login');

    expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    // No debe redirigir a dashboard
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  it('usuario no autenticado puede acceder a /register', () => {
    useAuthStore.setState({ isAuthenticated: false, isInitialized: true });

    renderAuthRoutes('/register');

    expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  // ── Usuarios autenticados ───────────────────────────────────────────────────

  it('usuario autenticado es redirigido de /login a /', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isInitialized: true,
      token: 'fake-token',
      sessionId: 'session-1',
      user: { id: 1, email: 'user@test.com', is_active: true, created_at: '2026-01-01T00:00:00Z' },
    });

    renderAuthRoutes('/login');

    // El login form NO debe mostrarse — el usuario fue redirigido
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    // El dashboard SÍ debe mostrarse (destino de la redirección)
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('usuario autenticado es redirigido de /register a /', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isInitialized: true,
      token: 'fake-token',
      sessionId: 'session-1',
      user: { id: 1, email: 'user@test.com', is_active: true, created_at: '2026-01-01T00:00:00Z' },
    });

    renderAuthRoutes('/register');

    expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  // ── Verificación de shell auth centralizado ───────────────────────────────

  it('el branding de AuthLayout es visible para usuario no autenticado en /login', () => {
    useAuthStore.setState({ isAuthenticated: false, isInitialized: true });

    renderAuthRoutes('/login');

    // El panel de branding siempre debe estar en el DOM cuando AuthLayout se monta
    expect(screen.getByText('Almacén Tienda')).toBeInTheDocument();
  });

  it('el branding de AuthLayout NO aparece cuando usuario autenticado es redirigido', () => {
    useAuthStore.setState({ isAuthenticated: true, isInitialized: true, token: 'fake-token', sessionId: 'session-1' });

    renderAuthRoutes('/login');

    // Cuando AuthRedirect redirige, AuthLayout NO se renderiza
    expect(screen.queryByText('Almacén Tienda')).not.toBeInTheDocument();
    // El dashboard sí debe mostrarse
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('muestra un shell neutro mientras auth todavía no se inicializó', () => {
    useAuthStore.setState({ isAuthenticated: false, isInitialized: false, token: null, sessionId: null, user: null });

    renderAuthRoutes('/login');

    expect(screen.getByTestId('auth-initializing-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });
});

// ── Verificación estática del módulo App ──────────────────────────────────────

describe('App module — estructura de rutas auth', () => {
  it('App.tsx exporta el componente App (default export exists)', async () => {
    const appModule = await import('@/App');
    expect(appModule.default).toBeDefined();
    expect(typeof appModule.default).toBe('function');
  });

  it('AuthPage valida el parámetro authMode y redirige a /login si es inválido', () => {
    render(
      <MemoryRouter initialEntries={['/foo']}>
        <Routes>
          <Route path="/:authMode" element={<AuthPage />} />
          <Route path="/login" element={<div data-testid="login-route">login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-route')).toBeInTheDocument();
  });
});
