# Estado del proyecto

> **Snapshot dinámico.** Se actualiza al cerrar cada fase o cuando la realidad del repo se separa de los docs. Si entras nuevo al proyecto, este documento te dice **dónde estamos exactamente y qué hacer ahora**.

**Última actualización:** 2026-05-12
**Última fase cerrada:** Rediseño "Claude Design" — Fases A–E + blog v3 completas
**En curso:** Fase 7 — artefactos listos en repo, ejecución pendiente del dueño
**Pendientes para Fase 8:** parte del trabajo (importación de blog WP, OG images) ya adelantado; queda 301s + switch DNS

---

## Resumen rápido

```
✅ Fase 0  Setup base                       [completada 2026-05-05]
✅ Fase 1  Sistema de diseño v1             [completada 2026-05-05]
✅ Fase 2  Páginas estáticas                [completada 2026-05-05]
✅ Fase 3  Content collections (MDX)        [completada 2026-05-05]
✅ Fase 4  Formulario + Resend              [completada 2026-05-05, deliverability 2026-05-06]
✅ Fase 5  Animaciones y pulido             [completada 2026-05-05]
✅ Fase 6  SEO técnico y performance        [completada 2026-05-05, OG per-entry 2026-05-06]
🔁 REDISEÑO  "Claude Design" v2 (5 fases)   [completado 2026-05-12]
🟡 Fase 7  Despliegue Hetzner               [artefactos listos · ejecución pendiente del dueño]
🟡 Fase 8  Migración SEO + switch DNS       [blog WP importado · pendiente switch DNS y 301s]
```

---

## Rediseño "Claude Design" (2026-05-12)

Rediseño visual completo siguiendo nueva propuesta del dueño, manteniendo arquitectura, contenido y endpoints. Se ejecutó en 5 fases más una para blog/post:

| Fase | Commit | Qué entrega |
|---|---|---|
| A | `0cab235` | Sistema de diseño: tipografías + tokens + helpers |
| B | `e4391ec` | Header + Footer + componente Marquee |
| C | `7fdbc09` | Home rediseñada (Hero, Services, Portfolio, Process, Blog) |
| D | `b34b3b4` | Páginas detalle: servicios, portfolio, contacto, blog, **/proceso nueva** |
| E | `19e68fb` | Legales con TOC sticky + CookieBanner + limpieza |
| Blog v3 | `cbdf95c` | Blog y posts con diseño editorial completo (TOC + drop cap + pull-quote + reading progress) |

### Identidad visual nueva

- **Fondo:** `#fafaf8` (off-white, no blanco puro)
- **Foreground:** `#0a0a0a`
- **Accent brand:** `#76c2da` (idéntico al anterior `#77c2da`)
- **Tipografías:** **Space Grotesk Variable** (display + sans) + **Instrument Serif 400 italic** (énfasis decorativos) + JetBrains Mono Variable (markers). Self-hosted con Fontsource.
- **Patrón distintivo:** `<em>` dentro de cualquier `<h1>..<h4>` se renderiza automáticamente en Instrument Serif italic color brand. Helper `.serif-em` para el mismo efecto fuera de headings.

### Patrones reutilizables

- `marker-eye` (utility): marcador monospace con dot brand `● Capacidades · 006`
- `.disc-morph`: disco animado orgánico con `border-radius` cambiante (respeta `prefers-reduced-motion`)
- Marquee component: items con asteriscos como separadores, variants `light` y `brand`, pausa en hover
- Pull-quote en posts: comilla `\201C` decorativa gigante, borde izq brand, fuente Instrument Serif italic
- Numeración automática `/ 01 / 02 / 03` antes de cada `<h2>` de un post (CSS counter, no requiere tocar el MD)

### Páginas con diseño nuevo

