# Briefing original del proyecto

> Documento congelado: este es el briefing que el dueño entregó al inicio del proyecto el 2026-05-05. Se conserva tal cual como fuente de verdad sobre el alcance original.
>
> Las decisiones que se han tomado posteriormente (descarte de Directus, uso de NPM en lugar de Caddy, etc.) están en [`decisiones.md`](decisiones.md). **Si hay contradicción, las ADRs ganan.**

---

## 1. Contexto del proyecto

Soy el dueño de **gesdiweb**, una agencia de diseño web y posicionamiento SEO. Mi web actual (`gesdiweb.es`) está en WordPress, lleva años sin renovarse y quiero rehacerla de cero con un diseño moderno, minimalista y profesional. La web nueva debe transmitir **modernidad, minimalismo y profesionalidad**, con un tono visual inspirado en estudios de diseño de tradición suiza.

**Web de referencia visual:** https://createstudio.framer.media/ — tipografía gigante como protagonista, mucho espacio en blanco, retículas marcadas, marcadores tipo `// 00.01°`, marquees infinitos de logos, vídeo hero, animaciones sutiles de scroll. **Inspiración, no copia pixel a pixel.**

**Marca:**
- Nombre: gesdiweb
- Tagline: "diseño web y posicionamiento SEO"
- Logo: existente. Símbolo "G" en círculo cian/turquesa claro, texto "gesdiweb" en gris azulado claro.
- **Paleta web confirmada:** azul `#77C2DA`, gris `#A7A7A7`, blanco `#FFFFFF`, negro `#0A0A0A`. Acento azul solo en detalles puntuales.

## 2. Stack tecnológico

> Ver versión vigente en [`CLAUDE.md`](../CLAUDE.md) y [`decisiones.md`](decisiones.md). El stack final difiere del propuesto inicialmente (sin Directus, sin Postgres, sin Redis, sin Caddy).

## 3. Estructura del sitio (URLs a mantener para SEO)

Estas páginas existían en la WordPress y deben preservarse o redirigirse con 301:

```
/                                        Home
/servicios                               Listado de servicios
/servicios/posicionamiento-web           Servicio individual
/servicios/apps-moviles                  Servicio individual
/servicios/hosting-web                   Servicio individual
/servicios/marketing-online              Servicio individual
/servicios/mantenimiento-informatico     Servicio individual
/portfolio                               Listado de proyectos
/portfolio/[slug]                        Proyecto individual
/blog                                    Listado de posts
/blog/[slug]                             Post individual
/contacto                                Página de contacto
/aviso-legal
/politica-privacidad
/politica-cookies
```

**Nota:** confirmar slugs reales con un export de Google Search Console antes del switch DNS (Fase 8). Tráfico actual bajo, hay margen para cambios menores.

## 4. SEO obligatorio

- Mantener slugs antiguos siempre que se pueda.
- `sitemap.xml` automático con `@astrojs/sitemap`.
- `robots.txt` con referencia al sitemap.
- Meta tags completos por página: title (50-60 chars), description (150-160 chars), Open Graph, Twitter Card, canonical.
- Schema.org JSON-LD por tipo de página:
  - Home: `Organization` + `LocalBusiness` + `WebSite` con `SearchAction`
  - Servicios: `Service` con `provider` apuntando a la organización
  - Portfolio: `CreativeWork`
  - Blog posts: `BlogPosting` con autor, fecha, imagen
- Imágenes optimizadas con `<Image>` de Astro (WebP, AVIF, lazy loading, `width`/`height`).
- Core Web Vitals objetivo: LCP < 2.5s, CLS < 0.1, INP < 200ms. Lighthouse 95+.
- Redirecciones 301 desde URLs antiguas (Fase 8).
- HTML semántico estricto: una sola `<h1>`, jerarquía de `<h2>`/`<h3>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`.

## 5. Sistema de diseño

### Tipografías

