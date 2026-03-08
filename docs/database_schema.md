# Schema de Base de Datos - Mejorado

---

## Motor

**PostgreSQL** 14+

---

## Enumeraciones (ENUM Types)

```sql
CREATE TYPE rol_usuario AS ENUM('admin', 'cajero', 'vendedor');
CREATE TYPE tipo_movimiento AS ENUM('entrada', 'venta', 'vencimiento', 'venta_fiada', 'ajuste_positivo', 'ajuste_negativo', 'devolucion');
CREATE TYPE tipo_venta AS ENUM('normal', 'fiada');
CREATE TYPE estado_credito AS ENUM('pendiente', 'pagado', 'vencido', 'cobro_dudoso');
CREATE TYPE estado_caja AS ENUM('abierta', 'cerrada');
```

---

## Tablas

### usuarios

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre completo |
| cedula | VARCHAR(20) | UNIQUE NOT NULL | Cédula de identidad |
| direccion | VARCHAR(255) | | Dirección completa |
| telefono | VARCHAR(20) | | Teléfono de contacto |
| correo | VARCHAR(100) | UNIQUE NOT NULL | Correo electrónico |
| password_hash | VARCHAR(255) | NOT NULL | Hash de contraseña (bcrypt) |
| rol | rol_usuario | DEFAULT 'vendedor' | Rol en el sistema |
| fecha_registro | TIMESTAMP | DEFAULT NOW() | Fecha de registro |
| ultimo_login | TIMESTAMP | | Último acceso |
| activo | BOOLEAN | DEFAULT TRUE | Estado del usuario |

**Índices:**
```sql
CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
```

---

### clientes

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre del cliente |
| cedula | VARCHAR(20) | UNIQUE | Cédula (opcional para fiadas) |
| telefono | VARCHAR(20) | | Teléfono de contacto |
| correo | VARCHAR(100) | | Correo electrónico |
| direccion | VARCHAR(255) | | Dirección |
| limite_credito | DECIMAL(10,2) | DEFAULT 0 | Límite de crédito permitido |
| activo | BOOLEAN | DEFAULT TRUE | Estado del cliente |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
```sql
CREATE INDEX idx_clientes_cedula ON clientes(cedula);
CREATE INDEX idx_clientes_activo ON clientes(activo);
```

---

### categorias

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| nombre | VARCHAR(50) | NOT NULL UNIQUE | Nombre de categoría |
| descripcion | TEXT | | Descripción detallada |
| categoria_padre_id | UUID | FK → categorias.id | Categoría padre (jerarquía) |
| activa | BOOLEAN | DEFAULT TRUE | Estado de categoría |
| orden | INTEGER | DEFAULT 0 | Orden de visualización |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
```sql
CREATE INDEX idx_categorias_padre ON categorias(categoria_padre_id);
CREATE INDEX idx_categorias_activa ON categorias(activa);
```

**Restricciones:**
```sql
ALTER TABLE categorias
ADD CONSTRAINT chk_categorias_no_circular
CHECK (id != categoria_padre_id);
```

---

### productos

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| codigo_barras | VARCHAR(50) | UNIQUE | Código de barras |
| nombre | VARCHAR(100) | NOT NULL | Nombre del producto |
| descripcion | TEXT | | Descripción |
| precio | DECIMAL(10,2) | NOT NULL, CHECK (precio >= 0) | Precio de venta |
| precio_costo | DECIMAL(10,2) | CHECK (precio_costo >= 0) | Precio de costo |
| categoria_id | UUID | FK → categorias.id | Categoría del producto |
| imagen_url | VARCHAR(500) | | URL de imagen |
| fecha_vencimiento | DATE | | Fecha de vencimiento |
| stock_actual | INTEGER | DEFAULT 0, CHECK (stock_actual >= 0) | Stock actual |
| stock_minimo | INTEGER | DEFAULT 5, CHECK (stock_minimo >= 0) | Stock mínimo para alertas |
| stock_maximo | INTEGER | CHECK (stock_maximo >= stock_minimo) | Stock máximo |
| unidad_medida | VARCHAR(20) | DEFAULT 'unidad' | Unidad (kg, lt, unidad, etc.) |
| activo | BOOLEAN | DEFAULT TRUE | Estado del producto |
| permite_ventas_fiadas | BOOLEAN | DEFAULT TRUE | Permite venta fiada |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
```sql
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_nombre ON productos(nombre) COLLATE "es_ES";
CREATE INDEX idx_productos_codigo_barras ON productos(codigo_barras);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_stock_bajo ON productos(stock_actual) WHERE stock_actual < stock_minimo;
CREATE INDEX idx_productos_vencimiento ON productos(fecha_vencimiento) WHERE fecha_vencimiento IS NOT NULL;
```

