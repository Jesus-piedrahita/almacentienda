/**
 * @fileoverview Formulario de registro.
 * Separado del login para respetar la semántica real de autofill/credenciales.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';

import { useRegister } from '@/hooks/use-auth';
import { registerSchema, type RegisterFormData } from '@/lib/validations/register-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegister();
  const isPending = isSubmitting || registerMutation.isPending;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      navigate('/login');
    } catch (error) {
      console.error('Register error:', error);
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
          autoComplete="new-password"
          disabled={isPending}
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isPending}
          {...register('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {registerMutation.isError ? (
        <p className="text-sm text-destructive">
          {registerMutation.error?.message || 'Error al crear cuenta'}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {registerMutation.isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>
    </form>
  );
}
