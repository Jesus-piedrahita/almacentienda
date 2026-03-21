/**
 * @fileoverview Componente Label reutilizable para inputs.
 * Etiqueta HTML accesible asociada a campos de entrada.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Props del componente Label.
 * Extiende los atributos HTML estándar de label.
 */
export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

/**
 * Componente Label - Etiqueta para campos de entrada.
 *
 * Etiqueta HTML accesible con estilos personalizados.
 * Tipicamente se usa junto a un Input para asociar una descripción con el campo.
 *
 * @param props - Props de label HTML (htmlFor, className, etc.)
 * @param props.htmlFor - ID del input asociado (para accesibilidad)
 * @param props.className - Clases CSS adicionales
 *
 * @example
 * ```tsx
 * <Label htmlFor="email">Correo electrónico</Label>
 * <Input id="email" type="email" />
 *
 * // Con estado deshabilitado
 * <Label htmlFor="disabled-input">Campo deshabilitado</Label>
 * <Input id="disabled-input" disabled />
 * ```
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
