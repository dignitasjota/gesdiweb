# Runbook operativo

> Procedimientos rápidos para operar la web en el día a día. Si necesitas el procedimiento completo de despliegue inicial, está en [`despliegue.md`](despliegue.md).

---

## 1. Arrancar entorno local de desarrollo

```bash
cd web
npm install              # primera vez o cuando cambien dependencias
npm run dev
```

Astro arranca en `http://localhost:4321` con hot reload. No requiere Docker.

## 2. Build local

```bash
cd web
npm run build
```

Genera `web/dist/client/` (estáticos prerenderizados) y `web/dist/server/` (entry Node + chunks API).

Para previsualizar el build de producción:

```bash
node ./dist/server/entry.mjs
# http://localhost:4321
```

## 3. Build + ejecución del contenedor en local

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml build

RESEND_API_KEY=re_xxx docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  up
# http://localhost:8090
```

Sin `RESEND_API_KEY` el endpoint sigue funcionando (modo dev, log local).

---

## 4. Despliegue a producción

### Despliegue automático (recomendado)

Cualquier push a `main` que toque `web/`, `docker-compose.yml` o `.github/workflows/`:

```bash
git push origin main
```

Hace:
1. GitHub Actions → build → push a GHCR (`ghcr.io/dignitasjota/gesdiweb-web:latest` + `sha-<commit>`).
2. Webhook → Portainer → pull + recreate del contenedor.
3. La web nueva está en producción en ~2-3 minutos.

Verificar:
- GitHub → Actions → último run en verde.
- Portainer → Stacks → `gesdiweb` → último deploy reciente.
- `curl -I https://new.gesdiweb.es` (o `gesdiweb.es` post-Fase 8).

### Despliegue manual (cuando GitHub Actions falla)

Desde el VPS via SSH:

```bash
cd <ruta-de-la-stack>            # típicamente /portainer-stacks/gesdiweb/
docker compose pull              # baja la última imagen de GHCR
docker compose up -d             # recrea el contenedor
docker compose logs -f web       # ver logs
```

---

## 5. Rollback

Cada imagen lleva tag `sha-<commit>`. Para volver atrás:

```bash
# En Portainer:
# - Stack gesdiweb → Editor → Environment variables
# - IMAGE_TAG = sha-abcd1234   (un commit anterior estable)
# - Update the stack

# O desde el VPS:
cd <ruta-stack>
IMAGE_TAG=sha-abcd1234 docker compose up -d --pull always
```

Cuando el fix esté listo, volver a `IMAGE_TAG=latest`.

---

## 6. Backups

### Qué se respalda

| Recurso | Cómo | Frecuencia |
|---|---|---|
| Código + contenido (MDX) | Git en GitHub | Cada commit |
| Imágenes Docker | GHCR | Cada build |
| VPS completo | Snapshots Hetzner | Diario (configurar en panel) |
| `.env` de producción | Gestor de contraseñas (Bitwarden, 1Password) | Manual al cambiar |

### Restore desde snapshot Hetzner

1. Panel Hetzner → Server → Snapshots → "Rebuild" desde el snapshot deseado.
2. El servidor reinicia con el estado anterior.
3. Verificar que Portainer y NPM siguen funcionando.

---

## 7. Variables de entorno

### Las 3 variables críticas en producción

```
RESEND_API_KEY=re_xxxxxxxxxxxx     ← obligatoria
RESEND_FROM_EMAIL=hola@gesdiweb.es ← default si no se define
LEAD_NOTIFICATION_EMAIL=hola@gesdiweb.es
```

Se definen en **Portainer → Stack `gesdiweb` → Environment variables**.

Sin `RESEND_API_KEY` el contenedor arranca pero el formulario de contacto **no envía emails reales** (loguea en consola y devuelve `devMode: true`).

### Cambiar una variable

1. Portainer → Stack → Editor → Environment → editar.
2. Update the stack (Portainer recrea el contenedor con las nuevas vars).
3. Verificar: `docker logs gesdiweb_web --tail 20`.

---

## 8. Logs

### En vivo

```bash
docker logs -f gesdiweb_web
docker logs gesdiweb_web --tail 100
```

