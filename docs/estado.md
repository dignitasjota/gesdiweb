# Estado del proyecto

> **Snapshot dinámico.** Se actualiza al cerrar cada fase o al final de cualquier sesión de trabajo significativa. Si entras nuevo al proyecto, este documento te dice **dónde estamos exactamente y qué hacer ahora**.

**Última actualización:** 2026-05-05
**Última fase cerrada:** Fase 1 — Sistema de diseño
**Fase en curso:** ninguna (esperando OK del dueño para iniciar Fase 2)

---

## Resumen rápido

```
✅ Fase 0  Setup base                   [completada 2026-05-05]
✅ Fase 1  Sistema de diseño            [completada 2026-05-05]
⏳ Fase 2  Páginas estáticas            [siguiente — esperando OK]
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
- `cd web && npm install` instala 285 paquetes sin vulnerabilidades.
- `cd web && npm run dev` arranca Astro en `http://localhost:4321` con hot reload.
- `cd web && npm run build` produce 2 páginas estáticas: `/` y `/styleguide`.
- Sistema de diseño completo activo: tipografías cargadas, tokens, escala fluida, componentes UI base, Header fijo + Footer y SmoothScroll con Lenis.
- Página `/styleguide` muestra todos los tokens y componentes (excluida del sitemap, marcada `noindex`).
- `docker build` y `docker run` siguen funcionando (Dockerfile no cambió en Fase 1).

## Lo que NO está hecho todavía

- Páginas reales de servicios, portfolio, blog, contacto → Fase 2.
- Cualquier sección de la home más allá del hero placeholder → Fase 2.
- Marquees, parallax y reveals al scroll → Fase 5.
- GSAP ya instalado pero **sin uso** todavía → Fase 5.
- Lenis activo pero solo para smooth scroll global, sin scroll-linked animations → Fase 5.
- Content collections + MDX → Fase 3.
- Formulario de contacto operativo → Fase 4.
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

## Detalle de Fase 1 (cerrada)

**Commits añadidos en `main`:**

```
29144f5 feat(web): home placeholder usa nuevo sistema de diseño y BaseLayout completo
b5b7cf5 feat(web): página /styleguide con paleta, tipografías, escala y componentes
e06ffc8 feat(web): SmoothScroll wrapper con Lenis (respeta prefers-reduced-motion)
dd3a8d2 feat(web): Header fijo con nav y CTA + Footer con datos legales placeholders
63f2b04 feat(web): componentes UI base (Marker, Button, Tag, Badge, StatBlock)
d9a2c33 feat(web): tokens completos del sistema de diseño en globals.css
291a511 chore(web): añadir Fontsource (Bricolage/Inter/JetBrains Mono), GSAP y Lenis
```

**Dependencias añadidas:**

| Paquete | Versión | Uso |
|---|---|---|
| `@fontsource-variable/bricolage-grotesque` | ^5.2.10 | Display |
| `@fontsource-variable/inter` | ^5.2.8 | Texto / UI |
| `@fontsource-variable/jetbrains-mono` | ^5.2.8 | Mono / marcadores |
| `gsap` | ^3.15.0 | Animaciones (sin usar todavía, Fase 5) |
| `lenis` | ^1.3.23 | Smooth scroll global |

**Archivos creados / modificados:**

- `web/src/styles/globals.css` — sistema de tokens completo, escala fluida, utilidades.
- `web/src/components/ui/`:
  - `Marker.astro` — etiqueta mono con prefijo `//`
  - `Button.astro` — primary/secondary/ghost, sm/md/lg, soporta `href` (anchor) o `type` (button)
  - `Tag.astro` — píldora pequeña (default/brand/inverse)
  - `Badge.astro` — numeración estilo `/01`, `/12`
  - `StatBlock.astro` — número grande + label
- `web/src/components/layout/`:
  - `Header.astro` — fijo arriba, blur translúcido, nav semántica con `aria-current`, móvil con hamburguesa (sin abrir todavía — Fase 2)
  - `Footer.astro` — fondo oscuro, 3 columnas legal/estudio/servicios, CTA con email
- `web/src/components/animations/`:
  - `SmoothScroll.astro` — Lenis montado en cliente, respeta `prefers-reduced-motion`
- `web/src/layouts/BaseLayout.astro` — ahora monta `<Header />`, `<Footer />` y `<SmoothScroll />` automáticamente. Prop nueva `hideChrome` y `noindex`.
- `web/src/pages/styleguide.astro` — página de referencia interna.
- `web/src/pages/index.astro` — home placeholder usa el nuevo sistema.
- `web/astro.config.mjs` — sitemap excluye `/styleguide`.

**Validación cumplida:**
- `npm run build` produce 2 páginas, sin errores.
- Sitemap solo contiene `/` (styleguide filtrado).
- Foco accesible visible globalmente.
- `prefers-reduced-motion` respetado (CSS + Lenis).
- Tipografías self-hosted, sin requests a CDN externos.

**Para revisar visualmente:**

```bash
cd web
npm run dev
# Abrir:
#   http://localhost:4321              → home placeholder
#   http://localhost:4321/styleguide   → sistema de diseño completo
```

---

## Próximo paso concreto

Cuando el dueño dé luz verde para Fase 2:

1. Maquetar **home** completa según [briefing §6](briefing.md#6-estructura-de-la-home): hero, marquee logos (placeholders), statement, servicios numerados, portfolio destacado, stats, proceso, CTA final, blog reciente.
2. Maquetar **/servicios** (listado) y **/servicios/[slug]** (detalle, 5 servicios estáticos).
3. Maquetar **/portfolio** (listado) y **/portfolio/[slug]** (detalle).
4. Maquetar **/blog** (listado) y **/blog/[slug]** (detalle).
5. Maquetar **/contacto** con formulario (sin integración Resend todavía → Fase 4).
6. Maquetar páginas legales con placeholders (`[PENDIENTE: razón social]`, etc.).
7. Validar cada página en 375 / 768 / 1440 antes de pasar a la siguiente.
8. **Sin animaciones** — solo maquetación. Reveals/marquees animados se añaden en Fase 5.

---

## Notas de sesiones

### 2026-05-05 — Sesión inicial (Fase 0)

Se cerró el alcance, se descartó Directus, se eligió NPM + Resend, se completó Fase 0.
Generación completa de documentación: `CLAUDE.md` + `docs/`.

### 2026-05-05 — Fase 1

Sistema de diseño operativo. Se eligió Fontsource Variable (no estática) para las 3 familias por mejor cobertura de pesos sin requests adicionales. Se renombró `/_styleguide` a `/styleguide` porque Astro excluye archivos con prefijo `_` del build; se filtró del sitemap y se marcó `noindex` para mantenerla "oculta" de buscadores sin perder accesibilidad para nosotros.

Cambio menor: la home pasó de un placeholder centrado a uno alineado a la izquierda con la nueva escala `--text-display`, para que ya empiece a verse el carácter editorial de la web.
