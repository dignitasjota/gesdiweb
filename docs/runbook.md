# Runbook operativo

> Procedimientos de operación: arrancar local, build, desplegar, hacer rollback, backups, troubleshooting. Documento vivo que se completa a partir de Fase 7.

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

Genera `web/dist/`. Para previsualizar el sitio estático construido:

```bash
npm run preview
```

## 3. Build + ejecución del contenedor en local (test de producción)

```bash
docker build -t gesdiweb-web ./web
docker run --rm -p 8090:80 gesdiweb-web
# abrir http://localhost:8090
```

> Si el puerto 8090 está ocupado, cambiar a otro libre.

## 4. Despliegue en Hetzner (Fase 7+)

> Sin completar todavía. Se llenará al cerrar Fase 7.

**Pre-requisitos:**
- VPS Hetzner `157.180.44.59` con Portainer + NPM corriendo.
- Stack `gesdiweb` creado en Portainer apuntando al `docker-compose.yml` del repo o a la imagen GHCR.
- Dominios `gesdiweb.es` y `www.gesdiweb.es` configurados en NPM.

**Procedimiento previsto:**
1. `git push origin main`
2. GitHub Actions construye imagen, etiqueta `latest` + `sha`, push a `ghcr.io/dignitasjota/gesdiweb-web`.
3. Webhook a Portainer → pull de la imagen → recreate del contenedor `web`.
4. Verificar `https://gesdiweb.es` responde 200 con SSL válido.

## 5. Rollback

> Sin completar todavía.

**Plan:**
- Cada imagen GHCR lleva tag `sha-<commit>`. Para rollback:
  - En Portainer, editar el stack y cambiar la imagen a `ghcr.io/dignitasjota/gesdiweb-web:sha-<commit_anterior>`.
  - Recreate.
- Como el contenido vive en Git, un rollback de imagen revierte también el contenido al commit correspondiente.

## 6. Backups

Como toda la fuente de verdad está en Git, los "backups" son:

- **Repo GitHub** = backup principal.
- **Imágenes en GHCR** = backup de builds.
- **VPS:** snapshot en Hetzner cada noche (configurable desde su panel). Coste mínimo, restauración trivial.
- **Variables `.env` de producción:** copia cifrada en gestor de contraseñas del dueño (no se versiona).

No hay BD que respaldar.

## 7. Troubleshooting

### El sitio no carga

```bash
# En el VPS:
docker ps                                # ¿está el contenedor up?
docker logs gesdiweb_web --tail 50       # logs nginx
curl -I http://gesdiweb_web:80           # desde otro contenedor en npm_default
```

### SSL no se renueva

NPM lo gestiona. En la UI de NPM → host → SSL → "Force renew".

### Build de Astro falla

```bash
cd web
rm -rf node_modules .astro dist
npm install
npm run build
```

Si persiste, comprobar que `vite` no se ha actualizado por encima de 7.x (`grep '"version"' node_modules/vite/package.json`). Si está en 8.x, el override de `package.json` no está funcionando.

### Tailwind no aplica clases

Comprobar que `web/src/styles/globals.css` se importa en `BaseLayout.astro`. Reiniciar el dev server.

### El contenedor está unhealthy

`docker logs gesdiweb_web` y revisar el healthcheck del Dockerfile (`wget -qO- http://localhost/`).

### Error "rolldown" / "tsconfigPaths" en build

Vite 8 (rolldown-vite) está colándose. Forzar Vite 7:

```bash
cd web
rm -rf node_modules package-lock.json
npm install
grep '"version"' node_modules/vite/package.json   # debe ser 7.x
```

## 8. Mantenimiento periódico

| Tarea | Frecuencia |
|---|---|
| `docker system prune` en VPS | Mensual |
| `npm audit` en `web/` | Mensual |
| Update de dependencias menor | Trimestral |
| Update de Astro/Tailwind major | Cuando salga estable + revisar advisories |
| Verificar Lighthouse de producción | Mensual |
| Revisar Search Console por 404 | Semanal el primer mes post-switch, mensual luego |
