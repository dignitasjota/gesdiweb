# Estado del proyecto

> **Snapshot dinámico.** Se actualiza al cerrar cada fase o cuando la realidad del repo se separa de los docs. Si entras nuevo al proyecto, este documento te dice **dónde estamos exactamente y qué hacer ahora**.

**Última actualización:** 2026-05-07
**Última fase cerrada:** Fase 6 (SEO técnico) + paquete de mejoras post-fase
**En curso:** Fase 7 — artefactos listos en repo, ejecución pendiente del dueño
**Pendientes para Fase 8:** parte del trabajo (importación de blog WP, OG images per-entry) ya se ha adelantado; queda redirección 301 + switch DNS

---

## Resumen rápido

```
✅ Fase 0  Setup base                   [completada 2026-05-05]
✅ Fase 1  Sistema de diseño            [completada 2026-05-05]
✅ Fase 2  Páginas estáticas            [completada 2026-05-05]
✅ Fase 3  Content collections (MDX)    [completada 2026-05-05]
✅ Fase 4  Formulario + Resend          [completada 2026-05-05, mejorado deliverability 2026-05-06]
✅ Fase 5  Animaciones y pulido         [completada 2026-05-05]
✅ Fase 6  SEO técnico y performance    [completada 2026-05-05, OG per-entry añadidas 2026-05-06]
🟡 Fase 7  Despliegue Hetzner           [artefactos listos · ejecución pendiente del dueño]
🟡 Fase 8  Migración SEO + switch DNS   [adelantado: blog WP importado · pendiente switch DNS y 301s]
```

---

## Qué hay realmente en el repo (2026-05-07)

### Contenido publicado

- **Blog:** 69 posts en `web/src/content/blog/*.md` (importados desde WordPress vía REST API).
- **Portfolio:** 5 proyectos en `web/src/content/portfolio/*.mdx`:
  - `flowfan` (2026, featured) — SaaS IA de medición de fans
  - `asucar-valencia` (2025, featured) — sala latina + sistema de reservas
  - `web-hotel-olympia` (2015) — WordPress + Sakudarte
  - `clinica-parc-central` (2014) — clínica para embarazadas
  - `grupo-as-de-picas` (2014) — SEO mobile-first
- **Servicios:** 6 entradas en `web/src/content/services/*.mdx`:
  1. `diseno-web` — añadido como servicio principal
  2. `posicionamiento-web`
  3. `apps-moviles`
  4. `hosting-web`
  5. `marketing-online`
  6. `mantenimiento-informatico`

### SEO + OG

- **JSON-LD** por tipo de página (`Organization`, `BlogPosting`, `Service`, `CreativeWork`, `WebSite`, `WebPage`, `Blog`, `BreadcrumbList`, `ItemList`).
- **OG images:**
  - `web/public/og-default.png` (1200×630, fallback global, generado con Playwright + HTML).
  - `web/public/og/{blog,portfolio,services}/<slug>.png` — 80 imágenes pre-generadas, una por entry, con paleta diferenciada por colección (blog blanco, portfolio dark, services brand). Generadas idempotentemente con `web/scripts/generate-og-images.mjs`.
- **Logo oficial integrado:**
  - `web/public/logo.png` (397×146, completo con tagline) → JSON-LD `Organization`.
  - `web/public/logo-mark.png` (397×92, sin tagline) → `<Header>` del sitio.

### Formulario de contacto

- Endpoint `web/src/pages/api/contact.ts` operativo con Resend.
- Subject mejorado: `[gesdiweb] Nuevo contacto desde la web — <name>[ · <service>]`.
- Headers de deliverability: `Auto-Submitted: auto-generated`, `List-Unsubscribe: <mailto:...>`, `List-Unsubscribe-Post: List-Unsubscribe=One-Click`.
- Variables runtime leídas con `astro:env/server` (no `process.env` ni `import.meta.env` — ver ADR-014).

### Infra y DX

