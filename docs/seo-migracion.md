# Plan de migración SEO

> Documento que se ejecuta en **Fase 8**. Hasta entonces sirve como referencia: define el procedimiento exacto para no perder posicionamiento al sustituir la WordPress antigua por la nueva web.

---

## 1. Estado actual de partida

- **Web actual:** WordPress en `https://gesdiweb.es`. Tráfico orgánico bajo pero existente.
- **Web nueva:** Astro estático, desplegada bajo dominio temporal en Hetzner durante Fase 7 para QA.
- **Cuando ambas existan en paralelo**, hacemos el switch DNS (este documento).

## 2. Pre-requisitos antes de iniciar Fase 8

| Item | Quién lo aporta | Estado |
|---|---|---|
| Acceso a Google Search Console de gesdiweb.es | Dueño | ⏳ |
| Export CSV de las URLs que rankean (informe "Páginas", últimos 12 meses) | Dueño | ⏳ |
| Blog migrado a MDX | — | ✅ (69 posts importados vía REST API; imágenes en `web/src/content/blog/imagenes/`) |
| Mapa de 301 inicial | — | ✅ parcial (`docs/redirecciones-301.md`; falta cruzarlo con GSC) |
| Tooling de migración (crawl, validador, verificador) | — | ✅ (`web/scripts/*`, ver §3) |
| Acceso DNS del dominio | Dueño | ✅ |
| Web nueva pasando Lighthouse 95+ en QA | Dueño | ⏳ (requiere el subdominio QA en vivo) |
| Inventario de URLs 200 del sitio actual | — | ⏳ (ejecutar `npm run crawl:old`) |

> ⚠️ **Estado de la WP actual (jul-2026):** el certificado TLS de `gesdiweb.es`
> está **caducado** (`CERT_HAS_EXPIRED`) y el dominio canonicaliza a **www**. Por
> eso el crawler y el verificador se ejecutan con `--insecure` mientras dure. No
> afecta al switch, pero convendría renovarlo o ignorarlo hasta el corte.

## 3. Procedimiento paso a paso

### 3.1 — Inventario de URLs antiguas

Dos fuentes que se unen:

1. **Google Search Console** → Rendimiento → pestaña **Páginas** → Exportar → CSV.
   Son las URLs que **realmente rankean** (las que no pueden dar 404 tras el switch).
2. **Crawl del sitio actual** con el script del repo (sigue enlaces + siembra desde
   el sitemap de WP):

   ```bash
   cd web
   npm run crawl:old -- --insecure          # → seo/urls-old.txt (URLs 200 de hoy)
   ```

   (`--insecure` porque el cert de la WP está caducado; ver aviso en §2.)

Unir ambas listas es la base del mapeo. El crawl encuentra páginas que quizá no
rankeen pero existen; GSC encuentra las que rankean aunque no estén enlazadas.

### 3.2 — Mapeo URLs antiguas → nuevas

El mapa vive en **`docs/redirecciones-301.md`** (tabla `old → new` + bloque nginx
listo para NPM). Ya está la base (posts del blog + landings de servicio + home).

Para completarlo y validarlo contra el tráfico real:

```bash
cd web
npm run redirects:check -- ../ruta/al/export-gsc.csv
```

El validador (`scripts/validate-redirects.mjs`) cruza GSC + el mapa + el inventario
real de URLs del sitio nuevo y reporta, ordenado por tráfico, **las URLs que rankean
sin redirección ni equivalente** (darían 404) y las redirecciones a un destino que no
existe. Cada URL crítica que salga: añadir su 301 al mapa o descartarla si ya no aplica.

Reglas:
- URL nueva con el mismo slug → **200**, no requiere redirección.
- Equivalente claro pero distinto → **301** al equivalente (documentado en el mapa).
- Sin equivalente → **preguntar al dueño**; preferible un 404/410 limpio antes que
  redirigir a la home (anti-patrón SEO).

Patrones estructurales de WP (categorías, tags, paginación, sitemaps antiguos) →
sección "Redirecciones estructurales" de `docs/redirecciones-301.md`.

### 3.3 — Implementar redirecciones

