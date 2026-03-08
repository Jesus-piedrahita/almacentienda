# Especificaciones de AI

---

## Visión General

Este documento define las especificaciones de inteligencia artificial para el sistema de gestión de inventario.

---

## Capacidades de AI

### 1. Predicción de Stock

**Descripción:** Analiza patrones de venta para predecir cuándo un producto necesitará reposición.

**Entradas:**
- Historial de ventas
- Historial de movimientos
- Temporadas/festivos

**Salida:**
- Fecha estimada de reposición
- Cantidad recomendada

**Implementación:**
```python
# Pseudocódigo
def predecir_reposicion(producto_id):
    ventas_promedio = calcular_promedio_ventas(producto_id, dias=30)
    stock_actual = obtener_stock(producto_id)
    dias_restantes = stock_actual / ventas_promedio
    return dias_restantes
```

---

### 2. Alertas Inteligentes

**Descripción:** Alertas contextuales basadas en patrones de comportamiento.

**Tipos de alertas:**
- Stock bajo crítico
- Productos próximos a vencer
- Ventas anómalas
- Productos sin movimiento

**Niveles de alerta:**
| Nivel | Condición | Color |
|-------|-----------|-------|
| Crítico | stock = 0 | Rojo |
| Bajo | stock < stock_minimo | Naranja |
| Advertencia | stock < stock_minimo * 1.5 | Amarillo |
| Normal | stock >= stock_minimo * 1.5 | Verde |

---

### 3. Recomendaciones de Productos

**Descripción:** Recomienda productos basados en historial de compras.

**Algoritmo:**
- Análisis de frecuencia de compra
- Productos complementarios
- Tendencias temporales

---

### 4. Análisis de Ventas

**Descripción:** Genera insights sobre patrones de venta.

**Métricas:**
- Productos más vendidos
- Horarios pico
- Días de mayor movimiento
- Categorías populares
- Margen de ganancia por producto

---

### 5. Detección de Anomalías

**Descripción:** Identifica patrones inusuales en el inventario.

**Detecta:**
- Ventas excesivamente altas/bajas
- Movimientos fuera de horario
- Productos con rotación anómala
- Pérdidas potenciales

---

## Integración con API

### Endpoint de Predicciones

```python
# Future endpoint
@app.get("/ai/predicciones/{producto_id}")
async def get_prediccion(producto_id: UUID):
    dias_hasta_reposicion = predecir_reposicion(producto_id)
    cantidad_recomendada = calcular_cantidad_optima(producto_id)
    
    return {
        "producto_id": producto_id,
        "dias_hasta_reposicion": dias_hasta_reposicion,
        "cantidad_recomendada": cantidad_recomendada,
        "nivel_alerta": determinar_nivel(stock_actual, dias_hasta_reposicion)
    }
```

### Endpoint de Insights

```python
@app.get("/ai/insights")
async def get_insights(fecha_inicio: date, fecha_fin: date):
    return {
        "productos_mas_vendidos": [...],
        "ventas_por_dia": [...],
        "categoria_mas_vendida": "...",
        "ingresos_totales": ...,
        "anomalias_detectadas": [...]
    }
```

---

## Modelo de Datos para AI

### Tabla: predicciones

```sql
CREATE TABLE predicciones (
    id UUID PRIMARY KEY,
    producto_id UUID REFERENCES productos(id),
    fecha_prediccion DATE NOT NULL,
    dias_hasta_reposicion INTEGER,
    cantidad_recomendada INTEGER,
    precision_modelo DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: alertas

```sql
CREATE TABLE alertas_ai (
    id UUID PRIMARY KEY,
    producto_id UUID REFERENCES productos(id),
    tipo_alerta VARCHAR(50) NOT NULL,
    nivel ENUM('critico', 'bajo', 'advertencia') NOT NULL,
    mensaje TEXT,
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Tecnologías

| Componente | Tecnología |
|------------|-----------|
| ML Framework | scikit-learn |
| Predicciones | Regresión lineal / LSTM |
| Detección anomalías | Isolation Forest |
| Base de datos | PostgreSQL |
| API | FastAPI |

---

## Fases de Implementación

### Fase 1: Alertas Básicas
- [ ] Stock bajo
- [ ] Productos por vencer

### Fase 2: Predicciones
- [ ] Predicción de reposición
- [ ] Cantidad recomendada

### Fase 3: Insights
- [ ] Dashboard analítico
- [ ] Reportes automáticos

### Fase 4: ML Avanzado
- [ ] Detección de anomalías
- [ ] Recomendaciones personalizadas
- [ ] Forecasting

---

## Consideraciones

1. **Calidad de datos**: El modelo requiere suficientes datos históricos
2. **Actualización**: Retrain del modelo semanal/mensual
3. **Monitoreo**: Registrar precisión de predicciones
4. **Privacidad**: No almacenar datos sensibles de clientes

---

## Métricas de Éxito

| Métrica | Target |
|---------|--------|
| Precisión predicción stock | > 85% |
| Alertas falsas | < 5% |
| Tiempo de respuesta API | < 500ms |
| Cobertura de productos con predicción | > 80% |

---

## Roadmap de AI

1. **Mes 1-2**: Alertas básicas + Dashboard
2. **Mes 3-4**: Predicciones simples
3. **Mes 5-6**: ML avanzado + Recomendaciones

---

## Referencias

- [scikit-learn](https://scikit-learn.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/)
