# syntax=docker/dockerfile:1.7

# ───────────────────────────────────────────────────────────────
# Etapa 1 — Build con Node
# ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias (capa cacheable)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar el código y construir
COPY . .
RUN npm run build

# ───────────────────────────────────────────────────────────────
# Etapa 2 — Runtime con nginx ultraligero
# ───────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Configuración nginx custom (gzip, headers de cache, etc.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el sitio estático generado
COPY --from=builder /app/dist /usr/share/nginx/html

# Healthcheck básico
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
