# syntax=docker/dockerfile:1.7

# ───────────────────────────────────────────────────────────────
# Etapa 1 — Build con Node
# ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Dependencias (capa cacheable)
COPY package.json package-lock.json ./
RUN npm ci

# Código y build (genera dist/client + dist/server)
COPY . .
RUN npm run build

# ───────────────────────────────────────────────────────────────
# Etapa 2 — Runtime: solo dependencias de producción + dist
# ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Solo dependencias de producción
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar el output de build (cliente estático + server entrypoint)
COPY --from=builder /app/dist ./dist

# Healthcheck contra el server de Astro
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4321/ > /dev/null || exit 1

EXPOSE 4321

# Servidor Astro Node standalone. Sirve estáticos + API.
CMD ["node", "./dist/server/entry.mjs"]
