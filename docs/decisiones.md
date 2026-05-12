# Decisiones técnicas (ADRs)

Lista corta de decisiones cerradas durante la fase de diseño del proyecto. Cada entrada incluye contexto, decisión y consecuencias.

---

## ADR-001 · Astro puro sin CMS (Directus descartado)

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** El briefing inicial planteaba usar Directus como CMS para gestionar servicios, portfolio, blog y leads. Tras analizar el caso real (un solo editor con perfil técnico, contenido manejable, SEO crítico), el coste/beneficio cambia.

**Decisión.** Toda la web se construye con Astro 5+ generando HTML estático. El contenido vive en archivos MDX dentro de `web/src/content/`. El formulario de contacto se procesa con un endpoint de Astro que envía email vía Resend.

**Consecuencias.**
- (+) Cero infraestructura adicional: sin Postgres, sin Redis, sin panel que mantener ni actualizar.
- (+) Superficie de fallo mínima: HTML estático servido por nginx.
- (+) Rendimiento y SEO máximos.
- (−) Editar contenido requiere editor de texto + git. Aceptable porque el editor único es técnico.
- (~) Si en el futuro se necesita un panel visual: Decap CMS o Tina CMS encima del repo, sin migración del frontend.

---

## ADR-002 · Nginx Proxy Manager en lugar de Caddy

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** El briefing proponía Caddy 2 como reverse proxy con SSL automático. El servidor Hetzner ya tiene Portainer + Nginx Proxy Manager (NPM) funcionando con otros servicios.

**Decisión.** Reutilizamos NPM. El stack `gesdiweb` se conecta a la red Docker de NPM y este expone el dominio con SSL Let's Encrypt automático.

**Consecuencias.**
- (+) Cero duplicación de infra. UI gráfica para gestionar dominios.
- (+) Certificados centralizados para todos los proyectos del servidor.
- (−) Una pieza menos versionada en el repo (no hay Caddyfile).
- (~) La configuración de redirecciones 301 (Fase 9) se hará desde NPM o con un middleware nginx en el contenedor `web`.

---

## ADR-003 · Resend como SMTP transaccional

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** Necesitamos enviar emails de notificación al recibir un lead del formulario de contacto. Plesk se elimina, así que no podemos usar su SMTP.

**Decisión.** Resend con plan gratuito (3.000 emails/mes, 100/día). Verificación del dominio gesdiweb.es vía SPF + DKIM + DMARC.

**Consecuencias.**
- (+) Sin servidor SMTP propio que mantener.
- (+) API moderna, integración trivial con Astro.
- (+) Plan free cubre el volumen previsto sobradamente.

---

## ADR-004 · MDX en repo como fuente única de contenido

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** Consecuencia de ADR-001. Hay que decidir cómo se estructura el contenido sin CMS.

**Decisión.** Astro Content Collections con MDX:
- `web/src/content/services/` — servicios
- `web/src/content/portfolio/` — proyectos
- `web/src/content/blog/` — posts

Cada entrada lleva frontmatter tipado (Zod schema) con campos seo, fecha, etc. Multi-idioma preparado vía campo `lang` y rutas con prefijo desactivado por defecto.

**Consecuencias.**
- (+) Versionado total en Git, diff de cambios revisable.
- (+) Tipado fuerte en el frontmatter, errores en build.
- (−) Requiere conocer Markdown (asumido).

---

## ADR-005 · Stack de tipografías Bricolage Grotesque + Inter + JetBrains Mono

**Fecha:** 2026-05-05
**Estado:** Aceptada (sin implementar hasta Fase 2)

**Contexto.** El briefing pide estética suiza con tipografía gigante. Hay que elegir tres familias: titulares, texto y mono para detalles técnicos.

**Decisión.**
- Display: **Bricolage Grotesque** (OFL, presencia geométrica moderna)
- Sans: **Inter** (OFL, legibilidad UI)
- Mono: **JetBrains Mono** (OFL, marcadores `// 00.01°`)

Self-hosted con Fontsource desde `/fonts/`, no Google Fonts CDN (RGPD + rendimiento).

---

