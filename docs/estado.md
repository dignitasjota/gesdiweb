# Estado del proyecto

> **Snapshot dinámico.** Se actualiza al cerrar cada fase. Si entras nuevo al proyecto, este documento te dice **dónde estamos exactamente y qué hacer ahora**.

**Última actualización:** 2026-05-05
**Última fase cerrada:** Fase 3 — Content collections + MDX
**Fase en curso:** ninguna (esperando OK del dueño para iniciar Fase 4)

---

## Resumen rápido

```
✅ Fase 0  Setup base                   [completada 2026-05-05]
✅ Fase 1  Sistema de diseño            [completada 2026-05-05]
✅ Fase 2  Páginas estáticas            [completada 2026-05-05]
✅ Fase 3  Content collections (MDX)    [completada 2026-05-05]
⏳ Fase 4  Formulario + Resend          [siguiente — esperando OK]
⏳ Fase 5  Animaciones y pulido
⏳ Fase 6  SEO técnico y performance
⏳ Fase 7  Despliegue Hetzner
⏳ Fase 8  Migración SEO + switch DNS
```

---

## Lo que está funcionando ahora mismo

- Repo `github.com/dignitasjota/gesdiweb` con `main` pusheada.
- `npm run build` produce **22 páginas estáticas** en ~1s.
- Todo el contenido vive ahora en **MDX dentro de `src/content/`**:
  - `services/*.mdx` (5 archivos)
  - `portfolio/*.mdx` (5 archivos, con cuerpo MDX para caso de estudio)
  - `blog/*.mdx` (3 archivos, con cuerpo Markdown real)
- Schemas Zod en `src/content.config.ts` — un MDX con frontmatter inválido rompe el build.
- Helpers async en `src/lib/collections.ts` con la misma API que los antiguos `src/data/*` (drop-in replacement).
- Sistema de diseño completo, iconografía SVG, smooth scroll, formulario maquetado.

## Cómo editar contenido ahora

```bash
# Crear/editar un post
edit src/content/blog/mi-nuevo-post.mdx

# Frontmatter mínimo:
---
title: "Mi título"
excerpt: "Resumen 1-2 frases"
publishedAt: 2026-06-01
readingMinutes: 5
categories: ["SEO técnico"]
tags: ["rendimiento"]
---

Aquí va el contenido en Markdown/MDX.

## Subtítulos

Texto con **negrita**, [enlaces](https://...), listas, etc.
```

Con el dev server corriendo (`npm run dev`), el cambio se ve al instante.

Lo mismo para `services/` (sin body, solo frontmatter) y `portfolio/` (frontmatter + cuerpo del caso de estudio).

## Lo que NO está hecho todavía

- Imágenes reales en covers de portfolio/blog → covers siguen marcados `[PLACEHOLDER]`.
- Foto del fundador, logos de clientes, datos legales → pendiente de aportar por dueño.
- Envío real del formulario de contacto vía Resend → Fase 4.
- Animaciones reveal/parallax/transiciones de página → Fase 5.
- JSON-LD por tipo de página, OG images dinámicas → Fase 6.
- Lighthouse 95+ verificado → Fase 6.
- Despliegue producción → Fase 7.
- Redirecciones 301 y migración del WordPress → Fase 8.

## Dependencias bloqueadas a información del dueño

Mismas que en Fase 2. Ver tabla en `docs/estado.md` previo si hace falta. Lo más urgente para Fase 4: **acceso DNS para SPF + DKIM + DMARC** y verificación del dominio en Resend.

---

## Detalle de Fase 3 (cerrada)

**Commits añadidos en `main`:**

```
(pendientes de hacer en este push)
chore(web): instalar @astrojs/mdx 5.0.4 y registrar integración
feat(web): content collections con Zod (services, portfolio, blog)
feat(web): migrar 5 services + 5 projects + 3 posts a MDX
feat(web): helpers src/lib/collections.ts (async wrappers sobre getCollection)
refactor(web): consumidores usan getCollection — eliminado src/data/
```

**Archivos creados:**

- `web/src/content.config.ts` — schemas Zod por colección
- `web/src/content/services/*.mdx` — 5 servicios
- `web/src/content/portfolio/*.mdx` — 5 proyectos con cuerpo de caso de estudio
- `web/src/content/blog/*.mdx` — 3 posts con cuerpo Markdown real
- `web/src/lib/collections.ts` — `getOrderedServices()`, `getAllProjects()`, `getFeaturedProjects()`, `getProjectById()`, `getServiceById()`, `getAllPosts()`, `getRecentPosts()`, `getPostById()`, `formatDateLong()`, `isoDate()`

**Archivos eliminados:**

- `web/src/data/services.ts`, `projects.ts`, `posts.ts` (sustituidos por MDX)

**Archivos modificados:**

- `web/astro.config.mjs` — añade `mdx()` integration
- `web/src/components/sections/ServicesNumberedList.astro`
- `web/src/components/sections/PortfolioFeatured.astro`
- `web/src/components/sections/BlogRecent.astro`
- `web/src/pages/servicios/index.astro` y `[slug].astro`
- `web/src/pages/portfolio/index.astro` y `[slug].astro`
- `web/src/pages/blog/index.astro` y `[slug].astro` (con prosa MDX renderizada vía `<Content />` y estilos `.post-body`)
- `web/src/pages/contacto.astro` (select de servicios)

**Validación cumplida:**
- 22 páginas, mismas URLs que antes.
- Sitemap inalterado.
- Posts del blog ahora con contenido MDX real (no placeholder).

---

## Próximo paso concreto

Cuando el dueño dé luz verde para Fase 4:

1. Crear endpoint `src/pages/api/contact.ts` que reciba POST y envíe email vía Resend.
2. Validar payload con Zod (mismo schema del formulario).
3. Honeypot anti-spam + rate limit (cookie/IP simple).
4. Conectar el formulario `<form data-contact-form>` al endpoint con JS mínimo (`client:idle`).
5. Estados UI: enviando, éxito, error con `aria-live`.
6. Verificar dominio gesdiweb.es en Resend (SPF/DKIM/DMARC).
7. Variables `.env`: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL`.

---

## Notas de sesiones

### 2026-05-05 — Fase 3
Migración a content collections. Para no reescribir cada consumer, creé helpers async (`src/lib/collections.ts`) con misma firma que los antiguos `src/data/*`. Los `id` de las entries equivalen al antiguo `slug` (filename sin extensión). Posts del blog ya tienen contenido Markdown real (no placeholder) — bueno para validar el rendering MDX y los estilos de prosa.

Decisión menor: estilos de prosa en `<style is:global>` por página (post detail y portfolio detail) en lugar de Tailwind Typography. Razón: control fino de la jerarquía editorial sin añadir 70KB de plugin Typography.
