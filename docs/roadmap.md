# Roadmap de Desarrollo

---

## Resumen de Fases

| Fase | Descripción | Duración |
|------|-------------|----------|
| 1 | Preparación del proyecto | 1 día |
| 2 | Backend base + Docker | 2 días |
| 3 | Modelado de base de datos | 1 día |
| 4 | API de inventario | 2 días |
| 5 | Movimientos de inventario | 2 días |
| 6 | Sistema de ventas + fiadas | 2 días |
| 7 | Sistema de clientes + créditos | 1 día |
| 8 | Sistema de compras | 1 día |
| 9 | Caja y reportes | 1 día |
| 10 | Desarrollo frontend | 4-5 días |
| 11 | Auditoría y seguridad | 1 día |
| 12 | AI y mejoras (opcional) | 3-4 días |

**Total estimado: 19-21 días**

---

## Fase 1 — Preparación del Proyecto

### Objetivos
- [ ] Crear repositorio Git
- [ ] Configurar estructura del proyecto
- [ ] Configurar Docker y Docker Compose

### Tareas
- [ ] Inicializar repositorio
- [ ] Crear estructura de directorios
- [ ] Crear docker-compose.yml
- [ ] Crear Dockerfiles

### Entregables
- Estructura de proyecto completa
- Contenedores configurados

---

## Fase 2 — Backend Base

### Objetivos
- [ ] Crear proyecto FastAPI
- [ ] Configurar conexión a base de datos
- [ ] Configurar autenticación JWT
- [ ] Crear rutas iniciales
- [ ] Configurar Alembic para migraciones

### Tareas
- [ ] Crear proyecto FastAPI
- [ ] Instalar dependencias (fastapi, uvicorn, sqlalchemy, pydantic, python-jose, passlib, alembic)
- [ ] Configurar CORS
- [ ] Configurar SQLAlchemy con PostgreSQL
- [ ] Crear modelo de usuario
- [ ] Crear endpoint de autenticación
- [ ] Crear login JWT
- [ ] Configurar Alembic

### Entregables
- FastAPI funcionando
- Autenticación JWT operativa
- Migraciones configuradas

---

## Fase 3 — Modelado de Base de Datos

### Objetivos
- [ ] Crear modelos SQLAlchemy
- [ ] Ejecutar migraciones
- [ ] Verificar estructura

### Modelos a crear (13 tablas)
- [ ] usuarios (con roles: admin, cajero, vendedor)
- [ ] clientes (con límite de crédito)
- [ ] categorias (con jerarquía)
- [ ] productos (con stock, precios, código de barras)
- [ ] proveedores
- [ ] movimientos (con tipos: entrada, venta, vencimiento, etc.)
- [ ] ventas (header)
- [ ] venta_detalles (líneas de venta)
- [ ] ventas_fiadas (créditos)
- [ ] pagos_credito (abonos)
- [ ] caja
- [ ] compras / compra_detalles
- [ ] historial_precios
- [ ] auditoria

### Elementos PostgreSQL
- [ ] ENUM types (rol_usuario, tipo_movimiento, tipo_venta, estado_credito, estado_caja)
- [ ] UUIDs automáticos con gen_random_uuid()
- [ ] Constraints CHECK
- [ ] Soft deletes (campo activo)
- [ ] Triggers (stock, fiadas, auditoría, timestamps)
- [ ] Funciones (stock bajo, resumen ventas)
- [ ] Vistas (resumen créditos)

### Entregables
- Base de datos con todas las tablas
- Modelos configurados
- Triggers funcionando

---

## Fase 4 — API de Inventario

### Objetivos
- [ ] CRUD de categorías
- [ ] CRUD de productos
- [ ] Consultas de inventario

### Endpoints
- [ ] GET/POST /categorias
- [ ] GET/PUT/DELETE /categorias/{id}
- [ ] GET/POST /productos
- [ ] GET/PUT/DELETE /productos/{id}
- [ ] GET /productos/barras/{codigo_barras}
- [ ] GET /inventario
- [ ] GET /inventario/alertas
- [ ] GET /vistas/productos-bajo-stock

