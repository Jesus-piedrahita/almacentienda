/**
 * @fileoverview Formulario de inicio de sesión.
 * Componente de formulario con validación Zod y conexión a API.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { loginSchema, type LoginFormData } from "@/lib/validations/login-schema";
import { useLogin } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

/**
 * Componente LoginForm - Formulario de inicio de sesión.
 *
 * Renderiza un formulario con validación Zod que incluye:
 * - Campo de email
 * - Campo de contraseña
 * - Validación en tiempo real
 * - Manejo de estados de carga
 * - Conexión con API de autenticación
 * - Enlace a registro para usuarios nuevos
 *
 * @param props - Props del componente
 * @param props.className - Clases CSS adicionales para el Card
 *
 * @returns El formulario de login renderizado dentro de un Card
 */
export function LoginForm({ className }: { className?: string }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      // Get user data from login response by calling /me
      // For now, create minimal user object from login data
      const userData = {
        id: 0, // Will be set by /me call
        email: data.email,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      // Store auth data in Zustand store
      setAuth(response.access_token, userData);

      // Redirect to home/dashboard after successful login
      navigate("/");
    } catch (error) {
      // Error is handled by React Query - shows in UI via error state
      console.error("Login error:", error);
    }
  };

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
              autoFocus
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
          
          {/* Error from API */}
          {loginMutation.isError && (
            <p className="text-sm text-destructive">
              {loginMutation.error?.message || "Error al iniciar sesión"}
            </p>
          )}
          
          <Button type="submit" className="w-full" disabled={isSubmitting || loginMutation.isPending}>
            {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
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
  );
}