## ADR-006 · Astro 6 con override de Vite 7

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** En Fase 0, al instalar Astro 5 detectamos un advisory XSS en versiones < 6.1.6. Subimos a Astro 6.2.2. Astro 6 acepta `vite ^7.3.2` como peer, pero en la práctica npm resolvió `vite@8.0.x` (rolldown-vite) que es incompatible con `@tailwindcss/vite@4.1.x` (error `Missing field tsconfigPaths on BindingViteResolvePluginConfig.resolveOptions`).

**Decisión.** Forzamos Vite 7 vía `overrides` en `web/package.json`:

```json
"overrides": {
  "vite": "^7.3.2"
}
```

**Consecuencias.**
- (+) Build estable con la combinación Astro 6 + Tailwind 4.1.
- (−) Quedamos atados a Vite 7 hasta que `@tailwindcss/vite` o rolldown-vite resuelvan la incompatibilidad. Revisar trimestralmente.

---

## ADR-007 · Content Collections + MDX (sin Tailwind Typography)

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** En Fase 3 había que mover el contenido fuera del código fuente. Dos decisiones acopladas:

1. ¿Qué API usar? Astro Content Collections v2 (la nueva, con `glob` loader) vs. los antiguos collections con `src/content/config.ts`.
2. ¿Cómo estilar la prosa Markdown renderizada? Tailwind Typography vs. CSS scoped propio.

**Decisiones.**

1. **Content Collections v2** con `defineCollection({ loader: glob(...) })` y schemas Zod en `web/src/content.config.ts` (no en la antigua ubicación `web/src/content/config.ts`). Razón: es la API actual recomendada en Astro 5+ y permite glob personalizado.

2. **CSS scoped propio** (`.post-body`, `.prose-mimic`) en lugar de Tailwind Typography. Razón:
   - **Control fino** sobre la jerarquía editorial (h2 con tipografía display, line-height 1.75 para lectura larga, enlaces subrayados con color brand).
   - **Sin añadir 60-70KB** de plugin Typography que se aplicaría a todo el contenido aunque no lo usemos.
   - El CSS necesario son ~30 líneas por estilo de prosa, totalmente mantenible.

**Consecuencias.**
- (+) Contenido versionado, validado y editable sin tocar código.
- (+) Posts con voz consistente gracias al CSS editorial scoped.
- (−) Si añadimos otra plantilla de prosa (ej: páginas de ayuda), hay que duplicar/extraer CSS. Aceptable.

---

## ADR-008 · Astro `output: 'server'` con prerender por página

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** En Fase 4 había que añadir un endpoint dinámico (`/api/contact`) para procesar el formulario de contacto vía Resend. Astro tiene tres modos: `static` (todo prerenderizado, sin endpoints), `server` (todo dinámico salvo `prerender = true`), y `hybrid` (deprecado en Astro 5+).

**Decisión.** Pasar a `output: 'server'` con `@astrojs/node` standalone, y marcar `export const prerender = true;` en **todas** las páginas estáticas (home, servicios, portfolio, blog, contacto, legales, styleguide). Solo `src/pages/api/contact.ts` queda con `prerender = false`.

**Consecuencias.**
- (+) Build genera `dist/client/` (HTML prerenderizado) + `dist/server/entry.mjs` (Node server). El server sirve estáticos directos del disco + API dinámicas.
- (+) Un único contenedor maneja todo. No hace falta separar nginx + Node.
- (+) Si en el futuro queremos más endpoints dinámicos (búsqueda, login, etc.), solo añadir el archivo con `prerender = false`.
- (−) Performance ligeramente menor que nginx puro sirviendo estáticos. Aceptable: <50ms de diferencia, NPM cachea por delante.
- (−) El runtime es Node 22 alpine en lugar de nginx alpine. Imagen un poco más grande.

---

## ADR-009 · Variables de entorno: `process.env` en runtime, no `import.meta.env`

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** Bug encontrado durante validación de Fase 7: `/api/contact.ts` leía `import.meta.env.RESEND_API_KEY`. Vite reemplaza estáticamente `import.meta.env.X` en build time, así que las vars inyectadas por docker-compose en runtime nunca llegaban al código.

**Decisión.** En endpoints API y código que se ejecuta server-side en runtime, usar `process.env.X`. Reservar `import.meta.env.PUBLIC_X` solo para vars que sí queremos inlinear en el build (PUBLIC_*).

**Consecuencias.**
- (+) Las vars de Resend se leen correctamente en runtime, el formulario funciona en producción.
- (+) Cambiar una env var (ej. cambiar destinatario de leads) no requiere rebuild — basta con recreate del contenedor.
- (~) Hay que recordar la regla. Documentado en `convenciones.md`.

