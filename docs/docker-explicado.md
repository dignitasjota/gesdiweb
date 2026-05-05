# Docker explicado para el proyecto gesdiweb

Este documento te da el contexto necesario para entender qué hace Docker en este proyecto, cómo encaja con tu Hetzner (Portainer + Nginx Proxy Manager) y qué comandos vas a usar día a día. No pretende ser exhaustivo, sino útil.

---

## 1. Qué es Docker (en una frase)

Docker empaqueta una aplicación junto con todo lo que necesita (sistema operativo mínimo, librerías, runtime, configuración) en una **imagen**. Esa imagen se ejecuta como un **contenedor**, que es como una mini-máquina virtual ultraligera y aislada.

**Analogía:** una imagen es la receta + ingredientes pesados. Un contenedor es el plato cocinado. De una imagen puedes lanzar muchos contenedores idénticos.

---

## 2. Conceptos clave

### Imagen (`image`)

Plantilla inmutable. Se descarga (`docker pull`) o se construye (`docker build`) desde un `Dockerfile`. Ejemplo: `node:22-alpine`, `postgres:16`, `caddy:2`.

Las imágenes se identifican por nombre y tag: `nginx:1.27-alpine`. Sin tag, Docker asume `latest` (mala práctica en producción).

### Contenedor (`container`)

Instancia en ejecución de una imagen. Tiene su propio sistema de archivos efímero, su propia red, sus propios procesos. Cuando lo paras y lo borras, todo lo que estaba dentro **desaparece** salvo lo que hayas montado en volúmenes.

### Volumen (`volume`)

Almacenamiento persistente que sobrevive al contenedor. Se usa para:
- Bases de datos (los datos de Postgres viven en un volumen)
- Uploads de usuarios
- Configuración que quieres preservar entre despliegues

Tipos:
- **Named volume:** Docker lo gestiona (`my_data:/var/lib/postgresql/data`). Recomendado.
- **Bind mount:** mapeas una carpeta del host (`./caddy_data:/data`). Útil para Caddyfile, configs, código en desarrollo.

### Red (`network`)

Los contenedores hablan entre sí por nombre dentro de una red Docker. Si tienes `web` y `directus` en la misma red, `web` puede llamar a `http://directus:8055` sin exponer el puerto al exterior.

**Esto es clave:** solo expones al exterior los puertos que realmente necesitas (80, 443). Postgres, Redis, etc. quedan dentro de la red Docker, invisibles a internet.

### `Dockerfile`

Receta para construir una imagen. Ejemplo simplificado:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### `docker-compose.yml`

Orquesta varios contenedores como un stack. En lugar de lanzar cada contenedor a mano con `docker run`, defines todo en un archivo YAML y lo levantas con `docker compose up`.

Ejemplo conceptual:

```yaml
services:
  web:
    build: ./web
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    volumes:
      - pg_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secreto

volumes:
  pg_data:
```

---

## 3. Cómo encaja con tu Hetzner

Tu servidor Hetzner ya tiene:

- **Portainer:** UI web para gestionar Docker (contenedores, imágenes, volúmenes, stacks). Es Docker con interfaz gráfica.
- **Nginx Proxy Manager (NPM):** reverse proxy con UI gráfica que gestiona dominios y certificados SSL Let's Encrypt automáticamente.

**Cómo va a funcionar gesdiweb:**

```
Internet
   │
   ▼
[Puerto 80/443]
   │
   ▼
┌─────────────────────────┐
│ Nginx Proxy Manager     │
│ - gesdiweb.es      ───┐ │
│ - www.gesdiweb.es ────┤ │
└───────────────────────┼─┘
                        │
                        ▼
              ┌─────────────────┐
              │  Red Docker     │
              │                 │
              │ ┌─────────────┐ │
              │ │   web       │ │  ← Astro estático
              │ │ (nginx)     │ │     servido por nginx
              │ └─────────────┘ │     puerto interno 80
              │                 │
              └─────────────────┘
```

NPM redirige `gesdiweb.es:443` → `web:80` dentro de la red Docker. SSL lo gestiona NPM. El contenedor `web` solo sirve archivos estáticos generados por Astro en build time.

**Lo bueno:** no necesitamos Caddy ni configurar SSL a mano. NPM ya hace ese trabajo y tú lo gestionas desde su panel.

---

## 4. Comandos esenciales

### Día a día

