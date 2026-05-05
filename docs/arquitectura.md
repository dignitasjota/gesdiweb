# Arquitectura

## 1. Visión general

`gesdiweb` es un sitio web 100% estático generado por Astro y servido por nginx dentro de un contenedor Docker. No hay base de datos, no hay backend con estado, no hay sesiones. El contenido vive como **archivos MDX en el repositorio Git**, lo que convierte al control de versiones en la fuente única de verdad sobre todo lo publicado.

```
[ Editor (Jota) ]
      │  git push origin main
      ▼
[ GitHub repo: dignitasjota/gesdiweb ]
      │  workflow CI (Fase 7)
      ▼
[ GitHub Actions ]
      │  docker build → push imagen
      ▼
[ GHCR: ghcr.io/dignitasjota/gesdiweb-web:latest ]
      │  webhook / pull
      ▼
[ Hetzner 157.180.44.59 — Portainer ]
      │
      ├── Stack `npm` (Nginx Proxy Manager)        ← ya existente en el VPS
      │     - escucha 80/443
      │     - SSL Let's Encrypt automático
      │     - red docker `npm_default`
      │
      └── Stack `gesdiweb`
            └── contenedor `web`
                 - nginx 1.27 alpine
                 - sirve /usr/share/nginx/html
                 - conectado a `npm_default`
                 - sin puertos expuestos al host
```

NPM redirige `gesdiweb.es` → `web:80` por la red Docker interna. Todo el TLS y los certificados los gestiona NPM.

## 2. Pipeline de build de Astro

```
src/
├── pages/*.astro             → rutas estáticas
├── pages/[slug].astro        → rutas dinámicas (Fase 3, vía getStaticPaths)
├── content/                  → MDX collections (Fase 3)
│   ├── services/
│   ├── portfolio/
│   └── blog/
├── layouts/*.astro           → templates de página
├── components/               → islas Astro (server-only por defecto)
├── styles/globals.css        → @import "tailwindcss" + tokens
└── public/                   → assets servidos tal cual

      │
      ▼  astro build
      │
dist/
├── index.html
├── servicios/
├── portfolio/
├── blog/
├── _astro/                   → CSS/JS bundleado con hash inmutable
├── images/                   → imágenes optimizadas (WebP/AVIF)
├── sitemap-index.xml
├── sitemap-0.xml
└── robots.txt
```

## 3. Decisiones arquitectónicas clave

Resumen aquí; razonamiento completo en [`decisiones.md`](decisiones.md).

| Decisión | Razón principal | Alternativa descartada |
|---|---|---|
| HTML 100% estático | SEO, rendimiento, mantenimiento mínimo | SSR / SSG híbrido / WordPress headless |
| Sin CMS visual | Editor único técnico | Directus, Strapi, Sanity, Decap |
| MDX en repo | Versionado total, diff revisable | BD relacional |
| Email vía Resend | Sin servidor SMTP propio | Postfix, Brevo, Postmark |
| NPM (existente) | Reutilizar infra | Caddy, Traefik |
| Self-host fuentes | RGPD + rendimiento | Google Fonts CDN |
| Sin Google Analytics | RGPD + ética | GA4 |
| Astro 6 | Última estable, evita advisory XSS | Astro 5 |
| Vite 7 forzado | Incompatibilidad rolldown-vite + tailwind 4.1 | Vite 8 |

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

## 5. Modelo de contenido (Fase 3)

### Colecciones MDX previstas

#### `services` — Servicios

```ts
{
  slug: string,           // único, indexado: "posicionamiento-web"
  title: string,
  headline: string,       // titular grande hero del servicio
  excerpt: string,
  cover: ImageMetadata,
  features: string[],
  seoTitle?: string,
  seoDescription?: string,
  order: number,
  status: 'draft' | 'published',
  lang: 'es',
}
```

URLs: `/servicios/[slug]`.

#### `portfolio` — Proyectos