---

## ADR-010 · Reveals con CSS + IntersectionObserver, GSAP solo para parallax

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** En Fase 5 había que animar la entrada de secciones al hacer scroll. Primer intento fue GSAP ScrollTrigger en cada `[data-reveal]` — funcional pero ~70KB de bundle en cada página.

**Decisión.** Reescribir reveals con **CSS transitions** disparadas por una clase `.is-visible` que añade un **IntersectionObserver** en el cliente. GSAP queda solo para `[data-parallax]` y se importa **lazy** (solo se descarga si hay parallax en la página actual).

**Consecuencias.**
- (+) Páginas sin parallax tienen 0 KB extra de JS de animaciones.
- (+) Sin flash inicial: el estado oculto vive en CSS, no se aplica con JS post-load.
- (+) `prefers-reduced-motion` se respeta puramente en CSS (`@media (prefers-reduced-motion: reduce)`).
- (−) Animaciones más limitadas que GSAP (sin keyframes complejos, sin scrub). Para reveals simples es suficiente.

---

## ADR-011 · JSON-LD por tipo de página con `@id` consistente

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** En Fase 6 había que decidir cómo emitir Schema.org. Opciones: librería de terceros (schema-dts, etc.), generación manual ad-hoc por página, o helper centralizado.

**Decisión.** Helper centralizado en `web/src/lib/seo.ts` con builders tipados por tipo (`organizationSchema`, `serviceSchema`, `blogPostingSchema`, etc.). Cada entidad usa `@id` con URL canónica (`https://gesdiweb.es/#organization`, `${url}#post`) para que Google asocie las referencias en el knowledge graph.

`Organization` se publica como array `["Organization", "LocalBusiness", "ProfessionalService"]` para cubrir las tres entidades en una sola declaración.

`address` y `telephone` quedan **comentados** hasta que el dueño aporte los datos legales reales. Mejor sin datos que con placeholder en el knowledge graph de Google.

**Consecuencias.**
- (+) Schemas reutilizables y consistentes entre páginas.
- (+) Knowledge graph propio (referencias `@id` cruzadas).
- (+) Cambiar nombre/datos de la organización es 1 archivo.
- (−) Cuando lleguen los datos legales hay que descomentar y rebuild.

---

## ADR-012 · OG image fallback en SVG en lugar de PNG generado

**Fecha:** 2026-05-05
**Estado:** Aceptada (transicional)

**Contexto.** Para Open Graph social cards se necesita imagen 1200×630 por página. Generar PNGs dinámicas (Satori, @vercel/og) añade complejidad y dependencia de canvas/runtime.

**Decisión.** Por ahora, un único SVG estático en `public/og-default.svg` con paleta corporativa. Cuando lleguen materiales reales (Fase 8), sustituir por PNG y opcionalmente generar dinámicas por página.

**Consecuencias.**
- (+) 0 dependencias añadidas, OG funcional inmediatamente.
- (+) SVG versionable en Git, editable.
- (−) **Algunos clientes no soportan SVG en OG** (Slack legacy, ciertos email clients). La mayoría sí (FB, X, LinkedIn, iMessage, WhatsApp).
- (~) En Fase 8 se debe sustituir o complementar con PNG.

---

## ADR-013 · CI/CD con GitHub Actions + webhook Portainer

**Fecha:** 2026-05-05
**Estado:** Aceptada

**Contexto.** En Fase 7 había que automatizar el despliegue. Opciones evaluadas:
1. GitHub Actions con SSH al VPS y `docker compose pull && up -d`.
2. GitHub Actions construye imagen → GHCR → webhook a Portainer hace pull/recreate.
3. Self-hosted runner en el VPS.

**Decisión.** Opción 2: workflow construye y publica en GHCR, después llama al webhook de la stack en Portainer.

**Razones:**
- No expone clave SSH del VPS a GitHub.
- Portainer es source of truth de qué hay desplegado y permite rollback con UI.
- Si el webhook no está configurado (`PORTAINER_WEBHOOK_URL` secret vacío), el workflow no falla — solo loguea warning y continúa. Permite empezar con build-only y conectar el deploy más tarde.

