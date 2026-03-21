/**
 * @fileoverview Componentes para construir tarjetas (Cards) con estructura modular.
 * Proporciona componentes composables para header, título, descripción, contenido y footer.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Componente Card - Contenedor principal de una tarjeta.
 *
 * Proporciona estilos base con borde redondeado, sombra y color de fondo.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Título</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     Contenido de la tarjeta
 *   </CardContent>
 * </Card>
 * ```
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * Componente CardHeader - Encabezado de la tarjeta.
 *
 * Proporciona espaciado y disposición para el encabezado de una tarjeta.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * Componente CardTitle - Título principal de la tarjeta.
 *
 * Elemento h3 con estilos de título (fuente semibold, tracking ajustado).
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * Componente CardDescription - Descripción o subtítulo de la tarjeta.
 *
 * Elemento p con texto más pequeño y color atenuado.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * Componente CardContent - Área de contenido principal de la tarjeta.
 *
 * Div con padding para envolver el contenido principal.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * Componente CardFooter - Pie de la tarjeta.
 *
 * Div flex para alinear elementos (típicamente botones o acciones) al final de la tarjeta.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