| Página | Patrón |
|---|---|
| `/` (home) | Hero gigante + disco morphing + word swap rotativo · Services hover azul · Portfolio grid 3 cols · Process 4 cols · Blog cards |
| `/servicios` | Listado tipo "filas hover azul" |
| `/servicios/[slug]` | Detalle con title gigante + tagline serif + mark decorativo (1ª palabra a 700px opacity 0.08) |
| `/portfolio` | Grid 3 cols con cover real o iniciales |
| `/portfolio/[slug]` | Case study con title 180px + meta 4 cols + hero media 64vh + galería + tech-grid + next |
| `/proceso` (NUEVA) | Hero + stats + sticky TOC + 4 fases con copy/viz/entregables/tools + 6 principios |
| `/blog` | Hero + featured destacado + filtro sticky por categoría + grid 3 cols editorial |
| `/blog/[slug]` | Hero + hero-image + body 3 cols (TOC izq sticky · content · rail derecho sticky) + author card + next post |
| `/contacto` | Hero con mark decorativo `↗` + grid form/info side · servicios y presupuesto como chips de radio |
| Legales | Layout con TOC sticky lateral + numeración 01/02/03 + info-box brand tint |

### Componentes y limpieza

**Nuevos:**
- `Marquee.astro` — separator infinito con asteriscos, variants light/brand
- `CookieBanner.astro` — vanilla JS, 3 acciones (todas/necesarias/personalizar), persistencia en localStorage, botón flotante para reabrir

**Eliminados** (siguen en `web/_design-legacy/` para revert):
- `Marker`, `Tag`, `Badge`, `StatBlock`, `Icon`, `Button`
- `Statement`, `Stats`, `FeatureStrip`, `HomeContactCTA`, `ClientsMarquee`
- `Reveal` (sustituido por CSS `[data-reveal]` global)

---

## Qué hay realmente en el repo (2026-05-12)

### Contenido publicado

- **Blog:** 69 posts en `web/src/content/blog/*.md` (importados desde WordPress vía REST API).
- **Portfolio:** 5 proyectos en `web/src/content/portfolio/*.mdx`:
  - `flowfan` (2026, featured)
  - `asucar-valencia` (2025, featured)
  - `web-hotel-olympia` (2015)
  - `clinica-parc-central` (2014)
  - `grupo-as-de-picas` (2014)
- **Servicios:** 6 entradas en `web/src/content/services/*.mdx`:
  1. `diseno-web`
  2. `posicionamiento-web`
  3. `apps-moviles`
  4. `hosting-web`
  5. `marketing-online`
  6. `mantenimiento-informatico`

### SEO + OG

- JSON-LD por tipo de página (organización, blog post, servicio, breadcrumb, etc.)
- 80 OG images PNG pre-generadas con Playwright en `web/public/og/{blog,portfolio,services}/<slug>.png`
- `og-default.png` global

### Formulario de contacto

- Endpoint `web/src/pages/api/contact.ts` operativo con Resend
- Headers de deliverability (Auto-Submitted, List-Unsubscribe)
- Vars con `astro:env/server` (carga consistente en dev y prod)
- **Cambio en el form:** los campos `service` y `budget` son ahora **chips de radio** en lugar de `<select>` y radio button group

### Infra y DX

- GitHub Actions: build → push GHCR → webhook Portainer
- Docker Compose producción con imagen GHCR, healthcheck, log rotation, env vars con `:?`
- Husky + lint-staged + Prettier 3.8 a nivel repo (`core.hooksPath = .husky`)
- Renovate (`.github/renovate.json`)

### Backup del diseño anterior

`web/_design-legacy/` contiene snapshot completo de `styles/`, `components/`, `layouts/` del diseño previo al rediseño. Eliminable con `rm -rf web/_design-legacy` cuando el rediseño esté validado en producción. Excluido del docker build (`.dockerignore`) y de Prettier (`.prettierignore`).

---

## Lo que queda pendiente

### Pendiente del dueño (ejecución manual)

Pasos según [`docs/despliegue.md`](despliegue.md):

1. Subdominio QA: `new.gesdiweb.es` → VPS Hetzner
2. Resend: cuenta + dominio verificado (SPF/DKIM/DMARC) — **YA hecho en dev**
3. GitHub Actions: permisos write + primer build → GHCR pública
4. VPS Hetzner: UFW + fail2ban
5. Portainer: stack como repo Git + env vars + webhook GitOps
6. NPM: proxy host con SSL Let's Encrypt
7. Validación post-deploy: Lighthouse 95+, axe-core 0 violaciones, formulario real
8. Backups: snapshots diarios Hetzner

### Pendiente de material del dueño