**Consecuencias.**
- (+) Trazabilidad: cada imagen tiene tag `sha-<commit>` para rollback exacto.
- (+) Cache de GitHub Actions reduce builds repetidos a ~30s.
- (+) Push solo afecta a `web/`, `docker-compose.yml` o el workflow — los cambios docs-only no construyen.
- (−) Dependencia de Portainer corriendo. Si Portainer cae, despliegues manuales por SSH.

---

## ADR-014 · Variables de entorno con `astro:env/server` (sustituye al ADR-009)

**Fecha:** 2026-05-06
**Estado:** Aceptada (sustituye ADR-009)

**Contexto.** Tras el fix de ADR-009 (`process.env` en lugar de `import.meta.env`), el dueño reportó que en desarrollo local el `.env` no se cargaba: `process.env.RESEND_API_KEY` aparecía undefined, aunque Astro detecta y carga `.env` automáticamente. Astro 5+ expone una API tipada y consistente entre dev/prod: `astro:env/server`.

**Decisión.** En `astro.config.mjs` declarar el schema:

```js
env: {
  schema: {
    RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
    RESEND_FROM_EMAIL: envField.string({ context: 'server', access: 'secret' }),
    LEAD_NOTIFICATION_EMAIL: envField.string({ context: 'server', access: 'secret' }),
  },
}
```

En el endpoint:

```ts
import { RESEND_API_KEY, RESEND_FROM_EMAIL, LEAD_NOTIFICATION_EMAIL } from 'astro:env/server';
```

**Consecuencias.**
- (+) Carga consistente de `.env` en dev, env vars de docker-compose en prod, sin diferencias de comportamiento.
- (+) Tipado fuerte: si una var falta o tiene tipo incorrecto, error explícito.
- (+) `access: 'secret'` impide que se inlinee accidentalmente en el cliente.
- (−) Hay que mantener el schema sincronizado con `.env.example` y el docker-compose.

---

## ADR-015 · OG images per-entry pre-generadas con Playwright (sustituye al ADR-012)

**Fecha:** 2026-05-06
**Estado:** Aceptada (sustituye ADR-012)

**Contexto.** ADR-012 dejó un único SVG estático como OG fallback. Limitaciones detectadas:
- Algunos clientes (Slack legacy, ciertos email) no soportan SVG en OG.
- Una imagen única para todo el sitio reduce el CTR en social vs imágenes contextuales por entry.

Opciones evaluadas:
1. Generación dinámica en runtime (Satori, `@vercel/og`) — añade dependencias y CPU en el endpoint.
2. Pre-generar PNGs en build/CI con Playwright headless — funciona offline, idempotente.
3. Pedir al dueño una imagen por post — no escala con 69 posts.

**Decisión.** Opción 2: script `web/scripts/generate-og-images.mjs` que recorre las collections, lee el frontmatter y renderiza HTML con Playwright a PNG 1200×630. Una imagen por entry de blog/portfolio/services + el `og-default.png` global. Idempotente: salta archivos existentes salvo `--force`.

Paleta diferenciada por colección:
- **blog** → fondo blanco, accent brand, asterisco soft (artículos de prosa).
- **portfolio** → fondo dark, accent brand, asterisco translúcido (foco visual).
- **services** → fondo brand, texto blanco, asterisco translúcido (estilo agencia).

**Consecuencias.**
- (+) 80 OG images PNG en `web/public/og/` (compatibles con todos los clientes).
- (+) Build de producción no se ralentiza (las PNGs ya están en el repo).
- (+) Cambiar el template afecta a todo: `npm run og:force` regenera.
- (−) PNGs entran al repo Git (~50KB cada una × 80 = ~4MB total). Aceptable.
- (−) Cuando se añade un post nuevo, hay que correr `npm run og` antes del commit.

---

## ADR-016 · Importar blog WP vía REST API (no XML/WXR)

**Fecha:** 2026-05-06
**Estado:** Aceptada

**Contexto.** Para Fase 8 había que migrar 69 posts de la WordPress antigua. Opciones:
1. Export → WXR (XML nativo de WP). Posts vienen con shortcodes sin renderizar.
2. REST API (`/wp-json/wp/v2/posts`). Posts vienen con HTML ya renderizado.

**Decisión.** REST API. El HTML renderizado contiene los shortcodes ya expandidos, las imágenes con sus URLs reales y los enlaces internos resueltos. Solo hay que sanear y convertir a Markdown.

