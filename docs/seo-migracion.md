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
| Export CSV de las URLs que rankean (con clics en los últimos 12 meses) | Dueño | ⏳ |
| Export XML/WXR del WordPress actual | Dueño | ⏳ |
| Acceso DNS del dominio | Dueño | ✅ |
| Web nueva pasando Lighthouse 95+ en QA | LLM | ⏳ |
| Lista de URLs que devuelven 200 hoy (`curl` + crawl) | LLM | ⏳ |

## 3. Procedimiento paso a paso

### 3.1 — Inventario de URLs antiguas

Dos fuentes:

1. **Google Search Console** → Performance → Páginas → exportar CSV de últimos 12 meses con clics > 0.
2. **Crawl directo** del dominio actual con `wget --spider --recursive --no-verbose --domains=gesdiweb.es https://gesdiweb.es 2>&1 | grep '^--' | awk '{print $3}' | sort -u`.

Unir ambas listas → fichero `seo/urls-old.txt`.

### 3.2 — Mapeo URLs antiguas → nuevas

Crear `seo/redirects.csv` con columnas: `old_url, new_url, status, notes`.

Reglas:
- Si la URL nueva existe con el mismo slug → `200`, no requiere redirección.
- Si la URL antigua tiene un equivalente claro pero distinto → `301` al equivalente.
- Si la URL antigua no tiene equivalente → **preguntar al dueño** antes de redirigir a la home (anti-patrón SEO).

Ejemplos esperados:

| Antigua | Nueva | Status |
|---|---|---|
| /servicios/posicionamiento-web | /servicios/posicionamiento-web | 200 |
| /servicios/seo | /servicios/posicionamiento-web | 301 |
| /blog/?p=123 | /blog/titulo-real-del-post | 301 |
| /sitemap_index.xml (WP) | /sitemap-index.xml | 301 |

### 3.3 — Implementar redirecciones

**Opción A — En NPM (recomendado):**
- Editar host `gesdiweb.es` en NPM → "Custom Locations" / "Advanced".
- Bloque nginx con `return 301 https://gesdiweb.es$new_path;` por cada regla.

**Opción B — En el contenedor `web`:**
- Añadir bloques `location` en `nginx.conf` con `return 301`.

Preferencia: A si son < 50 reglas, B si son muchas (las metemos versionadas en el repo).

### 3.4 — Migración del contenido del blog

Script Node en `scripts/wp-to-mdx.mjs` que:

1. Lee el WXR exportado.
2. Por cada `<item>` con `post_type=post` y `status=publish`:
   - Convierte HTML del contenido a Markdown con `turndown`.
   - Crea `web/src/content/blog/<slug>.mdx` con frontmatter:
     ```yaml
     ---
     title: ...
     slug: ...
     excerpt: ...
     publishedAt: 2024-...
     author: Jota
     categories: [...]
     tags: [...]
     cover: ./images/<slug>.jpg
     status: published
     lang: es
     ---
     ```
   - Descarga la imagen destacada a `web/public/images/blog/<slug>.<ext>`.
3. Reescribe rutas de imágenes inline a `/images/blog/...`.

Validar manualmente 2-3 posts antes de bulk.

### 3.5 — Switch DNS

1. **TTL bajo previo:** 24 h antes del switch, bajar TTL del registro A de gesdiweb.es a 300 s (5 min).
2. **Día D:**
   - Cambiar A record a `157.180.44.59`.
   - En NPM, mover el host `gesdiweb.es` para que apunte al stack `gesdiweb` en lugar del WordPress (si conviven en el mismo VPS, asegurar bind correcto).
   - Verificar SSL (Let's Encrypt vía NPM).
3. **Verificación inmediata:**
   ```bash
   for url in $(cat seo/urls-old.txt); do
     code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
     echo "$code $url"
   done
   ```
   Todas deberían dar 200 o 301→200. Cero 404.

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

- [ ] Lista URLs antiguas extraída
- [ ] Mapeo old → new revisado por dueño
- [ ] Redirecciones implementadas y probadas en QA
- [ ] Blog migrado a MDX con imágenes
- [ ] Lighthouse 95+ en producción QA
- [ ] DNS TTL bajado a 300s
- [ ] Switch DNS hecho
- [ ] Verificación de 200/301 en todas las URLs
- [ ] Sitemap subido a GSC + Bing
- [ ] Reindexación solicitada para top 20-30
- [ ] Monitorización 30 días configurada
- [ ] Resumen de tráfico antes/después comunicado al dueño
