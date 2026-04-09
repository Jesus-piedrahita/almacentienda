# Design: UI de vencimiento opcional para productos de inventario

## Technical Approach

La implementación es frontend-only y additive. El campo `expiration_date` se modela como opcional en tipos y payloads, los formularios usan `<input type="date" />` nativo y la UI renderiza un modelo de estados SIMPLE:

- `Vencido`
- `Con fecha`
- `Sin vencimiento`

La ausencia del endpoint de alertas no debe bloquear la pantalla: `useExpiringProducts()` encapsula 404/501 y devuelve `[]`.

## Architecture Decisions

### Decision: modelo simple de estados de vencimiento

**Choice**: usar `expired | has_date | none` en helpers de presentación
**Alternatives considered**: severidad por umbrales (`critical`, `warning`, `ok`) basada en `days_remaining`
**Rationale**: el usuario aprobó explícitamente una primera fase simple de UI sin umbrales ni proximidad.

### Decision: columna condicional por subset visible

**Choice**: mostrar la columna `Vencimiento` solo si el subconjunto visible/paginado contiene al menos un producto con fecha
**Alternatives considered**: mostrarla si cualquier producto total tiene fecha
**Rationale**: evita columnas vacías en páginas visibles y corrige el drift detectado durante verify.

### Decision: graceful degradation en hook

**Choice**: swallow 404/501 en `useExpiringProducts()`
**Alternatives considered**: propagar error y mostrar estado de fallo
**Rationale**: el backend todavía puede no exponer el endpoint; la UI no debe romper por eso.

### Decision: tarjeta resumen simple

**Choice**: mantener `ExpiringProductsCard` pero simplificada para mostrar fecha formateada + badge simple
**Alternatives considered**: remover la card por completo
**Rationale**: preserva el alcance visual del cambio sin introducir lógica avanzada no aprobada.

## Data Flow

```mermaid
flowchart TD
    A[API products / alerts] --> B[use-inventory.ts]
    B --> C[mapApiProductToProduct]
    B --> D[useExpiringProducts]
    D --> E{404 o 501?}
    E -- Sí --> F[Retornar []]
    E -- No --> G[Mapear ExpiringProduct]
    C --> H[ProductsTable]
    G --> I[ExpiringProductsCard]
    F --> I
    H --> J[getExpirationDisplayStatus]
    I --> J
    J --> K[Vencido / Con fecha / Sin vencimiento]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/types/inventory.ts` | Modify | Helpers `getExpirationDisplayStatus*` y labels |
| `src/hooks/use-inventory.ts` | Modify | Hook resiliente y mappers |
| `src/components/inventory/add-product-dialog.tsx` | Modify | Input date opcional |
| `src/components/inventory/edit-product-dialog.tsx` | Modify | Input date opcional + precarga |
| `src/components/inventory/products-table.tsx` | Modify | Columna condicional y badge simple |
| `src/components/inventory/expiring-products-card.tsx` | Create/Modify | Resumen simple de productos con fecha |
| `src/pages/inventory-page.tsx` | Modify | Integración de tarjeta |

## Interfaces / Contracts

```ts
export interface Product {
  expiration_date?: string;
}

export interface CreateProductInput {
  expiration_date?: string;
}

export interface UpdateProductInput {
  expiration_date?: string;
}

export const EXPIRATION_DISPLAY_STATUS = {
  EXPIRED: 'expired',
  HAS_DATE: 'has_date',
  NONE: 'none',
} as const;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Helpers simples de vencimiento | Validar labels y clases |
| Unit | ProductsTable | Columna condicional + contenido de celdas |
| Unit | ExpiringProductsCard | Título, lista, badges y accesibilidad |
| Integration | Add/Edit dialogs | Payload con y sin `expiration_date` |
| Integration | `useExpiringProducts()` | 404/501 -> `[]`, errores inesperados -> throw |

## Migration / Rollout

No requiere migración en frontend. El cambio puede convivir con backend incompleto gracias al graceful degradation.

## Open Questions

- Confirmar a futuro si `days_remaining` seguirá existiendo en el contrato backend aunque no se use en UI.
- Si más adelante se quiere severidad por proximidad, deberá abrirse un cambio nuevo en SDD.
