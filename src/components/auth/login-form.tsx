/**
 * @fileoverview Formulario de inicio de sesión.
 * Componente de formulario con validación Zod y manejo de errores.
 */

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { loginSchema, type LoginFormData } from "@/lib/validations/login-schema"
import { cn } from "@/lib/utils"

/**
 * Componente LoginForm - Formulario de inicio de sesión.
 *
 * Renderiza un formulario con validación Zod que incluye:
 * - Campo de email
 * - Campo de contraseña
 * - Validación en tiempo real
 * - Manejo de estados de carga
 * - Enlace a registro para usuarios nuevos
 *
 * Utiliza react-hook-form para la gestión del formulario y Zod para la validación
 * según el esquema definido en loginSchema.
 *
 * @param props - Props del componente
 * @param props.className - Clases CSS adicionales para el Card
 *
 * @returns El formulario de login renderizado dentro de un Card
 *
 * @example
 * ```tsx
 * <LoginForm />
 *
 * // Con clases personalizadas
 * <LoginForm className="mb-4" />
 * ```
 *
 * @todo Reemplazar console.log con llamada real a API
 * @todo Agregar manejo de errores HTTP
 * @todo Implementar redirección tras login exitoso
 */
export function LoginForm({ className }: { className?: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    // TODO: Replace with actual API call
    console.log("Login data:", data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return (
    <Card className={cn("w-full shadow-lg", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu cuenta
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Separator />
        <p className="text-sm text-center text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Crear una cuenta
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