---

### proveedores

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre del proveedor |
| nit | VARCHAR(20) | | NIT del proveedor |
| telefono | VARCHAR(20) | | Teléfono |
| correo | VARCHAR(100) | | Correo electrónico |
| direccion | VARCHAR(255) | | Dirección |
| persona_contacto | VARCHAR(100) | | Persona de contacto |
| activo | BOOLEAN | DEFAULT TRUE | Estado |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
```sql
CREATE INDEX idx_proveedores_activo ON proveedores(activo);
```

---

### movimientos

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| producto_id | UUID | FK → productos.id, NOT NULL | Producto afectado |
| tipo_movimiento | tipo_movimiento | NOT NULL | Tipo de movimiento |
| cantidad | INTEGER | NOT NULL, CHECK (cantidad != 0) | Cantidad (positiva o negativa) |
| cantidad_anterior | INTEGER | NOT NULL | Stock anterior |
| cantidad_nueva | INTEGER | NOT NULL | Stock nuevo |
| precio_unitario | DECIMAL(10,2) | | Precio unitario (para entradas) |
| referencia_id | UUID | | Referencia (id de venta, compra, etc.) |
| proveedor_id | UUID | FK → proveedores.id | Proveedor (para entradas) |
| fecha | TIMESTAMP | DEFAULT NOW() | Fecha del movimiento |
| usuario_id | UUID | FK → usuarios.id | Usuario que registró |
| notas | TEXT | | Observaciones |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

**Índices:**
```sql
CREATE INDEX idx_movimientos_producto ON movimientos(producto_id);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo_movimiento);
CREATE INDEX idx_movimientos_usuario ON movimientos(usuario_id);
CREATE INDEX idx_movimientos_fecha_producto ON movimientos(fecha, producto_id);
```

**Restricciones:**
```sql
-- Validar que cantidad_anterior + cantidad = cantidad_nueva
ALTER TABLE movimientos 
ADD CONSTRAINT chk_movimientos_stock 
CHECK (cantidad_anterior + cantidad = cantidad_nueva);
```

---

### ventas (Encabezado)

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| numero_venta | SERIAL | UNIQUE | Número secuencial de venta |
| cliente_id | UUID | FK → clientes.id | Cliente (nullable, para fiadas) |
| usuario_id | UUID | FK → usuarios.id, NOT NULL | Cajero/Vendedor |
| tipo_venta | tipo_venta | DEFAULT 'normal' | Tipo de venta |
| subtotal | DECIMAL(10,2) | NOT NULL | Subtotal |
| descuento | DECIMAL(10,2) | DEFAULT 0 | Descuento aplicado |
| impuestos | DECIMAL(10,2) | DEFAULT 0 | Impuestos |
| total | DECIMAL(10,2) | NOT NULL | Total de la venta |
| monto_recibido | DECIMAL(10,2) | | Monto recibido del cliente |
| cambio | DECIMAL(10,2) | | Cambio devuelto |
| efectivo | DECIMAL(10,2) | DEFAULT 0 | Pagado en efectivo |
| tarjeta | DECIMAL(10,2) | DEFAULT 0 | Pagado con tarjeta |
| transferencia | DECIMAL(10,2) | DEFAULT 0 | Pagado por transferencia |
| fecha | TIMESTAMP | DEFAULT NOW() | Fecha de venta |
| cancelada | BOOLEAN | DEFAULT FALSE | Si está cancelada |
| cancelada_por | UUID | FK → usuarios.id | Usuario que canceló |
| fecha_cancelacion | TIMESTAMP | | Fecha de cancelación |
| motivo_cancelacion | TEXT | | Motivo de cancelación |
| notas | TEXT | | Observaciones |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
```sql
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX idx_ventas_tipo ON ventas(tipo_venta);
CREATE INDEX idx_ventas_cancelada ON ventas(cancelada);
CREATE INDEX idx_ventas_fecha_cancelada ON ventas(fecha) WHERE cancelada = TRUE;
```

