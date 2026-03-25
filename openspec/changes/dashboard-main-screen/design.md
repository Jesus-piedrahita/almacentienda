# Design: Pantalla Principal con Sidebar Protegido

## Technical Approach

Se implementará una estructura de layout anidada utilizando React Router v7. El componente `ProtectedRoute` verificará el estado de autenticación del Zustand store y redirigirá según corresponda. El `MainLayout` contendrá el `Sidebar` y el contenido de las páginas. La navegación utilizará el componente `Link` de React Router.

## Architecture Decisions

### Decision: Zustand para estado de autenticación

**Choice**: Utilizar el `useAuthStore` existente de Zustand para verificar autenticación
**Alternatives considered**: Crear un nuevo contexto React para autenticación
**Rationale**: El proyecto ya tiene implementado un Zustand store con persistencia en localStorage que funciona correctamente. Es más consistente mantener un solo источник de verdad.

### Decision: Layout anidado con Outlet

**Choice**: Utilizar `<Outlet />` de React Router para renderizar el contenido de las páginas dentro del MainLayout
**Alternatives considered**: Pasar children como prop al Layout, renderizar el Layout en cada página
**Rationale**: React Router 7 soporta Layouts anidados nativamente. El Outlet permite que el sidebar permanezca fijo mientras el contenido cambia.

### Decision: Componente Sidebar con datos del store

**Choice**: Leer directamente `user` del `useAuthStore` dentro del Sidebar
**Alternatives considered**: Pasar user como prop desde MainLayout
**Rationale**: El Sidebar necesita acceso al logout() action también. Leer del store directamente es más limpio y permite que el Sidebar sea autocontenido.

## Data Flow

```
User navigates to /
       │
       ▼
ProtectedRoute checks useAuthStore.isAuthenticated
       │
       ├─► false ──► Redirect to /login
       │
       ▼
MainLayout renders
       │
       ├── Sidebar (fixed left)
       │    ├── Navigation links
       │    ├── User email from store
       │    └── Logout button → logout() → redirect /login
       │
       └── Outlet → DashboardPage (main content area)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/auth/protected-route.tsx` | Create | Componente HOC que verifica autenticación |
| `src/components/layout/sidebar.tsx` | Create | Componente de navegación lateral |
| `src/components/layout/main-layout.tsx` | Create | Layout contenedor con sidebar y Outlet |
| `src/pages/dashboard-page.tsx` | Create | Página principal del dashboard |
| `src/App.tsx` | Modify | Configurar rutas con ProtectedRoute y MainLayout |

## Interfaces / Contracts

```tsx
// src/components/auth/protected-route.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// src/components/layout/sidebar.tsx
// No requiere props - lee del store directamente
// Expone:
// - Navigation items: Dashboard, Inventario, Ventas, Reportes, Configuración
// - User info: user.email
// - Logout action: logout()

// src/components/layout/main-layout.tsx
interface MainLayoutProps {
  children?: React.ReactNode; // Para Outlet
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | ProtectedRoute redirect logic | Verificar que.redirecciona correctamente según estado |
| Unit | Sidebar navigation links | Verificar que los Links apuntan a las rutas correctas |
| Unit | Logout action cleanup | Verificar que logout() limpia localStorage |
| Integration | Route protection flow | Verificar flujo completo: no auth → protected → login |
| Integration | Login → Dashboard flow | Verificar que después de login redirige a / |

## Migration / Rollout

No se requiere migración de datos. El cambio es puramente de UI/routing.

## Open Questions

- [ ] None - El diseño está completo basado en los specs y el código existente.
