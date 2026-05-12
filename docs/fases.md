# Plan de fases

> Cada fase tiene un **punto de validación** obligatorio. **No se avanza sin OK explícito del dueño.** Al cerrar una fase, escribir resumen + estado + siguientes pasos en `docs/estado.md` y esperar luz verde.

Estado global:

| # | Fase | Estado |
|---|---|---|
| 0 | Setup base | ✅ Completada (2026-05-05) |
| 1 | Sistema de diseño v1 | ✅ Completada (2026-05-05) — **sustituida por rediseño "Claude Design" (2026-05-12)** |
| 2 | Páginas estáticas y maquetación | ✅ Completada (2026-05-05) — rediseñadas en 2026-05-12 |
| 3 | Content collections (MDX) | ✅ Completada (2026-05-05) |
| 4 | Formulario de contacto + Resend | ✅ Completada (2026-05-05) — rediseño form con chips (2026-05-12) |
| 5 | Animaciones y pulido | ✅ Completada (2026-05-05) — animaciones decorativas reescritas en CSS puro (2026-05-12) |
| 6 | SEO técnico y performance | ✅ Completada (2026-05-05) · OG per-entry añadido (2026-05-06) |
| 🔁 | **Rediseño "Claude Design"** | ✅ Completado 2026-05-12 (5 fases A–E + blog v3) |
| 7 | Despliegue en VPS Hetzner | 🟡 Artefactos listos · ejecución pendiente del dueño |
| 8 | Migración SEO y switch DNS | 🟡 Adelanto parcial: blog WP importado (69 posts) · pendiente 301s + switch DNS |

> **Cambio respecto al briefing original:** el briefing tenía 9 fases incluyendo "Fase 1: Configuración de Directus". Como Directus se descartó (ADR-001), esa fase desaparece y las siguientes se renumeran.

---

## Fase 0 — Setup base ✅

**Hecho:**
- Repo Git inicializado y conectado a `github.com/dignitasjota/gesdiweb`.
- Estructura de carpetas (`web/`, `docs/`, configs raíz).
- Astro 6.2.2 + Tailwind 4.1 funcionando. `npm run build` produce HTML estático.
- BaseLayout con meta SEO base, OG, Twitter, canonical.
- Página `index.astro` placeholder con paleta corporativa.
- Sitemap automático, `robots.txt`, favicon SVG.
- Dockerfile multi-stage (node 22 build → nginx 1.27 alpine).
- `nginx.conf` con gzip, cache headers, headers de seguridad.
- `docker-compose.yml` (red `npm_default` para Hetzner) y `docker-compose.dev.yml`.
- `.env.example` con variables previstas.
- Documentación: `CLAUDE.md`, `docs/briefing.md`, `docs/fases.md`, `docs/decisiones.md`, `docs/arquitectura.md`, `docs/convenciones.md`, `docs/docker-explicado.md`, `docs/runbook.md`, `docs/seo-migracion.md`, `docs/estado.md`.
- Verificación: `docker build` ✅, `docker run` + `curl localhost:8090` → HTTP 200 con HTML correcto.
- 4 commits atómicos pusheados a `origin/main`.

**Punto de validación cumplido:** `docker build` y `docker run` verificados localmente. Push a GitHub OK.

---

## Fase 1 — Sistema de diseño ✅

**Hecho:**
- Fontsource Variable: Bricolage Grotesque (display), Inter (sans), JetBrains Mono (mono).
- Tokens completos en `globals.css`: paleta, escala fluida `clamp()` (xs–display), espaciados (`--space-section`, `--space-block`), radios, sombras mínimas, transiciones, z-index, container fluido.
- Componentes UI: `Marker` (con dot brand), `Button` (primary/secondary/ghost · sm/md/lg), `Tag` (default/brand/inverse), `Badge`, `StatBlock`.
- `Header` fijo translúcido con backdrop-blur + nav móvil con hamburguesa.
- `Footer` con strip brand superior, 3 columnas y datos legales placeholders.
- `<SmoothScroll>` con Lenis (respeta reduced-motion).
- Página `/styleguide` (renombrada de `_styleguide` porque Astro excluye archivos con prefix `_`). Filtrada del sitemap, marcada `noindex`.

**Iteración posterior:** Tras feedback en Fase 2, se añadió librería `Icon.astro` con 26 iconos lineales SVG inline (servicios, stats, proceso, garantías, UI). El `Marker` se actualizó con dot azul.

---

## Fase 2 — Páginas estáticas y maquetación ✅

**Hecho:**
- 22 páginas: home (9 secciones), servicios (listado + 5 detalles), portfolio (listado + 5 detalles), blog (listado + 3 detalles), contacto, 3 legales, styleguide.
- Datos en `src/data/*.ts` con tipos TypeScript estrictos (luego migrados a content collections en Fase 3).
- 9 secciones de home: Hero, ClientsMarquee, Statement, ServicesNumberedList, PortfolioFeatured, Stats, FeatureStrip, Process, HomeContactCTA, BlogRecent.
- `LegalLayout` reutilizable para las 3 páginas legales.
- Formulario de contacto maquetado completo con honeypot y consentimiento RGPD obligatorio (envío real conectado en Fase 4).

**Iteraciones de diseño durante Fase 2:**
1. Primer pase muy plano (B&W) — se inyectó color brand (asterisco gigante hero, marquee animado, statement con drama, stats sobre dark, process con accent variado).
2. Tipografía bajada un escalón (display max 8rem en lugar de 12rem) y servicios reorganizados como grid de 5 cards uniformes (antes había una "destacada" que rompía la consistencia).
3. Iconografía SVG reemplaza caracteres geométricos (◐ ▣ ◇ → seo / mobile / server con SVG inline). FeatureStrip nueva entre Stats y Process. BlogRecent en fondo brand-soft. Footer con strip brand superior.

---

## Fase 3 — Content collections (MDX) ✅

**Hecho:**
- Instalado `@astrojs/mdx@5.0.4`.
- `web/src/content.config.ts` con schemas Zod para `services`, `portfolio`, `blog`. Glob loader sobre `**/*.{md,mdx}`.
- Migración: 5 servicios + 5 proyectos + 3 posts a MDX. Posts del blog con cuerpo Markdown real (no placeholder).
- Helpers async drop-in en `lib/collections.ts` con la misma firma que el antiguo `src/data/*`: `getOrderedServices`, `getAllProjects`, `getFeaturedProjects`, `getRecentPosts`, etc.
- Páginas dinámicas (`[slug].astro`) renderizan el cuerpo MDX con `<Content />`.
- Estilos editoriales scoped (`.post-body`, `.prose-mimic`) en lugar de Tailwind Typography.
- `src/data/*.ts` eliminado tras la migración.

**Decisión:** los `id` de las entries (filename sin extensión) reemplazan al antiguo campo `slug`. URLs idénticas a antes.

---

## Fase 4 — Formulario de contacto + Resend ✅

**Hecho:**
- Cambio arquitectónico: Astro `output: 'static'` → `output: 'server'` con adapter `@astrojs/node` standalone. Cada página `.astro` con `export const prerender = true;`. Solo `/api/contact` corre en runtime.
- Endpoint `src/pages/api/contact.ts` con validación Zod, honeypot (`company_url`), rate limit en memoria (5 req / 10 min / IP), envío vía Resend con plantilla HTML+texto.
- `ContactFormClient.astro` (~110 líneas, solo se carga en `/contacto`) intercepta el submit, hace fetch al endpoint, muestra estados accesibles con `aria-live="polite"`, marca campos inválidos con `aria-invalid` + mensaje específico.
- `lib/contact-schema.ts` con schema Zod compartido cliente/servidor.
- Plantilla email en `lib/email/contact-template.ts` con paleta corporativa.
- Dockerfile migrado a `node:22-alpine` ejecutando `dist/server/entry.mjs`.
- Variables runtime: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL`. Sin API key: modo dev con log local.
- Override `uuid: ^14.0.0` en `package.json` para resolver advisory transitivo.

**Verificación cumplida:** validación inválida → 400 con issues tipados; honeypot relleno → 200 sin enviar; rate limit → 429.

**Mejoras posteriores (2026-05-06):**
- Variables runtime migradas a `astro:env/server` (ADR-014) — funciona consistentemente en dev y prod.
- Deliverability: subject prefijado con `[gesdiweb]`, headers `Auto-Submitted: auto-generated` y `List-Unsubscribe` (one-click) para que clientes serios marquen el email como transaccional legítimo.

---

## Fase 5 — Animaciones y pulido ✅

**Hecho:**
- Componente `<Reveal>` con prop `stagger` y `delay`.
- Reveals con **CSS transitions + IntersectionObserver** (no GSAP). 0 KB JS extra para reveals simples. CSS oculta con `opacity: 0; transform: translateY(24px)`, IO añade `.is-visible` al entrar en viewport, transición CSS dispara la animación.
- Stagger interno con CSS variable `--stagger-delay` aplicada por JS a cada hijo.
- **GSAP ScrollTrigger lazy-loaded** solo si la página tiene `[data-parallax]`. Hero asterisco usa `data-parallax="0.25"`.
- View Transitions API: `<ClientRouter fallback="swap" />` con CSS fade-out/in 280ms global.
- Lenis sincronizado con View Transitions (destroy en `astro:before-swap`, reinit en `astro:page-load`).
- 9 secciones de home con reveals: Hero, Statement, Services, Portfolio, Stats, FeatureStrip, Process, ContactCTA, BlogRecent.
- `prefers-reduced-motion` respetado en CSS y JS.

**Verificación cumplida:** reveals funcionan con stagger, view transitions suaves entre páginas, reduced-motion desactiva todo.

---

## Fase 6 — SEO técnico y performance ✅

**Hecho:**
- Librería `lib/seo.ts` con 9 builders JSON-LD tipados:
  - `organizationSchema` (array `[Organization, LocalBusiness, ProfessionalService]`)
  - `webSiteSchema`, `webPageSchema`, `serviceSchema` (con `OfferCatalog`)
  - `creativeWorkSchema`, `blogPostingSchema`, `blogSchema`
  - `itemListSchema`, `breadcrumbSchema`
- Cada entidad usa `@id` con URL canónica para knowledge graph propio.
- BaseLayout añade props: `ogImage`, `ogType`, `publishedTime`, `modifiedTime`, `articleAuthor`, `jsonLd[]`.
- Meta tags refinados: `theme-color`, `apple-touch-icon`, `og:image:width/height/alt`, `twitter:image`, `max-image-preview:large`.
- JSON-LD aplicado en todas las páginas (home, /servicios listado y detalle, /portfolio listado y detalle, /blog listado y detalle, /contacto, legales).
- OG image fallback `og-default.svg` 1200×630 con paleta corporativa (asterisco decorativo, headline, URL).
- `robots.txt` actualizado: Disallow `/styleguide` y `/api/`.
- Documento `docs/auditoria.md` con procedimiento Lighthouse + axe-core + Schema validator + OG validator + linkinator.

**Verificación cumplida:** tipos JSON-LD detectados en HTML output, meta tags completos, sitemap excluye styleguide.

**Mejoras posteriores (2026-05-06):**
- OG default migrado de SVG a PNG 1200×630 generado con Playwright (ADR-015 sustituye ADR-012).
- **80 OG images per-entry** en `web/public/og/{blog,portfolio,services}/<slug>.png` con paleta diferenciada por colección. Generador idempotente en `web/scripts/generate-og-images.mjs` (`npm run og` o `npm run og:force`).
- Logo oficial integrado (2026-05-07): `web/public/logo.png` para JSON-LD `Organization`, `web/public/logo-mark.png` (sin tagline) para el Header.
- Bug raíz corregido (2026-05-07): el reset de imgs/svgs en `globals.css` movido dentro de `@layer base` para que las utilidades de Tailwind ganen (ADR-020).

**Pendiente para Fase 7+:** ejecutar auditorías Lighthouse 95+ y axe-core 0 violaciones contra producción real.

---

## Rediseño "Claude Design" — 5 fases + blog v3 ✅ (2026-05-12)

Rediseño visual completo siguiendo nueva propuesta del dueño. Mantiene arquitectura, contenido, endpoints y SEO; solo cambia la capa visual y los componentes que la implementan. Ver ADR-021 a ADR-027.

**Fase A · sistema de diseño** (commit `0cab235`)
- Sustituidas Bricolage Grotesque + Inter por **Space Grotesk Variable** (display + sans).
- Añadido **Instrument Serif italic 400** para énfasis decorativos.
- Tokens: fondo `#fafaf8`, accent `#76c2da`, escala fluida ampliada hasta `--text-display-hero` (224px), easing principal `cubic-bezier(0.65, 0, 0.05, 1)`.
- Helpers globales: `.serif-em`, `.disc-morph`, `marker-eye` (utility), `[data-reveal]`.
- Patrón distintivo: `<em>` dentro de h1–h4 = Instrument Serif italic brand automático.
- Backup del diseño anterior en `web/_design-legacy/`.

**Fase B · Header + Footer + Marquee** (commit `e4391ec`)
- Header: nav monospace uppercase + CTA pill "Hablemos" + drawer mobile fullscreen. Logo oficial.
- Footer dark con eyebrow pulsante, título gigante "¿Tienes una idea?", CTA con efecto magnético (sin libs), grid 4 cols (Estudio + Servicios + Estudio nav + Legal), "GESDIWEB®" gigante en outline.
- Componente `Marquee.astro` reutilizable con variants `light` y `brand`, asteriscos como separadores, pausa en hover.

**Fase C · home rediseñada** (commit `7fdbc09`)
- Hero gigantesco (`--text-display-hero`) con disco morphing + word swap rotativo (5 palabras en serif italic).
- Marquees alternantes blanco/azul.
- Services como filas con hover azul (fondo brand sube desde abajo).
- Portfolio en grid 3 cols con marks gigantes o cover real, traslación en hover + desplazamiento de la trama diagonal.
- Process en 4 columnas con tags pill.
- BlogRecent con cards homogéneas.
- Eliminados de la home: `Statement`, `Stats`, `FeatureStrip`, `HomeContactCTA`, `ClientsMarquee` (el CTA principal vive ahora en el Footer dark).

**Fase D · páginas detalle** (commit `b34b3b4`)
- `/servicios`: listado con filas hover azul + detalle con title gigante + tagline serif + mark decorativo de la primera palabra (a 700px opacity 0.08).
- `/portfolio`: listado grid 3 cols + detalle con breadcrumb monospace + meta 4 cols + hero media 64vh + galería + tech-grid hover azul + next project con thumb 280px.
- `/contacto`: hero con mark `↗` + grid 1.4fr/1fr (form / info side). Form con chips de radio (no select) para servicio y presupuesto, manteniendo lógica Resend intacta.
- `/blog`: listado + detalle (refactorizados después en blog v3).
- **`/proceso` NUEVA** (página independiente): hero con title 220px + stats 4 cols + sticky TOC con anclajes a cada fase + 4 fases con copy/viz/entregables/herramientas + sección "principios" con 6 cards en grid 3 cols (ADR-024).

**Fase E · legales + cookie banner + limpieza** (commit `19e68fb`)
- `LegalLayout` refactor: prop `emphasis` (palabra serif italic en el título), `toc` opcional sticky lateral, numeración 01/02/03 antes de cada h2 (data-num), `info-box` con tinte brand, tablas con header monospace.
- Las 3 páginas legales reescritas: aviso legal (8 secciones), política de privacidad (RGPD con tabla de tratamientos), política de cookies (con nota de "privacidad por diseño").
- `CookieBanner.astro`: vanilla JS, 3 modos (todas / solo necesarias / personalizar) con toggles animados, persistencia en localStorage, botón flotante para reabrir. 100% RGPD (ADR-025).
- Limpieza: eliminados del árbol activo los componentes UI legacy (`Marker`, `Tag`, `Badge`, `StatBlock`, `Icon`, `Button`, `Statement`, `Stats`, `FeatureStrip`, `HomeContactCTA`, `ClientsMarquee`, `Reveal`). Quedan en `web/_design-legacy/` para revert (ADR-023).
- Styleguide reescrita con los tokens y patrones del rediseño.

**Blog v3 · diseño editorial completo** (commit `cbdf95c`)
- `/blog` (listado):
  - Hero con title "Notas desde el taller" + meta row + marca `¶` gigante decorativa.
  - Post destacado en grid 1.2fr/1fr con pill "Destacado · Categoría".
  - Filtro sticky por categoría con backdrop blur, contador por categoría, "X resultados" en directo (JS vanilla sin recargar).
  - Grid 3 cols tipo "tabla editorial" con bordes entre cards y padding asimétrico.
- `/blog/[slug]` (post):
  - Reading progress bar fija arriba a 3px en brand.
  - Hero con breadcrumb + pill categoría + title hasta 96px + meta inline con avatar de iniciales.
  - Hero image gigantesca 16:9 con cover real o mark inicial.
  - Body grid 3 cols (200 / 720 / 200) en desktop: TOC izq sticky + content + rail derecho sticky.
  - Drop cap Instrument Serif italic brand en `.post-intro` usando el `excerpt` del frontmatter (ADR-027).
  - TOC automático desde `headings.depth === 2` de Astro Content. Omitido si <2 h2 (ADR-026).
  - Numeración auto `/ 01 / 02 ...` antes de cada h2 del body (CSS counter, no requiere tocar el MD).
  - Blockquote tipo pull-quote con margen negativo, borde brand, comilla `\201C` Instrument Serif gigante.
  - Rail derecho: tags pill + share (Twitter intent / LinkedIn share / copiar link con clipboard) + CTA mini a contacto.
  - Author card al final + next post con thumb estable por seed del slug.

**Verificación:** build limpio (`npm run build`) tras cada fase. Screenshots no posibles por incompatibilidad de Chromium con la versión cacheada local; el dueño valida en `npm run dev`.

---

## Fase 7 — Despliegue en VPS Hetzner 🟡

**Artefactos completados (en repo):**
- `.github/workflows/deploy.yml` — workflow build + push GHCR + webhook Portainer.
- `docker-compose.yml` ajustado: imagen GHCR con `${IMAGE_TAG:-latest}`, healthcheck, logging rotation, `RESEND_API_KEY` con `:?` (falla rápido si falta), `pull_policy: always`.
- Bug fix crítico: `process.env` en lugar de `import.meta.env` en endpoint API (Vite reemplazaba estáticamente las vars en build).
- `docs/despliegue.md` (~480 líneas) con procedimiento paso a paso ordenado.
- `docs/runbook.md` reescrito con operaciones día-a-día, rollback, troubleshooting.

**Pendiente de ejecución por el dueño** (siguiendo `docs/despliegue.md`):
- Crear cuenta Resend, generar API key, verificar dominio (SPF + DKIM + DMARC).
- Configurar permisos en GitHub Actions, ejecutar primer build, hacer pública la imagen GHCR.
- VPS: UFW (22/80/443) + fail2ban.
- Crear stack `gesdiweb` en Portainer como repo Git con env vars y webhook GitOps.
- Configurar `PORTAINER_WEBHOOK_URL` como secret en GitHub.
- NPM: proxy host con SSL Let's Encrypt para subdominio QA (`new.gesdiweb.es`).
- Validación: Lighthouse 95+, axe-core 0 violaciones, formulario real.
- Activar snapshots Hetzner.

**DNS:** el switch del dominio principal NO se hace en Fase 7 — va en Fase 8.

**Punto de validación:** checklist completo en [`despliegue.md` §12](despliegue.md#12-checklist-final-de-fase-7).

---

## Fase 8 — Migración SEO y switch DNS 🟡

**Adelanto parcial completado (2026-05-06):**
- ✅ **Blog WordPress migrado:** 69 posts importados vía REST API (no XML/WXR — decisión ADR-016). HTML renderizado convertido a Markdown puro (no MDX, ADR-017). Imágenes descargadas a `web/src/content/blog/imagenes/<slug>/`.
- ✅ Covers de blog: 36 detectados desde imágenes en el body, 8 desde `featured_media`, 25 generados sintéticamente con paleta brand. Total 69/69 con cover.
- ✅ Slug rules formalizadas: kebab-case, sin acentos, sin guiones bajos. Helper `safeFilename` slugify aplicado al renombrar (decodifica URL-encoded antes).

**Pre-requisitos pendientes:**
- El dueño extrae las URLs reales que rankean desde Google Search Console.

**Tareas pendientes:**
1. Mapear URLs antiguas → nuevas (incluso 1:1 si los slugs coinciden).
2. Configurar redirecciones 301 en NPM o nginx del contenedor `web`.
3. Cambiar DNS del dominio `gesdiweb.es` al VPS Hetzner.
4. Verificar todas las redirecciones con `curl -I`.
5. Resubir sitemap a Google Search Console y Bing Webmaster Tools.
6. Monitorizar errores 404 las primeras 2 semanas.

**Detalle completo en [`seo-migracion.md`](seo-migracion.md).**

**Punto de validación:** sin pérdidas de tráfico orgánico significativas en los 30 días siguientes al switch.
