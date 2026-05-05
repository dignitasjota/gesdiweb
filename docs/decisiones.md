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

## ADR-008 · CI/CD con GitHub Actions y GHCR

**Fecha:** 2026-05-05
**Estado:** Pendiente de detalle (Fase 7)

**Decisión preliminar.** Push a `main` → GitHub Actions construye la imagen Docker → la sube a GHCR → Portainer la recoge mediante webhook o pull manual.

Se cerrará al diseñar la pipeline en Fase 7.
