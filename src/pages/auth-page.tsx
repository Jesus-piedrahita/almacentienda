import { Navigate, useParams } from 'react-router';

import { AuthLayout } from '@/components/auth/auth-layout';

type AuthMode = 'login' | 'register';

function isAuthMode(value: string | undefined): value is AuthMode {
  return value === 'login' || value === 'register';
}

/**
 * Página auth unificada. Mantiene el mismo árbol visual principal y
 * cambia de modo según el parámetro de ruta.
 */
export function AuthPage() {
  const { authMode } = useParams<{ authMode: string }>();

  if (!isAuthMode(authMode)) {
    return <Navigate to="/login" replace />;
  }

  return <AuthLayout mode={authMode} />;
}
