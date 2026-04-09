# Especificación de API

---

## Base URL

```
http://localhost:8000/api/v1
```

---

## Autenticación

### POST /auth/login

Inicia sesión y obtiene token JWT.

**Request:**
```json
{
  "correo": "usuario@correo.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "rol": "admin"
  }
}
```

### POST /auth/refresh

Renueva el token de acceso.

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### POST /auth/logout

Invalida el token actual.

---

## Middleware de Autenticación

Todos los endpoints (excepto `/auth/login` y `/auth/refresh`) requieren autenticación JWT.

### Roles
- `admin`: Acceso total al sistema
- `cajero`: Ventas, caja, consultas de inventario
- `invitado`: Solo consultas públicas

### Endpoints de Admin Solo
Los siguientes endpoints requieren `rol: admin`:
- `/usuarios` (POST, PUT, DELETE)
- `/auditoria`
- `/reportes/financieros`
- `/configuracion`

---

## Usuarios

### GET /usuarios

Lista todos los usuarios. **Admin only.**

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "cedula": "12345678",
      "correo": "juan@correo.com",
      "rol": "admin",
      "activo": true,
      "fecha_creacion": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 10,
    "pagina": 1,
    "por_pagina": 20
  }
}
```

### POST /usuarios

Crea un nuevo usuario. **Admin only.**

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "cedula": "12345678",
  "correo": "juan@correo.com",
  "password": "password123",
  "rol": "cajero"
}
```

### GET /usuarios/{id}

Obtiene un usuario por ID.

### PUT /usuarios/{id}

Actualiza un usuario. **Admin only.**

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "cedula": "12345678",
  "correo": "juan@correo.com",
  "rol": "admin",
  "activo": true
}
```

### DELETE /usuarios/{id}

Desactiva un usuario (soft delete). **Admin only.**

---

## Clientes

### GET /clientes

Lista clientes.

**Query Params:**
- `busqueda`: string (busca en nombre, cedula, telefono)
- `activo`: boolean
- `tiene_deuda`: boolean

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Pedro Gómez",
      "cedula": "87654321",
      "telefono": "3001234567",
      "direccion": "Calle 123",
      "email": "pedro@correo.com",
      "activo": true,
      "deuda_actual": 25000.00,
      "fecha_creacion": "2025-01-15T00:00:00Z"
    }
  ]
}
```

### POST /clientes

Crea un cliente.

**Request:**
```json
{
  "nombre": "Pedro Gómez",
  "cedula": "87654321",
  "telefono": "3001234567",
  "direccion": "Calle 123",
  "email": "pedro@correo.com"
}
```

### GET /clientes/{id}

Obtiene cliente por ID con historial de compras.

**Response:**
```json
{
  "id": "uuid",
  "nombre": "Pedro Gómez",
  "cedula": "87654321",
  "telefono": "3001234567",
  "deuda_actual": 25000.00,
  "ventas_fiadas": [
    {
      "id": "uuid",
      "fecha": "2025-03-01",
      "monto": 15000.00,
      "pagado": false
    }
  ],
  "historial_compras": [...]
}
```

### PUT /clientes/{id}

Actualiza cliente.

### DELETE /clientes/{id}

Desactiva cliente.

---

## Proveedores

### GET /proveedores

Lista proveedores.

**Query Params:**
- `busqueda`: string
- `activo`: boolean

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Distribuidora ABC",
      "nit": "123456789",
      "telefono": "3001234567",
      "direccion": "Calle 456",
      "email": "contacto@distribuidora.com",
      "activo": true,
      "fecha_creacion": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### POST /proveedores

Crea proveedor.

**Request:**
```json
{
  "nombre": "Distribuidora ABC",
  "nit": "123456789",
  "telefono": "3001234567",
  "direccion": "Calle 456",
  "email": "contacto@distribuidora.com"
}
```

### GET /proveedores/{id}

Obtiene proveedor por ID con historial de compras.