**Consecuencias.**
- (+) Sin parser de shortcodes propios, sin conversión de oEmbed.
- (+) Imágenes con URL final: descarga directa.
- (+) Categorías y tags vienen ya con sus nombres legibles vía endpoints anidados.
- (−) Requiere que la WP origen tenga la REST API habilitada (estaba ok).
- (~) Algún HTML residual ha de limpiarse (clases CSS, `<div class="wp-block-...">` redundantes). Asumido.

---

## ADR-017 · Blog en `.md` (no `.mdx`) por incompatibilidad de WordPress

**Fecha:** 2026-05-06
**Estado:** Aceptada

**Contexto.** Inicialmente el schema de la collection `blog` aceptaba `**/*.{md,mdx}`. Al importar posts WP, MDX intentaba parsear sintaxis tipo `%{REQUEST_URI}` o ejemplos de código que contienen `<2 segundos` como JSX y rompía el build.

**Decisión.** Restringir el glob de la collection `blog` a **solo `*.md`**. Markdown puro pasa esos contenidos como texto literal sin intentar interpretar JSX.

```ts
blog: defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ...
})
```

`portfolio` y `services` siguen aceptando `.mdx` porque su contenido es controlado y sí se beneficia de componentes inline.

**Consecuencias.**
- (+) Build estable con contenido WP histórico.
- (−) En `blog/` no se pueden usar componentes Astro inline. Aceptable: los posts son prosa.
- (~) Si en el futuro queremos un post nuevo con componentes, se podría hacer `.mdx` y sanear su contenido.

---

## ADR-018 · DX: Husky + lint-staged + Prettier a nivel repo

**Fecha:** 2026-05-06
**Estado:** Aceptada

**Contexto.** El proyecto está en estructura "monorepo light" — repo en `/gesdiweb`, app Astro en `/gesdiweb/web`. Hace falta formatear automáticamente al hacer commit, pero solo los archivos de la app, no docs ni configs raíz.

**Decisión.**
- **Prettier 3.8** + **plugin-astro** dentro de `web/`.
- **Husky** con `core.hooksPath = .husky` apuntando al `.husky/` raíz (configurado en `npm run prepare` desde `web/`).
- **lint-staged** dentro de `web/package.json` formatea solo archivos staged.
- Hook `pre-commit` filtra archivos con prefijo `web/` y delega a lint-staged dentro de `web/`. Si no hay archivos `web/` en staging, exit 0 (no formatea docs).

**Consecuencias.**
- (+) Formato consistente en cada commit.
- (+) Docs y configs raíz no tocadas por Prettier.
- (+) Los LLMs no tienen que recordar correr `format` manualmente.
- (−) Primer setup en máquina nueva requiere `npm install` desde `web/` (instala husky vía script `prepare`).

---

## ADR-019 · Renovate para PRs automáticos de dependencias

**Fecha:** 2026-05-06
**Estado:** Aceptada

**Contexto.** Con Astro 6, Tailwind 4 y varias dependencias activas, mantenerlas al día manualmente es tedioso y se olvida. Dependabot vs Renovate vs scripts custom.

**Decisión.** Renovate (config `.github/renovate.json`):
- Schedule: lunes antes de las 6am Europe/Madrid.
- **Patch + minor agrupados** en un solo PR semanal (reduce ruido).
- **Majors críticos** (`astro`, `@astrojs/*`, `vite`, `tailwindcss`, `react`) con label `needs-review` y sin automerge.
- **Fontsource agrupado** en su propio PR.
- `lockFileMaintenance` semanal.
- Vulnerability alerts con label `security`, sin automerge.

**Consecuencias.**
- (+) Un PR por semana con casi todo, fácil de revisar.
- (+) Majors críticos no pasan automáticamente — protege de la incompatibilidad Astro 6 / rolldown-vite (ADR-006).
- (−) Hay que tener Renovate instalado en la org GitHub (cuenta gratuita).

---

## ADR-020 · Reset de imágenes dentro de `@layer base` para que Tailwind utilities ganen

**Fecha:** 2026-05-07
**Estado:** Aceptada