---

### venta_detalles (Línea de productos)

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| venta_id | UUID | FK → ventas.id, NOT NULL | Venta padre |
| producto_id | UUID | FK → productos.id, NOT NULL | Producto |
| cantidad | INTEGER | NOT NULL, CHECK (cantidad > 0) | Cantidad |
| precio_unitario | DECIMAL(10,2) | NOT NULL | Precio al momento de venta |
| descuento | DECIMAL(10,2) | DEFAULT 0 | Descuento por línea |
| subtotal | DECIMAL(10,2) | NOT NULL | Subtotal línea |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

**Índices:**
```sql
CREATE INDEX idx_venta_detalles_venta ON venta_detalles(venta_id);
CREATE INDEX idx_venta_detalles_producto ON venta_detalles(producto_id);
```

**Restricciones:**
```sql
ALTER TABLE venta_detalles 
ADD CONSTRAINT chk_venta_detalles_subtotal 
CHECK (subtotal = cantidad * precio_unitario - descuento);
```

---

### ventas_fiadas (Crédito)

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| venta_id | UUID | FK → ventas.id, UNIQUE, NOT NULL | Venta relacionada |
| cliente_id | UUID | FK → clientes.id, NOT NULL | Cliente fiado |
| monto_original | DECIMAL(10,2) | NOT NULL | Monto original de la deuda |
| monto_pendiente | DECIMAL(10,2) | NOT NULL | Monto pendiente |
| monto_pagado | DECIMAL(10,2) | DEFAULT 0 | Total pagado |
| estado | estado_credito | DEFAULT 'pendiente' | Estado del crédito |
| fecha_limite_pago | DATE | | Fecha límite |
| fecha_primer_pago | DATE | | Fecha del primer pago |
| numero_pagos | INTEGER | DEFAULT 0 | Número de pagos realizados |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
```sql
CREATE INDEX idx_ventas_fiadas_venta ON ventas_fiadas(venta_id);
CREATE INDEX idx_ventas_fiadas_cliente ON ventas_fiadas(cliente_id);
CREATE INDEX idx_ventas_fiadas_estado ON ventas_fiadas(estado);
CREATE INDEX idx_ventas_fiadas_fecha_limite ON ventas_fiadas(fecha_limite_pago);
CREATE INDEX idx_ventas_fiadas_pendientes ON ventas_fiadas(estado) WHERE estado = 'pendiente';
```

---

### pagos_credito (Abonos a crédito)

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| venta_fiada_id | UUID | FK → ventas_fiadas.id, NOT NULL | Crédito relacionado |
| monto | DECIMAL(10,2) | NOT NULL, CHECK (monto > 0) | Monto del abono |
| fecha | TIMESTAMP | DEFAULT NOW() | Fecha del pago |
| metodo_pago | VARCHAR(20) | DEFAULT 'efectivo' | Método (efectivo, transferencia, etc.) |
| referencia | VARCHAR(100) | | Referencia del pago |
| usuario_id | UUID | FK → usuarios.id | Usuario que registró |
| notas | TEXT | | Observaciones |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

**Índices:**
```sql
CREATE INDEX idx_pagos_credito_venta_fiada ON pagos_credito(venta_fiada_id);
CREATE INDEX idx_pagos_credito_fecha ON pagos_credito(fecha);
```

---

