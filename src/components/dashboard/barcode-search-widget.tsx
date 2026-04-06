/**
 * @fileoverview Widget de búsqueda por código de barras para el dashboard.
 * Soporta tipeo manual (debounce 300ms) y escáner físico (Enter inmediato).
 * Muestra 5 estados: idle, loading, results, empty, error.
 * Read-only: sin navegación ni paginación — solo consulta.
 */

import { useState, useCallback, useEffect, type KeyboardEvent } from 'react';
import { Search, Loader2, AlertCircle, ScanBarcode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useSearchProducts } from '@/hooks/use-inventory';
import type { Product } from '@/types/inventory';

// ============================================================
// Helpers
// ============================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

function stockStatusLabel(product: Product): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  const ratio = product.quantity / (product.minStock || 1);
  if (ratio >= 2) return { label: 'Stock OK', variant: 'default' };
  if (ratio >= 1) return { label: 'Stock bajo', variant: 'secondary' };
  return { label: 'Crítico', variant: 'destructive' };
}

// ============================================================
// Sub-componentes de estado
// ============================================================

function IdleHint() {
  return (
    <div
      className="flex flex-col items-center gap-2 py-6 text-muted-foreground"
      data-testid="barcode-search-idle"
    >
      <ScanBarcode className="size-8 opacity-40" aria-hidden />
      <p className="text-sm">
        Ingresá el código de barras o nombre del producto
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="flex items-center justify-center gap-2 py-6 text-muted-foreground"
      data-testid="barcode-search-loading"
      role="status"
      aria-label="Buscando productos"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span className="text-sm">Buscando…</span>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div
      className="py-6 text-center text-sm text-muted-foreground"
      data-testid="barcode-search-empty"
      role="status"
    >
      No se encontraron productos para{' '}
      <strong className="font-medium text-foreground">&ldquo;{query}&rdquo;</strong>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex flex-col items-center gap-3 py-6"
      data-testid="barcode-search-error"
      role="alert"
    >
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="size-4" aria-hidden />
        <span className="text-sm font-medium">Error al buscar productos</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        Intentar nuevamente
      </button>
    </div>
  );
}

function ResultsList({ products }: { products: Product[] }) {
  return (
    <ul
      className="divide-y divide-border"
      data-testid="barcode-search-results"
      aria-label={`${products.length} producto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
    >
      {products.map((product) => {
        const status = stockStatusLabel(product);
        return (
          <li
            key={product.id}
            className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            data-testid="barcode-search-result-item"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {product.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {product.barcode} · {product.categoryName}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(product.price)}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  {product.quantity} uds.
                </span>
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ============================================================
// Componente principal
// ============================================================

/**
 * BarcodeSearchWidget — widget de búsqueda por código de barras o nombre de producto.
 * Self-contained: no requiere props externas.
 *
 * Casos de uso:
 * - Tipeo manual: espera 300ms sin input antes de buscar (debounce).
 * - Escáner de código de barras: el escáner envía una cadena seguida de Enter;
 *   la tecla Enter dispara la búsqueda de forma inmediata sin esperar el debounce.
 *
 * @example
 * ```tsx
 * <BarcodeSearchWidget />
 * ```
 */
export function BarcodeSearchWidget() {
  const [inputValue, setInputValue] = useState('');

  // submittedQuery es la ÚNICA fuente de verdad para la query activa.
  // Se actualiza por dos caminos exclusivos:
  //   1. Debounce path: cuando debouncedInputValue cambia (300ms tras el último keystroke)
  //   2. Enter path: inmediatamente cuando el usuario presiona Enter
  const [submittedQuery, setSubmittedQuery] = useState('');

  // Debounce del inputValue para tipeo manual
  const debouncedInputValue = useDebouncedValue(inputValue, 300);

  // Camino 1: Debounce path — sincroniza submittedQuery con el valor debounced.
  // Esto cubre el caso de tipeo manual donde el usuario no presiona Enter.
  // Excepción: cuando el input se vacía (inputValue = ''), reseteamos submittedQuery
  // de forma inmediata en el onChange para que el idle state aparezca sin delay.
  useEffect(() => {
    setSubmittedQuery(debouncedInputValue);
  }, [debouncedInputValue]);

  const {
    data: products,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useSearchProducts(submittedQuery);

  /**
   * Camino 2: Enter path — actualiza submittedQuery directamente con el valor
   * actual del input, sin esperar el debounce de 300ms.
   * Esto garantiza que un escáner de código de barras (que envía Enter al final)
   * o el usuario presionando Enter siempre busca el valor visible en el input.
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setSubmittedQuery(inputValue);
      }
    },
    [inputValue]
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Determinamos el estado actual del widget
  const queryActive = submittedQuery.length >= 3;
  const showLoading = queryActive && (isLoading || isFetching);
  const showError = queryActive && isError && !isFetching;
  const showResults = queryActive && !isLoading && !isFetching && !isError && Array.isArray(products) && products.length > 0;
  const showEmpty = queryActive && !isLoading && !isFetching && !isError && Array.isArray(products) && products.length === 0;
  const showIdle = !queryActive;

  return (
    <Card data-testid="barcode-search-widget">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="size-4" aria-hidden />
          Búsqueda por código de barras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input de búsqueda */}
        <Input
          type="text"
          placeholder="Escanear o escribir código / nombre…"
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;
            setInputValue(val);
            // Reset inmediato al limpiar el input: no esperar el debounce de 300ms.
            // Esto garantiza que el idle state aparezca sin delay cuando el usuario
            // borra el campo manualmente.
            if (val === '') {
              setSubmittedQuery('');
            }
          }}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          aria-label="Buscar producto por código de barras o nombre"
          data-testid="barcode-search-input"
        />

        {/* Estados */}
        {showIdle && <IdleHint />}
        {showLoading && <LoadingState />}
        {showError && <ErrorState onRetry={handleRetry} />}
        {showResults && <ResultsList products={products!} />}
        {showEmpty && <EmptyState query={submittedQuery} />}
      </CardContent>
    </Card>
  );
}
