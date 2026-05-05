# Estado del proyecto

> **Snapshot dinámico.** Se actualiza al cerrar cada fase. Si entras nuevo al proyecto, este documento te dice **dónde estamos exactamente y qué hacer ahora**.

**Última actualización:** 2026-05-05
**Última fase cerrada:** Fase 2 — Páginas estáticas y maquetación
**Fase en curso:** ninguna (esperando OK del dueño para iniciar Fase 3)

---

## Resumen rápido

```
✅ Fase 0  Setup base                   [completada 2026-05-05]
✅ Fase 1  Sistema de diseño            [completada 2026-05-05]
✅ Fase 2  Páginas estáticas            [completada 2026-05-05]
⏳ Fase 3  Content collections (MDX)    [siguiente — esperando OK]
⏳ Fase 4  Formulario + Resend
⏳ Fase 5  Animaciones y pulido
⏳ Fase 6  SEO técnico y performance
⏳ Fase 7  Despliegue Hetzner
⏳ Fase 8  Migración SEO + switch DNS
```

---

## Lo que está funcionando ahora mismo

- Repo en `github.com/dignitasjota/gesdiweb` con `main` pusheada.
- `npm run build` produce **22 páginas estáticas** con sitemap correcto (21 URLs, `/styleguide` filtrada).
- Todas las rutas previstas están maquetadas:
  - `/` (home con 9 secciones)
  - `/servicios` listado + 5 detalles dinámicos
  - `/portfolio` listado + 5 detalles dinámicos
  - `/blog` listado + 3 detalles dinámicos
  - `/contacto` con formulario
  - `/aviso-legal`, `/politica-privacidad`, `/politica-cookies`
  - `/styleguide` (interna)
- Header fijo y Footer presentes en todas las páginas (salvo `hideChrome`).
- Sin animaciones JS (Lenis está activo pero la maquetación no depende de él).
- Datos en `src/data/services.ts`, `projects.ts`, `posts.ts` — tipados, listos para migrar a content collections.

## Lo que NO está hecho todavía

- Migrar `src/data/*` a content collections con MDX → Fase 3.
- Imágenes reales (todas marcadas `[PLACEHOLDER · ...]`) → Fases 3 y 8.
- Datos legales reales (razón social, NIF, dirección, teléfono) → Fase 3.
- Logos de clientes reales para el marquee → cuando los aporte el dueño.
- Foto del fundador para CTA final → cuando la aporte el dueño.
- Stats con cifras reales → cuando las confirme el dueño.
- Envío real del formulario de contacto vía Resend → Fase 4.
- Animaciones (reveals, marquee infinito, parallax, transiciones de página) → Fase 5.
- JSON-LD por tipo de página, OG images dinámicas → Fase 6.
- Lighthouse 95+ verificado → Fase 6.
- Despliegue a producción → Fase 7.
- Redirecciones 301 y migración del blog WordPress → Fase 8.

## Dependencias bloqueadas a información del dueño

| Necesario para | Pendiente |
|---|---|
| Páginas legales finales (Fase 3) | Razón social, NIF, dirección fiscal, teléfono |
| Marquee de logos | Lista + SVGs de clientes |
| Hero de la home | Vídeo o imagen propios |
| Stats de la home | Cifras reales (años, proyectos, clientes) |
| CTA final home | Foto/firma del fundador |
| Portfolio inicial | Imágenes y descripciones de proyectos reales |
| Blog inicial | Posts redactados (o migración del WordPress) |
| Verificación Resend (Fase 4) | Acceso DNS para SPF + DKIM + DMARC |
| Migración SEO (Fase 8) | Export Search Console (URLs que rankean) |
| Migración blog (Fase 8) | Export XML/WXR del WordPress |
| Analítica | Decisión Plausible/Umami self-hosted vs. servicio externo |
| Banner cookies | Confirmación: banner propio (recomendado) vs. servicio |

---

## Detalle de Fase 2 (cerrada)

**Commits añadidos en `main`:**

```
eb01ba7 feat(web): páginas legales (aviso, privacidad, cookies) con LegalLayout
d403ce5 feat(web): /contacto con formulario completo (sin envío)
8757db8 feat(web): /blog listado (1 destacado + grid) y /blog/[slug] post
ee9b68c feat(web): /portfolio listado y /portfolio/[slug] caso de estudio
2358716 feat(web): /servicios listado y /servicios/[slug] detalle (5 servicios)
9fe8e52 feat(web): home completa con 9 secciones (sin animaciones)
5f83ee9 feat(web): datos placeholder de servicios, proyectos y posts
```