### PUT /proveedores/{id}

Actualiza proveedor.

### DELETE /proveedores/{id}

Desactiva proveedor.

---

## Categorías

### GET /categorias

Lista categorías.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Bebidas",
      "descripcion": "Bebidas gaseosas y jugos",
      "activa": true,
      "cantidad_productos": 25
    }
  ]
}
```

### POST /categorias

Crea categoría.

**Request:**
```json
{
  "nombre": "Bebidas",
  "descripcion": "Bebidas"
}
```

### GET /categorias/{id}

Obtiene categoría por ID.

### PUT /categorias/{id}

Actualiza categoría.

### DELETE /categorias/{id}

Desactiva categoría (soft delete).

---

## Productos

### GET /productos

Lista productos con filtros.

**Query Params:**
- `categoria_id`: UUID
- `stock_bajo`: boolean
- `busqueda`: string (busca en nombre, descripcion)
- `activo`: boolean
- `proveedor_id`: UUID

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Coca Cola 500ml",
      "descripcion": "Gaseosa",
      "precio": 1500.00,
      "precio_costo": 1000.00,
      "categoria_id": "uuid",
      "categoria": "Bebidas",
      "proveedor": "Distribuidora ABC",
      "stock_actual": 20,
      "stock_minimo": 5,
      "codigo_barras": "1234567890123",
      "fecha_vencimiento": "2025-12-31",
      "activo": true
    }
  ]
}
```

### POST /productos

Crea producto.

**Request:**
```json
{
  "nombre": "Coca Cola 500ml",
  "descripcion": "Gaseosa",
  "precio": 1500.00,
  "precio_costo": 1000.00,
  "categoria_id": "uuid",
  "proveedor_id": "uuid",
  "stock_minimo": 5,
  "codigo_barras": "1234567890123",
  "fecha_vencimiento": "2025-12-31"
}
```

### GET /productos/{id}

Obtiene producto por ID con historial de precios.

**Response:**
```json
{
  "id": "uuid",
  "nombre": "Coca Cola 500ml",
  "precio": 1500.00,
  "historial_precios": [
    {
      "precio": 1400.00,
      "fecha_cambio": "2025-02-01T00:00:00Z"
    },
    {
      "precio": 1500.00,
      "fecha_cambio": "2025-03-01T00:00:00Z"
    }
  ],
  "movimientos_recientes": [...]
}
```

### PUT /productos/{id}

Actualiza producto. Registra cambio en historial_precios si el precio cambia.

**Request:**
```json
{
  "nombre": "Coca Cola 500ml",
  "precio": 1600.00,
  "stock_minimo": 10
}
```

### DELETE /productos/{id}

Desactiva producto (soft delete).

### GET /productos/barras/{codigo_barras}

Busca producto por código de barras.

---

## Inventario

### GET /inventario

Obtiene todo el inventario.

**Response:**
```json
{
  "data": [
    {
      "producto_id": "uuid",
      "producto": "Coca Cola 500ml",
      "categoria": "Bebidas",
      "cantidad": 20,
      "stock_minimo": 5,
      "estado": "normal",
      "valorizado": 30000.00
    }
  ],
  "resumen": {
    "total_productos": 150,
    "total_unidades": 5000,
    "stock_bajo": 3,
    "stock_agotado": 1,
    "valor_total_inventario": 1500000.00,
    "stock_por_categorias": [...]
  }
}
```

### GET /inventario/producto/{producto_id}

Obtiene inventario de un producto específico.

### GET /inventario/alertas

Lista productos con stock bajo o próximos a vencer.

**Response:**
```json
{
  "data": [
    {
      "producto": "Arroz 1kg",
      "cantidad": 3,
      "stock_minimo": 5,
      "estado": "bajo",
      "dias_vencimiento": 15
    },
    {
      "producto": "Leche",
      "cantidad": 20,
      "stock_minimo": 5,
      "estado": "por_vencer",
      "dias_vencimiento": 3
    }
  ]
}
```

