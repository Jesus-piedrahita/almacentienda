/**
 * @fileoverview Hook utilitario para debounce de valores reactivos.
 * Usado por widgets que necesitan retrasar disparos de búsqueda ante input rápido.
 */

import { useState, useEffect } from 'react';

/**
 * Retorna una versión "debounced" de `value` que sólo se actualiza
 * después de que hayan pasado `delay` milisegundos sin nuevos cambios.
 *
 * @param value  - El valor a debounce.
 * @param delay  - Tiempo de espera en milisegundos (e.g. 300).
 * @returns El valor debounced.
 *
 * @example
 * ```tsx
 * const debouncedQuery = useDebouncedValue(inputValue, 300);
 * // debouncedQuery sólo se actualiza 300ms después del último cambio de inputValue
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancelar el timer si value o delay cambian antes de que expire
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
