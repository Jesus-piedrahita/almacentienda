import { LoginForm } from "@/components/auth/login-form"

/**
 * Módulo de ruta para /login.
 * Thin route module — renderiza solo LoginForm.
 * El layout (AuthLayout) es provisto por la ruta padre en App.tsx.
 */
export function LoginPage() {
  return <LoginForm />
}