- **GitHub Actions** workflow `.github/workflows/deploy.yml`: build buildx → push GHCR → webhook Portainer.
- **Docker Compose** producción con imagen GHCR, healthcheck, log rotation, env vars con `:?` (falla rápido si faltan).
- **Husky + lint-staged + Prettier 3.8** configurados a nivel repo (`core.hooksPath = .husky`).
- **Renovate** (`.github/renovate.json`) — PRs agrupados patch+minor, majors críticos a revisión manual.
- **Skip link** para navegación por teclado.
- **Menú móvil** funcional (drawer fullscreen + ESC + click outside + cierre en transición de página).

---

## Lo que queda pendiente

### Pendiente del dueño (ejecución manual)

Pasos del dueño según [`docs/despliegue.md`](despliegue.md):

1. **Subdominio QA:** crear DNS `new.gesdiweb.es` → `157.180.44.59` (TTL 300s).
2. **Resend:** cuenta + API key + verificar dominio (SPF + DKIM + DMARC). [Ya hecho en local — emails llegando, primeros entran a spam por reputación nueva del dominio.]
3. **GitHub:**
   - Settings → Actions → Workflow permissions → "Read and write".
   - Verificar primer build del workflow funciona.
   - Hacer pública la imagen GHCR (o configurar Portainer con PAT).
