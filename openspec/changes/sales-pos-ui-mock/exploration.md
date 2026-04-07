# Exploration: sales-pos-ui-mock

## Current State

### App & Routing
- Routes defined in `src/App.tsx`: `/`, `/inventory`, `/clients` — **no `/sales` route exists yet**.
- Sidebar in `src/components/layout/sidebar.tsx` already has "Ventas" nav item pointing to `/sales` but it is a dead link (no route, no page).
- No sales-related files exist anywhere in the codebase (`glob **/sales*` → 0 results).

### Backend
- No sales routes, models, schemas, or migrations exist in `backendTienda/`.
- Existing backend: auth (`/api/auth`), inventory (`/api/inventory`), clients (`/api/clients`).
- The backend **is NOT ready** for sales — no `/api/sales` endpoint exists.

### Frontend Patterns Already in Place
- **React Query** for server state (`src/hooks/use-inventory.ts`, `src/hooks/use-clients.ts`)
- **Zustand** for global client-side state (`src/stores/auth-store.ts`, `src/stores/inventory-store.ts`)
- **Component pattern**: page → container component → presentational children
- **Hooks pattern**: `use-{domain}.ts` with mappers from API snake_case → camelCase
- **Type system**: rich domain types in `src/types/`
- **Axios instance**: `src/lib/api.ts` with JWT interceptors
- Product data already has: `id`, `barcode`, `name`, `price`, `cost`, `quantity`, `minStock`, `categoryName`

### Skill Available
`almacen-sales-ui` SKILL.md already exists in `.agents/skills/` with:
- Full POS flow diagram (search → cart → payment → ticket)
- Reference `POSPage` component pattern (two-column: products + cart)
- `ModalPago` component with efectivo/tarjeta modes and cambio calculation
- Payment methods: efectivo, tarjeta (mixto mentioned in diagram but not in code)

---

## Affected Areas

| File/Path | Why Affected |
|-----------|-------------|
| `src/App.tsx` | Needs `/sales` route added |
| `src/pages/sales-page.tsx` | New file — POS page (doesn't exist) |
| `src/components/sales/` | New directory — cart, payment modal, ticket components |
| `src/hooks/use-sales.ts` | New file — cart state and eventual API hooks (mock for now) |
| `src/types/sales.ts` | New file — CartItem, SaleOrder, PaymentMethod types |
| `src/components/layout/sidebar.tsx` | Sidebar nav already has `/sales` link — no change needed |

---

## Approaches

### Approach 1: Pure UI Mock (No Backend Integration)
Implement the full POS UI with local/in-memory state only. Cart operations, payment modal, and ticket display all work without hitting any API. Products are loaded from the existing `/api/inventory/products/search` endpoint (which already exists).

- **Pros**: Deliverable now; no backend changes; validates UX flow before backend exists; reuses existing product search infrastructure
- **Cons**: Cannot persist sales; ticket is ephemeral; needs rework when backend is built
- **Effort**: Low–Medium

### Approach 2: UI Mock + Placeholder API Hook
Same as Approach 1 but `use-sales.ts` includes a `useCreateSale()` mutation that calls `POST /api/sales` — which will 404 until backend is ready. This makes the integration contract explicit upfront.

- **Pros**: Cleaner handoff to backend change; forces type design for SaleOrder; identifies integration contract early
- **Cons**: Must handle 404 gracefully; slightly more code
- **Effort**: Medium

### Approach 3: Wait for Backend First
Build backend sales routes (`backend-sales-api` change) before building UI.

- **Pros**: No rework; end-to-end from day one
- **Cons**: Blocks UI progress; user experience validation delayed
- **Effort**: Higher total, less parallelism

---

## Recommendation

**Approach 1** (Pure UI Mock) — scoped to what the change name says: `sales-pos-ui-mock`. 

Key decisions for the proposal:
- Product search reuses existing `/api/inventory/products/search` — **no new backend needed**
- Cart state lives in a local Zustand slice or component state (no persistence needed for mock)
- Payment modal covers efectivo + tarjeta
- After "Confirmar Venta" → show a simple in-page ticket summary (no print)
- Wire route `/sales` → `<SalesPage />`

This is a pure frontend deliverable. Backend sales integration is a separate future change (`backend-sales-api`).

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Product search reuses `/api/inventory/products/search` — if this endpoint is slow or the user has no products, POS feels broken | Medium | Show skeleton states and empty states clearly |
| Cart state in component vs Zustand — if sales grows complex, component state won't scale | Low | Use Zustand from the start for cart state; it's already set up in the project |
| No backend for sales means "Finalizar Venta" is a dead end | Low | Scope clearly as mock; disable/toast message: "Módulo en construcción" after confirming |
| `useMemo` filter pattern in skill reference uses old React idioms — React 19 + compiler may differ | Low | Follow `react-19` skill and compiler conventions; avoid manual memoization |
| Sidebar already has `/sales` link — if route not added, users see 404 | Medium | Fixing the dead link is part of this change's scope |

---

## Ready for Proposal

**Yes** — scope is clear, no ambiguity about backend dependency (none needed for mock), patterns are established, existing infrastructure can be reused.

---

## Exploration Summary for Proposal Agent

### Suggested Intent Statement
> Implement a functional Sales POS UI mock for almacenTienda that allows staff to search products (via existing inventory search API), build a cart, select a payment method, and view a sale summary — all in-browser without a sales backend.

### Scope IN
- New `/sales` route + `SalesPage` component
- Product search panel reusing `useSearchProducts` hook
- Add-to-cart interaction with quantity +/−
- Cart panel with real-time total
- Payment modal (efectivo with cambio calculation, tarjeta)
- Post-sale ticket/summary display (in-page, no print)
- Zustand store slice for cart state

### Scope OUT
- Backend sales API (`POST /api/sales`, sales history, reports)
- Print/PDF ticket
- Payment with mixed methods (efectivo + tarjeta split)
- Sales history page
- Discount/coupon logic
- Client assignment to sale

### Assumptions
1. Products are already in inventory and accessible via `/api/inventory/products/search`
2. "Mock" means no persistence — sale data is lost on page refresh
3. A successful "Finalizar Venta" shows ticket summary but does NOT update inventory (backend not ready)
4. The `/sales` dead link in the sidebar must be resolved as part of this change

### Open Questions
1. Should "Finalizar Venta" silently no-op (just show ticket) or explicitly show a "módulo en construcción" toast?
2. Is there a design system reference (Figma/mockup) for the POS layout, or should we derive from `frontend-design` skill?
3. Should the change include a `useSalesStore` (Zustand) or is component-level state acceptable given the "mock" qualifier?
4. Is the `almacen-sales` backend skill already in the backlog as a dependent follow-up change?

### Recommended Next Step for Proposal Agent
Write proposal with:
- Intent: POS UI mock (frontend-only)
- Affected modules: `src/pages`, `src/components/sales`, `src/hooks`, `src/types`, `src/stores`, `src/App.tsx`
- Dependencies: none (backend not required for mock)
- Out of scope: backend sales API (separate change)
- Rollback plan: remove route + page (no DB changes)
- Follow-up changes: `backend-sales-api`, `sales-pos-backend-integration`
