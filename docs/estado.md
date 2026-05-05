# Estado del proyecto

> **Snapshot dinámico.** Se actualiza al cerrar cada fase. Si entras nuevo al proyecto, este documento te dice **dónde estamos exactamente y qué hacer ahora**.

**Última actualización:** 2026-05-05
**Última fase cerrada:** Fase 4 — Formulario de contacto + Resend
**Fase en curso:** ninguna (esperando OK del dueño para iniciar Fase 5)

---

## Resumen rápido

```
✅ Fase 0  Setup base                   [completada 2026-05-05]
✅ Fase 1  Sistema de diseño            [completada 2026-05-05]
✅ Fase 2  Páginas estáticas            [completada 2026-05-05]
✅ Fase 3  Content collections (MDX)    [completada 2026-05-05]
✅ Fase 4  Formulario + Resend          [completada 2026-05-05]
⏳ Fase 5  Animaciones y pulido         [siguiente — esperando OK]
⏳ Fase 6  SEO técnico y performance
⏳ Fase 7  Despliegue Hetzner
⏳ Fase 8  Migración SEO + switch DNS
```

---

## Cambio importante de arquitectura en Fase 4

El sitio era 100% estático (nginx). Ahora es **mayoritariamente estático con un endpoint dinámico** (`/api/contact`):

- Astro pasa de `output: 'static'` a `output: 'server'` con adapter `@astrojs/node` (modo standalone).
- Cada página `.astro` lleva `export const prerender = true` → se prerenderiza en build (HTML estático servido directo desde el server Node).
- Solo `src/pages/api/contact.ts` corre dinámicamente en runtime (`prerender = false`).
- El contenedor Docker pasa de **nginx 1.27 alpine** a **node 22 alpine** ejecutando `dist/server/entry.mjs`.
- Nginx Proxy Manager sigue por delante haciendo SSL y compresión.

**Consecuencia:** un único contenedor sirve estáticos + API. Sin sidecars ni servicios separados.

---

## Lo que está funcionando ahora mismo

- Build limpio: `dist/client` (22 HTMLs prerenderizados + assets) y `dist/server` (entry Node + chunks de la API).
- En local con `node ./dist/server/entry.mjs`, todas las páginas responden 200 y `/api/contact` valida correctamente:
  - Datos válidos sin `RESEND_API_KEY` → `{ ok: true, accepted: true, devMode: true }` y log local
  - Datos inválidos → 400 con array `issues[]` tipado por Zod
  - Honeypot relleno → 200 simulando éxito sin enviar nada
  - 5 envíos en 10 minutos desde la misma IP → 429 con `retry-after`
- Formulario en `/contacto` con cliente JS (fetch a `/api/contact`, estados accesibles `aria-live`, errores por campo).
- `.env.example` actualizado con `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL`.
- `docker-compose.yml` con variables Resend pasadas al contenedor.

## Lo que NO está hecho todavía

- Animaciones (reveals, marquees con scroll-linked, parallax, transiciones de página) → Fase 5.
- JSON-LD por tipo de página, OG images dinámicas → Fase 6.
- Lighthouse 95+ verificado → Fase 6.
- Despliegue producción + verificación dominio en Resend (SPF + DKIM + DMARC) → Fase 7.
- Redirecciones 301 y migración del WordPress → Fase 8.

## Variables de entorno requeridas en producción

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=hola@gesdiweb.es
LEAD_NOTIFICATION_EMAIL=hola@gesdiweb.es
```

Sin `RESEND_API_KEY` el endpoint sigue funcionando pero no envía email (loguea en consola y devuelve `devMode: true`). Útil en QA/preview, **no aceptable en producción**.

---

## Detalle de Fase 4 (cerrada)

**Commits añadidos en `main`:** (pendientes de hacer en este push)

```
chore(web): instalar @astrojs/node, resend y zod (override uuid 14)
feat(web): output server con prerender=true en todas las páginas estáticas
feat(api): endpoint /api/contact con Zod + honeypot + rate limit + Resend
feat(web): cliente JS del formulario con estados accesibles
chore(infra): Dockerfile con node standalone, compose con env Resend
docs: actualizar estado tras cierre de Fase 4
```

**Archivos creados:**

- `web/src/pages/api/contact.ts` — endpoint POST
- `web/src/lib/contact-schema.ts` — schema Zod compartido cliente/servidor
- `web/src/lib/rate-limit.ts` — rate limiter en memoria (5 req / 10 min / IP)
- `web/src/lib/email/contact-template.ts` — plantilla HTML + text del email
- `web/src/components/forms/ContactFormClient.astro` — script cliente

**Archivos modificados:**

- `web/astro.config.mjs` — `output: 'server'`, adapter Node standalone
- `web/Dockerfile` — runtime ahora es `node:22-alpine` corriendo `entry.mjs`
- `docker-compose.yml` — pasa env Resend al contenedor
- `docker-compose.dev.yml` — port mapping `8090:4321` (antes era 8090:80)
- `.env.example` — variables Resend documentadas
- Todas las páginas `.astro` — añadido `export const prerender = true;`
- `web/src/pages/contacto.astro` — incluye `<ContactFormClient />` y área `data-form-status`
- `web/package.json` — override `uuid: ^14.0.0` (resolver advisory transitivo)

**Validación cumplida:**

- Build OK: 22 páginas prerenderizadas + bundle servidor
- Endpoint en local: validación, honeypot, rate limit y modo dev funcionan
- Sin vulnerabilidades de npm (`npm audit` 0)
- Form client con `aria-live` + errores por campo + estados visibles

---

## Próximo paso concreto

Cuando el dueño dé luz verde para Fase 5:

1. Configurar GSAP + ScrollTrigger en `<SmoothScroll>` (ya existe wrapper Lenis).
2. Crear componente `<Reveal>` para fade-up en scroll (con `prefers-reduced-motion`).
3. Aplicar reveals a secciones clave de la home: Statement, Services, Stats.
4. Marquees con scroll-linked velocidad variable (Lenis hook).
5. Transiciones de página con Astro View Transitions API.
6. Estados de hover refinados y micro-interacciones.

---

## Notas de sesiones

### 2026-05-05 — Fase 4

Migración a `output: 'server'` con Node adapter. Considerada alternativa "dos contenedores" (web nginx + api node) pero descartada por simplicidad: un único contenedor Astro Node sirve estáticos prerenderizados + API. Pérdida de rendimiento mínima respecto a nginx (Astro Node entrega HTML precomputado del disco).

Vulnerabilidad transitiva resuelta: Resend → svix → uuid <14 tenía advisory moderado. Override `uuid: ^14.0.0` en `package.json` lo limpia. Sin vulnerabilidades en `npm audit`.

Cliente JS del formulario: ~110 líneas, no añade librería de validación en cliente (reutiliza el schema Zod del servidor pasando los issues). Solo se carga JS en `/contacto`, las demás páginas siguen con 0 KB.