### caja

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| fecha | DATE | UNIQUE NOT NULL | Fecha de la caja |
| estado | estado_caja | DEFAULT 'abierta' | Estado |
| saldo_inicial | DECIMAL(10,2) | DEFAULT 0 | Saldo al abrir |
| total_ventas | DECIMAL(10,2) | DEFAULT 0 | Total ventas del día |
| total_ventas_fiadas | DECIMAL(10,2) | DEFAULT 0 | Total ventas fiadas |
| total_ingresos | DECIMAL(10,2) | DEFAULT 0 | Otros ingresos |
| total_egresos | DECIMAL(10,2) | DEFAULT 0 | Egresos del día |
| total_efectivo | DECIMAL(10,2) | DEFAULT 0 | Total en efectivo |
| total_tarjeta | DECIMAL(10,2) | DEFAULT 0 | Total tarjetas |
| total_transferencia | DECIMAL(10,2) | DEFAULT 0 | Total transferencias |
| total_cobros_credito | DECIMAL(10,2) | DEFAULT 0 | Cobros de créditos |
| saldo_final | DECIMAL(10,2) | DEFAULT 0 | Saldo calculado |
| saldo_final_real | DECIMAL(10,2) | | Saldo real (contado) |
| diferencia | DECIMAL(10,2) | | Diferencia (real - calculado) |
| usuario_apertura_id | UUID | FK → usuarios.id | Usuario que abrió |
| usuario_cierre_id | UUID | FK → usuarios.id | Usuario que cerró |
| hora_apertura | TIMESTAMP | | Hora de apertura |
| hora_cierre | TIMESTAMP | | Hora de cierre |
| notas_apertura | TEXT | | Notas al abrir |
| notas_cierre | TEXT | | Notas al cerrar |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
```sql
CREATE INDEX idx_caja_fecha ON caja(fecha);
CREATE INDEX idx_caja_estado ON caja(estado);
```

---

### compras (Órdenes de compra)

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| numero_compra | SERIAL | UNIQUE | Número secuencial |
| proveedor_id | UUID | FK → proveedores.id | Proveedor |
| usuario_id | UUID | FK → usuarios.id | Usuario que registró |
| subtotal | DECIMAL(10,2) | NOT NULL | Subtotal |
| impuestos | DECIMAL(10,2) | DEFAULT 0 | Impuestos |
| descuento | DECIMAL(10,2) | DEFAULT 0 | Descuento |
| total | DECIMAL(10,2) | NOT NULL | Total |
| estado | VARCHAR(20) | DEFAULT 'recibida' | Estado (pendiente, recibida, cancelada) |
| fecha_esperada | DATE | | Fecha esperada de entrega |
| fecha_recibida | DATE | | Fecha de recepción |
| notas | TEXT | | Observaciones |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Última actualización |

---

### compra_detalles

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| compra_id | UUID | FK → compras.id | Compra padre |
| producto_id | UUID | FK → productos.id | Producto |
| cantidad | INTEGER | NOT NULL | Cantidad |
| precio_unitario | DECIMAL(10,2) | NOT NULL | Precio de costo |
| subtotal | DECIMAL(10,2) | NOT NULL | Subtotal |
| fecha_vencimiento | DATE | | Fecha de vencimiento recibida |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

---

### historial_precios

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| producto_id | UUID | FK → productos.id, NOT NULL | Producto |
| precio_anterior | DECIMAL(10,2) | NOT NULL | Precio anterior |
| precio_nuevo | DECIMAL(10,2) | NOT NULL | Precio nuevo |
| tipo_cambio | VARCHAR(20) | | Tipo de cambio (ajuste, oferta, costo) |
| usuario_id | UUID | FK → usuarios.id | Usuario que cambió |
| fecha | TIMESTAMP | DEFAULT NOW() | Fecha del cambio |
| motivo | TEXT | | Razón del cambio |

**Índices:**
```sql
CREATE INDEX idx_historial_precios_producto ON historial_precios(producto_id);
CREATE INDEX idx_historial_precios_fecha ON historial_precios(fecha);
```

---

### auditoria

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tabla | VARCHAR(50) | NOT NULL | Tabla afectada |
| registro_id | UUID | NOT NULL | ID del registro |
| accion | VARCHAR(20) | NOT NULL | INSERT, UPDATE, DELETE |
| datos_anteriores | JSONB | | Datos anteriores |
| datos_nuevos | JSONB | | Datos nuevos |
| usuario_id | UUID | FK → usuarios.id | Usuario que ejecutó |
| ip_address | VARCHAR(45) | | IP del cliente |
| fecha | TIMESTAMP | DEFAULT NOW() | Fecha de la acción |

