# Plan de fases

> Cada fase tiene un **punto de validación** obligatorio. **No se avanza sin OK explícito del dueño.** Al cerrar una fase, escribir resumen + estado + siguientes pasos en `docs/estado.md` y esperar luz verde.

Estado global:

| # | Fase | Estado |
|---|---|---|
| 0 | Setup base | ✅ Completada (2026-05-05) |
| 1 | Sistema de diseño | ✅ Completada (2026-05-05) |
| 2 | Páginas estáticas y maquetación | ✅ Completada (2026-05-05) |
| 3 | Content collections (MDX) | ⏳ |
| 4 | Formulario de contacto + Resend | ⏳ |
| 5 | Animaciones y pulido | ⏳ |
| 6 | SEO técnico y performance | ⏳ |
| 7 | Despliegue en VPS Hetzner | ⏳ |
| 8 | Migración SEO y switch DNS | ⏳ |

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

## Fase 1 — Sistema de diseño

**Objetivo:** dejar listo el sistema de diseño completo para que las páginas reales se maqueten encima sin tomar decisiones visuales adicionales.

**Tareas:**
1. Cargar tipografías Bricolage Grotesque + Inter + JetBrains Mono con Fontsource (subset latin, `font-display: swap`).
2. Definir tokens completos en `globals.css`: escala fluida `clamp()`, espaciados, radios, sombras (mínimas), z-index.
3. Crear componentes UI base en `web/src/components/ui/`:
   - `Marker.astro` — etiqueta mono `// 00.01°`
   - `Button.astro` — primario, secundario, ghost
   - `Tag.astro` — píldora pequeña
   - `Badge.astro`
   - `StatBlock.astro` — número grande + descripción
4. Crear `Header.astro` y `Footer.astro` en `components/layout/`.
5. Configurar GSAP + Lenis con `<SmoothScroll>` wrapper en `components/animations/`.
6. Crear página oculta `/_styleguide` que muestre todos los componentes y tokens.

**Punto de validación:**
- Revisar `/_styleguide` y aprobar dirección visual antes de tocar páginas reales.
- Lighthouse ≥ 95 en `/_styleguide` (sin contenido pesado).

**Lo que NO se hace en Fase 1:**
- Maquetación de home, servicios, portfolio, blog, contacto. Esto es Fase 2.
- Animaciones específicas de página (reveals, marquees con datos reales). Eso es Fase 5.

---

## Fase 2 — Páginas estáticas y maquetación

**Orden estricto, una página tras otra. Validar cada una antes de pasar a la siguiente.**

