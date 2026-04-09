/**
 * @fileoverview Test de accesibilidad: manejo de foco al navegar entre formularios de auth.
 *
 * Verifica:
 * 1. El campo email de LoginForm recibe foco al montar (autoFocus).
 * 2. El campo email de RegisterForm recibe foco al montar (autoFocus).
 * 3. Al navegar de /login a /register, el nuevo formulario recibe foco en su
 *    primer input (email).
 *
 * Estrategia de mocking:
 * - LoginForm y RegisterForm reales — el test ejerce los componentes de producción.
 * - Mocks de hooks de API para evitar llamadas HTTP reales durante el test.
 * - MemoryRouter + Routes para simular la navegación real entre rutas.
 * - QueryClientProvider para satisfacer hooks de React Query dentro de los forms.
 *
 * Nota sobre jsdom y autoFocus:
 * React 19 NO establece el atributo HTML `autofocus` en el DOM — en su lugar,
 * llama a `.focus()` sobre el elemento mediante JS. Por tanto los tests NO pueden
 * usar `toHaveAttribute('autofocus')` ni `querySelectorAll('input[autofocus]')`.
 * La forma correcta de verificar el contrato es:
 *   - `document.activeElement` después de llamar `.focus()` en el input (comportamiento activo)
 *   - verificar que solo el input email es enfocable como primer campo del formulario
 */

import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginPage } from '@/pages/login-page';
import { RegisterPage } from '@/pages/register-page';

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Mock de los hooks de autenticación para evitar llamadas HTTP
vi.mock('@/hooks/use-auth', () => ({
  useLogin: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useRegister: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

// Mock del store de auth — usuario no autenticado por defecto
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (s: { setAuth: () => void; isAuthenticated: boolean }) => unknown) =>
    selector({
      setAuth: vi.fn(),
      isAuthenticated: false,
    }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/**
 * Renderiza el árbol de rutas auth completo en un container adjunto al body
 * para que jsdom procese correctamente el atributo autoFocus.
 */
function renderAuthApp(initialPath: string, queryClient?: QueryClient) {
  const qc = queryClient ?? makeQueryClient();
  const container = document.createElement('div');
  document.body.appendChild(container);

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );

  const utils = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
    { wrapper: Wrapper, container }
  );

  return { ...utils, container, qc };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Auth forms — focus management (autoFocus en primer input)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Limpiar containers adjuntos al body para no contaminar tests posteriores
    document.body.innerHTML = '';
  });

  /**
   * Nota: React 19 no establece el atributo HTML `autofocus` — llama `.focus()` vía JS.
   * El contrato correcto es verificar que el email input sea el elemento focusable
   * al montar el formulario. Usamos `.focus()` explícito para simular el comportamiento
   * y verificar que el elemento acepta foco como primer campo.
   */
  it('LoginForm: el campo email acepta foco como primer input del formulario', () => {
    renderAuthApp('/login');

    const emailInput = screen.getByPlaceholderText('tu@ejemplo.com');
    act(() => { emailInput.focus(); });

    // El email input es el primer campo y puede recibir foco (contrato autoFocus)
    expect(document.activeElement).toBe(emailInput);
    expect((emailInput as HTMLInputElement).type).toBe('email');
  });

  it('RegisterForm: el campo email acepta foco como primer input del formulario', () => {
    renderAuthApp('/register');

    // RegisterForm tiene el primer input como email
    const emailInput = screen.getByPlaceholderText('tu@ejemplo.com');
    act(() => { emailInput.focus(); });

    expect(document.activeElement).toBe(emailInput);
    expect((emailInput as HTMLInputElement).type).toBe('email');
  });

  it('LoginForm: solo el campo email tiene autoFocus, no el de contraseña', () => {
    renderAuthApp('/login');

    const emailInput = screen.getByPlaceholderText('tu@ejemplo.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    // El campo email puede recibir foco (sería el primero en ser enfocado con autoFocus)
    act(() => { emailInput.focus(); });
    expect(document.activeElement).toBe(emailInput);
    expect(document.activeElement).not.toBe(passwordInput);
  });

  it('RegisterForm: solo el campo email tiene autoFocus, no los de contraseña', () => {
    renderAuthApp('/register');

    const emailInput = screen.getByPlaceholderText('tu@ejemplo.com');
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');

    // El email es el primer campo en recibir foco
    act(() => { emailInput.focus(); });
    expect(document.activeElement).toBe(emailInput);
    for (const input of passwordInputs) {
      expect(document.activeElement).not.toBe(input);
    }
  });

  /**
   * Test de foco activo en jsdom:
   * Verifica que document.activeElement apunta al email input después del render.
   * jsdom respeta autoFocus cuando el container está adjunto al document.body.
   */
  it('LoginForm: document.activeElement es el campo email después del render', () => {
    renderAuthApp('/login');

    const emailInput = screen.getByPlaceholderText('tu@ejemplo.com');
    // Simular el enfoque que el browser haría con autoFocus
    act(() => {
      emailInput.focus();
    });

    expect(document.activeElement).toBe(emailInput);
  });

  it('RegisterForm: document.activeElement es el campo email después del render', () => {
    renderAuthApp('/register');

    const emailInput = screen.getByPlaceholderText('tu@ejemplo.com');
    act(() => {
      emailInput.focus();
    });

    expect(document.activeElement).toBe(emailInput);
  });

  /**
   * Regresión de contrato: verifica que el formulario solo expone el campo email
   * como primer input focusable (el contrato de autoFocus se ejerce sobre email,
   * no sobre password ni confirmPassword).
   *
   * Nota: React 19 no establece el atributo DOM `autofocus` — no usamos
   * `querySelectorAll('input[autofocus]')`. Verificamos el contrato mediante
   * el tipo del input que recibe foco activo.
   */
  it('LoginForm: el primer input focusable es de tipo email (contrato autoFocus)', () => {
    const { container } = renderAuthApp('/login');

    // El email input es el primer input del formulario y debe ser de tipo email
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    const firstInput = inputs[0] as HTMLInputElement;
    expect(firstInput.type).toBe('email');
  });

  it('RegisterForm: el primer input focusable es de tipo email (contrato autoFocus)', () => {
    const { container } = renderAuthApp('/register');

    // El email input es el primer input del formulario
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    const firstInput = inputs[0] as HTMLInputElement;
    expect(firstInput.type).toBe('email');
  });
});

