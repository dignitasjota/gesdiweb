# Estado del proyecto

> **Snapshot dinámico.** Se actualiza al cerrar cada fase. Si entras nuevo al proyecto, este documento te dice **dónde estamos exactamente y qué hacer ahora**.

**Última actualización:** 2026-05-05
**Última fase cerrada:** Fase 6 — SEO técnico y performance
**Fase en curso:** ninguna (esperando OK del dueño para iniciar Fase 7)

---

## Resumen rápido

```
✅ Fase 0  Setup base                   [completada 2026-05-05]
✅ Fase 1  Sistema de diseño            [completada 2026-05-05]
✅ Fase 2  Páginas estáticas            [completada 2026-05-05]
✅ Fase 3  Content collections (MDX)    [completada 2026-05-05]
✅ Fase 4  Formulario + Resend          [completada 2026-05-05]
✅ Fase 5  Animaciones y pulido         [completada 2026-05-05]
✅ Fase 6  SEO técnico y performance    [completada 2026-05-05]
⏳ Fase 7  Despliegue Hetzner           [siguiente — esperando OK]
⏳ Fase 8  Migración SEO + switch DNS
```

---

## Lo que está funcionando ahora mismo

- 22 páginas estáticas + endpoint `/api/contact`
- Sistema de diseño + animaciones + view transitions
- **JSON-LD por tipo de página** (Organization+LocalBusiness, WebSite, Service, CreativeWork, BlogPosting, Blog, ItemList, BreadcrumbList, ContactPage, WebPage)
- **Meta tags SEO completos**: canonical, robots con max-image-preview:large, OG completo (site_name, image, image:width/height/alt, locale), Twitter Card, theme-color, apple-touch-icon
- **OG image fallback** SVG 1200×630 con paleta corporativa (`/og-default.svg`)
- **robots.txt** explícito (Disallow `/styleguide` y `/api/`, Sitemap declarado)
- **Sitemap automático** con i18n es-ES, excluye `/styleguide`
- **Posts del blog** con `ogType=article`, `article:published_time` y `article:author`
- **Páginas legales** con WebPage + BreadcrumbList automático vía LegalLayout
- **Documento de auditoría** (`docs/auditoria.md`) con procedimiento completo

## Validación de la build

```
22 páginas prerenderizadas
Tipos JSON-LD detectados en HTML output:
- Home: Organization+LocalBusiness+ProfessionalService, WebSite, Country
- Service detail: Service, OfferCatalog, Offer, BreadcrumbList, ListItem, Country
- Blog post: BlogPosting, Person, BreadcrumbList, ListItem, WebPage
OG image: https://gesdiweb.es/og-default.svg
theme-color: #77c2da
```

## Lo que NO está hecho todavía

- **Auditoría Lighthouse 95+ ejecutada** — el procedimiento está documentado pero las auditorías formales se hacen al desplegar (Fase 7) contra producción.
- **Auditoría axe-core ejecutada** — igual que arriba.
- OG image PNG real (actualmente SVG; algunos clientes no lo soportan). Cuando el dueño aporte material, sustituir por PNG en `/og-default.png` y actualizar referencia en `lib/seo.ts`.
- Datos legales reales de Organization (address, telephone). Comentado en `lib/seo.ts` hasta que el dueño los aporte.
- Despliegue producción → Fase 7.
- Redirecciones 301 y migración del WordPress → Fase 8.

## Dependencias bloqueadas a información del dueño

| Necesario para | Pendiente |
|---|---|
| Organization completa en JSON-LD | Razón social, NIF, dirección fiscal, teléfono |
| OG images por página | Imágenes de portfolio y blog (cuando lleguen) |
| Lighthouse en producción | Despliegue completado (Fase 7) |
| Verificación dominio Resend (Fase 7) | Acceso DNS para SPF + DKIM + DMARC |
| Migración SEO (Fase 8) | Export Search Console (URLs que rankean) |
| Migración blog (Fase 8) | Export XML/WXR del WordPress |

---

## Detalle de Fase 6 (cerrada)