### Reglas de negocio
- [ ] Validar stock suficiente en ventas
- [ ] Registrar historial_precios al cambiar precio
- [ ] Validar productos activos

### Entregables
- API de categorías operativa
- API de productos operativa
- Consulta de inventario funcional

---

## Fase 5 — Movimientos de Inventario

### Objetivos
- [ ] Registrar entradas
- [ ] Registrar salidas
- [ ] Actualizar stock automáticamente (trigger)

### Endpoints
- [ ] GET /movimientos
- [ ] POST /movimientos
- [ ] GET /movimientos/{id}
- [ ] POST /inventario/ajuste

### Reglas de negocio
- [ ] Entrada: stock += cantidad
- [ ] Venta: stock -= cantidad
- [ ] Vencimiento: stock -= cantidad
- [ ] Validar stock suficiente
- [ ] Registrar movimiento con referencia

### Triggers
- [ ] trg_actualizar_stock - Auto-actualiza stock_actual

### Entregables
- Registro de movimientos funcional
- Inventario actualizado automáticamente

---

## Fase 6 — Sistema de Ventas

### Objetivos
- [ ] Registrar ventas normales (multi-producto)
- [ ] Registrar ventas fiadas
- [ ] Integrar con caja

### Endpoints
- [ ] GET /ventas
- [ ] POST /ventas (con detalles)
- [ ] GET /ventas/{id}
- [ ] PUT /ventas/{id}/cancelar
- [ ] GET /ventas/{id}/imprimir
- [ ] POST /ventas/fiadas
- [ ] GET /ventas/fiadas
- [ ] PUT /ventas/fiadas/{id}/pagar

### Reglas de negocio
- [ ] Validar stock disponible
- [ ] Calcular totales automáticamente
- [ ] Crear registro fiado automáticamente
- [ ] Descontar stock al vender
- [ ] Validar límite de crédito del cliente

### Triggers
- [ ] trg_crear_venta_fiada - Auto-crea crédito

### Entregables
- Sistema de ventas multi-producto operativo
- Control de ventas fiadas
- Integración con caja

---

## Fase 7 — Sistema de Clientes y Créditos

### Objetivos
- [ ] CRUD de clientes
- [ ] Gestión de créditos
- [ ] Pagos/abonos

### Endpoints
- [ ] GET/POST /clientes
- [ ] GET/PUT/DELETE /clientes/{id}
- [ ] GET /pagos_credito
- [ ] GET /pagos_credito/{id}

### Reglas de negocio
- [ ] Validar límite de crédito
- [ ] Calcular deuda actual
- [ ] Marcar como vencido si pasa fecha límite
- [ ] Registrar pagos

### Triggers
- [ ] trg_actualizar_credito_pago - Auto-actualiza saldo

### Entregables
- Gestión completa de clientes
- Sistema de créditos operativos

---

## Fase 8 — Sistema de Compras

### Objetivos
- [ ] CRUD de proveedores
- [ ] Órdenes de compra
- [ ] Recepción de productos

### Endpoints
- [ ] GET/POST /proveedores
- [ ] GET/PUT/DELETE /proveedores/{id}
- [ ] GET/POST /compras
- [ ] GET /compras/{id}
- [ ] PUT /compras/{id}/recibir
- [ ] PUT /compras/{id}/cancelar

### Reglas de negocio
- [ ] Registrar compra (no afecta inventario)
- [ ] Recibir = crear movimiento de entrada + actualizar stock

### Entregables
- Gestión de proveedores
- Órdenes de compra operativas

---

## Fase 9 — Caja y Reportes

### Objetivos
- [ ] Apertura y cierre de caja
- [ ] Registro de egresos
- [ ] Reportes

