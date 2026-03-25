# Proposal: Pantalla Principal con Sidebar Protegido

## Intent

Crear la pantalla principal (dashboard) del sistema almacenTienda con un sidebar de navegación y protección de rutas. Después de un login exitoso, el usuario será redirigido a esta pantalla principal que mostrará información general del sistema.

## Scope

### In Scope
- Crear componente Sidebar con menú de navegación (Dashboard, Inventario, Ventas, Reportes, Configuración)
- Crear componente MainLayout que envuelve el contenido con el sidebar
- Crear componente ProtectedRoute para proteger las rutas autenticadas
- Crear página DashboardPage como página principal
- Configurar rutas en App.tsx con protección de autenticación
- Mostrar información del usuario logueado en el sidebar
- Agregar botón de logout en el sidebar

### Out of Scope
- Funcionalidad de cada sección del menú (inventario, ventas, reportes)
- Diseño detallado de cada página del dashboard
- Métricas o gráficos en el dashboard

## Approach

Se implementará una estructura de layout anidada donde ProtectedRoute envuelve al MainLayout, que a su vez contiene el Sidebar y el contenido de la página. El Sidebar mostrará información del usuario almacenada en el Zustand auth-store y permitirá cerrar sesión.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/layout/sidebar.tsx` | New | Componente de sidebar con navegación |
| `src/components/layout/main-layout.tsx` | New | Layout contenedor con sidebar |
| `src/components/auth/protected-route.tsx` | New | Componente de ruta protegida |
| `src/pages/dashboard-page.tsx` | New | Página principal del dashboard |
| `src/App.tsx` | Modified | Agregar rutas protegidas y layout |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Conflicto con rutas existentes | Low | Verificar que no existan rutas conflictivas antes de implementar |
| Estado de autenticación no inicializado | Medium | Asegurar que initialize() se llame en main.tsx |

## Rollback Plan

1. Eliminar los archivos creados: sidebar.tsx, main-layout.tsx, protected-route.tsx, dashboard-page.tsx
2. Revertir cambios en App.tsx a la versión anterior
3. El sistema volverá al comportamiento original de redirección a login

## Dependencies

- Zustand auth-store existente (src/stores/auth-store.ts)
- Componentes UI existentes (shadcn/ui)
- React Router v7 instalado

## Success Criteria

- [ ] El usuario autenticado es redirigido a / después del login
- [ ] El Sidebar muestra las opciones de navegación
- [ ] El Sidebar muestra el email del usuario logueado
- [ ] El botón de logout cierra la sesión y redirige a /login
- [ ] Acceder a / sin autenticación redirige a /login
- [ ] Las rutas protegidas funcionan correctamente