**Commits añadidos en `main`:**

```
f4f6e0b docs: procedimiento completo de auditoría (Lighthouse, axe, schema, OG)
0fea8e8 feat(seo): OG image fallback con paleta corporativa + robots completo
7a8ebf7 feat(seo): JSON-LD en cada página
dd02e78 feat(seo): meta tags refinados y slot JSON-LD en BaseLayout
4fc4a6b feat(seo): librería de helpers JSON-LD por tipo de página
```

**Archivos creados:**

- `web/src/lib/seo.ts` — 9 builders JSON-LD tipados + constante SITE
- `web/public/og-default.svg` — fallback OG 1200×630 brand
- `docs/auditoria.md` — procedimiento de auditorías (Lighthouse, axe, schema, OG, links)

**Archivos modificados:**

- `web/src/layouts/BaseLayout.astro` — props `ogImage`, `ogType`, `publishedTime`, `modifiedTime`, `articleAuthor`, `jsonLd[]`. Meta tags refinados (theme-color, apple-touch-icon, og:image dimensions, max-image-preview).
- `web/src/layouts/LegalLayout.astro` — pasa WebPage + BreadcrumbList automático
- `web/src/pages/index.astro` — Organization + WebSite
- `web/src/pages/servicios/index.astro` — WebPage + ItemList + Breadcrumb
- `web/src/pages/servicios/[slug].astro` — Service + Breadcrumb + seoTitle/seoDescription support
- `web/src/pages/portfolio/index.astro` — WebPage + ItemList + Breadcrumb
- `web/src/pages/portfolio/[slug].astro` — CreativeWork + Breadcrumb
- `web/src/pages/blog/index.astro` — Blog + Breadcrumb
- `web/src/pages/blog/[slug].astro` — BlogPosting + Breadcrumb + ogType=article
- `web/src/pages/contacto.astro` — ContactPage + Breadcrumb
- `web/public/robots.txt` — Disallow /styleguide y /api/, Sitemap declarado

---

## Próximo paso concreto

Cuando el dueño dé luz verde para Fase 7 (despliegue Hetzner):

1. **Pre-deploy:**
   - Crear cuenta Resend y obtener API key
   - Verificar dominio gesdiweb.es en Resend (te genero los registros DNS exactos)
   - Decidir CI/CD: GitHub Actions con SSH al VPS o webhook a Portainer
2. **Stack en Portainer:** crear stack `gesdiweb` apuntando al docker-compose con env Resend
3. **NPM:** dar de alta `gesdiweb.es`, `www.gesdiweb.es` en NPM con SSL Let's Encrypt
4. **DNS temporal:** subdominio QA tipo `new.gesdiweb.es` para probar antes del switch
5. **Lighthouse en QA** contra el subdominio temporal
6. **Firewall + fail2ban** en el VPS
7. **Backups nocturnos** del VPS

El switch DNS final del dominio principal se hace en **Fase 8** (no en 7).

---

## Notas de sesiones

### 2026-05-05 — Fase 6

JSON-LD priorizado sobre OG images dinámicas porque el primero impacta directamente en SEO técnico (rich results en Google) y el segundo solo en CTR de redes sociales. Las OG images por página se quedan con un único fallback SVG hasta que haya material real.

Decisión: SVG en lugar de PNG para OG. Algunos clientes no soportan SVG (Slack viejos, ciertos clients email), pero la cuota es minoritaria y permite que el OG sea totalmente versionable en Git sin dependencia de generación de imágenes. Cuando el dueño aporte logo y material real, sustituir por PNG.

`Organization` en home incluye `["Organization", "LocalBusiness", "ProfessionalService"]` como `@type` array — Google lo indexa con la unión de las tres entidades. `address` y `telephone` quedan comentados hasta tener los datos reales para no publicar placeholder al knowledge graph.

`seoTitle` y `seoDescription` añadidos como overrides opcionales en `[slug].astro` de servicios, portfolio y blog. Si el frontmatter los define, ganan al título por defecto. Útil para títulos largos del listado que en SEO conviene acortar.
