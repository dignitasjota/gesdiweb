# Estado del proyecto

> **Snapshot dinámico.** Se actualiza al cerrar cada fase o al final de cualquier sesión de trabajo significativa. Si entras nuevo al proyecto, este documento te dice **dónde estamos exactamente y qué hacer ahora**.

**Última actualización:** 2026-05-05
**Última fase cerrada:** Fase 0 — Setup base
**Fase en curso:** ninguna (esperando OK del dueño para iniciar Fase 1)

---

## Resumen rápido

```
✅ Fase 0  Setup base                   [completada 2026-05-05]
⏳ Fase 1  Sistema de diseño            [siguiente — esperando OK]
⏳ Fase 2  Páginas estáticas
⏳ Fase 3  Content collections (MDX)
⏳ Fase 4  Formulario + Resend
⏳ Fase 5  Animaciones y pulido
⏳ Fase 6  SEO técnico y performance
⏳ Fase 7  Despliegue Hetzner
⏳ Fase 8  Migración SEO + switch DNS
```

---

## Lo que está funcionando ahora mismo

- Repo en `github.com/dignitasjota/gesdiweb` con `main` pusheada.
- `cd web && npm install` instala 287 paquetes sin vulnerabilidades.
- `cd web && npm run dev` arranca Astro en `http://localhost:4321`.
- `cd web && npm run build` produce HTML estático en `web/dist/`.
- `docker build -t gesdiweb-web ./web` construye la imagen multi-stage.
- `docker run --rm -p 8090:80 gesdiweb-web` sirve el sitio en `localhost:8090` (HTTP 200, nginx 1.27).

## Lo que NO está hecho todavía

- Tipografías Bricolage / Inter / JetBrains Mono → Fase 1.
- Sistema de diseño completo (escala fluida, espaciados, componentes UI) → Fase 1.
- Header y Footer → Fase 1.
- GSAP + Lenis → Fase 1.
- Página `/_styleguide` → Fase 1.
- Cualquier maquetación de página real → Fase 2.
- Content collections + MDX → Fase 3.
- Formulario de contacto operativo → Fase 4.
- Animaciones reveal/marquee → Fase 5.
- Lighthouse 95+ verificado → Fase 6.
- Despliegue a producción → Fase 7.
- Redirecciones 301 y migración del blog → Fase 8.

## Dependencias bloqueadas a información del dueño

| Necesario para | Pendiente de aportar |
|---|---|
| Páginas legales (Fase 2) | Razón social, NIF, dirección fiscal, email contacto, teléfono |
| Marquee de logos (Fase 2) | Lista + SVGs de clientes |
| Hero de la home (Fase 2) | Vídeo o imagen propios |
| Stats de la home (Fase 2) | Cifras reales (años, proyectos, clientes) |
| CTA final home (Fase 2) | Foto/firma del fundador |
| Portfolio inicial (Fase 3) | Imágenes y descripciones de proyectos |
| Verificación Resend (Fase 4) | Acceso DNS para SPF + DKIM + DMARC |
| Migración SEO (Fase 8) | Export Search Console (URLs que rankean) |
| Migración blog (Fase 8) | Export XML/WXR del WordPress |
| Analítica | Decisión Plausible/Umami self-hosted vs. servicio externo |
| Banner cookies | Decisión: banner propio (recomendado) vs. servicio |

---

## Detalle de Fase 0 (cerrada)

**Commits en `main`:**

```
9cf36f2 feat(web): scaffold Astro 6 + Tailwind 4 con BaseLayout y home placeholder
89b49a9 feat(infra): docker compose para producción (NPM) y override dev
1100302 docs: docker primer, decisiones (ADRs) y runbook
a9e525a chore: initial repo scaffold (.gitignore + README)
```

**Archivos clave creados:**

- `web/package.json` con override `vite: ^7.3.2` (rolldown-vite incompatible con `@tailwindcss/vite` 4.1).
- `web/astro.config.mjs` (site, sitemap es-ES, tailwind via `@tailwindcss/vite`).
- `web/tsconfig.json` (strict, alias `@/*`).
- `web/src/styles/globals.css` (tokens corporativos `#77C2DA`, `#A7A7A7`).
- `web/src/layouts/BaseLayout.astro` (meta SEO, OG, Twitter, canonical).
- `web/src/pages/index.astro` (placeholder con marker `// 00.00°`).
- `web/Dockerfile` (multi-stage node 22 → nginx 1.27 alpine, healthcheck).
- `web/nginx.conf` (gzip, headers cache, headers seguridad).
- `docker-compose.yml` (red externa `npm_default`).
- `docker-compose.dev.yml` (puerto `8080:80` y red local).

**Desvíos respecto al plan original de Fase 0:**

1. Astro 6 en lugar de Astro 5 (advisory XSS en <6.1.6 al instalar).
2. Vite 7 forzado vía `overrides` en `package.json`.
3. Sin Caddy (ya decidido en ADR-002, NPM existente en VPS).

---

## Próximo paso concreto

Cuando el dueño dé luz verde para Fase 1:

1. Iniciar Fase 1 — Sistema de diseño según plan en [`fases.md#fase-1`](fases.md).
2. Empezar instalando Fontsource para las tres familias.
3. Definir tokens completos en `globals.css` (escala fluida).
4. Construir componentes UI base (`Marker`, `Button`, `Tag`, `Badge`, `StatBlock`).
5. Crear `Header` y `Footer`.
6. Configurar Lenis + GSAP con wrapper `<SmoothScroll>`.
7. Crear página `/_styleguide` mostrando todo.
8. Pedir validación al dueño antes de pasar a Fase 2.

---

## Notas de sesiones

### 2026-05-05 — Sesión inicial

Se cerró el alcance, se descartó Directus, se eligió NPM + Resend, se completó Fase 0.

Se generó documentación completa: `CLAUDE.md` raíz como entrada para LLMs + `docs/` con briefing original, fases, decisiones, arquitectura, convenciones, runbook, Docker explicado, plan de migración SEO y este snapshot.
