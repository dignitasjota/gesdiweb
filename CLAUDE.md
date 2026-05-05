# CLAUDE.md — Punto de entrada para cualquier LLM

> Este archivo es el contexto canónico del proyecto. Cualquier LLM (Claude, GPT, Gemini, etc.) que se incorpore al desarrollo debe **leer este documento entero** antes de hacer cualquier cosa, y luego revisar los enlaces que apuntan a documentación más detallada en `docs/`.
>
> **Si en algún momento la información de este archivo contradice lo que ves en el código, el código gana** y debes actualizar este archivo.

---

## 1. Resumen ejecutivo (30 segundos)

- **Proyecto:** rediseño completo de [gesdiweb.es](https://gesdiweb.es), web corporativa de una agencia española de **diseño web y posicionamiento SEO**.
- **Sustituye:** una WordPress antigua que sigue online y rankea (poco tráfico, pero tráfico real que NO debe perderse).
- **Estética objetivo:** suiza moderna, tipografía gigante, mucho blanco, marcadores tipográficos `// 00.01°`, marquees infinitos, scroll suave, animaciones reveal. Inspiración (no clon): [createstudio.framer.media](https://createstudio.framer.media/).
- **Idioma de lanzamiento:** español. Arquitectura preparada para multi-idioma sin implementar inglés todavía.
- **Estado actual:** Fases 0–4 completadas (2026-05-05). Sistema de diseño operativo, 22 páginas maquetadas, contenido en MDX con content collections, formulario de contacto operativo con Resend. Listos para iniciar Fase 5 (animaciones y pulido) cuando el dueño dé luz verde.
- **Dueño / único editor:** Jota (`dignitasjota@gmail.com`), perfil técnico (terminal, Docker, GitHub, Claude Code).

## 2. Reglas de oro (no negociables)

1. **Trabajo por fases con validación.** Hay 9 fases (ver `docs/fases.md`). **No se avanza de fase sin OK explícito del dueño.** Al terminar una fase: resumen + estado + siguientes pasos + esperar luz verde.
2. **SEO es lo más crítico.** La web actual rankea; cualquier decisión que ponga en riesgo el posicionamiento debe consultarse. Redirecciones 301 desde URLs antiguas son obligatorias antes del switch DNS (Fase 9).
3. **0 KB de JS por defecto.** Astro genera HTML estático puro. Solo se añade JS donde sea imprescindible (formulario, GSAP, Lenis).
4. **Móvil primero.** Maquetar en 375px y escalar hacia arriba. Probar siempre en iPhone SE como suelo.
5. **Accesibilidad AA desde el día 1**, no como tarea final. Foco visible, contraste, navegación por teclado, ARIA.
6. **Sin Google Fonts CDN, sin Google Analytics.** Self-host todo (Fontsource, Plausible/Umami).
7. **Imágenes:** siempre `<Image>` o `<Picture>` de Astro. Nunca `<img>`.
8. **TypeScript strict.** Errores tipados son errores reales.
9. **Commits atómicos** en Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`).
10. **Sin dependencias innecesarias.** Justifica cada paquete antes de añadirlo.
11. **Cuando dudes, pregunta.** Pero NO preguntes lo que ya está respondido en este archivo o en `docs/`.

## 3. Stack tecnológico (decisiones cerradas)

| Capa | Tecnología | Versión | Por qué |
|---|---|---|---|
| Framework | **Astro** | 6.2.2 | Static-site generator con HTML 100% estático, ideal SEO |
| CSS | **Tailwind CSS** | 4.1.x | Velocidad de prototipado, tokens custom |
| Bundler interno | Vite | 7.3.2 (forzado) | Vite 8 (rolldown-vite) incompatible con `@tailwindcss/vite` 4.1, ver `package.json#overrides` |
| Sitemap | `@astrojs/sitemap` | 3.7.x | Generación automática, excluye `/styleguide` |
| MDX | `@astrojs/mdx` | 5.0.x | Renderizado del cuerpo de posts y casos de estudio |
| Contenido | **Content Collections + MDX en `web/src/content/`** | — | Sin CMS — el dueño es técnico y el flujo Markdown+Git es más rápido que cualquier panel. Schemas Zod validan el frontmatter |
| Tipografías | Bricolage Grotesque + Inter + JetBrains Mono Variable, Fontsource self-hosted | 5.2.x | Privacidad RGPD, rendimiento, sin CDN externo |
| Animaciones | GSAP + ScrollTrigger | 3.15.x (instalado, sin uso hasta Fase 5) | Estándar profesional |
| Smooth scroll | Lenis | 1.3.x (activo) | Scroll suave estilo Createstudio, respeta `prefers-reduced-motion` |
| Iconografía | SVG inline custom (`web/src/components/ui/Icon.astro`) | — | 26 iconos lineales propios, hereda `currentColor` |
| Email transaccional | **Resend** | (Fase 4+) | Plan free 3.000 emails/mes, API moderna, dominio verificado con SPF+DKIM+DMARC |
| Reverse proxy + SSL | **Nginx Proxy Manager** existente en el VPS | — | Ya desplegado en Hetzner. SSL Let's Encrypt automático |
| Runtime contenedor | **nginx 1.27 alpine** | — | Sirve los archivos estáticos generados por Astro |
| Base de imagen build | **node 22 alpine** | — | Multi-stage Dockerfile |
| Orquestación | Docker Compose | — | |
| VPS producción | Hetzner `157.180.44.59` (8GB / 80GB → migrará a 64GB) | — | Ya alquilado |
| Sistema dev local | macOS (jota) | — | El dev server de Astro corre nativo, no en Docker |
| Repositorio | github.com/dignitasjota/gesdiweb (privado) | — | |
| CI/CD | GitHub Actions → GHCR → Portainer (Fase 8) | — | |

**Decisiones descartadas (no reabrir sin razón nueva):**
- ❌ **Directus / cualquier CMS visual** — descartado por ADR-001. Editor único técnico, MDX es más rápido.
- ❌ **PostgreSQL / Redis** — no se necesita BD; el formulario de leads enviará email vía Resend (sin persistencia inicial).
- ❌ **Caddy** — el VPS ya tiene Nginx Proxy Manager.
- ❌ **Google Fonts / Google Analytics** — privacidad RGPD y rendimiento.

Detalle completo en [`docs/decisiones.md`](docs/decisiones.md).

## 4. Arquitectura

### Diagrama de despliegue (Fase 8 en adelante)

```
                    Internet
                       │
                       ▼  (80 / 443)
            ┌──────────────────────┐
            │ Nginx Proxy Manager  │
            │ gesdiweb.es          │
            │ www.gesdiweb.es      │
            │ (SSL Let's Encrypt)  │
            └──────────┬───────────┘
                       │
                       ▼  (red docker `npm_default`)
            ┌──────────────────────┐
            │ Contenedor `web`     │
            │ - nginx 1.27 alpine  │
            │ - sirve /dist        │
            │   (HTML estático)    │
            └──────────────────────┘
```

### Pipeline de build

```
[ MDX en src/content/ ]──┐
[ .astro pages/        ] │   astro build
[ tailwind.css         ] ├─────────────────► [ web/dist/ ] ──► Docker image ──► GHCR ──► Portainer ──► VPS
[ assets in public/    ] │  (HTML+CSS+IMG estáticos)
└────────────────────────┘
```

### Estructura del repositorio

```
gesdiweb/
├── CLAUDE.md                       ← Este archivo. Entrada para LLMs.
├── README.md                       Lectura humana corta.
├── .gitignore
├── .env.example                    Variables previstas (Resend, GHCR, etc.)
├── docker-compose.yml              Stack producción Hetzner
├── docker-compose.dev.yml          Override dev local (no se usa habitualmente)
│
├── docs/                           ← Documentación viva. Cualquier LLM debe leer todo.
│   ├── briefing.md                 Briefing original del dueño (fuente de verdad del alcance)
│   ├── fases.md                    Plan de 9 fases con estado y validaciones
│   ├── estado.md                   Snapshot del estado actual (se actualiza al cerrar cada fase)
│   ├── arquitectura.md             Detalle de arquitectura, decisiones de diseño, flujos de datos
│   ├── decisiones.md               ADRs (Architecture Decision Records)
│   ├── convenciones.md             Convenciones de código, commits, accesibilidad, SEO
│   ├── docker-explicado.md         Docker desde cero aplicado al proyecto
│   ├── runbook.md                  Operación: despliegue, backups, troubleshooting
│   └── seo-migracion.md            Plan de migración SEO desde la WordPress antigua (Fase 9)
│
└── web/                            Aplicación Astro
    ├── package.json                Override de vite forzado a ^7.3.2
    ├── tsconfig.json               Strict, alias @/* → src/*
    ├── astro.config.mjs            site, sitemap (excluye /styleguide), mdx, tailwind
    ├── Dockerfile                  Multi-stage: node 22 build → nginx 1.27 alpine
    ├── nginx.conf                  gzip, headers cache, headers seguridad
    ├── .dockerignore
    ├── public/
    │   ├── favicon.svg             Provisional (azul corporativo + G blanca)
    │   └── robots.txt              Apunta a /sitemap-index.xml
    └── src/
        ├── content.config.ts       ← Schemas Zod para services / portfolio / blog
        ├── content/                ← Fuente única de contenido (MDX)
        │   ├── services/           5 servicios (.mdx con solo frontmatter)
        │   ├── portfolio/          5 proyectos (.mdx con cuerpo de caso de estudio)
        │   └── blog/               3 posts (.mdx con cuerpo Markdown real)
        ├── pages/
        │   ├── index.astro                  Home (9 secciones)
        │   ├── servicios/index.astro        Listado de servicios
        │   ├── servicios/[slug].astro       Detalle dinámico (consume content collections)
        │   ├── portfolio/index.astro        Listado portfolio
        │   ├── portfolio/[slug].astro       Caso de estudio (renderiza MDX con <Content />)
        │   ├── blog/index.astro             Listado de posts
        │   ├── blog/[slug].astro            Post individual (renderiza MDX)
        │   ├── contacto.astro               Formulario maquetado (envío Fase 4)
        │   ├── styleguide.astro             Página interna (noindex, fuera del sitemap)
        │   ├── aviso-legal.astro
        │   ├── politica-privacidad.astro
        │   └── politica-cookies.astro
        ├── layouts/
        │   ├── BaseLayout.astro    Meta SEO + Header + Footer + SmoothScroll
        │   └── LegalLayout.astro   Layout específico de páginas legales
        ├── components/
        │   ├── ui/                 Marker, Button, Tag, Badge, StatBlock, Icon (+ icon-names.ts)
        │   ├── layout/             Header (fijo, hamburguesa móvil), Footer (con strip brand)
        │   ├── sections/           Hero, ClientsMarquee, Statement, ServicesNumberedList,
        │   │                       PortfolioFeatured, Stats, FeatureStrip, Process,
        │   │                       HomeContactCTA, BlogRecent
        │   └── animations/         SmoothScroll (Lenis)
        ├── lib/
        │   └── collections.ts      ← Helpers async sobre getCollection (drop-in API)
        └── styles/
            └── globals.css         Tailwind import + tokens corporativos + escala fluida
```

## 5. Estado del proyecto

| Fase | Nombre | Estado | Documento |
|---|---|---|---|
| 0 | Setup base | ✅ Completada (2026-05-05) | [`docs/fases.md`](docs/fases.md) |
| 1 | Sistema de diseño | ✅ Completada (2026-05-05) | |
| 2 | Páginas estáticas y maquetación | ✅ Completada (2026-05-05) | |
| 3 | Content collections + MDX | ✅ Completada (2026-05-05) | |
| 4 | Formulario de contacto + Resend | ✅ Completada (2026-05-05) | |
| 5 | Animaciones y pulido | ⏳ | |
| 6 | SEO técnico y performance | ⏳ | |
| 7 | Despliegue en VPS Hetzner | ⏳ | |
| 8 | Migración SEO y switch DNS | ⏳ | |

> **Nota sobre la numeración.** El briefing original tenía 9 fases incluyendo "Fase 1: Directus". Como Directus se descartó (ADR-001), las fases se renumeraron. La numeración vigente está en `docs/fases.md`. Cuando hables con el dueño, refiérete a las fases por nombre además de número para evitar confusiones.

Snapshot detallado y "qué hacer ahora": [`docs/estado.md`](docs/estado.md).

## 6. Lo que NO está decidido todavía

Estos son blockers o pendientes activos que el dueño aún no ha resuelto. **No los inventes.** Si los necesitas para avanzar, pregúntale.

- **Datos legales** para footer y páginas legales: razón social, NIF, dirección fiscal, email de contacto, teléfono. (El dueño dijo: "luego los definimos").
- **Logos de clientes** para el marquee de la home: lista + archivos vectoriales.
- **Material para hero:** ¿vídeo propio o imagen?
- **Stats reales** (años de experiencia, número de proyectos, clientes satisfechos).
- **Foto/firma del fundador** para el CTA final de la home.
- **Material del portfolio inicial:** cuántos proyectos publicar al lanzar y con qué imágenes/textos.
- **URLs reales que rankean en Google Search Console.** El dueño las extraerá antes de Fase 8 para construir el mapa de redirecciones 301.
- **Migración del blog WordPress:** XML/WXR exportado por el dueño en Fase 8.
- **Analítica:** Plausible/Umami autohospedado o servicio externo. Pendiente.
- **Solución cookies/RGPD:** banner propio minimalista vs. servicio externo. Recomendación dada (banner propio si no metemos cookies no esenciales). Pendiente confirmación.

## 7. Cómo editar contenido (sin tocar código)

Todo el contenido editorial vive como **archivos `.mdx` en `web/src/content/`**. Crear o editar contenido es un cambio de archivo + commit, sin tocar páginas Astro:

- **Posts del blog:** `web/src/content/blog/<slug>.mdx`
- **Servicios:** `web/src/content/services/<slug>.mdx`
- **Proyectos del portfolio:** `web/src/content/portfolio/<slug>.mdx`

Cada colección tiene un schema Zod en `web/src/content.config.ts`. Si el frontmatter no cumple, el build rompe (deseado — evita publicar contenido roto).

**Para crear contenido nuevo o adaptar texto bruto al formato MDX correcto, lee la guía completa:** [`docs/contenido.md`](docs/contenido.md). Incluye plantillas listas para copiar, schemas detallados, voz/estilo de redacción y ejemplo de conversión de texto bruto → MDX.

## 8. Cómo continuar el desarrollo (LLM checklist)

Si te incorporas al proyecto, en este orden:

1. **Lee este archivo entero.**
2. **Lee `docs/briefing.md`** — la fuente de verdad sobre el alcance original del dueño.
3. **Lee `docs/fases.md`** — saber exactamente en qué fase estamos y qué exige el siguiente punto de validación.
4. **Lee `docs/estado.md`** — qué quedó hecho en la última sesión y cuál es el próximo paso concreto.
5. **Lee `docs/decisiones.md`** — antes de proponer alternativas técnicas, comprueba que no se hayan descartado ya.
6. **Lee `docs/convenciones.md`** — para no romper estilo de commits, accesibilidad, SEO, etc.
7. **Mira el código:** `web/astro.config.mjs`, `web/src/styles/globals.css`, `web/src/layouts/BaseLayout.astro`.
8. **Comprueba `git log`** para entender el último estado real del repo.
9. **Saluda al dueño con un resumen de qué entendiste y cuál es el siguiente paso propuesto.** Espera su OK.

> Si la tarea es **editar/crear contenido** (no código): saltarse los puntos 5–8 y leer directamente [`docs/contenido.md`](docs/contenido.md).

## 9. Cosas críticas que un LLM nuevo suele intentar hacer mal

- ❌ Proponer un CMS porque "facilitaría la edición". Ya está descartado y razonado en ADR-001.
- ❌ Añadir Caddy / Traefik / un proxy nuevo. Hay NPM en el VPS.
- ❌ Meter React, Vue o Svelte en cliente "para hacer las cosas dinámicas". Astro estático es la decisión.
- ❌ Cargar Google Fonts. Self-host con Fontsource.
- ❌ Subir Astro a 7 o Tailwind a 4.2 sin plan. La combinación actual está pinada por incompatibilidad con rolldown-vite.
- ❌ Saltarse fases "porque parece obvio el siguiente paso". El dueño valida cada fase.
- ❌ Cambiar URLs de páginas que ya rankean en la web actual sin plan de redirecciones.
- ❌ Inventar datos legales, logos de clientes o stats. Si faltan, marcarlos como `[PENDIENTE]` y preguntar.

## 10. Contacto y ubicación de fuentes

- **Repo:** https://github.com/dignitasjota/gesdiweb
- **Dominio:** https://gesdiweb.es (aún apuntando a la WordPress antigua hasta Fase 8)
- **VPS:** Hetzner `157.180.44.59` (Portainer + Nginx Proxy Manager corriendo)
- **Dueño:** dignitasjota@gmail.com
- **Logo de marca:** ver `docs/arquitectura.md#identidad-visual`. Captura provisional en el desktop del dueño; SVG vectorial pendiente de aportar.

---

**Última actualización de este archivo:** 2026-05-05 (cierre de Fase 3).
**Mantenedor:** se actualiza al cerrar cada fase. Si tras tu sesión ha cambiado algo de los puntos 3, 5, 6, 7, 8 o 9, **edítalo** antes de cerrar.
