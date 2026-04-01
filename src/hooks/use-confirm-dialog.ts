/**
 * @fileoverview Hooks para confirmación de acciones mediante SweetAlert2.
 * Proporciona funciones reutilizables para modales de confirmación.
 */

import swal from 'sweetalert';

/**
 * Muestra un modal de confirmación para eliminar un producto.
 * 
 * @param productName - Nombre del producto a eliminar
 * @returns true si el usuario confirma, false si cancela
 * 
 * @example
 * ```tsx
 * const confirmed = await confirmDelete('Mi Producto');
 * if (confirmed) {
 *   await deleteProductMutation.mutateAsync(id);
 * }
 * ```
 */
export async function confirmDelete(productName: string): Promise<boolean> {
  const result = await swal({
    title: '¿Estás seguro?',
    text: `¿Eliminar el producto "${productName}"?\n\nEsta acción no se puede deshacer.`,
    icon: 'warning',
    buttons: ['Cancelar', 'Eliminar'],
    dangerMode: true,
  });
  
  return result === true;
}

/**
 * Muestra un modal de error.
 * 
 * @param title - Título del error
 * @param message - Mensaje de error
 * 
 * @example
 * ```tsx
 * showError('Error', 'No se pudo guardar el producto.');
 * ```
 */
export async function showError(title: string, message: string): Promise<void> {
  await swal({
    title,
    text: message,
    icon: 'error',
    buttons: ['Aceptar'],
  });
}
