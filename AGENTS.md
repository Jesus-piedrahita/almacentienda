# almacenTienda Frontend - Repository Guidelines

---

## Reglas y Normas del Proyecto Frontend

### Cómo Usar Esta Guía

- Esta guía contiene las normas específicas para el desarrollo del frontend de almacenTienda.
- Este proyecto usa React 19 + TypeScript + Vite + bun.
- Para normas generales del proyecto, consultar el `AGENTS.md` raíz en el directorio padre.

### Normas Generales de Desarrollo Frontend

1. **Memoria Persistente (Engram)**: Antes de iniciar cualquier tarea, BUSCAR en Engram para actualizar contexto de sesiones previas. DESPUÉS de completar trabajo significativo, GUARDAR observación. Al finalizar sesión, generar session_summary.
2. **Documentación**: Todo archivo `.md` debe incluir un diagrama de flujo en Mermaid para explicar la idea/concepto.
3. **TypeScript**: Usar tipos `const`, interfaces planas y tipos utilitarios. Nunca usar `any`.
3. **React 19**: Usar React Compiler cuando sea posible. Evitar `useMemo`/`useCallback` prematura.
4. **Estado Cliente**: Usar Zustand para estado global, React Query para estado servidor.
5. **Estado Servidor**: Usar React Query para fetching, caching y sincronización.
6. **Estilos**: Usar TailwindCSS + shadcn/ui. Evitar `var()` en className. Usar función `cn()` para combinar clases.
7. **Validación**: Usar Zod para validación de esquemas.
8. **HTTP**: Usar Axios para peticiones HTTP.
9. **Routing**: Usar React Router.
10. **Commits**: Seguir conventional-commits: `<tipo>[alcance]: <descripción>`.

---

## Engram - Memoria Persistente

El proyecto usa Engram para persistir contexto entre sesiones. Toda acción significativa debe registrarse.

### Cuándo GUARDAR (mem_save)
- Decisiones de arquitectura o diseño
- Bug fixes completados
- Patrones establecidos (naming, estructura, convenciones)
- Cambios de configuración o setup
- Descubrimientos importantes sobre el codebase

### Cuándo BUSCAR (mem_search)
- Cuando el usuario menciona algo del pasado ("recordar", "qué hicimos")
- Al iniciar trabajo que podría haber sido hecho antes
- Cuando el usuario menciona un tema sin contexto previo

### Cómo USAR
```typescript
// Guardar observación
mem_save({
  title: "Título corto y buscable",
  content: "**What**: qué se hizo\n**Why**: motivación\n**Where**: archivos afectados\n**Learned**: gotchas o decisiones",
  type: "architecture|bugfix|pattern|decision",
  project: "almacenTienda"
})

// Buscar en memoria
mem_search({ query: "palabras clave", project: "almacenTienda" })

// Resumen de sesión
mem_session_summary({
  content: "## Goal\n## Instructions\n## Discoveries\n## Accomplished\n## Relevant Files",
  project: "almacenTienda"
})
```

---

## Available Skills

### Habilidades Genéricas (Frontend)

| Habilidad | Descripción | URL |
|-----------|-------------|-----|
| `typescript` | Const types, flat interfaces, utility types | [SKILL.md](./.agents/skills/typescript/SKILL.md) |
| `react-19` | React 19 patterns, React Compiler | [SKILL.md](./.agents/skills/react-19/SKILL.md) |
| `zustand-5` | Zustand 5 state management patterns | [SKILL.md](./.agents/skills/zustand-5/SKILL.md) |
| `axios` | HTTP client patterns and best practices | [SKILL.md](./.agents/skills/axios/SKILL.md) |
| `react-query` | Server state management, caching, invalidation | (pendiente) |
| `tailwind-4` | cn() utility, no var() in className | (pendiente) |
| `zod` | Schema validation for TypeScript | (pendiente) |
| `react-router` | Routing patterns | (pendiente) |
| `shadcn` | UI component patterns | (pendiente) |
| `testing` | Unit and E2E testing patterns | (pendiente) |
| `tdd` | Test-Driven Development workflow | (pendiente) |
| `frontend-design` | Production-grade frontend interfaces | [SKILL.md](./.agents/skills/frontend-design/SKILL.md) |
| `frontend-design-system` | UI designs with design tokens | [SKILL.md](./.agents/skills/frontend-design-system/SKILL.md) |
| `frontend-ui-animator` | UI animations for React | [SKILL.md](./.agents/skills/frontend-ui-animator/SKILL.md) |