**Contexto.** Al integrar el logo oficial, las clases `h-8 md:h-9 w-auto` no se aplicaban al `<img>`. Computed: `height: 167px` (calculado por aspect-ratio del attribute `width`/`height`), no `36px` (lo que `.h-9` debía aplicar). Investigación: el reset `img,svg,video { display: block; max-width: 100%; height: auto }` en `globals.css` estaba **fuera de cualquier `@layer`**. CSS Cascade Layers hace que las reglas fuera de capas siempre ganen sobre las que están en capas, independientemente de la especificidad. Entonces `height: auto` (sin layer) sobreescribía `.h-9 { height: 36px }` (en `@layer utilities`).

Esto afectaba a más sitios: el `class="hidden"` no ocultaba el SVG del icono X del menú móvil (siempre se veían los dos iconos juntos), las imágenes responsive no respetaban heights asignadas, etc.

**Decisión.** Mover el reset de imgs/svgs/videos a `@layer base`:

```css
@layer base {
  img, svg, video {
    display: block;
    max-width: 100%;
    height: auto;
  }
}
```

Tailwind 4 ordena `@layer theme, base, components, utilities`. Las utilities ganan sobre base.

**Consecuencias.**
- (+) `.hidden`, `.h-X`, `.w-X` aplican correctamente a imgs y svgs.
- (+) El reset sigue funcionando como default cuando no hay clases utility.
- (~) Cualquier futuro reset de elemento HTML que escribamos debe ir dentro de `@layer base` salvo que conscientemente queramos que tenga prioridad máxima.

---

## ADR-021 · Rediseño "Claude Design" (Space Grotesk + Instrument Serif)

**Fecha:** 2026-05-12
**Estado:** Aceptada (sustituye al sistema de diseño v1 con Bricolage + Inter)

**Contexto.** El dueño propuso un rediseño visual completo basado en una nueva propuesta generada con Claude Design. Mantenemos arquitectura (Astro 6, content collections, Resend, JSON-LD), contenido (69 posts, 5 portfolio, 6 servicios) y endpoints. Solo cambia la capa visual y los componentes que la implementan.

**Decisión.** Rediseño en 5 fases más una de blog/post:
- **Fase A** — tokens + tipografías (Space Grotesk Variable + Instrument Serif 400 italic + JetBrains Mono Variable)
- **Fase B** — Header con CTA pill + nav monospace + drawer mobile · Footer dark con bigtype "GESDIWEB®" + magnetic CTA · componente `Marquee` reutilizable
- **Fase C** — home rediseñada (Hero con disco morphing + word swap, services hover azul, portfolio grid 3 cols con marks, process 4 cols)
- **Fase D** — páginas detalle (servicios, portfolio, blog, contacto, **/proceso nueva independiente**)
- **Fase E** — legales con TOC sticky lateral + CookieBanner vanilla + limpieza

Paleta:
- Fondo `#fafaf8` (off-white, no blanco puro)
- Foreground `#0a0a0a`
- Accent brand `#76c2da` (mantenido del anterior `#77c2da`)
- Muted `#a7a7a7`

Patrón visual distintivo: **cualquier `<em>` dentro de `<h1>..<h4>`** se renderiza automáticamente en Instrument Serif italic color brand vía un selector global. Esto permite escribir `<h2>Hacemos cosas <em>raras</em></h2>` y obtener el estilo sin clases extra. Helper `.serif-em` para el mismo efecto fuera de headings.

**Consecuencias.**
- (+) Identidad visual diferenciada y memorable. Los énfasis serif son "la marca" de la web.
- (+) Cero JS para los énfasis: todo se resuelve con CSS y la tipografía.
- (+) Tokens consistentes en `globals.css` con cascada Tailwind 4 (`@theme`).
- (−) Editar contenido nuevo requiere recordar la convención `<em>` para los énfasis (ya documentada en `convenciones.md`).
- (−) Subimos del bundle CSS por las dos familias variables nuevas. Aceptable: ~30KB total con subsetting latin.

Backup del diseño anterior en `web/_design-legacy/` para permitir revert hasta que se valide en producción. Excluido del docker build y de Prettier. Eliminable con `rm -rf web/_design-legacy`.

---

## ADR-022 · Disco morphing + word swap + reveals con CSS puro (sin GSAP en bundle)

**Fecha:** 2026-05-12
**Estado:** Aceptada (refuerza ADR-010)