1. **Home** — siguiendo el guion del [briefing §6](briefing.md#6-estructura-de-la-home).
2. **Servicios** — listado + página de detalle (5 servicios).
3. **Portfolio** — listado + página de detalle.
4. **Blog** — listado + página de detalle.
5. **Contacto** — formulario incluido (la integración con Resend es Fase 4).
6. **Páginas legales** — `/aviso-legal`, `/politica-privacidad`, `/politica-cookies`. Datos legales reales pendientes del dueño.

**Cada página primero se maqueta SIN animaciones.** Las animaciones se añaden en Fase 5.

**Datos:** placeholders Lorem-style mientras no haya contenido real. Marcar claramente con `[PLACEHOLDER]` cualquier dato que el dueño deba aportar (logos clientes, fotos, stats, datos legales).

**Punto de validación:** revisar cada página en desktop (1440), tablet (768) y móvil (375) antes de continuar.

---

## Fase 3 — Content collections (MDX)

**Objetivo:** mover contenido hardcoded en `.astro` a colecciones MDX tipadas con Zod.

**Tareas:**
1. Configurar `web/src/content/config.ts` con schemas Zod para `services`, `portfolio`, `blog`.
2. Crear archivos MDX iniciales con datos de ejemplo (los reales llegarán en Fase 8).
3. Páginas dinámicas con `getStaticPaths()`.
4. Imágenes optimizadas con `<Image>` desde dentro de MDX.
5. Generar JSON-LD por colección.

**Punto de validación:** crear/editar un MDX y ver el cambio reflejado tras `npm run build`. Tipos correctos al meter datos inválidos.

---

## Fase 4 — Formulario de contacto + Resend

**Tareas:**
1. Validación cliente con Zod en el formulario de `/contacto`.
2. Endpoint Astro (`server: 'hybrid'` o action) que recibe POST.
3. Honeypot anti-spam + rate limit básico (cookie/IP).
4. Envío de email con Resend al `LEAD_NOTIFICATION_EMAIL`.
5. Respuesta de éxito/error con UI accesible.

**Variables `.env`:**
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (verificado en dominio gesdiweb.es)
- `LEAD_NOTIFICATION_EMAIL`

**DNS pendiente:** SPF + DKIM + DMARC en `gesdiweb.es` para verificar el dominio en Resend. Se hace al desplegar el formulario.

**Punto de validación:** enviar formulario de prueba, recibir email.

---

## Fase 5 — Animaciones y pulido

**Tareas:**
1. GSAP ScrollTrigger en secciones que lo requieran (reveals, parallax suave).
2. Marquees infinitos en logos de clientes y banda de texto.
3. Reveals de texto y elementos al scroll.
4. Transiciones de página con Astro View Transitions API.
5. Cursor follower (opcional, evaluar si aporta).
6. Estados de hover refinados.

**Punto de validación:** prueba en móvil/tablet/desktop. Que las animaciones no rompan rendimiento ni accesibilidad (`prefers-reduced-motion` respetado).

---

## Fase 6 — SEO técnico y performance

**Tareas:**
1. `@astrojs/sitemap` configurado correctamente con prioridades.
2. `robots.txt` revisado.
3. JSON-LD por tipo de página (Organization, LocalBusiness, Service, CreativeWork, BlogPosting).
4. Meta tags dinámicos (title, description, OG image por página).
5. Open Graph images dinámicas (opcional, `@vercel/og` o pre-generadas en build).
6. Auditoría Lighthouse: 95+ en performance, accesibilidad, SEO, best practices.
7. Auditoría con axe-core.
8. Comprimir/optimizar imágenes self-hosted.

**Punto de validación:** Lighthouse 95+ en home, servicios, portfolio, blog, contacto.

---

## Fase 7 — Despliegue en VPS Hetzner

**Pre-requisitos:** decidir CI/CD definitivo (GHCR + Portainer webhook vs. GitHub Actions con SSH).

**Tareas:**
1. Verificar Portainer + NPM funcionando en `157.180.44.59`.
2. Crear stack `gesdiweb` en Portainer apuntando al repo.
3. Configurar dominios en NPM: `gesdiweb.es`, `www.gesdiweb.es` (con redirección www → apex).
4. SSL Let's Encrypt automático en NPM.
5. Firewall del host (UFW): solo 22, 80, 443.
6. fail2ban.
7. CI/CD: push a `main` → GitHub Actions construye imagen → GHCR → Portainer pull/redeploy.
8. Backups: snapshot del VPS o tar del volumen de assets generados (mínimo, ya que el contenido vive en Git).

**DNS:** todavía NO se hace el switch del dominio aquí. Se despliega bajo un dominio temporal (`new.gesdiweb.es` o subdominio en NPM) para QA.

**Punto de validación:** el sitio responde con SSL válido en el dominio temporal con Lighthouse decente.

---

## Fase 8 — Migración SEO y switch DNS

**Pre-requisitos:**
- El dueño extrae las URLs reales que rankean desde Google Search Console.
- El dueño exporta el blog WordPress en XML/WXR.

**Tareas:**
1. Mapear URLs antiguas → nuevas (incluso 1:1 si los slugs coinciden).
2. Configurar redirecciones 301 en NPM o nginx del contenedor `web`.
3. Migrar posts del WordPress a MDX (script Node + `xml2js` o conversión manual).
4. Migrar imágenes del blog a `web/public/images/blog/`.
5. Cambiar DNS del dominio `gesdiweb.es` al VPS Hetzner.
6. Verificar todas las redirecciones con `curl -I`.
7. Resubir sitemap a Google Search Console y Bing Webmaster Tools.
8. Monitorizar errores 404 las primeras 2 semanas.

**Detalle completo en [`seo-migracion.md`](seo-migracion.md).**

**Punto de validación:** sin pérdidas de tráfico orgánico significativas en los 30 días siguientes al switch.
