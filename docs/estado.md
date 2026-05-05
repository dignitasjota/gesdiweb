# Estado del proyecto

> **Snapshot dinámico.** Se actualiza al cerrar cada fase. Si entras nuevo al proyecto, este documento te dice **dónde estamos exactamente y qué hacer ahora**.

**Última actualización:** 2026-05-05
**Última fase cerrada:** Fase 5 — Animaciones y pulido
**Fase en curso:** ninguna (esperando OK del dueño para iniciar Fase 6)

---

## Resumen rápido

```
✅ Fase 0  Setup base                   [completada 2026-05-05]
✅ Fase 1  Sistema de diseño            [completada 2026-05-05]
✅ Fase 2  Páginas estáticas            [completada 2026-05-05]
✅ Fase 3  Content collections (MDX)    [completada 2026-05-05]
✅ Fase 4  Formulario + Resend          [completada 2026-05-05]
✅ Fase 5  Animaciones y pulido         [completada 2026-05-05]
⏳ Fase 6  SEO técnico y performance    [siguiente — esperando OK]
⏳ Fase 7  Despliegue Hetzner
⏳ Fase 8  Migración SEO + switch DNS
```

---

## Lo que está funcionando ahora mismo

- 22 páginas estáticas + endpoint `/api/contact`.
- **Smooth scroll global** con Lenis.
- **Reveals al scroll** con CSS transitions disparadas por IntersectionObserver (no GSAP — ligero y sin flash).
- **Stagger** de hijos en grids (cards de servicios, stats, process, blog).
- **Parallax sutil** del asterisco decorativo del hero (con GSAP ScrollTrigger lazy-loaded — solo se carga si hay `[data-parallax]` en la página).
- **View Transitions API** activa: navegación entre páginas con fade global de 280ms.
- **prefers-reduced-motion** respetado en absolutamente todas las animaciones (CSS + JS).

## Lo que NO está hecho todavía

- JSON-LD por tipo de página (Organization, LocalBusiness, Service, CreativeWork, BlogPosting) → Fase 6.
- OG images dinámicas → Fase 6.
- Auditoría Lighthouse 95+ formal → Fase 6.
- Auditoría axe-core → Fase 6.
- Compresión y optimización de imágenes (cuando lleguen, todavía son placeholders) → Fase 6.
- Despliegue producción → Fase 7.
- Redirecciones 301 y migración del WordPress → Fase 8.

---

## Detalle de Fase 5 (cerrada)

**Decisión de implementación clave.** Empecé usando GSAP para los reveals (tamaño + complejidad) pero refactoricé a CSS transitions con `IntersectionObserver`:

- ❌ GSAP para reveals: 70+ KB de bundle, gestión imperativa, riesgo de flash inicial si JS tarda.
- ✅ CSS transitions + IO: 0 KB extra (CSS nativo), 0 flash (estado inicial en CSS), simpler.

**GSAP solo se usa para parallax** (scroll-linked, requiere RAF + `scrub`) y se importa de forma **lazy** (solo se carga si la página tiene `[data-parallax]`).

**Componente `<Reveal>`:** wrapper semántico que añade `data-reveal` al elemento. Soporta:
- `delay` (ms)
- `y` (px de translación inicial — actualmente fijo 24px en CSS)
- `stagger` (anima hijos en cascada con 80ms entre cada uno)

**Aplicado en home a:** Hero, Statement, ServicesNumberedList, PortfolioFeatured, Stats, FeatureStrip, Process, HomeContactCTA, BlogRecent.

**View Transitions API:** `<ClientRouter />` en BaseLayout con `fallback="swap"`. Animación CSS global de fade-out/in de 280ms. `prefers-reduced-motion` lo desactiva. La compatibilidad de Lenis con View Transitions: limpieza explícita en `astro:before-swap` y reinit en `astro:page-load`.

**Hero parallax:** asterisco decorativo de fondo con `data-parallax="0.25"` — se mueve a 25% de la velocidad del scroll.

**Archivos creados/modificados:**

- `web/src/components/animations/Reveal.astro` — nuevo wrapper
- `web/src/components/animations/SmoothScroll.astro` — Lenis + IO + GSAP lazy parallax + sync con View Transitions
- `web/src/styles/globals.css` — estilos `[data-reveal]`, `.is-visible`, `--stagger-delay`, View Transitions fade
- `web/src/layouts/BaseLayout.astro` — `<ClientRouter fallback="swap" />`
- 9 secciones de home con `<Reveal>` aplicado quirúrgicamente

**Validación cumplida:**
- Build OK, 22 páginas + endpoint
- Sitio responde en local sin errores
- Reveals funcionan en navegadores modernos (IO desde Safari 12.1+, Chrome 51+)
- Sin flash inicial (CSS oculta antes de JS)
- Reduced-motion respetado
- 0 vulnerabilidades npm

---

## Próximo paso concreto

Cuando el dueño dé luz verde para Fase 6 (SEO técnico y performance):

1. **JSON-LD por tipo de página:**
   - Home: `Organization` + `LocalBusiness` + `WebSite` con `SearchAction`
   - Servicios: `Service` con `provider`
   - Portfolio: `CreativeWork`
   - Blog: `BlogPosting` con autor, fecha, imagen
2. **OG images** (Open Graph) por página — generadas dinámicamente o pre-generadas en build.
3. **Meta tags refinados** (title length, description length, robots por página).
4. **Auditoría Lighthouse** sobre el server Node local (`npm run preview` o el container) — objetivo 95+ en Performance/Accesibilidad/SEO/Best Practices.
5. **Auditoría axe-core** o Pa11y.
6. **Optimización de imágenes** — cuando el dueño aporte material real, pasar por `<Image>` de Astro con AVIF/WebP.
7. **Headers de seguridad** (CSP, HSTS) revisados.

---

## Notas de sesiones

### 2026-05-05 — Fase 5

Iteración importante en el approach técnico: arranqué con GSAP ScrollTrigger para reveals y lo cambié por IntersectionObserver + CSS transitions. La decisión la tomé al darme cuenta del costo (~70KB GSAP en cada página) frente al beneficio mínimo (los reveals son fades simples con stagger).

GSAP queda solo para parallax porque ahí sí aporta (scrub scroll-linked es complejo de implementar con CSS). Y se carga lazy: solo se descarga si la página actual tiene `[data-parallax]`.

View Transitions API funciona bien con Lenis siempre que se haga `lenis.destroy()` en `astro:before-swap` y `setupAnimations()` en `astro:page-load`. Sin esto, el smooth scroll se rompía al navegar.
