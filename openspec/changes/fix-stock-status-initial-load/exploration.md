# Exploration: fix-stock-status-initial-load

## Problema Clarificado

Al navegar por primera vez a la página de Inventario (o después de un reload), el bloque **"Estado del Stock"** muestra `0 / 0 / 0` en los tres contadores (Bien, Alerta, Crítico) y la barra visual no aparece, hasta que `useInventoryStats()` resuelve su fetch. Esto crea la ilusión de que no hay datos o de que algo falló.

El componente `StockStatusIndicator` **no recibe ni propaga** el estado de carga/error: su contrato de props solo acepta `{ good, warning, critical }` como números planos. La `inventory-page.tsx` lo alimenta con `stats?.stockStatus.good ?? 0`, lo cual silencia el estado `isLoading: true`.

Adicionalmente, si el fetch falla, no hay ningún feedback en esa sección (la sección del vecino `InventoryStatsCards` sí tiene skeleton, pero este bloque y el de categorías no tienen manejo de error).

---

## Estado Actual

### Componentes afectados

| Archivo | Problema |
|---|---|
| `src/components/inventory/stock-status-indicator.tsx` | Props solo numéricas; no tiene variante loading ni error |
| `src/pages/inventory-page.tsx` (líneas ~149-158) | Alimenta `StockStatusIndicator` con fallback `?? 0` sin guardar `isLoadingStats` para ese bloque |
| `src/components/inventory/category-chart.tsx` | Mismo patrón: recibe `categories` vacías mientras carga, sin skeleton |
| `src/hooks/use-inventory.ts` | `useInventoryStats()` expone `isLoading`, `isError`, `error` — correctamente — pero nadie los consume en estos dos bloques |

### Patrón existente correcto (referencia)

`InventoryStatsCards` ya lo hace bien:
```tsx
if (isLoading) {
  return (/* 4 skeleton cards con animate-pulse */);
}
```
Se le pasan `stats` e `isLoading` como props. **Ese es el patrón a replicar.**

---

## Áreas Afectadas

- `src/components/inventory/stock-status-indicator.tsx` — agregar props `isLoading` / `isError`
- `src/pages/inventory-page.tsx` — pasar `isLoadingStats` al bloque de stock status
- `src/components/inventory/category-chart.tsx` — agregar prop `isLoading` y skeleton
- (Opcional) crear un componente `SkeletonCard` reutilizable si hay más páginas que lo necesiten

---

## Enfoques

### Opción A — Prop drilling mínimo (recomendado)
Agregar `isLoading?: boolean` e `isError?: boolean` a las props de `StockStatusIndicator` y `CategoryChart`. Cuando `isLoading = true`, mostrar un skeleton inline. Cuando `isError = true`, mostrar un mensaje de error con botón de retry.

- **Pros**: Cambio quirúrgico, consistente con `InventoryStatsCards`, sin nuevas abstracciones
- **Cons**: Duplica un poco la lógica de skeleton entre componentes
- **Esfuerzo**: Bajo (2-3 horas)

### Opción B — Wrapper `AsyncSection` genérico
Crear un componente `<AsyncSection isLoading isError onRetry>` que envuelva cualquier sección con skeleton/error automático.

- **Pros**: Reutilizable en futuras páginas (clientes, ventas)
- **Cons**: Más indirección, requiere definir una API de slot/children
- **Esfuerzo**: Medio (4-6 horas)

### Opción C — Suspense + Error Boundary
Usar React 19 Suspense con `suspense: true` en React Query y un `<ErrorBoundary>`.

- **Pros**: Solución idiomática React 19, cero prop drilling
- **Cons**: Requiere refactorizar `useInventoryStats` con la opción `suspense: true`, cambiar cómo se usan las queries, riesgo de regresión
- **Esfuerzo**: Alto (6-10 horas, cambio de paradigma)

---

## Recomendación

**Opción A** — prop drilling mínimo. Sigue exactamente el patrón ya establecido en `InventoryStatsCards`. Es el cambio de menor riesgo y entrega el mayor valor perceptible al usuario (skeleton visible → datos reales) sin introducir nuevas abstracciones.

La Opción B puede considerarse en una mejora posterior si hay más secciones async que lo necesiten. La Opción C es un cambio de paradigma que no vale la pena para este fix puntual.

---

## Riesgos

- **Skeleton mal dimensionado**: si el skeleton no imita la altura real del componente, habrá un layout shift cuando los datos carguen. Mitigar con altura fija en el placeholder.
- **`isLoading` vs `isFetching`**: en React Query, `isLoading` solo es `true` en la carga inicial (sin cache). Si la página ya tiene datos en cache, `isLoading = false` aunque esté refetching. Hay que decidir si también mostrar indicador durante `isFetching` (recomendado: no bloquear la UI, solo mostrar spinner sutil).
- **`isError` silencioso**: si el endpoint de stats falla, actualmente el usuario no sabe. Agregar un mensaje con botón de retry es parte del fix.
- **Regresión en `CategoryChart`**: actualmente muestra "No hay categorías con productos" cuando `categories.length === 0`, que es el mismo mensaje que daría durante la carga. El skeleton evita esa confusión.

---

## Ready for Proposal

**Sí.** El problema está bien delimitado, el patrón de solución existe en el código base, el esfuerzo es bajo y el impacto en UX es visible inmediatamente.

**Scope del proposal:**
1. `StockStatusIndicator` — agregar `isLoading` + `isError` props con skeleton y mensaje de error
2. `CategoryChart` — agregar `isLoading` prop con skeleton  
3. `inventory-page.tsx` — pasar `isLoadingStats` e `isError` a ambos bloques
4. Sin cambios en backend ni en hooks de React Query
