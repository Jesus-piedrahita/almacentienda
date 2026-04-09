# Tasks: UI de vencimiento opcional para productos de inventario

## Phase 1: Types

- [x] 1.1 Extender `Product`, `CreateProductInput` y `UpdateProductInput` con `expiration_date?: string`
- [x] 1.2 Agregar contrato `ExpiringProduct`
- [x] 1.3 Reemplazar helpers de severidad por helpers simples de display (`expired | has_date | none`)

## Phase 2: Data Layer

- [x] 2.1 Extender `ApiProduct` con `expiration_date`
- [x] 2.2 Mapear `expiration_date` desde API hacia dominio
- [x] 2.3 Implementar `useExpiringProducts()`
- [x] 2.4 Hacer graceful degradation para respuestas 404/501

## Phase 3: UI Layer

- [x] 3.1 Agregar campo opcional de fecha en `AddProductDialog`
- [x] 3.2 Agregar precarga/edición de fecha en `EditProductDialog`
- [x] 3.3 Mostrar columna `Vencimiento` de forma condicional en `ProductsTable`
- [x] 3.4 Mostrar labels simples `Vencido`, `Con fecha`, `Sin vencimiento`
- [x] 3.5 Integrar tarjeta resumen de productos con fecha en `InventoryPage`

## Phase 4: Tests

- [x] 4.1 Cubrir helpers simples de vencimiento
- [x] 4.2 Cubrir `ProductsTable` con fecha, sin fecha y vencido
- [x] 4.3 Cubrir `ExpiringProductsCard`
- [x] 4.4 Cubrir mapper `expiration_date`
- [x] 4.5 Cubrir submit de Add/Edit dialogs con fecha opcional
- [x] 4.6 Cubrir fallback resiliente de `useExpiringProducts()`

## Phase 5: Verification

- [x] 5.1 Ejecutar `npx tsc --noEmit`
- [x] 5.2 Ejecutar suite focalizada de Vitest para expiración
- [x] 5.3 Re-ejecutar `/sdd:verify inventory-product-expiration-ui` y confirmar PASS

## Task Flow

```mermaid
flowchart LR
    A[Types] --> B[Data Layer]
    B --> C[UI Layer]
    C --> D[Tests]
    D --> E[Verify]
```