**En Nginx Proxy Manager** (no hay nginx interno; el contenedor es Node standalone):
Proxy Host de `gesdiweb.es` → pestaña **Advanced** → *Custom Nginx Configuration* →
pegar el bloque nginx de `docs/redirecciones-301.md`. El `www → no-www` y `http →
https` se gestionan en la pestaña SSL del propio host. Ver también las cabeceras de
seguridad en `docs/despliegue.md §7.3`.

### 3.4 — Migración del contenido del blog · ✅ HECHO

Los **69 posts** ya están en `web/src/content/blog/*.md`, importados del WordPress
vía su REST API (no se usó WXR/turndown). Las imágenes viven en
`web/src/content/blog/imagenes/<slug>/` y se referencian con rutas relativas.
Los enlaces internos que apuntaban a permalinks WP antiguos ya fueron reescritos a
rutas relativas del sitio nuevo. Nada pendiente aquí salvo aportar, si se quiere,
fechas de modificación reales (`updatedAt`) para mejorar la señal de frescura.

### 3.5 — Switch DNS

1. **TTL bajo previo:** 24 h antes del switch, bajar TTL del registro A de gesdiweb.es a 300 s (5 min).
2. **Día D:**
   - Cambiar A record a `157.180.44.59`.
   - En NPM, mover el host `gesdiweb.es` para que apunte al stack `gesdiweb` en lugar del WordPress (si conviven en el mismo VPS, asegurar bind correcto).
   - Verificar SSL (Let's Encrypt vía NPM).
3. **Verificación inmediata** con el script del repo:
   ```bash
   cd web
   npm run verify:migration -- ../seo/urls-old.txt
   ```
   Recorre todas las URLs antiguas y las clasifica: 200 directo, 301/302 → 200, o
   ✗ 404/5xx/error. **Sale con código 1 si hay algún 404 o 5xx**, así que sirve de
   gate del switch. Cero 404 = OK.

   > También sirve **antes** del switch para probar contra el QA sin tocar DNS:
   > `npm run verify:migration -- ../seo/urls-old.txt --base https://new.gesdiweb.es`
   > (reescribe el host de cada URL al del QA).

### 3.6 — Reindexación

1. Subir nuevo `sitemap-index.xml` a Google Search Console y Bing Webmaster Tools.
2. Solicitar reindexación de las 20-30 URLs más importantes (las de mayor tráfico) desde "Inspección de URL" → "Solicitar indexación".
3. Verificar que `robots.txt` no bloquea nada relevante.

### 3.7 — Monitorización post-switch (30 días)

- **Search Console diario** durante 7 días, semanal el resto del mes:
  - Errores 4xx/5xx en "Cobertura".
  - Caída de impresiones/clics.
  - Páginas excluidas que antes estaban indexadas.
- **uptimerobot o similar** apuntando a 5 URLs clave.
- **404 log:** revisar logs nginx semanalmente. Cualquier 404 frecuente → añadir 301.

### 3.8 — Plan de contingencia

Si en las primeras 48 h hay caída > 30% de tráfico orgánico:
1. Capturar logs.
2. Auditar errores 4xx/5xx.
3. Si causa raíz no se identifica en 24 h: rollback DNS al WordPress antiguo, debug, reintentar.

---

## 4. Checklist final de Fase 8

- [x] Blog migrado a MDX con imágenes
- [x] Mapa de 301 inicial creado (`docs/redirecciones-301.md`)
- [x] Tooling listo (crawl, validador, verificador)
- [ ] Export de GSC obtenido (dueño)
- [ ] Inventario de URLs antiguas extraído (`npm run crawl:old`)
- [ ] Mapa cruzado y validado contra GSC (`npm run redirects:check`) — cero críticas
- [ ] Mapeo old → new revisado por dueño
- [ ] Redirecciones implementadas en NPM y probadas contra QA (`verify:migration --base`)
- [ ] Lighthouse 95+ en producción QA
- [ ] DNS TTL bajado a 300s
- [ ] Switch DNS hecho
- [ ] Verificación 200/301 en todas las URLs (`npm run verify:migration`) — cero 404
- [ ] Sitemap subido a GSC + Bing
- [ ] Reindexación solicitada para top 20-30
- [ ] Monitorización 30 días configurada
- [ ] Resumen de tráfico antes/después comunicado al dueño
