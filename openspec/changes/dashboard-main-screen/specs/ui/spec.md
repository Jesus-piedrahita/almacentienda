# Delta for UI/Layout

## ADDED Requirements

### Requirement: Protected Route

El sistema DEBE verificar el estado de autenticación antes de permitir acceso a rutas protegidas. El sistema DEBE redirigir a /login cuando el usuario no esté autenticado.

#### Scenario: Usuario autenticado accede a ruta protegida

- GIVEN El usuario ha iniciado sesión exitosamente y el token está almacenado
- WHEN El usuario intenta acceder a la ruta /
- THEN El sistema DEBE mostrar el contenido de la página protegida
- AND El sidebar DEBE estar visible

#### Scenario: Usuario no autenticado intenta acceder a ruta protegida

- GIVEN El usuario NO ha iniciado sesión y no existe token en localStorage
- WHEN El usuario intenta acceder a la ruta /
- THEN El sistema DEBE redirigir automáticamente a /login

### Requirement: Sidebar Navigation

El sistema DEBE mostrar un sidebar de navegación en el lado izquierdo de la pantalla cuando el usuario esté autenticado. El sidebar DEBE contener opciones de navegación al sistema.

#### Scenario: Sidebar muestra opciones de navegación

- GIVEN El usuario está autenticado
- WHEN El componente Sidebar se renderiza
- THEN El sistema DEBE mostrar las siguientes opciones:
  - Dashboard (página actual)
  - Inventario
  - Ventas
  - Reportes
  - Configuración
- AND Cada opción DEBE ser clickeable y navegar a su ruta correspondiente

### Requirement: User Information Display

El sidebar DEBE mostrar la información del usuario autenticado, incluyendo su email.

#### Scenario: Sidebar muestra información del usuario

- GIVEN El usuario está autenticado
- WHEN El componente Sidebar se renderiza
- THEN El sistema DEBE mostrar el email del usuario almacenado en el auth-store
- AND La información DEBE actualizarse si el usuario cambia

### Requirement: Logout Functionality

El sistema DEBE permitir al usuario cerrar sesión desde el sidebar. Al cerrar sesión, el sistema DEBE limpiar el token y redirigir a /login.

#### Scenario: Usuario cierra sesión

- GIVEN El usuario está autenticado y ve el sidebar
- WHEN El usuario hace clic en el botón de cerrar sesión
- THEN El sistema DEBE:
  - Eliminar el token de localStorage
  - Eliminar los datos del usuario de localStorage
  - Actualizar el estado de autenticación a false
  - Redirigir automáticamente a /login

### Requirement: Dashboard Page

El sistema DEBE mostrar una página de dashboard como página principal después del login exitoso.

#### Scenario: Dashboard se muestra después del login

- GIVEN El usuario ha iniciado sesión exitosamente
- WHEN El usuario es redirigido a /
- THEN El sistema DEBE mostrar la página de Dashboard
- AND El sidebar DEBE estar visible con las opciones de navegación

## MODIFIED Requirements

### Requirement: Login Redirect

La ruta /login DEBE redirigir a / cuando el usuario YA está autenticado.

#### Scenario: Usuario autenticado intenta acceder a /login

- GIVEN El usuario ha iniciado sesión y el token está activo
- WHEN El usuario navega a /login
- THEN El sistema DEBE redirigir automáticamente a / (dashboard)
- AND El formulario de login NO DEBE mostrarse

(Previously: El sistema mostraba el formulario de login sin importar el estado de autenticación)

## REMOVED Requirements

Ninguno.

## Additional Scenarios - Edge Cases

### Scenario: Token expirado en ruta protegida

- GIVEN El usuario tiene un token en localStorage pero está expirado
- WHEN El usuario intenta acceder a una ruta protegida
- THEN El sistema DEBE redirigir a /login (el interceptor de axios manejará el 401)

### Scenario: Acceso directo a /register cuando ya está autenticado

- GIVEN El usuario ya está autenticado
- WHEN El usuario navega a /register
- THEN El sistema DEBE redirigir a /
