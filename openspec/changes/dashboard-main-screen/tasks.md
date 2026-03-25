# Tasks: Pantalla Principal con Sidebar Protegido

## Phase 1: Componentes de Layout

- [x] 1.1 Crear `src/components/auth/protected-route.tsx` con lógica de verificación de autenticación
- [x] 1.2 Crear `src/components/layout/sidebar.tsx` con menú de navegación y logout
- [x] 1.3 Crear `src/components/layout/main-layout.tsx` con sidebar y Outlet

## Phase 2: Página Dashboard

- [x] 2.1 Crear `src/pages/dashboard-page.tsx` como página principal

## Phase 3: Configuración de Rutas

- [x] 3.1 Modificar `src/App.tsx` para agregar:
  - Ruta raíz `/` con ProtectedRoute → MainLayout → DashboardPage
  - Redirección de `/login` a `/` si ya está autenticado
  - Redirección de `/register` a `/` si ya está autenticado

## Phase 4: Verificación

- [ ] 4.1 Verificar que el login exitoso redirija a `/`
- [ ] 4.2 Verificar que el Sidebar muestre las opciones de navegación
- [ ] 4.3 Verificar que el Sidebar muestre el email del usuario
- [ ] 4.4 Verificar que el botón de logout funcione correctamente
- [ ] 4.5 Verificar que acceder a `/` sin autenticación redirija a `/login`