### POST /inventario/ajuste

Registra ajuste de inventario. **Admin only.**

**Request:**
```json
{
  "producto_id": "uuid",
  "cantidad_nueva": 50,
  "motivo": "Inventario físico",
  "notas": "Conteo realizado el 2025-03-08"
}
```

---

## Movimientos

### GET /movimientos

Lista movimientos con filtros.

**Query Params:**
- `producto_id`: UUID
- `tipo`: entrada | venta | vencimiento | ajuste | compra
- `fecha_inicio`: DATE
- `fecha_fin`: DATE

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "producto_id": "uuid",
      "producto": "Coca Cola 500ml",
      "tipo_movimiento": "entrada",
      "cantidad": 10,
      "cantidad_anterior": 20,
      "cantidad_nueva": 30,
      "fecha": "2025-03-08T10:30:00Z",
      "usuario": "Juan Pérez",
      "referencia_id": "uuid (venta o compra)"
    }
  ]
}
```

### POST /movimientos

Registra movimiento manualmente. **Admin only.**

**Request:**
```json
{
  "producto_id": "uuid",
  "tipo_movimiento": "entrada",
  "cantidad": 10,
  "notas": "Reposición de inventario"
}
```

---

## Contratos de Ventas

```mermaid
flowchart TD
    A[Contrato vigente consumido por frontend] --> B[/api/sales]
    C[Contrato roadmap/legacy] --> D[/ventas y /ventas/fiadas]
```

### A) Ventas POS (Contrato vigente en la interfaz frontend)

> Esta sección documenta el contrato **real actualmente consumido por el frontend** (`useCreateSale`, `useSales`, `useSale`).
> Base efectiva usada en cliente: `http://localhost:8000` + prefijo `/api`.

```mermaid
flowchart LR
    UI[PaymentDialog / SalesPage] --> H1[useCreateSale]
    UI --> H2[useSales]
    UI --> H3[useSale]
    H1 -->|POST /api/sales| API
    H2 -->|GET /api/sales?page&limit| API
    H3 -->|GET /api/sales/{id}| API
    API -->|snake_case| H1
    H1 -->|mapper camelCase| UI
```

### POST /api/sales

Registra venta real (backend calcula totales y descuenta stock).

