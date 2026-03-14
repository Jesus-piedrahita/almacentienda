# Dockerfile para Frontend - almacenTienda
# Multi-stage build para optimizar el tamaño de la imagen

# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar bun
RUN npm install -g bun

WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar caché
COPY package.json bun.lock ./

# Instalar dependencias
RUN bun install

# Copiar código fuente
COPY . .

# Build de producción
RUN bun run build

# Stage 2: Servir con Nginx
FROM nginx:alpine AS production

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estáticos del stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
