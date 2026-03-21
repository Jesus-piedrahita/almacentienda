import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"

export function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
