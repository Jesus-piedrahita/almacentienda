# Configuración Docker

---

## Estructura

```
almacenTienda/
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
├── .env
└── ...
```

---

## docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend React
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000/api/v1
    volumes:
      - ./src:/app/src
    depends_on:
      - backend

  # Backend FastAPI
  backend:
    build:
      context: ./backend
      dockerfile: ../Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/almacentienda
      - SECRET_KEY=your-secret-key
    volumes:
      - ./backend:/app
    depends_on:
      - db
    command: uvicorn app.main:app --host 0.0.0.0 --reload

  # Base de datos PostgreSQL
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=almacentienda
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # pgAdmin (opcional, para administración de DB)
  pgadmin:
    image: dpage/pgadmin4
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@admin.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      - db

volumes:
  postgres_data
  pgadmin_data
```

---

## Dockerfile.frontend

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero para cache
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 5173

# Comando para desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

---

## Dockerfile.backend

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requerimientos
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando para desarrollo
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--reload"]
```

---

## .env

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/almacentienda

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Frontend
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Comandos

### Iniciar todos los servicios

```bash
docker-compose up -d
```

### Ver logs

```bash
docker-compose logs -f
```

### Detener servicios

```bash
docker-compose down
```

### Reconstruir contenedores

```bash
docker-compose build --no-cache
```

### Acceder a la DB desde terminal

```bash
docker-compose exec db psql -U postgres -d almacentienda
```

---

## Puertos

| Servicio | Puerto |
|----------|--------|
| Frontend | 5173 |
| Backend | 8000 |
| PostgreSQL | 5432 |
| pgAdmin | 5050 |

---

## Desarrollo

### Modo desarrollo

```bash
# Iniciar solo la base de datos
docker-compose up -d db

# Iniciar backend localmente
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Iniciar frontend localmente
npm run dev
```

### Producción

```bash
# Build de producción
docker-compose -f docker-compose.prod.yml build

# Ejecutar en producción
docker-compose -f docker-compose.prod.yml up -d
```

---

## Estructura de directorios para Docker

```
almacenTienda/
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
├── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
└── backend/
    ├── app/
    │   ├── routers/
    │   ├── models/
    │   ├── schemas/
    │   └── main.py
    ├── requirements.txt
    └── ...
```

---

## Notas

1. **Puertos en uso**: Verificar que los puertos 5173, 8000, 5432, 5050 estén disponibles
2. **Volúmenes**: Los datos de PostgreSQL persisten en el volumen `postgres_data`
3. **pgAdmin**: Opcional, útil para administración visual de la DB
4. **Seguridad**: Cambiar SECRET_KEY y passwords en producción
