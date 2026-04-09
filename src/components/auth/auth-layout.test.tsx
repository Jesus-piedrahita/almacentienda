/**
 * @fileoverview Test de regresión para AuthLayout como layout route compartido.
 *
 * Verifica:
 * 1. AuthLayout renderiza el contenido del Outlet (rutas hijas).
 * 2. El panel de branding (aside con logo y texto) se mantiene en el DOM
 *    al navegar de /login → /register (sin remount del shell compartido).
 * 3. El wrapper del Outlet tiene la clase `min-h-[480px]` para prevenir CLS.
 *
 * Estrategia de mocking:
 * - MemoryRouter + Routes para simular el entorno de layout route padre/hijo.
 * - No se mockea auth-store aquí porque AuthLayout no lo consume directamente
 *   (AuthRedirect en App.tsx lo hace, pero no se monta en estos tests).
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { vi, describe, it, expect } from 'vitest';
import { AuthLayout } from './auth-layout';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Renderiza AuthLayout como ruta layout padre con las rutas hijas especificadas.
 * Refleja fielmente la estructura real de App.tsx.
 */
function renderAuthLayoutWithRoutes(
  initialPath: string,
  routes: Array<{ path: string; element: React.ReactElement }>
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AuthLayout />}>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthLayout — layout route compartido', () => {
  it('renderiza el contenido del Outlet cuando la ruta hija coincide', () => {
    renderAuthLayoutWithRoutes('/login', [
      { path: '/login', element: <div data-testid="login-form-stub">Login Form</div> },
      { path: '/register', element: <div data-testid="register-form-stub">Register Form</div> },
    ]);

    expect(screen.getByTestId('login-form-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('register-form-stub')).not.toBeInTheDocument();
  });

  it('renderiza el contenido del Outlet para /register', () => {
    renderAuthLayoutWithRoutes('/register', [
      { path: '/login', element: <div data-testid="login-form-stub">Login Form</div> },
      { path: '/register', element: <div data-testid="register-form-stub">Register Form</div> },
    ]);

    expect(screen.getByTestId('register-form-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form-stub')).not.toBeInTheDocument();
  });

  it('mantiene el panel de branding (aside) en el DOM — texto "Almacén Tienda" visible', () => {
    renderAuthLayoutWithRoutes('/login', [
      { path: '/login', element: <div>Login</div> },
    ]);

    // El aside del panel de branding siempre debe estar presente en el DOM
    // aunque sea visualmente oculto en mobile (hidden md:flex).
    const brandingText = screen.getByText('Almacén Tienda');
    expect(brandingText).toBeInTheDocument();
  });

  it('mantiene el texto del encabezado del branding', () => {
    renderAuthLayoutWithRoutes('/login', [
      { path: '/login', element: <div>Login</div> },
    ]);

    expect(
      screen.getByText(/Gestiona tu inventario con facilidad/i)
    ).toBeInTheDocument();
  });

  it('el wrapper del Outlet contiene la clase min-h para prevenir CLS', () => {
    renderAuthLayoutWithRoutes('/login', [
      { path: '/login', element: <div data-testid="outlet-child">Form</div> },
    ]);

    // El wrapper directo del Outlet debe tener min-h-[480px] para prevención CLS
    // Buscamos el div que contiene al outlet-child y verificamos su clase ancestro
    const outletChild = screen.getByTestId('outlet-child');

    // El Outlet child está dentro de .animate-auth-fade-in → dentro del min-h wrapper
    // Verificamos que hay un ancestor con la clase min-h-[480px]
    let el: HTMLElement | null = outletChild;
    let foundMinH = false;
    while (el) {
      if (el.className && el.className.includes('min-h-[480px]')) {
        foundMinH = true;
        break;
      }
      el = el.parentElement;
    }
    expect(foundMinH).toBe(true);
  });

  it('el wrapper del Outlet tiene la clase animate-auth-fade-in', () => {
    renderAuthLayoutWithRoutes('/login', [
      { path: '/login', element: <div data-testid="outlet-child">Form</div> },
    ]);

    const outletChild = screen.getByTestId('outlet-child');

    // El div inmediatamente padre debe tener animate-auth-fade-in
    let el: HTMLElement | null = outletChild;
    let foundFadeIn = false;
    while (el) {
      if (el.className && el.className.includes('animate-auth-fade-in')) {
        foundFadeIn = true;
        break;
      }
      el = el.parentElement;
    }
    expect(foundFadeIn).toBe(true);
  });

  it('no renderiza contenido de ruta hija si ningún path coincide', () => {
    renderAuthLayoutWithRoutes('/unknown', [
      { path: '/login', element: <div data-testid="login-stub">Login</div> },
      { path: '/register', element: <div data-testid="register-stub">Register</div> },
    ]);

    // Cuando ninguna ruta hija coincide, React Router no renderiza el layout padre tampoco.
    // Verificamos que NINGÚN contenido de ruta hija aparece.
    expect(screen.queryByTestId('login-stub')).not.toBeInTheDocument();
    expect(screen.queryByTestId('register-stub')).not.toBeInTheDocument();
    // Y el branding tampoco se renderiza ya que la layout route no matcheó
    expect(screen.queryByText('Almacén Tienda')).not.toBeInTheDocument();
  });

  /**
   * Test crítico de no-remount:
   * Simula la navegación /login → /register renderizando ambas vistas por separado
   * y verificando que el nodo del panel de branding no desaparece entre renders.
   *
   * Nota: RTL no puede verificar "identidad de nodo DOM" entre renders de componentes
   * distintos (ese caso requiere Playwright o interacción real). Lo que sí verificamos
   * es que el branding shell SIEMPRE está presente en AMBAS rutas, que es el contrato
   * que previene el remount del panel al navegar.
   */
  it('el panel de branding está presente tanto en /login como en /register (contrato anti-remount)', () => {
    // Render en /login
    const { unmount: unmountLogin } = renderAuthLayoutWithRoutes('/login', [
      { path: '/login', element: <div>Login Form</div> },
      { path: '/register', element: <div>Register Form</div> },
    ]);

    expect(screen.getByText('Almacén Tienda')).toBeInTheDocument();
    unmountLogin();

    // Render en /register — el branding sigue igual
    renderAuthLayoutWithRoutes('/register', [
      { path: '/login', element: <div>Login Form</div> },
      { path: '/register', element: <div>Register Form</div> },
    ]);

    expect(screen.getByText('Almacén Tienda')).toBeInTheDocument();
  });
});

// Silenciar warnings de act innecesarios para estos tests estáticos
vi.stubGlobal('console', {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
});