**Request (frontend → backend):**
```json
{
  "payment_method": "cash",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

**Response (backend):**
```json
{
  "id": 10,
  "user_id": 2,
  "state": "completed",
  "payment_method": "cash",
  "subtotal": 37.0,
  "total": 42.92,
  "created_at": "2026-04-09T12:00:00Z",
  "cancelled_at": null,
  "cancel_reason": null,
  "items": [
    {
      "id": 101,
      "product_id": 1,
      "product_name": "Coca Cola 600ml",
      "quantity": 2,
      "unit_price": 18.5,
      "subtotal": 37.0
    }
  ]
}
```

### GET /api/sales?page=1&limit=20

Lista paginada de ventas.

**Response (backend):**
```json
{
  "data": [
    {
      "id": 10,
      "user_id": 2,
      "state": "completed",
      "payment_method": "cash",
      "subtotal": 37.0,
      "total": 42.92,
      "created_at": "2026-04-09T12:00:00Z",
      "cancelled_at": null,
      "cancel_reason": null,
      "items": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

> Nota de mapeo frontend: `total_pages` se transforma a `totalPages` en `src/hooks/use-sales.ts`.

### GET /api/sales/{id}

Obtiene detalle completo de una venta.

### Reglas funcionales actualmente aplicadas en UI

- Pago con tarjeta está bloqueado visualmente (backend actual soporta `cash`).
- Si `POST /api/sales` falla, el carrito **se preserva** y se muestra error inline.
- Tras venta exitosa, frontend invalida caches de:
  - `['sales']`
  - `['products']`
  - `['inventory-stats']`

---

### B) Ventas (Roadmap/Legacy — no consumido por la interfaz actual)

> ⚠️ Esta sección describe contratos históricos/planificados (`/ventas`, `/ventas/fiadas`) y **no** representa el consumo actual del frontend POS.
> Para la integración vigente de interfaz usar únicamente la sección **A) Ventas POS** (`/api/sales`).

### GET /ventas

Lista ventas.

**Query Params:**
- `tipo`: normal | fiada
- `fecha`: DATE
- `fecha_inicio`: DATE
- `fecha_fin`: DATE
- `cliente_id`: UUID
- `cancelada`: boolean
- `pagada`: boolean (para ventas fiadas)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "numero_venta": "V-2025-001",
      "tipo": "normal",
      "cliente": null,
      "cliente_nombre": null,
      "subtotal": 3000.00,
      "descuento": 0.00,
      "total": 3000.00,
      "metodo_pago": "efectivo",
      "estado": "completada",
      "cancelada": false,
      "fecha": "2025-03-08T14:30:00Z",
      "usuario_id": "uuid",
      "usuario": "Juan Pérez",
      "detalles": [
        {
          "id": "uuid",
          "producto_id": "uuid",
          "producto": "Coca Cola 500ml",
          "cantidad": 2,
          "precio_unitario": 1500.00,
          "subtotal": 3000.00
        }
      ]
    }
  ]
}
```

### POST /ventas

Registra venta con múltiples productos (header + details).

**Request:**
```json
{
  "tipo": "normal",
  "cliente_id": "uuid (opcional)",
  "metodo_pago": "efectivo",
  "descuento": 0.00,
  "notas": "Venta rápido",
  "detalles": [
    {
      "producto_id": "uuid",
      "cantidad": 2
    },
    {
      "producto_id": "uuid",
      "cantidad": 1
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "numero_venta": "V-2025-001",
  "total": 4500.00,
  "tipo": "normal",
  "estado": "completada",
  "fecha": "2025-03-08T14:30:00Z"
}
```

### GET /ventas/{id}

Obtiene venta completa con detalles.

### PUT /ventas/{id}/cancelar

Cancela una venta. **Admin only.**

**Request:**
```json
{
  "motivo": "Error en productos"
}
```

### GET /ventas/{id}/imprimir

Genera ticket/impresión de venta.

---

## Ventas Fiadas (Credit Sales)

### GET /ventas/fiadas

Lista ventas fiadas.

**Query Params:**
- `pagada`: boolean
- `cliente_id`: UUID
- `vencida`: boolean

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "venta_id": "uuid",
      "numero_venta": "V-2025-002",
      "cliente_id": "uuid",
      "cliente": "Pedro Gómez",
      "cedula": "87654321",
      "telefono": "3001234567",
      "monto_total": 25000.00,
      "monto_pagado": 0.00,
      "monto_pendiente": 25000.00,
      "fecha_venta": "2025-03-01",
      "fecha_limite": "2025-04-01",
      "estado": "pendiente",
      "vencida": false,
      "detalles": [...]
    }
  ]
}
```

### POST /ventas/fiadas

Registra venta fiada (venta + cliente).

**Request:**
```json
{
  "cliente_id": "uuid (o crear nuevo cliente)",
  "cliente_nombre": "Pedro Gómez",
  "cliente_cedula": "87654321",
  "cliente_telefono": "3001234567",
  "fecha_limite_pago": "2025-04-08",
  "metodo_pago": "efectivo",
  "notas": "Primero pagar",
  "detalles": [
    {
      "producto_id": "uuid",
      "cantidad": 5
    }
  ]
}
```

### GET /ventas/fiadas/{id}

Obtiene venta fiada con historial de pagos.

### PUT /ventas/fiadas/{id}/pagar

Registra pago parcial o total de venta fiada.

**Request:**
```json
{
  "monto": 10000.00,
  "metodo_pago": "efectivo",
  "notas": "Abono parcial"
}
```

**Response:**
```json
{
  "id": "uuid",
  "estado": "parcial",
  "monto_pagado": 10000.00,
  "monto_pendiente": 15000.00
}
```

---

## Pagos Crédito

### GET /pagos_credito

Lista todos los pagos de ventas fiadas.

**Query Params:**
- `venta_fiada_id`: UUID
- `cliente_id`: UUID
- `fecha_inicio`: DATE
- `fecha_fin`: DATE

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "venta_fiada_id": "uuid",
      "cliente": "Pedro Gómez",
      "monto": 10000.00,
      "metodo_pago": "efectivo",
      "fecha": "2025-03-08T10:00:00Z",
      "usuario": "Juan Pérez",
      "notas": "Abono parcial"
    }
  ]
}
```

### GET /pagos_credito/{id}

Obtiene detalle de pago.

---

## Compras (Header + Details)

### GET /compras

Lista compras.

**Query Params:**
- `proveedor_id`: UUID
- `fecha`: DATE
- `fecha_inicio`: DATE
- `fecha_fin`: DATE
- `cancelada`: boolean

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "numero_compra": "C-2025-001",
      "proveedor_id": "uuid",
      "proveedor": "Distribuidora ABC",
      "subtotal": 100000.00,
      "descuento": 5000.00,
      "iva": 0.00,
      "total": 95000.00,
      "estado": "completada",
      "cancelada": false,
      "fecha": "2025-03-08T10:00:00Z",
      "usuario": "Juan Pérez",
      "detalles": [
        {
          "id": "uuid",
          "producto_id": "uuid",
          "producto": "Coca Cola 500ml",
          "cantidad": 24,
          "precio_unitario": 800.00,
          "subtotal": 19200.00,
          "cantidad_recibida": 24
        }
      ]
    }
  ]
}
```