**Índices:**
```sql
CREATE INDEX idx_auditoria_tabla_registro ON auditoria(tabla, registro_id);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
```

---

## Relaciones

```
usuarios 1──∞ movimientos
usuarios 1──∞ ventas
usuarios 1──∞ caja
usuarios 1──∞ pagos_credito
usuarios 1──∞ auditoria

categorias 1──∞ productos
categorias 1──∞ categorias (jerarquía)

clientes 1──∞ ventas_fiadas
clientes 1──∞ pagos_credito

productos 1──∞ movimientos
productos 1──∞ venta_detalles
productos 1──∞ historial_precios
productos 1──∞ compra_detalles

proveedores 1──∞ movimientos (entradas)
proveedores 1──∞ compras

ventas 1──1 ventas_fiadas
ventas 1──∞ venta_detalles

ventas_fiadas 1──∞ pagos_credito

compras 1──∞ compra_detalles
```

---

## Funciones y Triggers

### 1. Trigger: Actualizar stock después de movimiento

```sql
CREATE OR REPLACE FUNCTION fn_actualizar_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock_actual = NEW.cantidad_nueva,
        updated_at = NOW()
    WHERE id = NEW.producto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock
AFTER INSERT ON movimientos
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_stock_producto();
```

### 2. Trigger: Crear registro fiado automáticamente

```sql
CREATE OR REPLACE FUNCTION fn_crear_venta_fiada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo_venta = 'fiada' AND NEW.cliente_id IS NOT NULL THEN
        INSERT INTO ventas_fiadas (venta_id, cliente_id, monto_original, monto_pendiente, fecha_limite_pago)
        VALUES (NEW.id, NEW.cliente_id, NEW.total, NEW.total, NEW.fecha + INTERVAL '30 days');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_crear_venta_fiada
AFTER INSERT ON ventas
FOR EACH ROW
EXECUTE FUNCTION fn_crear_venta_fiada();
```

### 3. Trigger: Actualizar crédito al pagar

```sql
CREATE OR REPLACE FUNCTION fn_actualizar_credito_pago()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ventas_fiadas
    SET monto_pagado = monto_pagado + NEW.monto,
        monto_pendiente = monto_pendiente - NEW.monto,
        numero_pagos = numero_pagos + 1,
        estado = CASE
            WHEN monto_pendiente - NEW.monto <= 0 THEN 'pagado'
            ELSE estado
        END,
        fecha_primer_pago = COALESCE(fecha_primer_pago, NEW.fecha),
        updated_at = NOW()
    WHERE id = NEW.venta_fiada_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_credito_pago
AFTER INSERT ON pagos_credito
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_credito_pago();
```

### 4. Trigger: Auditoría automática

