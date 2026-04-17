import { z } from 'zod';

export const authModeSchema = z.enum(['login', 'register']);

export const authSchema = z
  .object({
    mode: authModeSchema,
    email: z.string().min(1, 'El email es requerido').email('Email inválido'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.mode !== 'register') {
      return;
    }

    if (!data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Confirmar contraseña es requerido',
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Las contraseñas no coinciden',
      });
    }
  });

export type AuthFormValues = z.infer<typeof authSchema>;
