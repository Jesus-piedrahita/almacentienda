/**
 * @fileoverview Panel de búsqueda de productos para el POS.
 * Usa `useDebouncedValue(300)` + `useSearchProducts(query)` para buscar
 * en el inventario existente. Muestra estados de carga, vacío y error.
 *
 * No recibe props — usa el store de ventas internamente.
 *
 * @example
 * ```tsx
 * <ProductSearchPanel />
 * ```
 */

import { useState } from 'react';
import { Search, RefreshCw, SearchX, Info } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useSearchProducts } from '@/hooks/use-inventory';
import { useSalesStore } from '@/stores/sales-store';
import { ProductResultCard } from './product-result-card';
import type { Product } from '@/types/inventory';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const MIN_QUERY_LENGTH = 3;
const SKELETON_COUNT = 6;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Skeleton grid durante carga */
function SearchSkeletons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Hint inicial cuando el input está vacío o tiene menos de MIN_QUERY_LENGTH chars */
function SearchHint() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
      <Info className="size-10 opacity-50" />
      <p className="text-sm">
        Escribí al menos {MIN_QUERY_LENGTH} caracteres para buscar
      </p>
    </div>
  );
}

/** Pantalla de sin resultados */
function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
      <SearchX className="size-10 opacity-50" />
      <p className="text-sm">
        Sin resultados para <strong>"{query}"</strong>
      </p>
    </div>
  );
}

/** Pantalla de error con retry */
function SearchError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <RefreshCw className="size-10 text-destructive opacity-70" />
      <p className="text-sm text-destructive font-medium">
        Error al buscar productos. Intentá de nuevo.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RefreshCw className="size-4" />
        Reintentar
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * ProductSearchPanel — Panel izquierdo del POS para buscar productos.
 *
 * Flujo:
 * 1. Usuario escribe en el input (estado local)
 * 2. `useDebouncedValue` retarda 300 ms antes de actualizar `debouncedQuery`
 * 3. `useSearchProducts` dispara sólo si `debouncedQuery.length >= 3`
 * 4. Al hacer click en un producto, llama a `useSalesStore.addItem`
 */
export function ProductSearchPanel() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  const addItem = useSalesStore((s) => s.addItem);

  const {
    data: results,
    isLoading,
    isError,
    refetch,
  } = useSearchProducts(debouncedQuery);

  const isQueryTooShort = debouncedQuery.length < MIN_QUERY_LENGTH;
  const hasResults = results && results.length > 0;
  const isEmpty = !isLoading && !isError && !isQueryTooShort && (!results || results.length === 0);

  function handleAdd(product: Product) {
    addItem(product);
    setQuery(''); // Limpiar input después de agregar al carrito
  }

  function handleRetry() {
    void refetch();
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto por nombre o código de barras..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          autoComplete="off"
          autoFocus
        />
      </div>

      {/* Área de resultados */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading && <SearchSkeletons />}

        {isError && !isLoading && <SearchError onRetry={handleRetry} />}

        {isQueryTooShort && !isLoading && <SearchHint />}

        {isEmpty && <NoResults query={debouncedQuery} />}

        {hasResults && !isLoading && !isError && (
          <div className="grid grid-cols-2 gap-3">
            {results.map((product) => (
              <ProductResultCard
                key={product.id}
                product={product}
                onAdd={handleAdd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