### Habilidades Específicas del Frontend

| Habilidad | Descripción | URL |
|-----------|-------------|-----|
| `almacen-frontend` | Frontend React patterns for almacenTienda | [SKILL.md](./.agents/skills/almacen-frontend/SKILL.md) |
| `almacen-auth-frontend` | JWT authentication patterns (frontend) | [SKILL.md](./.agents/skills/almacen-auth-frontend/SKILL.md) |
| `almacen-inventory-ui` | Inventory management UI components | [SKILL.md](./.agents/skills/almacen-inventory-ui/SKILL.md) |
| `almacen-sales-ui` | Sales and POS UI components | [SKILL.md](./.agents/skills/almacen-sales-ui/SKILL.md) |
| `almacen-reports-ui` | Reports and analytics UI | [SKILL.md](./.agents/skills/almacen-reports-ui/SKILL.md) |

---

## Auto-invoke Skills

Al realizar estas acciones en el frontend, SIEMPRE invocar la habilidad correspondiente PRIMERO:

| Tipo de Acción | Habilidad a Invocar |
|----------------|---------------------|
| Escribir componentes React | `react-19` |
| Escribir tipos TypeScript | `typescript` |
| Usar Zustand stores | `zustand-5` |
| Realizar HTTP requests | `axios` |
| Crear/modificar estados servidor | `react-query` |
| Validar schemas | `zod` |
| Aplicar estilos | `tailwind-4` |
| Crear rutas | `react-router` |
| Usar componentes UI | `shadcn` |
| Diseñar interfaces UI | `frontend-design` |
| Crear design system | `frontend-design-system` |
| Agregar animaciones | `frontend-ui-animator` |
| Implementar autenticación | `almacen-auth-frontend` |
| Crear UI de inventario | `almacen-inventory-ui` |
| Crear UI de ventas | `almacen-sales-ui` |
| Crear UI de reportes | `almacen-reports-ui` |
| Escribir tests | `testing` |
| Implementar características | `tdd` |

---

## Project Overview

**almacenTienda Frontend** es la interfaz de usuario del sistema de gestión de inventario para tienda.

### Componente

| Componente | Ubicación | Tech Stack |
|------------|-----------|------------|
| Frontend | `./src/` | React 19, TypeScript, Vite, bun, TailwindCSS, shadcn, React Query, Zustand, Axios, React Router |

---

## Estructura del Proyecto Frontend

```
almacenTienda/
├── src/
│   ├── components/      # Componentes React
│   │   ├── ui/         # Componentes base (shadcn)
│   │   └── ...
│   ├── pages/          # Páginas de la aplicación
│   ├── hooks/          # Custom hooks
│   ├── stores/         # Zustand stores
│   ├── api/            # Configuración Axios, endpoints
│   ├── lib/            # Utilidades
│   ├── types/          # Tipos TypeScript
│   └── ...
├── .agents/
│   └── skills/         # Habilidades específicas
├── dist/              # Build de producción
└── ...
```

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun run dev

# Build de producción
bun run build

# Linting
bun run lint
```

---

## Commit & Pull Request Guidelines

Seguir el estilo conventional-commit: `<tipo>[alcance]: <descripción>`

**Tipos:** `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`

Antes de crear un PR:

1. Completar checklist en `.github/pull_request_template.md`
2. Ejecutar todos los tests y linters relevantes
3. Incluir capturas de pantalla para cambios de UI

---

## How to Use

Cargar una habilidad cuando empieces a trabajar en tareas relacionadas:

```
Load skill: {skill-name}
```

Ejemplo:
```
Load skill: react-19
Load skill: typescript
```