**Archivos creados:**

- `web/src/data/`:
  - `services.ts` — 5 servicios con headline, excerpt, features, approach
  - `projects.ts` — 5 proyectos placeholder (3 featured)
  - `posts.ts` — 3 posts placeholder con `formatDateLong()` helper

- `web/src/components/sections/` (9 componentes):
  - `Hero.astro` — hero gigante con CTAs
  - `ClientsMarquee.astro` — banda placeholder
  - `Statement.astro` — verbos clave
  - `ServicesNumberedList.astro` — lista numerada con divisores
  - `PortfolioFeatured.astro` — 3 destacados (1 grande + 2)
  - `Stats.astro` — 4 StatBlocks
  - `Process.astro` — 4 pasos en negativo
  - `HomeContactCTA.astro` — CTA con foto fundador placeholder
  - `BlogRecent.astro` — últimos 3 posts

- `web/src/pages/`:
  - `index.astro` — home compuesta
  - `servicios/index.astro` — listado
  - `servicios/[slug].astro` — detalle dinámico (5 rutas)
  - `portfolio/index.astro` — grid asimétrico
  - `portfolio/[slug].astro` — caso de estudio (5 rutas)
  - `blog/index.astro` — destacado + grid
  - `blog/[slug].astro` — post + relacionados (3 rutas)
  - `contacto.astro` — formulario completo
  - `aviso-legal.astro`, `politica-privacidad.astro`, `politica-cookies.astro`

- `web/src/layouts/LegalLayout.astro` — layout para páginas legales con tipografía editorial.

**Validación cumplida:**
- `npm run build` → 22 páginas, 0 errores.
- Sitemap correcto con 21 URLs (excluida `/styleguide`).
- Todas las rutas del briefing presentes.
- Cero JS innecesario en cliente (solo Lenis para smooth scroll).
- Accesibilidad: foco visible, jerarquía heading, ARIA en navegaciones, formulario con labels asociados, honeypot anti-spam.

**Para revisar visualmente:**

```bash
cd web && npm run dev
```

URLs principales a recorrer en desktop, tablet y móvil:
- `/`
- `/servicios` y `/servicios/posicionamiento-web`
- `/portfolio` y `/portfolio/tienda-aceite-ecologico`
- `/blog` y `/blog/como-mejorar-core-web-vitals`
- `/contacto`
- `/aviso-legal`, `/politica-privacidad`, `/politica-cookies`
- `/styleguide` (referencia interna)

---

## Próximo paso concreto

Cuando el dueño dé luz verde para Fase 3:

1. Crear `web/src/content/config.ts` con schemas Zod para `services`, `projects`, `posts`.
2. Migrar contenido de `src/data/*` a archivos MDX en `src/content/{services,portfolio,blog}/`.
3. Reescribir las páginas dinámicas para consumir `getCollection()` en lugar de los `src/data/*`.
4. Habilitar imágenes optimizadas con `<Image>` desde MDX.
5. Eliminar `src/data/*.ts` cuando la migración esté completa.
6. Verificar que el build sigue produciendo las mismas 22 páginas.

---

## Notas de sesiones

### 2026-05-05 — Fase 0
Setup base, decisiones cerradas, documentación completa para LLMs.

### 2026-05-05 — Fase 1
Sistema de diseño operativo: Fontsource Variable, tokens, escala fluida, 5 componentes UI, Header/Footer, SmoothScroll Lenis, página `/styleguide`.

### 2026-05-05 — Fase 2
Maquetación completa de las 22 páginas previstas. Datos en `src/data/*` con tipado TypeScript estricto y placeholders marcados claramente. Layout `LegalLayout` reutilizable para las 3 páginas legales.

Decisión menor: el formulario de contacto incluye honeypot y campo de privacidad obligatorio ya en Fase 2, aunque el envío real se conecta en Fase 4. La razón: maquetar la UI completa para validar el diseño antes de añadir lógica.

Pequeño bug encontrado y arreglado durante el build: `<` se interpretaba como inicio de Fragment en JSX. Cambiado a "menos de" en `/contacto`.
