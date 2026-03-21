/**
 * @fileoverview Componente Input reutilizable.
 * Campo de entrada de texto accesible con estilos Tailwind y soporte para estados.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Componente Input - Campo de entrada de texto.
 *
 * Input HTML nativo con estilos personalizados. Soporta todos los atributos estándar
 * de input HTML más estilos para estados de foco, deshabilitado e inválido.
 *
 * @param props - Props estándar de input HTML (type, placeholder, disabled, etc.)
 * @param props.type - Tipo de input (text, email, password, etc.). Por defecto: "text"
 * @param props.className - Clases CSS adicionales
 *
 * @example
 * ```tsx
 * // Input básico
 * <Input type="email" placeholder="correo@ejemplo.com" />
 *
 * // Input deshabilitado
 * <Input disabled value="Lectura" />
 *
 * // Con validación personalizada
 * <Input aria-invalid={hasError} />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