### Errores recientes

```bash
docker logs gesdiweb_web --tail 500 2>&1 | grep -iE 'error|warn'
```

### Rotación

Configurada en `docker-compose.yml` con json-file, `max-size: 10m, max-file: 5`. No hace falta intervención manual.

---

## 9. Troubleshooting

### El sitio no carga (502/504 desde NPM)

```bash
# 1. Estado del contenedor
docker compose ps
docker logs gesdiweb_web --tail 50

# 2. ¿Está en la red de NPM?
docker network inspect npm_default | grep gesdiweb_web

# 3. ¿Responde internamente?
docker exec gesdiweb_web wget -qO- http://localhost:4321 | head

# 4. Si todo OK pero NPM falla:
# NPM → host gesdiweb.es → Edit → verificar Forward Hostname (gesdiweb_web) y Port (4321)
```

### SSL no se renueva

NPM lo gestiona. NPM → Hosts → host → SSL → "Force Renew".

Si falla repetidamente, comprobar logs de NPM y rate limit de Let's Encrypt (5 fails/hora/dominio).

### Webhook de GitHub Actions no dispara redeploy

```bash
# Verificar manualmente desde local
curl -fsSL -X POST "$PORTAINER_WEBHOOK_URL"
# Debe responder 204 No Content
```

Si responde 401/404: webhook URL desactualizada. Recuperar de Portainer y actualizar el secret en GitHub.

### Build de Astro falla en GitHub Actions

Lo más común: dependencias rotas tras una actualización mayor. Reproducir local:

```bash
cd web
rm -rf node_modules package-lock.json .astro
npm install
npm run build
```

Si pasa local pero falla en CI: comprobar logs de Actions, suele ser caché obsoleto. Re-correr el workflow desde la UI.

### "Missing field tsconfigPaths" en build

Vite 8 (rolldown-vite) se ha colado pese al override. Solución:

```bash
cd web
rm -rf node_modules package-lock.json
npm install
grep '"version"' node_modules/vite/package.json   # debe ser 7.x
```

### Tailwind no aplica clases

Comprobar que `web/src/styles/globals.css` se importa en `BaseLayout.astro`. Reiniciar dev server con `Ctrl+C` y `npm run dev`.

### Resend devuelve 403/422

- 403: API key inválida o sin permisos. Regenerar en https://resend.com/api-keys.
- 422: dominio no verificado o `from` no coincide. Resend → Domains → re-verificar.

### Reveals no aparecen / sitio se ve vacío

Probable: JS no carga o IntersectionObserver falla. Inspector → Console:

```js
document.querySelectorAll('[data-reveal].is-visible').length
// > 0 si algunos reveals dispararon
```

Si es 0 con elementos en pantalla: error en `SmoothScroll.astro`, revisar console errors.

---

## 10. Mantenimiento periódico

| Tarea | Frecuencia |
|---|---|
| `docker system prune` en VPS | Mensual |
| `npm audit` en `web/` | Mensual |
| Update de dependencias menores | Trimestral |
| Update de Astro/Tailwind major | Cuando salga estable + revisar advisories |
| Lighthouse de producción | Mensual |
| Revisar Search Console por 404 | Semanal el primer mes post-switch, mensual luego |
| Verificar que los snapshots Hetzner funcionan | Trimestral (test restore en VPS desechable) |

---

## 11. Operaciones puntuales

### Añadir un nuevo dominio o subdominio

1. DNS: añadir A record apuntando a `157.180.44.59`.
2. NPM: nuevo Proxy Host con SSL Let's Encrypt.
3. Verificar `curl -I https://nuevo.gesdiweb.es`.

### Cambiar el VPS (migración a 64GB)

Documentar el procedimiento aquí cuando se haga. Idea general:
1. Instalar Docker + Portainer + NPM en el nuevo VPS.
2. Crear la stack `gesdiweb` con las mismas env vars.
3. Bajar TTL del DNS.
4. Cambiar IPs en los A records.
5. Apagar el VPS antiguo tras 24h sin tráfico.

### Promocionar el dominio principal (Fase 8)

Procedimiento completo en [`seo-migracion.md`](seo-migracion.md).
