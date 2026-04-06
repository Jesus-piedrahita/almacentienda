# Exploration: dashboard-barcode-search

## Current State

### Dashboard (frontend)
`almacenTienda/src/pages/dashboard-page.tsx` es hoy una pantalla placeholder estática:
- 4 tarjetas hardcodeadas con valores `0` / `$0.00` / `1`
- Sin ninguna conexión a la API
- Sin buscador ni interacción

### Inventario – búsqueda existente (frontend)
`src/components/inventory/products-table.tsx` implementa un buscador **client-side**:
- Filtra el arreglo local `products[]` por `name | barcode | categoryName`
- Opera únicamente sobre la **página actual cargada** (default 20 productos)
- No llama al backend — si hay 500 productos, solo busca entre los 20 cargados

### Backend – endpoint de búsqueda real
`GET /api/inventory/products/search?q=<term>` en `backendTienda/app/routes/inventory.py`:
- Acepta query param `q` → busca por `Product.barcode ILIKE %q%` OR `Product.name ILIKE %q%`
- Soporta filtros adicionales: `category_id`, `price_min`, `price_max`, `stock_status`
- Retorna `list[ProductWithCategory]` (sin paginación — respuesta plana)
- **No está siendo usado por el frontend**

### Hook de inventario (`use-inventory.ts`)
- `useProducts(page)` — paginated GET, no incluye búsqueda
- **No existe `useSearchProducts`** ni hook dedicado para la búsqueda real
- El queryKey para búsqueda no está definido

### Modelo Product
`barcode: Column(String(50), unique=True, index=True)` — indexado, listo para búsqueda exacta y LIKE rápida.

---

## Affected Areas

- `almacenTienda/src/pages/dashboard-page.tsx` — componente principal a enriquecer con el buscador
- `almacenTienda/src/hooks/use-inventory.ts` — agregar `useSearchProducts` hook
- `almacenTienda/src/components/inventory/products-table.tsx` — puede reutilizarse para mostrar resultados, o crearse un `BarcodeSearchResults` nuevo
- `backendTienda/app/routes/inventory.py` — endpoint `/products/search` ya existe, sin cambios necesarios
- `backendTienda/app/services/inventory_service.py` — `search_products()` ya funciona

---

## Approaches

### 1. Buscador en Dashboard — Widget independiente
Agregar un `BarcodeSearchWidget` en `dashboard-page.tsx` con un `<Input>` que llama a `GET /api/inventory/products/search?q=<barcode>`.

- **Pros**: Focal point visual en el dashboard, no contamina la página de inventario, UX de cajero rápido (scan → resultado inmediato)
- **Cons**: Necesita nuevo componente, nuevo hook, y definir qué mostrar ante 0 resultados
- **Effort**: Medium

### 2. Búsqueda global en Header/Sidebar
Agregar un input de búsqueda global en el `MainLayout`/sidebar que funcione desde cualquier página.

- **Pros**: Accesible siempre, experiencia de uso más fluida para el cajero
- **Cons**: Scope más amplio, contamina el layout global, puede confundir con future global search
- **Effort**: High

### 3. Reusar ProductsTable con backend search en Inventario
Cambiar el filtro client-side del `ProductsTable` por una llamada real al backend search endpoint.

- **Pros**: Corrección de bug real (búsqueda completa, no solo página cargada), sin nueva UI
- **Cons**: No satisface el caso de uso de "buscar desde el dashboard", no es el scope del change
- **Effort**: Low

---

## Recommendation

**Approach 1**: Widget de búsqueda por barcode en el Dashboard.

Es el más alineado con el nombre del change (`dashboard-barcode-search`). El backend ya tiene la infraestructura completa. Solo falta:
1. Un `useSearchProducts(query)` hook en `use-inventory.ts`
2. Un componente `BarcodeSearchWidget` en `src/components/inventory/` (o `dashboard/`)
3. Wiring en `dashboard-page.tsx`

El widget debe contemplar:
- Input con debounce o búsqueda por enter
- Estado: idle → loading → results / no-results / error
- Mostrar: nombre, barcode, categoría, precio, stock (con badge de estado)
- Click en resultado → navegar a inventario (opcional, fuera de scope mínimo)

---

## Risks

- **Búsqueda sin límite de resultados**: `search_products()` devuelve lista plana sin paginación. Si el término es muy corto (ej: `"a"`) puede devolver cientos de productos. Considerar añadir `limit` al endpoint o al hook.
- **Debounce vs Enter**: Sin debounce, un scanner de barras dispara múltiples requests. Con solo Enter, se pierde UX para búsqueda manual. Recomendado: debounce 300ms + búsqueda por Enter.
- **Colisión de nombre de change**: El inventario ya tiene búsqueda client-side. Hay riesgo de confusión si no queda claro cuál es el canal "canónico" de búsqueda.
- **Dashboard actual es placeholder**: Las 4 tarjetas muestran datos hardcodeados (`0`, `$0.00`, `1`). Si el scope incluye conectarlas a la API (stats), el effort sube considerablemente — esto debe declararse explícitamente fuera de scope si no se quiere.
- **Auth requerida**: El endpoint `/products/search` requiere `current_user` vía `get_current_user`. El token ya se inyecta automáticamente via axios interceptor, sin problema.

---

## Open Questions

1. ¿El buscador debe ser solo por barcode exacto o también por nombre parcial?
2. ¿Al encontrar un producto, debe disparar alguna acción (ej. abrir modal de edición, registrar venta)?
3. ¿Las tarjetas del dashboard (`Total Productos`, `Ventas Hoy`, etc.) deben conectarse a datos reales en este mismo change?
4. ¿El widget debe soportar escaneo físico de barras (foco automático en el input)?

---

## Ready for Proposal

**Sí** — con las preguntas abiertas respondidas el proposal puede escribirse. El scope mínimo viable está claro:
- Nuevo hook `useSearchProducts`
- Nuevo componente `BarcodeSearchWidget`  
- Wiring en `dashboard-page.tsx`
- Backend listo, sin cambios requeridos
