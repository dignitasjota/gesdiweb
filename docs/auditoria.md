# Auditorías de calidad

> Procedimientos para verificar SEO, accesibilidad, rendimiento y validez del marcado. Se ejecutan **antes de cualquier despliegue importante** (Fase 7) y **mensualmente** una vez en producción.

---

## 1. Lighthouse (Performance + SEO + Accessibility + Best Practices)

**Objetivo:** ≥ 95 en cada categoría en Home, Servicios (listado y un detalle), Portfolio (listado y un detalle), Blog (listado y un detalle) y Contacto.

### Cómo ejecutar localmente

```bash
# 1. Build de producción
cd web
npm run build

# 2. Levantar servidor real (no dev) — sirve estáticos prerenderizados
node ./dist/server/entry.mjs &
SERVER_PID=$!

# 3. Ejecutar Lighthouse vía CLI (instalación efímera)
npx lighthouse http://localhost:4321/ \
  --output=html \
  --output-path=./lighthouse-home.html \
  --chrome-flags="--headless"

# Repetir para cada URL crítica:
for url in "" "servicios" "servicios/posicionamiento-web" "portfolio" \
           "portfolio/tienda-aceite-ecologico" "blog" \
           "blog/como-mejorar-core-web-vitals" "contacto"; do
  slug=${url:-home}
  npx lighthouse "http://localhost:4321/${url}" \
    --output=html \
    --output-path="./lighthouse-${slug//\//-}.html" \
    --chrome-flags="--headless" \
    --quiet
done

# 4. Parar el servidor
kill $SERVER_PID
```

Abrir cada `lighthouse-*.html` en el navegador.

### Cómo ejecutar en producción

Una vez Fase 7 (despliegue) completada, repetir contra las URLs reales:

```bash
npx lighthouse https://gesdiweb.es/ --output=html --output-path=./lh-prod.html
```

