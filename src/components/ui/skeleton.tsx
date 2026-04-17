/**
 * @fileoverview Primitive compartida para placeholders de loading.
 * Proporciona una base visual consistente para skeletons en cards, listas y shells de página.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Skeleton - Bloque visual reutilizable para estados de carga.
 *
 * Debe usarse para representar la estructura futura del contenido sin
 * mostrar valores falsos mientras las queries siguen pendientes.
 */
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    data-slot="skeleton"
    className={cn(
      "animate-pulse rounded-md bg-muted/80",
      className
    )}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton }
