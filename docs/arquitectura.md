# Arquitectura

## 1. Visión general

`gesdiweb` es un sitio web **mayoritariamente estático con un endpoint dinámico** (formulario de contacto). Astro corre en modo `server` con el adapter Node standalone: las 22 páginas se prerenderizan en build (`prerender = true` en cada una) y el server las sirve directamente del disco; solo `/api/contact` se ejecuta en runtime para procesar envíos vía Resend.

El contenido vive como **archivos MDX en el repositorio Git**, lo que convierte al control de versiones en la fuente única de verdad sobre todo lo publicado.

```
[ Editor (Jota) ]
      │  git push origin main
      ▼
[ GitHub repo: dignitasjota/gesdiweb ]
      │  GitHub Actions (paths web/, compose, workflow)
      ▼
[ docker buildx → push imagen linux/amd64 ]
      │
      ▼
[ GHCR: ghcr.io/dignitasjota/gesdiweb-web:latest + sha-<short> ]
      │  webhook
      ▼
[ Portainer en Hetzner 157.180.44.59 ]
      │  pull + recreate
      ▼
┌──────────────────────────────────────────────────┐
│  Stack `gesdiweb`                                │
│   └── contenedor `gesdiweb_web`                  │
│        - node 22 alpine                          │
│        - dist/server/entry.mjs                   │
│        - escucha :4321 interno                   │
│        - env: RESEND_API_KEY, RESEND_FROM_EMAIL,│
│               LEAD_NOTIFICATION_EMAIL            │
│        - red docker `npm_default`                │
└──────────────────────────────────────────────────┘
                  ▲
                  │ HTTP interno
                  │
┌──────────────────────────────────────────────────┐
│  Stack `npm` (Nginx Proxy Manager — pre-existente)│
│   - escucha :80 + :443                           │
│   - SSL Let's Encrypt automático                 │
│   - HSTS, HTTP/2, gzip                           │
│   - host `gesdiweb.es` → gesdiweb_web:4321       │
└──────────────────────────────────────────────────┘
                  ▲
                  │ HTTPS público
                  ▼
              Internet
```

NPM termina TLS y proxy-pasa al contenedor `gesdiweb_web` por la red Docker `npm_default`. El contenedor sirve estáticos prerenderizados directamente y solo `/api/contact` ejecuta lógica server-side.

## 2. Pipeline de build de Astro

```
src/
├── pages/*.astro             → rutas estáticas (todas con prerender = true)
├── pages/[slug].astro        → rutas dinámicas vía getStaticPaths
├── pages/api/contact.ts      → endpoint dinámico (prerender = false)
├── content.config.ts         → schemas Zod por colección
├── content/                  → MDX collections
│   ├── services/             5 .mdx
│   ├── portfolio/            5 .mdx con cuerpo de caso de estudio
│   └── blog/                 3 .mdx con cuerpo Markdown
├── layouts/*.astro           → BaseLayout, LegalLayout
├── components/
│   ├── ui/                   Marker, Button, Tag, Badge, StatBlock, Icon
│   ├── layout/               Header, Footer
│   ├── sections/             Hero, Statement, Services, Stats, etc.
│   ├── animations/           Reveal, SmoothScroll
│   └── forms/                ContactFormClient
├── lib/
│   ├── collections.ts        helpers async getCollection
│   ├── seo.ts                builders JSON-LD
│   ├── contact-schema.ts     Zod schema compartido cliente/servidor
│   ├── rate-limit.ts         limiter en memoria
│   └── email/                plantillas HTML+texto del email Resend
├── styles/globals.css        → @import "tailwindcss" + tokens + reveals
└── public/                   → assets servidos tal cual (favicon, og-default.svg, robots.txt)

      │
      ▼  astro build
      │
dist/
├── client/                   → estáticos prerenderizados (servidos por el server Node)
│   ├── index.html
│   ├── servicios/<slug>/index.html
│   ├── portfolio/<slug>/index.html
│   ├── blog/<slug>/index.html
│   ├── _astro/               CSS/JS con hash inmutable
│   ├── og-default.svg
│   ├── sitemap-index.xml + sitemap-0.xml
│   └── robots.txt
└── server/
    ├── entry.mjs             → CMD del contenedor: node ./dist/server/entry.mjs
    ├── manifest_*.mjs
    └── chunks/               → API endpoints + render handlers
```

## 3. Decisiones arquitectónicas clave

Resumen aquí; razonamiento completo en [`decisiones.md`](decisiones.md).

| Decisión | Razón principal | Alternativa descartada |
|---|---|---|
| Astro `output: 'server'` con prerender por página | Mezcla estático + endpoint API en un solo runtime | `output: 'static'` (sin API) o sidecar Node |
| Sin CMS visual | Editor único técnico | Directus, Strapi, Sanity, Decap |
| MDX en repo | Versionado total, diff revisable | BD relacional |
| Email vía Resend | Sin servidor SMTP propio | Postfix, Brevo, Postmark |
| NPM (existente) | Reutilizar infra | Caddy, Traefik |
| Self-host fuentes | RGPD + rendimiento | Google Fonts CDN |
| Sin Google Analytics | RGPD + ética | GA4 |
| Astro 6 | Última estable, evita advisory XSS | Astro 5 |
| Vite 7 forzado | Incompatibilidad rolldown-vite + tailwind 4.1 | Vite 8 |
| Reveals con CSS+IO, parallax con GSAP lazy | 0 KB JS extra para reveals simples | GSAP en todas las páginas |
| JSON-LD centralizado (lib/seo.ts) con `@id` cruzados | Knowledge graph propio + reusabilidad | Schemas inline ad-hoc |
| `process.env` en endpoints | Vars inyectadas en runtime por docker-compose | `import.meta.env` (se inlinea en build) |
| CI/CD: Actions + GHCR + webhook Portainer | Sin SSH expuesto, trazabilidad por sha | SSH directo, self-hosted runner |

## 4. Identidad visual

### Logo

- Tipografía wordmark "gesdiweb" (provisional, color `#A7A7A7` aproximado en captura).
- Símbolo: G en círculo color `#77C2DA` (azul corporativo).
- Tagline: "diseño web y posicionamiento SEO".
- **El SVG vectorial original aún no está en el repo.** Cuando llegue, irá a `web/public/logo.svg`.

### Paleta

```
--color-bg            #FFFFFF   Fondo principal
--color-bg-soft       #FAFAFA   Fondo secundario sutil
--color-fg            #0A0A0A   Texto principal
--color-fg-soft       #525252   Texto secundario
--color-border        #E5E5E5   Líneas y separadores
--color-brand         #77C2DA   Azul corporativo (uso puntual)
--color-brand-hover   #5FB3CF   Hover sobre acento
--color-muted         #A7A7A7   Gris secundario del logo
```

**Filosofía de uso:** la base es blanco/negro. El azul aparece solo en marcadores tipográficos, hover de enlaces, líneas de detalle, y pequeños acentos (un punto en el final de un título, el icono de un servicio, etc.). **Nunca como fondo dominante.**

### Tipografías (Fase 1)

| Rol | Familia | Uso |
|---|---|---|
| Display | Bricolage Grotesque | H1, H2 grandes, hero gigante |
| Sans | Inter | Texto, UI, navegación |
| Mono | JetBrains Mono | Marcadores tipográficos `// 00.01°`, números, detalles técnicos |

Self-hosted con [Fontsource](https://fontsource.org), subset latin, `font-display: swap`.

### Escala tipográfica (Fase 1)

Fluida con `clamp()` para escalar entre 375px y 1920px sin breakpoints duros. Ver [`briefing.md#5`](briefing.md#5-sistema-de-diseño).

### Retícula

- 8px base.
- 12 columnas desktop, 4 móvil con CSS Grid.
- Container max 1440px, padding fluido `clamp(1.5rem, 5vw, 4rem)`.
- Vertical entre secciones: `clamp(6rem, 12vw, 12rem)`.

## 5. Modelo de contenido (Fase 3 — implementado)

> **Para cualquier tarea editorial** (crear post, añadir servicio, modificar proyecto), la guía operativa está en [`contenido.md`](contenido.md). Esta sección documenta solo la arquitectura.

### Estructura

Todo el contenido editorial vive como **archivos `.mdx`** en `web/src/content/`, organizado en tres colecciones:

```
web/src/
├── content.config.ts           ← Schemas Zod (services, portfolio, blog)
└── content/
    ├── services/<slug>.mdx     5 servicios
    ├── portfolio/<slug>.mdx    5 proyectos (cuerpo MDX = caso de estudio)
    └── blog/<slug>.mdx         3 posts (cuerpo MDX = artículo)
```

El **slug** es el filename sin extensión. El **frontmatter** lleva los metadatos. El **cuerpo Markdown/MDX** se renderiza vía `<Content />` solo en portfolio y blog (los services no usan cuerpo todavía).

### Validación

`web/src/content.config.ts` define schemas Zod por colección con `defineCollection({ loader: glob(...), schema })`. Si un `.mdx` tiene frontmatter inválido → **build rompe** con error tipado. Es deseable: evita publicar contenido roto.

### Acceso desde páginas Astro

Las rutas dinámicas (`[slug].astro`) y secciones consumen las colecciones a través del helper `web/src/lib/collections.ts`:

```ts
import { getOrderedServices, getFeaturedProjects, getRecentPosts } from '@/lib/collections';

const services = await getOrderedServices();        // [...] entries publicadas, ordenadas
const featured = await getFeaturedProjects();       // [...] entries con featured: true
const recent = await getRecentPosts(3);             // 3 posts más recientes
```

Helpers disponibles:
- `getOrderedServices()`, `getServiceById(id)`
- `getAllProjects()`, `getFeaturedProjects()`, `getProjectById(id)`
- `getAllPosts()`, `getRecentPosts(limit)`, `getPostById(id)`
- `formatDateLong(date)`, `isoDate(date)`

Filtran automáticamente entries con `status: 'draft'`.

### Schemas (resumen — detalle completo en `contenido.md`)

Todos los schemas comparten campos opcionales `seoTitle`, `seoDescription`, `status` (`draft`/`published`/`scheduled` según colección) y `lang` (default `'es'`).

Campos específicos:

- **services:** `title`, `headline`, `excerpt`, `order`, `features[]`, `approach[]`
- **portfolio:** `title`, `client`, `year`, `excerpt`, `order`, `featured`, `techStack[]`, `servicesUsed[]`, `url?`
- **blog:** `title`, `excerpt`, `publishedAt` (Date), `readingMinutes`, `categories[]`, `tags[]`, `author?`

### Renderizado del cuerpo MDX

Solo en portfolio y blog:

```astro
const { Content } = await render(entry);
// ...
<Content />
```

Los estilos editoriales viven scoped en cada layout dinámico:
- `web/src/pages/blog/[slug].astro` → clase `.post-body` con tipografía pensada para lectura larga (line-height 1.75, h2 grande, enlaces subrayados con color brand).
- `web/src/pages/portfolio/[slug].astro` → clase `.prose-mimic` más compacta para casos de estudio.

### Multi-idioma

Todas las colecciones llevan `lang` (default `'es'`). Estructura preparada para inglés sin implementarlo todavía. Cuando se active: filtrar por `lang` en los helpers y añadir prefijo de ruta `/en/`.

## 6. Formulario de contacto y endpoint API

Único punto dinámico del sitio. Flujo:

```
Usuario rellena /contacto en el navegador
   │
   │ ContactFormClient.astro intercepta submit
   │ fetch POST /api/contact (FormData)
   ▼
Astro server (Node runtime)
   │ src/pages/api/contact.ts (prerender = false)
   │
   ├── Parse body (JSON o FormData)
   ├── Honeypot check (campo company_url) → si lleno, simula 200 sin enviar
   ├── Zod schema validation (lib/contact-schema.ts)
   ├── Rate limit por IP (lib/rate-limit.ts, 5 req / 10 min)
   ├── Resend.send con plantilla HTML (lib/email/contact-template.ts)
   │
   ▼
Respuesta JSON al cliente
   { ok: true, accepted: true }                    // éxito
   { ok: false, error: 'validation_failed', ... }  // 400
   { ok: false, error: 'rate_limited', retryAfterSeconds }  // 429
   { ok: false, error: 'email_provider_error' }    // 502 (Resend caído)
```

**Cliente JS** (`ContactFormClient.astro`, ~110 líneas):
- Solo se carga en `/contacto`
- Estados accesibles vía `aria-live="polite"` (loading / success / error)
- Errores de validación se muestran por campo con `aria-invalid="true"` + mensaje
- Reset del formulario al éxito

**Variables de entorno** (en runtime, no build time):
- `RESEND_API_KEY` (obligatoria en producción)
- `RESEND_FROM_EMAIL` (default `hola@gesdiweb.es`)
- `LEAD_NOTIFICATION_EMAIL` (default `hola@gesdiweb.es`)

Sin API key: el endpoint loguea en consola y devuelve `devMode: true` en lugar de fallar (útil para desarrollo).

## 7. Animaciones

Tres capas independientes:

### 7.1 — Smooth scroll (Lenis)

`SmoothScroll.astro` monta Lenis al cargar la página. Sincroniza con View Transitions: en `astro:before-swap` se destruye Lenis, en `astro:page-load` se reinit. Respeta `prefers-reduced-motion` (no se inicializa).

### 7.2 — Reveals (CSS + IntersectionObserver)

Componente `<Reveal>` añade `data-reveal` al elemento. CSS oculta inicialmente con `opacity: 0; transform: translateY(24px)`. El controller en `SmoothScroll.astro` observa con IntersectionObserver y añade `.is-visible` cuando entra en viewport, disparando la transición CSS.

`stagger=true` aplica delays incrementales a hijos directos vía CSS variable `--stagger-delay`. **0 KB de JS extra** para reveals (es nativo del navegador).

### 7.3 — Parallax (GSAP ScrollTrigger lazy)

`[data-parallax="0.3"]` activa parallax scroll-linked. GSAP + ScrollTrigger se importan **dinámicamente** solo si la página actual tiene al menos un `[data-parallax]`. Si no, no se descargan.

### 7.4 — View Transitions

`<ClientRouter fallback="swap" />` en BaseLayout activa la API nativa. CSS global aplica fade-out/in de 280ms en `::view-transition-old(root)` / `::view-transition-new(root)`. Reduced-motion lo deja en 0.001ms.

## 8. SEO

### Meta tags por página

`BaseLayout.astro` recibe:
- `title` (default `gesdiweb — diseño web y posicionamiento SEO`)
- `description` (default agencia + tagline)
- `noindex` (default false; true en `/styleguide`)
- `ogImage` (default `og-default.svg`)
- `ogType` (`'website'` o `'article'` para posts)
- `publishedTime`, `modifiedTime`, `articleAuthor` (solo para posts)
- `jsonLd` (array de schemas a inyectar)

Genera: canonical absoluto, `robots` con `max-image-preview:large, max-snippet:-1`, OG completo (`og:site_name`, `og:image:width/height/alt`), Twitter Card, `theme-color`, `apple-touch-icon`.

### JSON-LD por tipo de página

Builders en `web/src/lib/seo.ts`. Cada entidad lleva `@id` con URL canónica para que Google asocie las referencias en su knowledge graph.

| Página | Schemas inyectados |
|---|---|
| Home | `Organization+LocalBusiness+ProfessionalService` (array `@type`), `WebSite` |
| `/servicios` | `WebPage`, `ItemList`, `BreadcrumbList` |
| `/servicios/<slug>` | `Service` (con `OfferCatalog` por feature), `BreadcrumbList` |
| `/portfolio` | `WebPage`, `ItemList`, `BreadcrumbList` |
| `/portfolio/<slug>` | `CreativeWork`, `BreadcrumbList` |
| `/blog` | `Blog`, `BreadcrumbList` |
| `/blog/<slug>` | `BlogPosting` (con `Person` author + `keywords`), `BreadcrumbList`, `og:type=article` |
| `/contacto` | `ContactPage`, `BreadcrumbList` |
| Páginas legales | `WebPage`, `BreadcrumbList` (vía `LegalLayout`) |

`Organization` tiene `address` y `telephone` **comentados** hasta que el dueño aporte los datos legales reales.

### Open Graph

- **OG image fallback:** `public/og-default.svg` 1200×630 con paleta corporativa (asterisco decorativo, headline gesdiweb, URL).
- Algunos clientes legacy no soportan SVG OG (Slack viejo, ciertos email clients). Mayoría sí (FB, X, LinkedIn, iMessage, WhatsApp).
- Cuando lleguen materiales reales (Fase 8), sustituir por PNG y opcionalmente generar dinámicas por página.

### Sitemap

Generado por `@astrojs/sitemap`. Configurado con i18n España (`es-ES`). Filtro excluye `/styleguide`. URL: `https://gesdiweb.es/sitemap-index.xml` (referenciada en `robots.txt`).

### Redirecciones 301 (Fase 8)

Mapa de URLs antiguas → nuevas. Implementado en NPM. Detalle en [`seo-migracion.md`](seo-migracion.md).

## 9. Rendimiento

Objetivo Lighthouse: **95+ en performance, accesibilidad, SEO, best practices** en home, servicios, portfolio, blog y contacto.

Núcleos:
- **LCP < 2.5s.** Hero con imagen optimizada (`<Image>` AVIF/WebP, `width`/`height` para CLS), preload de la fuente display.
- **CLS < 0.1.** Toda imagen con dimensiones, fuentes con `font-display: swap` y métricas size-adjust si hace falta.
- **INP < 200ms.** Astro envía 0 KB de JS por defecto. Las islas (formulario, GSAP) se cargan con `client:idle` o `client:visible`.
- **Compresión.** gzip y brotli (en NPM o nginx interno).
- **Cache.** Headers largos para `_astro/` (hash inmutable), corto para HTML.

## 10. Accesibilidad

Objetivos AA mínimo:
- Contraste texto/fondo ≥ 4.5:1 (normal) y ≥ 3:1 (grande).
- Navegación por teclado completa con foco visible.
- ARIA solo cuando aporta (no por inercia).
- `prefers-reduced-motion` respetado en todas las animaciones.
- Imágenes con `alt` descriptivo (vacío `alt=""` solo si decorativas).
- Heading hierarchy correcta (una `<h1>` por página).
- Auditorías con axe-core en Fase 6.

## 11. Seguridad

- HTTPS obligatorio (Let's Encrypt vía NPM).
- Headers nginx: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- (Fase 6) `Content-Security-Policy` ajustada al sitio.
- Sin secretos en el repo. `.env` ignorado, `.env.example` documentado.
- Bloqueo de archivos ocultos en nginx (`/\.`).
- Firewall del host: 22, 80, 443.
- fail2ban en SSH (Fase 7).

## 12. Operaciones

Ver [`docker-explicado.md`](docker-explicado.md) para Docker básico y [`runbook.md`](runbook.md) para procedimientos operativos (despliegue, rollback, backup, troubleshooting). Estos documentos se completan a partir de Fase 7.
