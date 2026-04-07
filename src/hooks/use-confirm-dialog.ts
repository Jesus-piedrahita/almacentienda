/**
 * @fileoverview API global para confirmaciones y errores.
 *
 * Evita manipulación directa del DOM por librerías externas (ej. sweetalert)
 * delegando en un host React (ConfirmDialogHost).
 */

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface ErrorOptions {
  title: string;
  message: string;
  buttonText?: string;
}

interface ConfirmDialogHandlers {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  error: (options: ErrorOptions) => Promise<void>;
}

const defaultHandlers: ConfirmDialogHandlers = {
  confirm: async ({ title, message, confirmText = 'Aceptar' }) => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.confirm(`${title}\n\n${message}`) && Boolean(confirmText);
  },
  error: async ({ title, message }) => {
    if (typeof window !== 'undefined') {
      window.alert(`${title}\n\n${message}`);
    }
  },
};

let handlers: ConfirmDialogHandlers = defaultHandlers;

/**
 * Registra los handlers del host React para dialogs.
 */
export function setConfirmDialogHandlers(nextHandlers: ConfirmDialogHandlers): void {
  handlers = nextHandlers;
}

/**
 * Restablece handlers por defecto (útil al desmontar host).
 */
export function resetConfirmDialogHandlers(): void {
  handlers = defaultHandlers;
}

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
  return handlers.confirm({
    title: '¿Estás seguro?',
    message: `¿Eliminar el producto "${productName}"?\n\nEsta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
  });
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
  await handlers.error({
    title,
    message,
    buttonText: 'Aceptar',
  });
}
