/**
 * @fileoverview Componente de tabla de productos del inventario.
 * Muestra la lista de productos con información clave y acciones.
 *
 * El buscador aplica los mismos arreglos del BarcodeSearchWidget del dashboard:
 * - Debounce 300ms para evitar re-renders en cada tecla con listas grandes.
 * - Normalización con `.trim()` y comparación case-insensitive.
 * - Reset inmediato de página al limpiar el input (sin esperar el debounce).
 * - Soporte para escáner de código de barras: Enter limpia el input visible
 *   para evitar concatenar el próximo código con el actual.
 * - data-testid para testability consistente con el resto del sistema.
 * - aria-label + autoComplete="off" para accesibilidad y UX.
 *
 * ### Causa raíz del crash `removeChild` (resuelto)
 * El mensaje "No se encontraron productos para X" usaba `inputValue.trim()` (inmediato)
 * mientras la condición `showNoResults` dependía de `searchTerm` (debounced).
 * Durante el borrado manual, `inputValue` se vaciaba inmediatamente pero `searchTerm`
 * seguía siendo no-vacío por 300ms, causando que el ternario intentara re-renderizar
 * el `<strong>` con un string vacío mientras el nodo ya estaba en transición, lo que
 * generaba `NotFoundError: Failed to execute 'removeChild' on 'Node'`.
 * Solución: usar `searchTerm` en lugar de `inputValue.trim()` en el mensaje.
 */

import { useState, useCallback, type KeyboardEvent } from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/inventory';
import {
  getStockStatus,
  getStockStatusLabel,
  getStockStatusColor,
  getExpirationDisplayLabel,
  getExpirationDisplayStatus,
  getExpirationDisplayStatusColor,
} from '@/types/inventory';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

/**
 * Formatea un número como moneda
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

/**
 * Formatea una fecha ISO-8601 para mostrar al usuario (dd/mm/aaaa).
 * Devuelve '—' si la cadena está vacía o es inválida.
 */
function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return '—';
  // Parse YYYY-MM-DD without timezone conversion to avoid off-by-one day
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return '—';
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(year, month - 1, day)
  );
}

const ITEMS_PER_PAGE = 10;

/**
 * ProductsTable - Tabla de productos con paginación y buscador.
 *
 * Muestra:
 * - Nombre, codigo de barras, Categoría
 * - Precio y Cantidad
 * - Estado del stock (visual)
 * - Acciones (editar, eliminar)
 *
 * Buscador: filtrado client-side con debounce 300ms y normalización de texto,
 * consistente con el BarcodeSearchWidget del dashboard.
 *
 * Soporte escáner: al presionar Enter, la query actual se confirma inmediatamente
 * y el input se limpia para evitar concatenación con el siguiente código escaneado.
 *
 * @example
 * ```tsx
 * <ProductsTable products={products} isLoading={false} />
 * ```
 */
