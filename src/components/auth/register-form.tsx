/**
 * @fileoverview Formulario de registro de usuario.
 * Componente de formulario con validación Zod y confirmación de contraseña.
 */

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { registerSchema, type RegisterFormData } from "@/lib/validations/register-schema"
import { cn } from "@/lib/utils"

/**
 * Componente RegisterForm - Formulario de registro de usuario.
 *
 * Renderiza un formulario con validación Zod que incluye:
 * - Campo de email
 * - Campo de contraseña
 * - Campo de confirmación de contraseña
 * - Validación en tiempo real
 * - Validación de coincidencia entre contraseñas
 * - Manejo de estados de carga
 * - Enlace a login para usuarios existentes
 *
 * Utiliza react-hook-form para la gestión del formulario y Zod para la validación
 * según el esquema definido en registerSchema.
 *
 * @param props - Props del componente
 * @param props.className - Clases CSS adicionales para el Card
 *
 * @returns El formulario de registro renderizado dentro de un Card
 *
 * @example
 * ```tsx
 * <RegisterForm />
 *
 * // Con clases personalizadas
 * <RegisterForm className="mb-4" />
 * ```
 *
 * @todo Reemplazar console.log con llamada real a API
 * @todo Agregar validaciones adicionales (fortaleza de contraseña, términos)
 * @todo Implementar redirección tras registro exitoso
 * @todo Agregar verificación de email
 */
export function RegisterForm({ className }: { className?: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    // TODO: Replace with actual API call
    console.log("Register data:", data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return (
    <Card className={cn("w-full shadow-lg", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
        <CardDescription>
          Ingresa tus datos para registrarte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Separator />
        <p className="text-sm text-center text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Iniciar Sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
