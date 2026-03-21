/**
 * @fileoverview Utilidades generales para la aplicación.
 * Funciones helper comunes utilizadas en toda la aplicación.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina múltiples valores de clases CSS resolviendo conflictos de Tailwind.
 *
 * Esta función es esencial para trabajar con Tailwind CSS en aplicaciones React,
 * ya que permite combinar clases condicionalmente sin preocuparse por conflictos
 * de estilos. Utiliza dos librerías complementarias:
 *
 * - `clsx`: Construye strings de clases CSS de forma condicional, eliminando valores falsos
 * - `twMerge`: Resuelve conflictos entre clases de Tailwind CSS (ej: mantiene solo `p-8` si hay `p-4` y `p-8`)
 *
 * @param inputs - Múltiples valores de clase CSS. Puede incluir:
 *   - Strings: `"px-2 py-1"`
 *   - Objetos: `{ "bg-blue-500": isActive }`
 *   - Arrays: `["px-2", isActive && "bg-blue-500"]`
 *   - Valores falsos: `null`, `undefined`, `false` (serán ignorados)
 * @returns Una cadena única de clases CSS sin conflictos de Tailwind
 *
 * @example
 * // Combinación simple de clases
 * cn("px-2", "py-1") // "px-2 py-1"
 *
 * @example
 * // Resuelve conflictos de Tailwind (mantiene la última)
 * cn("p-4", "p-8") // "p-8"
 *
 * @example
 * // Clases condicionales con objetos
 * cn("px-2", { "bg-blue-500": isActive, "text-white": isActive }) // "px-2 bg-blue-500 text-white"
 *
 * @example
 * // Mezcla de tipos de input
 * cn("base-class", condition && "conditional-class", ["array", "classes"]) // "base-class conditional-class array classes"
 *
 * @example
 * // Uso típico en componentes React
 * <div className={cn("base-styles", variant === "primary" && "primary-styles", className)}>
 *   Contenido
 * </div>
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