### POST /compras

Registra compra con múltiples productos.

**Request:**
```json
{
  "proveedor_id": "uuid",
  "descuento": 5000.00,
  "notas": "Compra mensual",
  "detalles": [
    {
      "producto_id": "uuid",
      "cantidad": 24,
      "precio_unitario": 800.00
    },
    {
      "producto_id": "uuid",
      "cantidad": 12,
      "precio_unitario": 1500.00
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "numero_compra": "C-2025-001",
  "total": 95000.00,
  "estado": "completada",
  "fecha": "2025-03-08T10:00:00Z"
}
```

### GET /compras/{id}

Obtiene compra completa con detalles.

### PUT /compras/{id}/recibir

Registra recepción de productos (actualiza inventario).

**Request:**
```json
{
  "detalles": [
    {
      "producto_id": "uuid",
      "cantidad_recibida": 24
    }
  ]
}
```

### PUT /compras/{id}/cancelar

Cancela una compra. **Admin only.**

---

## Historial Precios

### GET /historial_precios

Consulta historial de cambios de precios.

**Query Params:**
- `producto_id`: UUID
- `fecha_inicio`: DATE
- `fecha_fin`: DATE

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "producto_id": "uuid",
      "producto": "Coca Cola 500ml",
      "precio_anterior": 1400.00,
      "precio_nuevo": 1500.00,
      "tipo_cambio": "manual",
      "fecha_cambio": "2025-03-01T00:00:00Z",
      "usuario": "Juan Pérez"
    }
  ]
}
```

### POST /historial_precios

Registra cambio de precio manualmente.

**Request:**
```json
{
  "producto_id": "uuid",
  "precio_nuevo": 1600.00,
  "motivo": "Incremento por proveedor"
}
```

---

## Caja

### GET /caja/dia

Obtiene estado de caja del día.

**Response:**
```json
{
  "id": "uuid",
  "fecha": "2025-03-08",
  "saldo_inicial": 100000.00,
  "ventas_efectivo": 150000.00,
  "ventas_tarjeta": 50000.00,
  "ventas_fiadas": 25000.00,
  "egresos": 20000.00,
  "pagos_credito": 10000.00,
  "saldo_final": 280000.00,
  "estado": "abierta",
  "ultima_apertura": "2025-03-08T08:00:00Z"
}
```

### POST /caja/apertura

Abre caja al inicio del día.

**Request:**
```json
{
  "saldo_inicial": 100000.00
}
```

### POST /caja/cierre

Cierra caja al final del día.

**Request:**
```json
{
  "saldo_final": 280000.00,
  "notas": "Todo correcto"
}
```

### POST /caja/egreso

Registra egreso.

**Request:**
```json
{
  "monto": 50000.00,
  "descripcion": "Compra de mercancía",
  "categoria": "inventario"
}
```

### GET /caja/reporte

Reporte de caja por período.

**Query Params:**
- `fecha_inicio`: DATE
- `fecha_fin`: DATE

---

## Auditoría

### GET /auditoria

Lista movimientos de auditoría. **Admin only.**

**Query Params:**
- `tabla`: string (usuarios, productos, ventas, etc.)
- `usuario_id`: UUID
- `accion`: insert | update | delete
- `fecha_inicio`: DATE
- `fecha_fin`: DATE
- `registro_id`: UUID

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tabla": "productos",
      "registro_id": "uuid",
      "accion": "update",
      "datos_anteriores": {
        "precio": 1400.00
      },
      "datos_nuevos": {
        "precio": 1500.00
      },
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "fecha": "2025-03-08T14:30:00Z",
      "usuario": "Juan Pérez"
    }
  ]
}
```