4. **VPS Hetzner (SSH):** UFW (22 + 80 + 443) + fail2ban con jail SSH.
5. **Portainer:** stack `gesdiweb` como repo Git, env vars (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL`), webhook GitOps activado, URL guardada como secret `PORTAINER_WEBHOOK_URL` en GitHub.
6. **Nginx Proxy Manager:** proxy host `new.gesdiweb.es` → `gesdiweb_web:4321`, SSL Let's Encrypt, force SSL + HTTP/2 + HSTS.
7. **Validación post-deploy:** Lighthouse 95+, axe-core 0 violaciones críticas, Rich Results Test, formulario real.
8. **Backups:** snapshots diarios en panel Hetzner.

### Pendiente de material del dueño

- **Datos legales:** razón social, NIF, dirección fiscal, email, teléfono → footer + legales + JSON-LD `address`/`telephone`.
- **Logos de clientes** para `ClientsMarquee`.
- **Material hero:** vídeo propio o imagen.
- **Stats reales** (años, proyectos, clientes).
- **Foto/firma del fundador** para CTA final de la home.
- **Captura real del panel de FlowFan** (la galería actual usa screenshots del demo).
- **URLs reales que rankean** desde Google Search Console → mapa de redirecciones 301 (Fase 8).

### Bugs detectados sin abordar todavía

- **Componente `Button` con `class="hidden md:inline-flex"` no oculta en mobile.** El componente aplica `inline-flex` y luego concatena las clases pasadas; en Tailwind 4 ambas reglas viven en `@layer utilities` con misma especificidad y gana la última en aparecer. Visible en el botón "Hablemos" del Header en mobile. Pendiente: refactor del componente para que detecte/elimine clases display cuando se le pasen explícitamente.

---

## Notas de sesiones recientes

### 2026-05-07 — logo oficial + bug raíz en `@layer base`

- Integrado el logo oficial: `logo.png` para JSON-LD y `logo-mark.png` (recortado con Playwright sin tagline) para el Header.
- Bug raíz descubierto: el reset de `img/svg/video { display: block; max-width: 100%; height: auto }` en `globals.css` estaba **fuera de cualquier `@layer`**. CSS Cascade Layers hace que las reglas fuera de capas ganen siempre sobre las que están en capas, así que `.h-9`, `.hidden`, etc. de Tailwind 4 nunca se aplicaban a imgs y svgs. Fix: meter el reset dentro de `@layer base`. Esto afectaba a más sitios (iconos del menú móvil con `class="hidden"` que aparecían siempre, imgs sin respetar la altura asignada).

### 2026-05-06 — paquete de mejoras técnicas post-Fase 7

- **`astro:env/server` API** sustituye a `process.env` (que a su vez había sustituido a `import.meta.env`). Razón: el dueño reportó que el `.env` no se cargaba en dev. La nueva API funciona en dev y prod consistentemente. ADR-009 actualizado en ADR-014.
- **Resend deliverability:** primer email del dueño llegó a spam (reputación nueva del dominio). Mejoras aplicadas: subject con prefix `[gesdiweb]`, headers `Auto-Submitted` y `List-Unsubscribe` (one-click). Comportamiento esperado: la primera entrega a cada cuenta puede ir a spam — marcar como no spam construye reputación.
- **OG images per-entry pre-generadas:** script `web/scripts/generate-og-images.mjs` con Playwright headless. Idempotente (no regenera si existe; flag `--force` para forzar). Reemplaza la estrategia de SVG estático del ADR-012. ADR-015 nuevo.
- **OG default migrado de SVG a PNG:** algunos clientes no soportan SVG en OG. Generación automática vía mismo script.
- **Skip link de accesibilidad** y **menú móvil completamente funcional** (drawer fullscreen + ESC + click + close en `astro:before-swap`).
- **DX:** Husky + lint-staged + Prettier configurados a nivel repo. Hook `pre-commit` filtra archivos en `web/` y delega a lint-staged dentro de `web/`.
- **Renovate** activado para PRs automáticos de dependencias (patch+minor agrupados, majors críticos a revisión manual).

### 2026-05-06 — adelanto de Fase 8 parcial: blog WP importado

- 69 posts del WordPress antiguo importados vía **REST API** (`/wp-json/wp/v2/`). Decisión vs XML/WXR: la REST devuelve HTML ya renderizado (mejor que parsear shortcodes y vista renderizada del XML).
- 36 covers detectados desde imágenes en el body, 8 desde `featured_media`, 25 generados sintéticamente con paleta brand. Total 69/69 con cover.
- Slug rules: kebab-case, sin acentos, sin guión bajo. Helper `safeFilename` slugify aplicado a archivos descargados (decodifica URL-encoded antes).
- **Cambio importante:** la colección `blog` pasó de `**/*.{md,mdx}` a **solo `*.md`**. Razón: WordPress contiene shortcodes tipo `%{REQUEST_URI}` que MDX intenta interpretar como JSX y rompe el build.

### 2026-05-06 — portfolio + servicios

- **Portfolio:** sustituidos 3 placeholders por proyectos reales con casos de estudio completos (FlowFan, Asucar Valencia, Hotel Olympia). Reordenados a 1–5. Galería renderizada en página de detalle.
- **Servicios:** `diseno-web` añadido como servicio principal (order 1). Slug en kebab-case sin tildes (cuidado al referenciarlo desde formulario o frontmatter `servicesUsed`).

### 2026-05-05 — cierre Fases 0–7 (artefactos)

Ver historial original más abajo en este mismo doc o `docs/fases.md`.

---

## Próximo paso concreto

**Para el dueño:** seguir el procedimiento en [`docs/despliegue.md`](despliegue.md). Empezar por §3 Resend → §4 GitHub Actions → §5 VPS → §6 Portainer → §7 NPM → §8 Validación.

**Para LLMs entrando ahora:**
1. Leer `CLAUDE.md`, este doc, `docs/decisiones.md`.
2. Si la tarea es **editar contenido**: leer `docs/contenido.md`.
3. Si la tarea es **bug del Button** (ver "Bugs detectados sin abordar"): refactor del componente.
4. Si la tarea es **adelantar Fase 8**: empezar por mapeo de URLs viejas → nuevas en `docs/seo-migracion.md`.

---

## Histórico breve

- **2026-05-05** — Fases 0 a 7 cerradas en una sesión. Artefactos de despliegue listos. Bug `import.meta.env` → `process.env` corregido.
- **2026-05-06** — paquete de mejoras técnicas post-Fase 7 + adelanto parcial de Fase 8 (blog WP, portfolio real, servicios).
- **2026-05-07** — logo oficial integrado, bug raíz `@layer base` corregido.