O usar [PageSpeed Insights](https://pagespeed.web.dev/) directamente.

### Métricas objetivo (Core Web Vitals)

| Métrica | Bueno | Necesita mejora | Malo |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5–4s | > 4s |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200–500ms | > 500ms |

Si una métrica está en amarillo o rojo: priorizar arreglarla antes de seguir.

---

## 2. axe-core (Accesibilidad)

**Objetivo:** 0 violaciones críticas, 0 violaciones serias.

### Vía extensión navegador (más rápido)

1. Instalar [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd) en Chrome o Firefox.
2. Abrir cada página crítica del sitio.
3. DevTools → pestaña axe DevTools → "Scan ALL of my page".
4. Revisar resultados, priorizar por severidad.

### Vía CLI (para CI futuro)

```bash
# Levantar el server local
node ./dist/server/entry.mjs &

# Auditar con @axe-core/cli
npx @axe-core/cli http://localhost:4321/ --exit
```

`--exit` devuelve código distinto de 0 si hay violaciones (útil para CI).

### Reglas que aplicamos manualmente además de axe

- **Foco visible** en todos los elementos interactivos (link, button, input).
- **Contraste AA** (4.5:1 texto normal, 3:1 grande). El gris `#a7a7a7` sobre blanco no llega a AA — solo se usa para detalle decorativo, **nunca para texto principal**.
- **Heading hierarchy** sin saltos: una `<h1>` por página, luego `<h2>`, luego `<h3>`.
- **Imágenes con `alt`** descriptivo (vacío `alt=""` solo si decorativas).
- **`prefers-reduced-motion`** respetado (verificable en DevTools → Rendering → Emulate CSS media feature).
- **Formularios** con `<label for>` asociados, errores con `aria-describedby` / `aria-invalid`.
- **Skip-link** "Saltar al contenido" (pendiente de añadir si una auditoría lo pide).

---

## 3. Validación de Schema.org / JSON-LD

**Objetivo:** todos los snippets pasan validación sin warnings.

### Vía herramienta de Google

1. https://search.google.com/test/rich-results
2. Pegar URL en producción o el HTML completo de una página.
3. Verificar que detecta los tipos esperados según la página:

| Página | Tipos esperados |
|---|---|
| Home | `Organization`, `LocalBusiness`, `WebSite` |
| `/servicios` | `WebPage`, `ItemList`, `BreadcrumbList` |
| `/servicios/<slug>` | `Service`, `BreadcrumbList` |
| `/portfolio` | `WebPage`, `ItemList`, `BreadcrumbList` |
| `/portfolio/<slug>` | `CreativeWork`, `BreadcrumbList` |
| `/blog` | `Blog`, `BreadcrumbList` |
| `/blog/<slug>` | `BlogPosting`, `BreadcrumbList` |
| `/contacto` | `ContactPage`, `BreadcrumbList` |
| Páginas legales | `WebPage`, `BreadcrumbList` |

### Validador alternativo (más estricto)

https://validator.schema.org/ — usa el JSON-LD oficial, da errores más detallados.

---

## 4. Validación de Open Graph / Twitter Card

### Open Graph

1. https://www.opengraph.xyz/ — pegar URL, ver preview en FB/LinkedIn/Twitter.
2. https://developers.facebook.com/tools/debug/ (requiere login Facebook) — el más fiable.

Comprobar:
- Imagen 1200×630, no se recorta mal.
- `og:title` y `og:description` se muestran completos.
- `og:url` correcto (canonical).

### Twitter Card

1. https://cards-dev.twitter.com/validator (requiere login X/Twitter).
2. Verificar `summary_large_image`.

---

## 5. Validación de HTML

```bash
npx html-validate dist/client/**/*.html
```

O subir el HTML a [validator.w3.org](https://validator.w3.org/).

---

## 6. Comprobación de enlaces rotos

```bash
# Tras build:
node ./dist/server/entry.mjs &
SERVER_PID=$!

# linkinator recorre todo el sitio buscando 404s
npx linkinator http://localhost:4321 --recurse --silent

kill $SERVER_PID
```

---

## 7. Performance budget

Mantener bajo control:

| Recurso | Tamaño objetivo | Tamaño actual (al cierre Fase 6) |
|---|---|---|
| HTML inicial (gzipped) | < 30 KB | revisar |
| CSS total (gzipped) | < 30 KB | revisar |
| JS inicial (gzipped) | < 50 KB | revisar — solo carga en `/contacto` |
| Imagen LCP | < 200 KB | placeholder, pendiente |
| Tipografías totales | < 100 KB | Bricolage + Inter + JBM Variable subsets |

Si alguno supera el objetivo: investigar antes de aceptarlo.

---

## 8. Cuándo auditar

- ✅ **Antes de cada despliegue importante** (Fase 7 inicial y subsiguientes).
- ✅ **Cuando se añade contenido pesado** (vídeo hero, imágenes grandes).
- ✅ **Cuando se actualiza una dependencia mayor** (Astro, Tailwind, Resend).
- ✅ **Mensualmente** una vez en producción.
- ✅ **Después de cada cambio de Core Web Vitals** detectado en Search Console.

---

## 9. Plantilla para registrar resultados

Crear `docs/auditorias/AAAA-MM-DD.md` con:

```markdown
# Auditoría — AAAA-MM-DD

## Lighthouse (mobile)
- /                            Perf 98 · A11y 100 · BP 100 · SEO 100
- /servicios                   Perf 99 · A11y 100 · BP 100 · SEO 100
- /servicios/posicionamiento-web  Perf 99 · A11y 100 · BP 100 · SEO 100
- /portfolio                   Perf 98 · A11y 100 · BP 100 · SEO 100
- /portfolio/tienda...         Perf 99 · A11y 100 · BP 100 · SEO 100
- /blog                        Perf 99 · A11y 100 · BP 100 · SEO 100
- /blog/como-mejorar-cwv       Perf 99 · A11y 100 · BP 100 · SEO 100
- /contacto                    Perf 96 · A11y 100 · BP 100 · SEO 100

## axe-core
- 0 violaciones críticas
- 0 violaciones serias
- N moderadas: [listar]

## Schema validator
- Todos los tipos esperados detectados ✅

## Open Graph
- Preview correcto en FB / LinkedIn / X ✅

## Acciones derivadas
- (vacío si todo OK)
```