- **Datos legales reales** para reemplazar los `[PENDIENTE · ...]` en aviso legal y política de privacidad
- **Logos de clientes** para `ClientsMarquee` (cuando lo recuperemos, no urge)
- **Stats reales** del estudio para `/proceso` (años, proyectos, etc.)
- **Foto del fundador** para CTA o autor del blog
- **Captura real del panel de FlowFan**
- **URLs reales que rankean** desde Google Search Console → mapa 301 (Fase 8)

### Pendiente técnico

- **Auditoría Lighthouse/axe-core** sobre el rediseño nuevo (no he podido tomar screenshots por incompatibilidad de Chromium con la versión cacheada local).
- **Regenerar OG images** si quieres reflejar la nueva paleta tipográfica (`npm run og:force`). Las actuales siguen funcionando porque la paleta brand es la misma.
- **Datos legales reales** una vez los tenga el dueño.

---

## Notas de sesiones recientes

### 2026-05-12 — Rediseño "Claude Design" completo

Se ejecutó el rediseño visual completo en 5 fases + blog v3 (commits `0cab235`..`cbdf95c`). Cambios principales:

- **Tipografía:** sustituido Bricolage Grotesque + Inter por Space Grotesk Variable (display + sans) e Instrument Serif italic para énfasis decorativos.
- **Tokens:** fondo `#fafaf8` (off-white), accent `#76c2da`, escala fluida ampliada hasta `--text-display-hero` (224px). Nuevo `--ease` con cubic-bezier(0.65,0,0.05,1).
- **Reset CSS:** el reset de imgs/svgs sigue en `@layer base` (ADR-020) — sin esto, las clases utility de Tailwind no aplican.
- **Bug arreglado de raíz:** el componente `Button` antiguo combinaba mal sus clases con las pasadas (`hidden md:inline-flex` no ocultaba en mobile). El componente fue eliminado y los CTAs ahora usan `<a>` con clases inline, lo que resuelve el bug y simplifica el árbol.

Decisiones tomadas durante el rediseño:

- **Sin reloj de Madrid en header** (decisión del dueño, evita JS de cliente innecesario)
- **Sin testimonial** en la home (no tenemos uno real todavía)
- **Sin newsletter funcional** (no hay endpoint y no queremos prometer algo que no entregamos)
- **`/proceso` como página independiente** (no solo sección de la home)
- **Author bio del blog genérica** en lugar de mapeo hardcoded por autor

Patrones nuevos importantes:

- `<em>` dentro de h1-h4 = Instrument Serif italic brand automático (sin clase extra). Helper `.serif-em` para fuera de headings.
- Numeración auto `/ 01 / 02` antes de cada `<h2>` del cuerpo de un post (CSS counter, no requiere tocar el MD).
- TOC automático del post leído de `headings.depth === 2` de Astro Content. Se omite si el post tiene menos de 2 h2.
- Drop cap Instrument Serif italic brand en el párrafo intro del post (CSS `::first-letter`).
- Color del thumb del post derivado del slug con seed numérico (estable entre vistas).

### Sesiones anteriores

Ver `docs/fases.md` y el historial git para detalle de cada fase 0–6 y mejoras pre-rediseño.

---

## Próximo paso concreto

**Para el dueño:** elegir entre:

1. **Validar el rediseño en local** (`cd web && npm run dev`) revisando home, servicios, portfolio, /proceso, blog (con filtros), un post largo (con TOC y blockquote), contacto, legales y el cookie banner.
2. Si OK, **arrancar el despliegue** siguiendo [`docs/despliegue.md`](despliegue.md). Empezar por §3 Resend → §4 GitHub Actions → §5 VPS → §6 Portainer → §7 NPM → §8 Validación.

**Para LLMs entrando ahora:**
1. Leer `CLAUDE.md`, este doc, `docs/decisiones.md`.
2. Si la tarea es **editar contenido**: leer `docs/contenido.md`.
3. Si la tarea es **adaptar otra sección al diseño nuevo**: ver patrones en `docs/convenciones.md` § "Sistema de diseño v2".

---

## Histórico breve

- **2026-05-05** — Fases 0–7 cerradas. Artefactos despliegue listos.
- **2026-05-06** — Mejoras post-Fase 7 + adelanto parcial Fase 8 (blog WP, portfolio real).
- **2026-05-07** — Logo oficial integrado + fix raíz `@layer base`.
- **2026-05-12** — **Rediseño "Claude Design"** completo (5 fases + blog v3).