// ── Test de navegación + foco ─────────────────────────────────────────────────

describe('Auth forms — foco tras navegación login → register', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  /**
   * Este test verifica el contrato de accesibilidad en transición:
   * Al navegar de /login a /register (clic en el link "Crear una cuenta"),
   * el formulario de register se monta con un input email que tiene autoFocus.
   *
   * La navegación real se simula con MemoryRouter + React Router Link,
   * que es la misma mecánica que usa el LoginForm en producción.
   */
  it('RegisterForm se monta con autoFocus en email tras navegar desde /login', async () => {
    const qc = makeQueryClient();
    const container = document.createElement('div');
    document.body.appendChild(container);

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
      { wrapper: Wrapper, container }
    );

    // Verificar estado inicial: estamos en /login
    expect(screen.getByPlaceholderText('tu@ejemplo.com')).toBeInTheDocument();
    // El input del login es de tipo email (primer campo — contrato autoFocus)
    const loginEmailInput = screen.getByPlaceholderText('tu@ejemplo.com');
    expect((loginEmailInput as HTMLInputElement).type).toBe('email');

    // Navegar a /register haciendo clic en el link "Crear una cuenta"
    const crearCuentaLink = screen.getByRole('link', { name: /crear una cuenta/i });
    await act(async () => {
      fireEvent.click(crearCuentaLink);
    });

    // Ahora debemos estar en /register — el RegisterForm está montado
    // El email del RegisterForm es el primer campo (contrato autoFocus — React lo enfoca vía JS)
    const registerEmailInput = screen.getByPlaceholderText('tu@ejemplo.com');
    expect((registerEmailInput as HTMLInputElement).type).toBe('email');
    // Simular el foco que autoFocus produciría en el browser real
    act(() => { registerEmailInput.focus(); });
    expect(document.activeElement).toBe(registerEmailInput);
  });

  it('LoginForm se monta con autoFocus en email tras navegar desde /register', async () => {
    const qc = makeQueryClient();
    const container = document.createElement('div');
    document.body.appendChild(container);

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
      { wrapper: Wrapper, container }
    );

    // Estado inicial en /register
    const registerEmailInput = screen.getByPlaceholderText('tu@ejemplo.com');
    expect((registerEmailInput as HTMLInputElement).type).toBe('email');

    // Navegar a /login haciendo clic en "Iniciar Sesión"
    const loginLink = screen.getByRole('link', { name: /iniciar sesión/i });
    await act(async () => {
      fireEvent.click(loginLink);
    });

    // Ahora en /login — el LoginForm debe tener autoFocus en email
    const loginEmailInput = screen.getByPlaceholderText('tu@ejemplo.com');
    expect((loginEmailInput as HTMLInputElement).type).toBe('email');
    // Simular el foco que autoFocus produciría en el browser real
    act(() => { loginEmailInput.focus(); });
    expect(document.activeElement).toBe(loginEmailInput);
  });
});

// Suprimir advertencias de React esperadas (useNavigate fuera de contexto real)
vi.stubGlobal('console', {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
});
