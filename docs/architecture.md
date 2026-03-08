# Arquitectura del Sistema

---

## Descripción General

Sistema de Gestión de Inventario para Tienda — Aplicación web full-stack para controlar inventario, ventas, caja y usuarios.

---

## Arquitectura General

```
Usuario
   ↓
Frontend (React + TypeScript + Vite  + bun)
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

---

## Stack Tecnológico

### Frontend

| Tecnología | Propósito |
|-------------|-----------|
| React 19 | UI Framework |
| TypeScript | Tipado estático |
| Vite | Build tool |
| bun          | manejador de paquetes
| TailwindCSS | Estilos |
| shadcn       | Estilos y componentes
| sass         | Estilos y layout
| React Query | Estado servidor |
| Zustand | Estado cliente |
| Axios | HTTP client |
| React Router | Routing |
| Zod | Validación |

### Backend

| Tecnología | Propósito |
|------------|-----------|
| FastAPI | Framework |
| Uvicorn | Servidor ASGI |
| SQLAlchemy | ORM |
| Pydantic | Validación |
| JWT | Autenticación |
| PyMySQL | Driver MySQL |

### Infraestructura

| Tecnología | Propósito |
|------------|-----------|
| Docker | Contenedores |
| Docker Compose | Orquestación |
| PostgreSQL | Base de datos |
| Git | Control de versiones |

---

## Estructura del Proyecto

```
almacenTienda/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── api/
│   └── ...
├── backend/          # FastAPI app
│   ├── app/
│   │   ├── routers/  # rutas de la api
|   |   ├── services/ # lógica de negocio
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repository/CRUD/  # extracción e inyección en DB
│   │   └── utils/
│   ├── alembic/      # Migraciones
│   └── ...
├── docker-compose.yml
└── README.md
```

---

## Flujo de Datos

### Request
```
Usuario → Frontend → Axios → FastAPI → Services → SQLAlchemy → PostgreSQL
```

### Response
```
PostgreSQL → SQLAlchemy → FastAPI → Frontend → Interfaz
```

---

## Autenticación

- JWT (JSON Web Tokens)
- Tokens en headers Authorization
- Refresh tokens para sesiones largas

---

## Seguridad

- Passwords encriptadas (bcrypt)
- Validación de entrada con Pydantic
- CORS configurado
- Rate limiting opcional