**Contexto.** El nuevo diseño tiene varias animaciones decorativas: disco que cambia de forma orgánicamente, palabras rotativas en el hero, marquees infinitos, reveals al scroll, drop cap en blog. En la primera iteración (Fase 5 original) decidimos usar GSAP solo para parallax. Con el rediseño, parallax desaparece y todas las animaciones son CSS puro.

**Decisión.** Cero JS para animaciones decorativas del rediseño. Todo CSS:
- `disc-morph` keyframes con border-radius cambiante
- Word swap del hero con keyframes `hero-swap-cycle` y delays escalonados
- Marquee con `translateX(-50%)` y duplicación de items
- Reading progress bar (post) con `scroll` listener trivial que actualiza un `style.width`
- Drop cap con `::first-letter`
- Numeración auto de h2 con CSS counter (`counter-increment: post-h2`)

GSAP queda solo como dependencia disponible en `package.json` pero **no se importa en ningún archivo**. Si en el futuro se necesita una animación compleja se puede recuperar con un import lazy.

**Consecuencias.**
- (+) 0KB JS de animaciones en producción. Solo el código vanilla del reveal observer y el reading progress (juntos <2KB).
- (+) `prefers-reduced-motion` se respeta con un solo bloque CSS por animación.
- (+) Animaciones siguen funcionando aunque falle el JS.
- (~) Posibilidad real de retirar GSAP de `package.json` cuando confirmemos que no hace falta en el roadmap futuro.

---

## ADR-023 · Eliminación del componente `Button` y demás UI legacy

**Fecha:** 2026-05-12
**Estado:** Aceptada

**Contexto.** El sistema v1 tenía componentes UI atómicos (`Marker`, `Tag`, `Badge`, `StatBlock`, `Icon`, `Button`) usados en home y secciones. El rediseño elimina la necesidad de varios de ellos y, además, reveló un bug en `Button`: combinaba `inline-flex` internamente con clases pasadas (`hidden md:inline-flex`), generando ambas reglas en `@layer utilities` con misma especificidad, y ganaba la última en aparición en el CSS. Resultado: en mobile el botón "Hablemos" se veía cuando debería estar oculto.

**Decisión.** Eliminar todos los componentes UI legacy del árbol activo y reemplazarlos por CSS inline en cada página/componente que los use. Los CTAs ahora se escriben como `<a class="...">...</a>` con clases pill construidas en el style scoped del componente.

Componentes eliminados (siguen en `web/_design-legacy/` por si hay que recuperar algo):
- `Marker`, `Tag`, `Badge`, `StatBlock`, `Icon`, `Button`
- `Statement`, `Stats`, `FeatureStrip`, `HomeContactCTA`, `ClientsMarquee`
- `Reveal` (sustituido por CSS `[data-reveal]` global + IO en `SmoothScroll`)

**Consecuencias.**
- (+) Bug del Button resuelto sin parche: el componente que causaba el problema ya no existe.
- (+) Árbol más simple. Cada página/sección tiene su CSS scoped.
- (+) Menos abstracción: leer una página te muestra el diseño completo sin saltar entre componentes.
- (−) Si el sistema crece, podría tener sentido reintroducir un `Button` saneado. Por ahora no se justifica con 5 CTAs en toda la web.

---

## ADR-024 · `/proceso` como página independiente (no solo sección de la home)

**Fecha:** 2026-05-12
**Estado:** Aceptada

**Contexto.** En la web v1 el proceso era una sección de la home (`Process.astro`). El rediseño propuso una página dedicada `/proceso.html` con más profundidad: hero con stats, sticky TOC con saltos a cada fase, descripción larga de cada fase con entregables y herramientas, y una sección de "principios" al final.

**Decisión.** Crear `/proceso` como página independiente prerenderizada con SEO propio (JSON-LD WebPage, meta tags). El componente `Process` de la home sigue existiendo como resumen condensado en 4 columnas y enlaza al detalle.

**Consecuencias.**
- (+) Página dedicada para SEO ("proceso diseño web agencia") sin saturar la home.
- (+) Más espacio para contar el método con honestidad (entregables reales por fase, tiempos).
- (+) La home queda más ligera y enfocada en convertir.
- (~) Hay que mantener consistencia entre el resumen de la home y el detalle. Si se cambia una fase se actualizan los dos sitios.

---

## ADR-025 · CookieBanner vanilla en BaseLayout

**Fecha:** 2026-05-12
**Estado:** Aceptada