```ts
{
  slug: string,
  title: string,
  client: string,
  year: number,
  excerpt: string,
  cover: ImageMetadata,
  gallery?: ImageMetadata[],
  services: string[],     // referencia a slugs de services
  techStack: string[],
  url?: string,
  featured: boolean,
  order: number,
  status: 'draft' | 'published',
  lang: 'es',
}
```

URLs: `/portfolio/[slug]`.

#### `blog` — Posts

```ts
{
  slug: string,
  title: string,
  excerpt: string,
  cover: ImageMetadata,
  author: string,         // por ahora hardcoded "Jota"
  categories: string[],
  tags: string[],
  publishedAt: Date,
  seoTitle?: string,
  seoDescription?: string,
  status: 'draft' | 'published',
  lang: 'es',
}
```

URLs: `/blog/[slug]`.

### Validación con Zod

`web/src/content/config.ts` define los schemas. Astro valida en build time; un MDX con un campo inválido rompe el build (deseado).

### Multi-idioma

Todas las colecciones llevan `lang`. Por defecto se filtra `lang === 'es'`. La estructura de rutas con prefijo de idioma queda preparada pero **desactivada** hasta que se implemente inglés.

## 6. SEO

### Meta tags por página

`BaseLayout.astro` recibe props `title`, `description`, `lang`, opcionalmente `image`, `noindex`. Cada página pasa los suyos. Al no pasarlos, hereda los del singleton previsto en `site_settings` (Fase 3, vivirá como un MDX o JSON central).

### JSON-LD por tipo de página

| Tipo | Schema |
|---|---|
| Home | `Organization` + `LocalBusiness` + `WebSite` con `SearchAction` |
| Servicio | `Service` con `provider` apuntando a la organización |
| Proyecto | `CreativeWork` |
| Post | `BlogPosting` con autor, fecha, imagen |

### Sitemap

Generado por `@astrojs/sitemap`. Configurado con i18n España (`es-ES`).

### Redirecciones 301 (Fase 8)

Mapa de URLs antiguas → nuevas. Implementado en NPM o como reglas `nginx` dentro del contenedor. Detalle en [`seo-migracion.md`](seo-migracion.md).

## 7. Rendimiento

Objetivo Lighthouse: **95+ en performance, accesibilidad, SEO, best practices** en home, servicios, portfolio, blog y contacto.

Núcleos:
- **LCP < 2.5s.** Hero con imagen optimizada (`<Image>` AVIF/WebP, `width`/`height` para CLS), preload de la fuente display.
- **CLS < 0.1.** Toda imagen con dimensiones, fuentes con `font-display: swap` y métricas size-adjust si hace falta.
- **INP < 200ms.** Astro envía 0 KB de JS por defecto. Las islas (formulario, GSAP) se cargan con `client:idle` o `client:visible`.
- **Compresión.** gzip y brotli (en NPM o nginx interno).
- **Cache.** Headers largos para `_astro/` (hash inmutable), corto para HTML.

## 8. Accesibilidad

Objetivos AA mínimo:
- Contraste texto/fondo ≥ 4.5:1 (normal) y ≥ 3:1 (grande).
- Navegación por teclado completa con foco visible.
- ARIA solo cuando aporta (no por inercia).
- `prefers-reduced-motion` respetado en todas las animaciones.
- Imágenes con `alt` descriptivo (vacío `alt=""` solo si decorativas).
- Heading hierarchy correcta (una `<h1>` por página).
- Auditorías con axe-core en Fase 6.

## 9. Seguridad

- HTTPS obligatorio (Let's Encrypt vía NPM).
- Headers nginx: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- (Fase 6) `Content-Security-Policy` ajustada al sitio.
- Sin secretos en el repo. `.env` ignorado, `.env.example` documentado.
- Bloqueo de archivos ocultos en nginx (`/\.`).
- Firewall del host: 22, 80, 443.
- fail2ban en SSH (Fase 7).

## 10. Operaciones

Ver [`docker-explicado.md`](docker-explicado.md) para Docker básico y [`runbook.md`](runbook.md) para procedimientos operativos (despliegue, rollback, backup, troubleshooting). Estos documentos se completan a partir de Fase 7.
