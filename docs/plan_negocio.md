# Modelo de Negocio y Arquitectura del Sistema

## Sistema de Gestión de Inventario para Tienda

---

# 1. Descripción General

Este proyecto consiste en el desarrollo de una **aplicación web para la gestión del inventario de una tienda**, permitiendo controlar:

* Registro de productos
* Control de inventario
* Gestión de ventas
* Ventas fiadas
* Control de caja
* Gestión de usuarios
* Alertas de stock

La plataforma permitirá llevar control completo de las operaciones comerciales de la tienda, optimizando la administración del inventario y generando reportes automáticos de ventas.

---

# 2. Objetivos del Sistema

## Objetivo general

Desarrollar una plataforma web que permita administrar el inventario y las ventas de una tienda de manera eficiente y automatizada.

## Objetivos específicos

* Registrar productos y categorías
* Controlar entradas y salidas de inventario
* Generar alertas de stock bajo
* Gestionar ventas diarias
* Administrar ventas fiadas
* Generar reportes de caja
* Gestionar usuarios del sistema

---

# 3. Modelo de Negocio

## Entidades principales

### Producto

Representa un artículo disponible para la venta.

Atributos:

* id
* nombre
* precio
* fecha de vencimiento
* categoria_id
* imagen
* stock_actual
* fecha_registro

---

### Categoría

Agrupa productos por tipo.

Atributos:

* id
* nombre
* descripcion

Ejemplos:

* Bebidas
* Lácteos
* Aseo
* Granos

---

### Inventario

Controla la cantidad disponible de cada producto.

Funciones:

* cálculo total de productos
* cálculo por categorías
* generación de alertas de stock

Estados de inventario:

* **Stock bajo**
* **Stock para pedir**
* **Stock normal**

---

### Movimientos de Inventario

Representa cualquier cambio en el stock.

Tipos de movimiento:

* entrada de producto
* venta
* producto vencido
* venta fiada

Atributos:

* id
* producto_id
* tipo_movimiento
* cantidad
* fecha
* usuario_id

---

### Ventas

Registro de productos vendidos.

Atributos:

* id
* producto_id
* cantidad
* precio_unitario
* total
* fecha
* usuario_id

Tipos de ventas:

* venta normal
* venta fiada

---

### Caja

Controla los ingresos diarios.

Funciones:

* total ventas del día
* ventas por categoría
* ventas fiadas

---

### Usuarios

Personas que utilizan el sistema.

Atributos:

* id
* nombre
* cedula
* direccion
* telefono
* rol
* fecha_registro

---

# 4. Flujo de Usuario

## Inicio de sesión

Proceso:

1. Usuario ingresa correo y contraseña
2. Sistema valida credenciales
3. Si es válido accede al dashboard

Flujo:

```
Login
   ↓
Validación
   ↓
Dashboard
```

---

# 5. Flujo de Operaciones del Sistema

Una vez autenticado, el usuario puede acceder a:

* Gestión de categorías
* Registro de productos
* Inventario
* Salida de productos
* Caja
* Usuarios

---

# 6. Flujo de Registro de Productos

Proceso:

```
Crear categoría
      ↓
Registrar producto
      ↓
Validación de datos
      ↓
Producto almacenado
```

Datos registrados:

* nombre
* precio
* categoría
* fecha de vencimiento
* imagen

---

# 7. Flujo de Inventario

El inventario calcula automáticamente:

* total de productos
* total por categoría
* estado del stock

Estados del inventario:

| Estado | Condición  |
| ------ | ---------- |
| Bajo   | stock < 5  |
| Pedir  | stock < 10 |
| Normal | stock > 10 |

---

# 8. Flujo de Salida de Productos

Cuando un producto sale del inventario se registra un movimiento.

Tipos de salida:

* Venta
* Producto vencido
* Venta fiada

Flujo:

```
Producto
   ↓
Tipo de salida
   ↓
Registro de movimiento
   ↓
Actualización de inventario
```

---

# 9. Flujo de Caja

La caja calcula automáticamente:

* total ventas del día
* ventas por categoría
* total ventas fiadas

Flujo:

```
Ventas
   ↓
Registro de caja
   ↓
Reporte diario
```

---

# 10. Arquitectura Tecnológica

El sistema se implementa utilizando una arquitectura **Full Stack moderna**.

---

# 11. Frontend

Tecnologías utilizadas:

* React
* Typescript
* Vite
* TailwindCSS
* React Query
* Zustand
* Axios
* React Router
* Zod

Responsabilidades:

* interfaz de usuario
* validación de formularios
* gestión de estado
* consumo de API

---

# 12. Backend

Tecnologías utilizadas:

* FastAPI
* Uvicorn
* SQLAlchemy
* Pydantic
* JWT
* PyMySQL

Responsabilidades:

* lógica de negocio
* validación de datos
* autenticación
* acceso a base de datos

---

# 13. Base de Datos

Motor:

PostgreSQL

Tablas principales:

* usuarios
* categorias
* productos
* inventario
* movimientos
* ventas
* ventas_fiadas

---

# 14. Infraestructura

El proyecto se ejecutará mediante contenedores.

Tecnologías:

* Docker
* Docker Compose
* Git
* GitHub

Servicios:

* frontend
* backend
* base de datos

---

# 15. Flujo de Datos del Sistema

```
Usuario
   ↓
Frontend (React)
   ↓
Axios HTTP
   ↓
API Backend (FastAPI)
   ↓
Servicios de negocio
   ↓
ORM (SQLAlchemy)
   ↓
Base de datos PostgreSQL
```

Respuesta:

```
Base de datos
   ↓
Backend
   ↓
API
   ↓
Frontend
   ↓
Interfaz
```

---

# 16. Plan de Desarrollo

## Fase 1 — Preparación del proyecto

* Crear repositorio
* Configurar Git
* Crear estructura del proyecto
* Configurar Docker

Duración estimada: 1 día

---

## Fase 2 — Backend base

* Crear proyecto FastAPI
* Configurar conexión base de datos
* Configurar autenticación JWT
* Crear rutas iniciales

Duración estimada: 2 días

---

## Fase 3 — Modelado de base de datos

Crear modelos:

* usuarios
* categorias
* productos
* inventario
* movimientos
* ventas

Duración estimada: 1 día

---

## Fase 4 — API de inventario

Endpoints:

* crear categorías
* registrar productos
* consultar inventario

Duración estimada: 2 días

---

## Fase 5 — Movimientos de inventario

Endpoints:

* registrar entrada
* registrar salida

Duración estimada: 2 días

---

## Fase 6 — Sistema de ventas

Implementar:

* ventas normales
* ventas fiadas
* registro en caja

Duración estimada: 1 día

---

## Fase 7 — Desarrollo frontend

Pantallas:

* login
* dashboard
* inventario
* productos
* ventas
* caja
* usuarios

Duración estimada: 3 a 4 días

---

# 17. Mejoras Futuras

Posibles extensiones del sistema:

* reportes en PDF
* exportación a Excel
* control de proveedores
* control de compras
* notificaciones de stock
* dashboard analítico
* aplicación móvil

---

# 18. Conclusión

Este sistema permitirá a la tienda administrar su inventario, ventas y caja de manera eficiente, reduciendo errores manuales y proporcionando información en tiempo real para la toma de decisiones.

El uso de tecnologías modernas como **React, FastAPI y Docker** permite crear una plataforma escalable, mantenible y preparada para futuras expansiones.