**Contexto.** RGPD requiere consentimiento explícito para cookies no esenciales. Actualmente no usamos cookies de analítica ni marketing, pero queremos tener la infraestructura lista para el futuro (Plausible/Umami autohospedado) y dar transparencia al usuario.

**Decisión.** Componente `CookieBanner.astro` inyectado desde `BaseLayout` con tres modos:

1. **Aceptar todas** — activa analytics y marketing en localStorage
2. **Solo necesarias** — guarda preferencias con todo desactivado
3. **Personalizar** — panel expandido con 3 toggles (necesarias locked, analytics, marketing)

El estado se persiste en localStorage (`gesdiweb_cookies_v1`). Tras la primera decisión, el banner se oculta y queda un botón flotante abajo-izquierda para reabrirlo.

Implementación 100% vanilla JS sin dependencias. ~3KB gzipped. Se monta en `astro:page-load` para que View Transitions funcione correctamente.

**Consecuencias.**
- (+) Cumple RGPD sin librerías de terceros.
- (+) Privacidad por diseño: no usamos GA ni FB Pixel. Si activamos analítica será sin cookies de seguimiento.
- (+) Si en el futuro se añaden cookies opcionales, el código que las active solo tiene que leer `localStorage.getItem('gesdiweb_cookies_v1')` y comprobar `analytics: true`.
- (~) Documentado en `politica-cookies.astro` con tabla de tipos y enlaces a cómo gestionarlas desde el navegador.

---

## ADR-026 · TOC del post automático desde `headings.depth === 2`

**Fecha:** 2026-05-12
**Estado:** Aceptada

**Contexto.** El diseño de post incluye una columna izquierda sticky con índice de contenidos del artículo. Generarlo manualmente en cada post sería ruido en el frontmatter; preferimos extraerlo del contenido del MDX/MD.

**Decisión.** En `/blog/[slug].astro`, usar la API de Astro Content `const { Content, headings } = await render(post)` para extraer los headings del artículo. Filtramos por `depth === 2` (solo h2 de primer nivel) y renderizamos un TOC con numeración 01, 02, ... y links a los slugs auto-generados de Astro (rehype-slug por defecto).

Si el post tiene **menos de 2 h2**, el TOC se omite y el `.post-content` ocupa 2 columnas en lugar de 1 (regla CSS `.post-content.with-toc` opcional). Esto cubre posts cortos sin forzar UI vacía.

Adicionalmente, los h2 del cuerpo del post llevan numeración automática `/ 01`, `/ 02`, ... antes del texto vía CSS counter (`counter-increment: post-h2`). No requiere tocar el contenido MD.

**Consecuencias.**
- (+) Posts del blog WP importado tienen TOC sin necesidad de retocar 69 archivos.
- (+) Si el autor reordena o renombra h2, el TOC se actualiza solo.
- (+) Los slugs de los anclajes coinciden con los `id` auto-generados de rehype-slug → links del TOC funcionan sin código extra.
- (−) El TOC solo cubre h2. h3 quedan fuera. Aceptable para artículos de blog cortos.

---

## ADR-027 · Drop cap del post con `excerpt` como párrafo intro

**Fecha:** 2026-05-12
**Estado:** Aceptada

**Contexto.** El diseño de post incluye un párrafo intro con drop cap (letra capital decorativa) en Instrument Serif italic color brand. Tradicionalmente esto requiere un marcador en el contenido (un `<p class="intro">` específico). No queremos pedirle al autor que marque el primer párrafo en cada post.

**Decisión.** El `<p class="post-intro">` se renderiza desde el campo `excerpt` del frontmatter (que ya es obligatorio en todos los posts). El drop cap se aplica con `.post-intro::first-letter`.

El contenido del MDX/MD renderizado con `<Content />` se mete en `.post-prose` debajo, sin drop cap (los párrafos del body son normales).

**Consecuencias.**
- (+) El excerpt cumple dos funciones: meta description SEO + intro visual del post.
- (+) Los 69 posts importados de WP tienen excerpt → drop cap funciona sin retocar nada.
- (+) Si el excerpt es corto el drop cap se ve más impactante (mejor para escaneo).
- (−) El autor debe cuidar que el excerpt comience con una letra mayúscula visualmente fuerte (no número, no símbolo). Documentado en `contenido.md`.