export function ProductsTable({ products, isLoading, onEdit, onDelete }: ProductsTableProps) {
  // inputValue: valor visible en el input (actualización inmediata)
  const [inputValue, setInputValue] = useState('');

  // submittedQuery: última búsqueda confirmada por Enter (escáner o teclado).
  // Permite limpiar el input visible post-scan sin perder la query activa.
  const [submittedQuery, setSubmittedQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  // debouncedSearch: se actualiza 300ms después del último cambio en inputValue.
  // Esto evita re-renders del filtrado en cada tecla cuando el usuario escribe rápido.
  const debouncedSearch = useDebouncedValue(inputValue, 300);

  // searchTerm normalizado:
  // - Si el input tiene texto visible, usamos el valor debounced (tipeo manual).
  // - Si el input está vacío, preservamos la última query enviada por Enter (escáner).
  // Esto evita que el filtrado desaparezca inmediatamente cuando el escáner limpia el input.
  const activeSearch = inputValue.trim() === '' ? submittedQuery : debouncedSearch;
  const searchTerm = activeSearch.trim().toLowerCase();

  // Filtrar productos por búsqueda (client-side: todos los datos ya están en memoria)
  const filteredProducts = products.filter((product) => {
    if (searchTerm === '') return true;
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.barcode.toLowerCase().includes(searchTerm) ||
      product.categoryName.toLowerCase().includes(searchTerm)
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // Handler del input onChange:
  // - Actualiza inputValue (valor visible) de forma inmediata.
  // - Reset inmediato de página al limpiar (val === '') sin esperar el debounce.
  // - Al limpiar, también resetea submittedQuery para volver al estado vacío completo.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val === '') {
      setSubmittedQuery('');
      setCurrentPage(1);
    }
  };

  // Handler de teclado: soporte para escáner de código de barras.
  // El escáner envía la cadena seguida de Enter; al detectar Enter:
  // 1. Confirma la query actual como submittedQuery (búsqueda inmediata).
  // 2. Limpia el inputValue para que el próximo código no se concatene.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const query = inputValue.trim();
      if (!query) return;
      setSubmittedQuery(query);
      setInputValue('');
      setCurrentPage(1);
    },
    [inputValue]
  );

  // Sincronizar reset de página cuando el debounce propaga el nuevo valor.
  // Si la página actual excede las páginas disponibles, se clampea al mostrar.
  const safePage = Math.min(currentPage, totalPages || 1);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Mostrar columna "Vencimiento" solo si el subconjunto visible actual contiene
  // al menos un producto con fecha de vencimiento.
  const hasExpiration = paginatedProducts.some((product) => !!product.expiration_date);

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="products-table-loading">
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="flex h-40 items-center justify-center text-muted-foreground"
        data-testid="products-table-empty"
      >
        No hay productos en el inventario. Agrega tu primer producto.
      </div>
    );
  }

  // Si la búsqueda no encontró resultados (pero sí hay productos en total)
  const showNoResults = searchTerm !== '' && filteredProducts.length === 0;

  return (
    <div className="space-y-4" data-testid="products-table">
      {/* Buscador */}
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Buscar por nombre, código de barras o categoría..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label="Buscar productos por nombre, código de barras o categoría"
          data-testid="products-table-search"
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground" data-testid="products-table-count">
          {/* se mantiene en una sola cadena de texto para evitar problemas con nodos hijos */}
          {`${filteredProducts.length} resultado${filteredProducts.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Sin resultados para la búsqueda actual */}
      {showNoResults ? (
        <div
          className="py-10 text-center text-sm text-muted-foreground"
          data-testid="products-table-no-results"
          role="status"
        >
          {/* Usar searchTerm (debounced) en lugar de inputValue.trim() para evitar
              discrepancia temporal durante el borrado que causa removeChild crash:
              ambos (condición showNoResults y contenido del mensaje) usan el mismo valor. */}
          {`No se encontraron productos para "${searchTerm}"`}
        </div>
      ) : (
        <>
          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Código de Barras</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  {hasExpiration && (
                    <TableHead className="text-center">Vencimiento</TableHead>
                  )}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product) => {
                  const status = getStockStatus(product.quantity);
                  const statusColor = getStockStatusColor(status);
                  const expirationStatus = getExpirationDisplayStatus(product.expiration_date);
                  const expirationStatusColor = getExpirationDisplayStatusColor(expirationStatus);

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-center">{product.quantity}</TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          statusColor
                        )}>
                          {getStockStatusLabel(status)}
                        </span>
                      </TableCell>
                      {hasExpiration && (
                        <TableCell className="text-center">
                          {product.expiration_date ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs text-foreground">
                                {formatDate(product.expiration_date)}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                  expirationStatusColor
                                )}
                              >
                                {getExpirationDisplayLabel(expirationStatus)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {getExpirationDisplayLabel(expirationStatus)}
                            </span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8"
                            onClick={() => onEdit?.(product)}
                            disabled={!onEdit}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => onDelete?.(product)}
                            disabled={!onDelete}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {`Mostrando ${(safePage - 1) * ITEMS_PER_PAGE + 1} a ${Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} de ${filteredProducts.length}`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={safePage === i + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="size-8"
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
