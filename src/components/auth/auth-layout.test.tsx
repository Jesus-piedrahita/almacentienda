/**
 * @fileoverview Test de regresión para AuthLayout como shell auth persistente.
 *
 * Verifica:
 * 1. AuthLayout renderiza el modo correcto (`login` / `register`).
 * 2. El panel de branding (aside con logo y texto) está presente.
 * 3. El shell del Card auth vive en AuthLayout y mantiene `min-h-[480px]` para prevenir CLS.
 * 4. El wrapper auth ya no depende de Outlet ni de fade-in visual.
 *
 * Estrategia de mocking:
 * - MemoryRouter + Routes para simular el entorno de layout route padre/hijo.
 * - No se mockea auth-store aquí porque AuthLayout no lo consume directamente
 *   (AuthRedirect en App.tsx lo hace, pero no se monta en estos tests).
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { AuthLayout } from './auth-layout';

function renderAuthLayout(mode: 'login' | 'register') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthLayout mode={mode} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthLayout — shell auth persistente', () => {
  it('renderiza LoginForm cuando mode=login', () => {
    renderAuthLayout('login');

    expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('renderiza RegisterForm cuando mode=register', () => {
    renderAuthLayout('register');

    expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Cuenta/i })).toBeInTheDocument();
  });

  it('mantiene el panel de branding (aside) en el DOM — texto "Almacén Tienda" visible', () => {
    renderAuthLayout('login');

    // El aside del panel de branding siempre debe estar presente en el DOM
    // aunque sea visualmente oculto en mobile (hidden md:flex).
    const brandingText = screen.getByText('Almacén Tienda');
    expect(brandingText).toBeInTheDocument();
  });

  it('mantiene el texto del encabezado del branding', () => {
    renderAuthLayout('login');

    expect(
      screen.getByText(/Gestiona tu inventario con facilidad/i)
    ).toBeInTheDocument();
  });

  it('el shell auth contiene la clase min-h para prevenir CLS', () => {
    renderAuthLayout('login');

    const outletChild = screen.getByRole('button', { name: /Iniciar Sesión/i });

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

  it('renderiza el shell persistente del card auth en login', () => {
    renderAuthLayout('login');

    expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByText(/Ingresa tus credenciales para acceder a tu cuenta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear una cuenta/i })).toBeInTheDocument();
  });

  it('renderiza el shell persistente del card auth en register', () => {
    renderAuthLayout('register');

    expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeInTheDocument();
    expect(screen.getByText(/Ingresa tus datos para registrarte/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('el shell auth no aplica animate-auth-fade-in para evitar flash visual', () => {
    renderAuthLayout('login');

    const outletChild = screen.getByRole('button', { name: /Iniciar Sesión/i });

    let el: HTMLElement | null = outletChild;
    let foundFadeIn = false;
    while (el) {
      if (el.className && el.className.includes('animate-auth-fade-in')) {
        foundFadeIn = true;
        break;
      }
      el = el.parentElement;
    }
    expect(foundFadeIn).toBe(false);
  });

  it('mantiene el branding shell presente en ambos modos', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthLayout mode="login" />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Almacén Tienda')).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthLayout mode="register" />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Almacén Tienda')).toBeInTheDocument();
  });
});

// Silenciar warnings de act innecesarios para estos tests estáticos
vi.stubGlobal('console', {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
});
