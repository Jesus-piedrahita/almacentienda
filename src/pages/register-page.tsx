import { RegisterForm } from "@/components/auth/register-form"

/**
 * Módulo de ruta para /register.
 * Thin route module — renderiza solo RegisterForm.
 * El layout (AuthLayout) es provisto por la ruta padre en App.tsx.
 */
export function RegisterPage() {
  return <RegisterForm />
}