### GET /auditoria/{id}

Obtiene detalle de un registro de auditoría.

### GET /auditoria/tabla/{tabla}/{registro_id}

Obtiene historial de cambios de un registro específico.

---

## Dashboard

### GET /dashboard

Obtiene resumen general.

**Response:**
```json
{
  "ventas_hoy": 150000.00,
  "ventas_semana": 1050000.00,
  "ventas_mes": 4200000.00,
  "ventas_fiadas_pendientes": 25000.00,
  "ventas_fiadas_vencidas": 5000.00,
  "productos_stock_bajo": 3,
  "productos_por_vencer": 2,
  "movimientos_hoy": 15,
  "compras_pendientes": 1,
  "top_productos": [
    {
      "producto": "Coca Cola 500ml",
      "cantidad_vendida": 50,
      "monto": 75000.00
    }
  ],
  "ventas_por_hora": [...],
  "ventas_por_metodo_pago": {
    "efectivo": 100000.00,
    "tarjeta": 50000.00
  }
}
```

### GET /dashboard/ventas

Gráficos de ventas.

**Query Params:**
- `periodo`: dia | semana | mes | año

### GET /dashboard/inventario

Estado del inventario.

---

## Reportes

### GET /reportes/ventas

Reporte detallado de ventas.

**Query Params:**
- `fecha_inicio`: DATE
- `fecha_fin`: DATE
- `agrupar`: dia | semana | mes | producto | categoria

### GET /reportes/inventario

Reporte de inventario valorizado.

### GET /reportes/utilidades

Reporte de utilidades (ventas - costos).

**Query Params:**
- `fecha_inicio`: DATE
- `fecha_fin`: DATE

### GET /reportes/clientes/deudas

Reporte de clientes con deudas.

### GET /reportes/proveedores/saldos

Reporte de cuentas por pagar a proveedores.

---

## Funciones/Vistas de Base de Datos

### GET /vistas/productos-bajo-stock

Lista productos con stock bajo (vista optimizada).

### GET /vistas/ventas-dia

Ventas del día actual.

### GET /vistas/movimientos-pendientes

Movimientos de inventario pendientes de procesar.

---

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## Formato de Respuestas

### Éxito
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensaje descriptivo",
    "details": [...]
  }
}
```

### Paginación
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "pagina": 1,
    "por_pagina": 20,
    "ultima_pagina": 5
  }
}
```
