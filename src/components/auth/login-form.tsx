/**
 * @fileoverview Formulario de inicio de sesión.
 * Separado del registro para respetar la semántica real de autofill/credenciales.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';

import { useLogin } from '@/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/lib/validations/login-schema';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
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
  const isPending = isSubmitting || loginMutation.isPending;

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      setAuth(response.access_token, response.user, response.session_id);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@ejemplo.com"
          autoComplete="username"
          autoFocus
          disabled={isPending}
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isPending}
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>

      {loginMutation.isError ? (
        <p className="text-sm text-destructive">
          {loginMutation.error?.message || 'Error al iniciar sesión'}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
}
