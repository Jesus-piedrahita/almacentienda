/**
 * @fileoverview Esquemas de validación Zod para formularios de autenticación.
 * Define las reglas de validación para el formulario de inicio de sesión.
 */

import { z } from "zod"

/**
 * Esquema de validación para el formulario de inicio de sesión.
 *
 * Valida que el email tenga formato correcto y que la contraseña
 * tenga al menos 8 caracteres. Ambos campos son requeridos.
 *
 * @example
 * ```typescript
 * const result = loginSchema.safeParse({
 *   email: "usuario@ejemplo.com",
 *   password: "password123"
 * })
 * // result.success === true
 * ```
 *
 * @example
 * ```typescript
 * const result = loginSchema.safeParse({
 *   email: "invalid-email",
 *   password: "123"
 * })
 * // result.success === false
 * // result.error.issues contiene los errores de validación
 * ```
 */
export const loginSchema = z.object({
  /** Campo de email - debe ser un email válido */
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  /** Campo de contraseña - mínimo 8 caracteres */
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
})

/**
 * Tipo TypeScript inferido del esquema de login.
 * Representa los datos válidos del formulario de inicio de sesión.
 *
 * @example
 * ```typescript
 * const loginData: LoginFormData = {
 *   email: "usuario@ejemplo.com",
 *   password: "password123"
 * }
 * ```
 */
export type LoginFormData = z.infer<typeof loginSchema>