```css
--font-display: "Bricolage Grotesque", system-ui, sans-serif;  /* Titulares */
--font-sans: "Inter", system-ui, sans-serif;                    /* Texto */
--font-mono: "JetBrains Mono", ui-monospace, monospace;         /* Detalles */
```

Self-hosted con Fontsource desde `/fonts/`. `font-display: swap`. Subsetting latin.

### Escala tipográfica fluida

```css
--text-xs:    clamp(0.75rem, 0.7rem + 0.2vw, 0.85rem);
--text-sm:    clamp(0.875rem, 0.8rem + 0.3vw, 1rem);
--text-base:  clamp(1rem, 0.95rem + 0.3vw, 1.125rem);
--text-lg:    clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem);
--text-xl:    clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
--text-2xl:   clamp(2.5rem, 2rem + 2.5vw, 4rem);
--text-3xl:   clamp(3.5rem, 2.5rem + 5vw, 6rem);
--text-display: clamp(4rem, 3rem + 8vw, 10rem);
```

### Colores

```css
--color-bg:        #FFFFFF;
--color-bg-soft:   #FAFAFA;
--color-fg:        #0A0A0A;
--color-fg-soft:   #525252;
--color-border:    #E5E5E5;

--color-brand:        #77C2DA;
--color-brand-hover:  #5FB3CF;
--color-muted:        #A7A7A7;
```

### Retícula y espaciado

- Sistema base de 8px.
- Container max-width: 1440px con padding fluido `clamp(1.5rem, 5vw, 4rem)`.
- 12 columnas desktop, 4 móvil (CSS Grid).
- Espaciado entre secciones: `clamp(6rem, 12vw, 12rem)`.

### Componentes clave a construir

1. **Marker** — etiqueta mono pequeña tipo `// 00.01°`, `// SERVICES`
2. **Marquee** — banda infinita de logos/texto
3. **HeroDisplay** — titular gigante con vídeo/imagen de fondo
4. **ServiceCard** — tarjeta numerada con imagen, descripción, bullets
5. **ProjectCard** — tarjeta de proyecto
6. **PostCard** — tarjeta de post
7. **StatBlock** — número grande + descripción
8. **RevealText** — texto que aparece línea a línea al scroll
9. **CursorFollower** — opcional
10. **ContactForm** — formulario con validación + envío vía Resend

## 6. Estructura de la home

1. Header fijo (logo, nav, CTA "Hablemos")
2. Hero (titular gigante, marker, CTA, vídeo/imagen)
3. Marquee de logos de clientes
4. Statement section (escuchamos / diseñamos / posicionamos / acompañamos)
5. Servicios numerados (`/01` a `/05`)
6. Portfolio destacado (3-4 proyectos `featured`)
7. Stats (años, proyectos, clientes)
8. Proceso (4 pasos)
9. Testimonios (Fase 2 opcional)
10. CTA final (foto/firma del fundador)
11. Blog reciente (últimos 3)
12. Footer

## 7. Reglas originales del dueño

1. No avanzar de fase sin aprobación.
2. Commits atómicos, Conventional Commits.
3. Documentación viva (README + docs/).
4. Variables de entorno en `.env`.
5. TypeScript strict.
6. Sin dependencias innecesarias.
7. Accesibilidad desde día 1.
8. Móvil primero (375px).
9. 0 KB JS por defecto.
10. Cuando dudes, pregunta. Pero no preguntes lo ya resuelto.
11. Preservar SEO existente (redirecciones 301).
12. `<Image>` de Astro siempre.
13. Sin Google Fonts CDN ni Google Analytics.

## 8. Entregables

- Repo GitHub con código limpio.
- `docker-compose.yml` que levanta el stack.
- README completo (cómo arrancar, desplegar, backup, añadir contenido).
- Web producción `https://gesdiweb.es` con Lighthouse 95+.
- Backup inicial.