```bash
docker compose up -d              # Levanta el stack en segundo plano
docker compose down               # Para y elimina contenedores (volúmenes se conservan)
docker compose down -v            # Para y elimina TAMBIÉN los volúmenes (CUIDADO: borra datos)
docker compose ps                 # Lista contenedores del stack
docker compose logs -f web        # Ver logs en vivo del servicio "web"
docker compose restart web        # Reinicia un servicio
docker compose build web          # Reconstruye imagen tras cambios
docker compose pull               # Descarga últimas versiones de imágenes
```

### Inspección y debug

```bash
docker ps                         # Todos los contenedores corriendo
docker ps -a                      # Incluyendo parados
docker images                     # Imágenes disponibles
docker volume ls                  # Volúmenes existentes
docker network ls                 # Redes existentes
docker exec -it <container> sh    # Entrar a un contenedor (shell interactivo)
docker logs <container>           # Ver logs
docker stats                      # Uso de CPU/RAM en vivo
```

### Limpieza

```bash
docker system df                  # Cuánto espacio ocupa Docker
docker system prune               # Borra contenedores parados, redes huérfanas, build cache
docker system prune -a            # Lo anterior + imágenes no usadas (agresivo)
docker volume prune               # Borra volúmenes no usados (CUIDADO)
```

---

## 5. Flujo de despliegue de gesdiweb

### Desarrollo local (en tu Mac)

```bash
cd ~/Documents/Desarrollos/gesdiweb
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

- Astro arranca con hot reload en `localhost:4321`
- No necesitamos NPM en local (Astro sirve directamente)

### Producción (en Hetzner)

Opción A — manual desde Portainer:
1. Push del código a GitHub
2. GitHub Actions construye la imagen y la sube a GHCR (GitHub Container Registry)
3. En Portainer, "Stacks" → "gesdiweb" → "Pull and redeploy"

Opción B — automático con webhook:
1. Push a `main`
2. GitHub Actions llama a un webhook de Portainer
3. Portainer hace pull + redeploy sin intervención

Definiremos cuál en Fase 8.

---

## 6. Por qué este enfoque es bueno para SEO y rendimiento

- El contenedor `web` sirve **HTML estático generado en build time** por Astro. No hay PHP, no hay BD viva, no hay procesos lentos en cada request.
- Tiempo de respuesta típico: **< 50ms** desde el servidor.
- nginx interno cachea agresivamente, sirve gzip/brotli, define headers de cache largos para assets con hash.
- Cada despliegue genera una imagen nueva con todo el sitio dentro. Rollback = volver a la imagen anterior. No hay BD que migrar.

---

## 7. Errores comunes y cómo evitarlos

| Síntoma | Causa probable | Solución |
|---|---|---|
| `port is already allocated` | Otro servicio usa el puerto | `lsof -i :80` y matar el proceso, o cambiar puerto en compose |
| Cambios no se reflejan | Imagen cacheada | `docker compose build --no-cache web && docker compose up -d` |
| Datos borrados al recrear contenedor | No estaban en volumen | Mover esa carpeta a un volumen montado |
| `permission denied` en bind mount | UID del contenedor != UID del host | Ajustar permisos o usar named volume |
| Disco lleno | Imágenes/contenedores antiguos acumulados | `docker system prune -a` |

---

## 8. Seguridad básica

- **Nunca** expongas Postgres/Redis al exterior con `ports:`. Solo red interna.
- Variables sensibles en `.env`, **nunca** commiteado al repo.
- Mantén imágenes actualizadas: `docker compose pull && docker compose up -d` mensualmente.
- Firewall del host (UFW): solo 22 (SSH), 80, 443 abiertos al mundo.
- SSH con clave pública, password disabled.

---

## 9. Recursos

- Documentación oficial: https://docs.docker.com/
- Compose spec: https://docs.docker.com/compose/compose-file/
- Portainer docs: https://docs.portainer.io/
- NPM docs: https://nginxproxymanager.com/guide/

---

## 10. Glosario rápido

- **Stack:** conjunto de servicios definido en un `docker-compose.yml`. En Portainer se llaman "Stacks".
- **Service:** una entrada bajo `services:` en el compose. Equivale a un contenedor (o varios si escalas).
- **Tag:** etiqueta de versión de una imagen (`postgres:16` vs `postgres:15`).
- **Layer:** cada instrucción del Dockerfile crea una capa cacheable. Por eso copiamos primero `package.json` y luego el código: aprovechamos el cache de `npm ci` cuando solo cambia el código fuente.
- **GHCR:** GitHub Container Registry. Donde alojaremos las imágenes construidas por GitHub Actions.