```sql
CREATE OR REPLACE FUNCTION fn_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria (tabla, registro_id, accion, datos_nuevos, usuario_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), current_setting('app.current_user_id', true)::UUID);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO auditoria (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id', true)::UUID);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO auditoria (tabla, registro_id, accion, datos_anteriores, usuario_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), current_setting('app.current_user_id', true)::UUID);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 5. Trigger: Actualizar updated_at

```sql
CREATE OR REPLACE FUNCTION fn_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas con updated_at
CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
-- Repetir para otras tablas...
```

### 6. Función: Productos con stock bajo

```sql
CREATE OR REPLACE FUNCTION fn_productos_stock_bajo()
RETURNS TABLE (
    id UUID,
    nombre VARCHAR,
    stock_actual INTEGER,
    stock_minimo INTEGER,
    categoria_nombre VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.nombre,
        p.stock_actual,
        p.stock_minimo,
        c.nombre as categoria_nombre
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.stock_actual < p.stock_minimo AND p.activo = TRUE
    ORDER BY p.stock_actual ASC;
END;
$$ LANGUAGE plpgsql;
```

### 7. Función: Resumen de ventas por período

```sql
CREATE OR REPLACE FUNCTION fn_resumen_ventas(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    fecha DATE,
    total_ventas DECIMAL,
    total_fiadas DECIMAL,
    total_efectivo DECIMAL,
    total_tarjeta DECIMAL,
    total_transferencia DECIMAL,
    numero_ventas INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.fecha::DATE as fecha,
        SUM(v.total) as total_ventas,
        SUM(CASE WHEN v.tipo_venta = 'fiada' THEN v.total ELSE 0 END) as total_fiadas,
        SUM(v.efectivo) as total_efectivo,
        SUM(v.tarjeta) as total_tarjeta,
        SUM(v.transferencia) as total_transferencia,
        COUNT(*) as numero_ventas
    FROM ventas v
    WHERE v.fecha >= p_fecha_inicio 
        AND v.fecha < p_fecha_fin + 1
        AND v.cancelada = FALSE
    GROUP BY v.fecha::DATE
    ORDER BY v.fecha DESC;
END;
$$ LANGUAGE plpgsql;
```

### 8. Vista: Resumen crédito clientes

```sql
CREATE VIEW v_resumen_creditos AS
SELECT 
    c.id as cliente_id,
    c.nombre as cliente_nombre,
    c.cedula,
    COUNT(vf.id) as total_fiadas,
    SUM(vf.monto_pendiente) as total_pendiente,
    MAX(vf.fecha_limite_pago) as fecha_mas_antigua,
    CASE 
        WHEN MAX(vf.fecha_limite_pago) < CURRENT_DATE THEN 'vencido'
        WHEN SUM(vf.monto_pendiente) > c.limite_credito THEN 'límite excedido'
        ELSE 'al_día'
    END as estado
FROM clientes c
LEFT JOIN ventas_fiadas vf ON vf.cliente_id = c.id AND vf.estado = 'pendiente'
WHERE c.activo = TRUE
GROUP BY c.id, c.nombre, c.cedula, c.limite_credito
HAVING SUM(vf.monto_pendiente) > 0;
```

---

## Políticas de Seguridad (Row Level Security)

### Ejemplo para datos sensibles

```sql
-- Solo admins pueden ver contraseñas
CREATE POLICY ver_password_hash ON usuarios
    FOR SELECT TO admin
    USING (true);

-- Usuarios solo ven sus propios registros en auditoría
CREATE POLICY ver_propia_auditoria ON auditoria
    FOR SELECT TO cajero
    USING (usuario_id = current_setting('app.current_user_id', true)::UUID);
```

---

## Migración de datos existentes

Si ya existen datos en el schema anterior:

```sql
-- 1. Crear clientes desde ventas_fiadas existentes
INSERT INTO clientes (nombre, cedula, telefono, activo)
SELECT DISTINCT cliente_nombre, cliente_cedula, cliente_telefono, TRUE
FROM ventas_fiadas 
WHERE cliente_nombre IS NOT NULL
ON CONFLICT (cedula) DO NOTHING;

-- 2. Migrar ventas a estructura con detalles
-- (Requiere script personalizado según datos)
```

---

## Resumen de cambios vs. Schema Anterior

| Aspecto | Anterior | Mejorado |
|---------|----------|----------|
| Entidades | 8 | 13 |
| Tabla inventario | Separada (redundante) | Eliminada (usa stock_actual) |
| Clientes | No existían | Nueva tabla con límite crédito |
| Ventas | Una línea por producto | Header + Detalles |
| Tipos ENUM | En línea | Definidos globalmente |
| UUID | Manual | gen_random_uuid() |
| timestamps | Basic | created_at + updated_at |
| CHECK constraints | Ninguno | Precios y cantidades positivos |
| Foreign keys | Sin acciones | CASCADE/SET NULL apropiados |
| Índices | Básicos | Compuestos y parciales |
| Triggers | 2 propuestos | 5 funcionales |
| Auditoría | No existía | Tabla completa |
| Vistas | No existían | Resumen créditos |
| Soft delete | No | Campo activo en todas |

---

*Documento generado: 2026-03-08*
*Versión PostgreSQL: 14+*
