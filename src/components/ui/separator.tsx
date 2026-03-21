/**
 * @fileoverview Componente Separator reutilizable.
 * Línea divisoria visual para separar contenido en la interfaz.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Componente Separator - Línea divisoria visual.
 *
 * Un separador versátil que puede ser horizontal o vertical.
 * Proporciona una línea sutil para separar secciones de contenido.
 *
 * @param props - Props del separador
 * @param props.orientation - Dirección del separador: "horizontal" | "vertical". Por defecto: "horizontal"
 * @param props.decorative - Si es true, se marca como decorativo (no afecta lectura de pantalla). Por defecto: true
 * @param props.className - Clases CSS adicionales
 *
 * @example
 * ```tsx
 * // Separador horizontal (por defecto)
 * <div>
 *   <p>Contenido 1</p>
 *   <Separator />
 *   <p>Contenido 2</p>
 * </div>
 *
 * // Separador vertical
 * <div className="flex">
 *   <p>Izquierda</p>
 *   <Separator orientation="vertical" />
 *   <p>Derecha</p>
 * </div>
 *
 * // Separador semántico (no decorativo)
 * <Separator decorative={false} />
 * ```
 */
const Separator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical"
    decorative?: boolean
  }
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <div
    ref={ref}
    role={decorative ? "none" : "separator"}
    aria-orientation={orientation}
    data-slot="separator"
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
))
Separator.displayName = "Separator"

export { Separator }
