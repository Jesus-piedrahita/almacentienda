/**
 * @fileoverview Esquemas de validación Zod para formularios de registro.
 * Define las reglas de validación para el formulario de creación de cuenta.
 */

import { z } from "zod"

/**
 * Esquema de validación para el formulario de registro de usuario.
 *
 * Valida que el email tenga formato correcto, que la contraseña tenga
 * al menos 8 caracteres, y que el campo de confirmación coincida con
 * la contraseña original. Todos los campos son requeridos.
 *
 * Utiliza un refinamiento (.refine) para validar que ambas contraseñas
 * sean idénticas, mostrando el error en el campo confirmPassword.
 *
 * @example
 * ```typescript
 * const result = registerSchema.safeParse({
 *   email: "usuario@ejemplo.com",
 *   password: "password123",
 *   confirmPassword: "password123"
 * })
 * // result.success === true
 * ```
 *
 * @example
 * ```typescript
 * const result = registerSchema.safeParse({
 *   email: "usuario@ejemplo.com",
 *   password: "password123",
 *   confirmPassword: "different123"
 * })
 * // result.success === false
 * // Error: "Las contraseñas no coinciden" en confirmPassword
 * ```
 */
export const registerSchema = z
  .object({
    /** Campo de email - debe ser un email válido */
    email: z.string().min(1, "El email es requerido").email("Email inválido"),
    /** Campo de contraseña - mínimo 8 caracteres */
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    /** Campo de confirmación de contraseña - debe coincidir con password */
    confirmPassword: z.string().min(1, "Confirmar contraseña es requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // El error se muestra en este campo
  })

/**
 * Tipo TypeScript inferido del esquema de registro.
 * Representa los datos válidos del formulario de creación de cuenta.
 *
 * @example
 * ```typescript
 * const registerData: RegisterFormData = {
 *   email: "usuario@ejemplo.com",
 *   password: "password123",
 *   confirmPassword: "password123"
 * }
 * ```
 */
export type RegisterFormData = z.infer<typeof registerSchema>