### Endpoints
- [ ] GET /caja/dia
- [ ] POST /caja/apertura
- [ ] POST /caja/cierre
- [ ] POST /caja/egreso
- [ ] GET /caja/reporte
- [ ] GET /dashboard
- [ ] GET /reportes/ventas
- [ ] GET /reportes/inventario
- [ ] GET /reportes/utilidades

### Reglas de negocio
- [ ] Solo una caja abierta por día
- [ ] Calcular totales automáticamente
- [ ] Validar cierre con diferencia

### Entregables
- Caja diaria funcional
- Reportes operativos

---

## Fase 10 — Desarrollo Frontend

### Objetivos
- [ ] Crear interfaces de usuario
- [ ] Integrar con API
- [ ] Testing

### Pantallas
- [ ] Login
- [ ] Dashboard
- [ ] Gestión de categorías
- [ ] Registro de productos
- [ ] Inventario
- [ ] Registro de ventas
- [ ] Ventas fiadas
- [ ] Clientes
- [ ] Proveedores
- [ ] Compras
- [ ] Caja
- [ ] Usuarios (admin)
- [ ] Auditoría (admin)

### Componentes
- [ ] Sidebar/Navegación
- [ ] Tablas de datos con paginación
- [ ] Formularios con validación Zod
- [ ] Alertas de stock bajo
- [ ] Gráficos (Recharts o similar)
- [ ] Tickets de venta

### Integración
- [ ] Axios configurado
- [ ] React Query implementado
- [ ] Zustand para estado
- [ ] Rutas protegidas por rol

### Entregables
- Frontend completo
- UI funcional
- Integración con API

---

## Fase 11 — Auditoría y Seguridad

### Objetivos
- [ ] Tracking de cambios
- [ ] Seguridad

### Endpoints
- [ ] GET /auditoria (admin only)
- [ ] GET /auditoria/{id}
- [ ] GET /auditoria/tabla/{tabla}/{registro_id}

### Triggers
- [ ] trg_auditoria - Registra todos los cambios

### Seguridad
- [ ] Middleware de autenticación
- [ ] Protección de rutas por rol
- [ ] Validación de entrada
- [ ] CORS configurado

### Entregables
- Auditoría completa
- Sistema seguro

---

## Fase 12 — AI y Mejoras (Opcional)

### Objetivos
- [ ] Alertas inteligentes
- [ ] Predicciones de stock
- [ ] Dashboard analítico

### Features
- [ ] Alertas de stock bajo (existente en API)
- [ ] Predicción de reposición
- [ ] Recomendaciones de productos
- [ ] Detección de anomalías

### Tecnologías
- [ ] scikit-learn
- [ ] pandas
- [ ] Jupyter (para análisis)

### Entregables
- Sistema de alertas
- Predicciones básicas

---

## Dependencias entre Fases

```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6
                                              ↓
Fase 11 ← Fase 10 ← Fase 9 ← Fase 8 ← Fase 7
```

---

## Priorities

### Alta Prioridad (Semana 1-2)
1. Autenticación
2. CRUD Productos
3. Inventario
4. Ventas
5. Clientes y créditos

### Media Prioridad (Semana 2-3)
6. Categorías
7. Proveedores
8. Compras
9. Caja
10. Reportes

### Baja Prioridad (Semana 3-4)
11. Auditoría
12. Frontend completo
13. AI y mejoras

---

## Tech Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + TypeScript + Vite |
| Estado | Zustand + React Query |
| Estilos | TailwindCSS |
| Backend | FastAPI + SQLAlchemy |
| DB | PostgreSQL |
| Auth | JWT |
| Container | Docker |
| Migraciones | Alembic |

---

## Métricas de Éxito

| Métrica | Target |
|---------|--------|
| Endpoints implementados | 50+ |
| Cobertura de tests | > 70% |
| Tiempo respuesta API | < 200ms |
| UI responsive | 100% |
| Stock bajo precisión | > 90% |
