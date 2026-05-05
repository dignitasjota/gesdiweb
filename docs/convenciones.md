# Convenciones del proyecto

Reglas concretas que rigen cómo escribimos código, hacemos commits y tomamos decisiones de implementación. Si te incorporas al proyecto, lee esto antes de tocar nada.

---

## 1. Git y commits

### Formato

[Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope opcional>): <descripción imperativa en minúscula>

<cuerpo opcional explicando POR QUÉ, no qué>

<footer opcional con BREAKING CHANGE: o referencias>
```

### Tipos permitidos

| Tipo | Uso |
|---|---|
| `feat` | Funcionalidad nueva visible para el usuario |
| `fix` | Corrección de bug |
| `chore` | Tareas mantenimiento sin afectar al usuario (configs, deps menores) |
| `docs` | Solo documentación |
| `style` | Formato, espaciado (no afecta a la lógica) |
| `refactor` | Reorganización sin cambio de comportamiento |
| `perf` | Mejora de rendimiento |
| `test` | Tests |
| `build` | Sistema de build, CI |
| `revert` | Revertir un commit anterior |

### Reglas

- Un commit = una unidad lógica. Si tocas tres cosas distintas, tres commits.
- Mensaje en imperativo, en minúscula, sin punto final.
- Escribir en **español o inglés según el contexto**, pero coherente dentro del proyecto. Aquí: español.
- No usar emojis salvo petición explícita.
- Cuerpo solo si aporta el "por qué". El "qué" ya lo cuenta el diff.
- Nunca commitear `.env`, secretos, archivos de OS (`.DS_Store`).

### Ejemplos

✅ `feat(web): añadir componente Marker con variantes claro/oscuro`
✅ `fix(nginx): añadir cache-control para favicon`
✅ `docs: actualizar estado tras cierre de Fase 1`
❌ `Update files` (vacío)
❌ `WIP` (no se commitea trabajo a medias en `main`)
❌ `feat: nuevo componente. Resuelve issue #4 y mejora seo, performance, etc...` (mezcla)

### Branches

- `main` siempre desplegable.
- Trabajo directo en `main` mientras seamos un solo dev. Si entran colaboradores, ramas `feature/...` y PR.

---

## 2. Estructura de carpetas en `web/src/`

```
src/
├── pages/
│   ├── index.astro              Una página por archivo
│   ├── servicios/
│   │   ├── index.astro          Listado
│   │   └── [slug].astro         Detalle dinámico
│   ├── portfolio/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── blog/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── _styleguide.astro        Páginas con prefijo "_" no se exportan
├── layouts/
│   ├── BaseLayout.astro         Wrapper SEO global
│   ├── ServiceLayout.astro
│   ├── ProjectLayout.astro
│   └── PostLayout.astro
├── components/
│   ├── ui/                      Atómicos: Button, Tag, Marker, etc.
│   ├── layout/                  Header, Footer, Nav
│   ├── sections/                Compuestos: Hero, ServicesGrid, etc.
│   └── animations/              SmoothScroll, Reveal, Marquee
├── content/                     MDX collections (Fase 3)
│   ├── config.ts                Schemas Zod
│   ├── services/
│   ├── portfolio/
│   └── blog/
├── lib/
│   ├── seo.ts                   Helpers de meta tags y JSON-LD
│   └── utils.ts                 Helpers genéricos
└── styles/
    └── globals.css              Tailwind + tokens custom
```

Naming:
- Archivos `.astro` y componentes en **PascalCase**: `BaseLayout.astro`, `ServiceCard.astro`.
- Archivos `.ts` en **kebab-case** o **camelCase** consistente: `seo.ts`, `format-date.ts`.
- Páginas Astro en **kebab-case** (porque la URL hereda el nombre): `aviso-legal.astro` → `/aviso-legal`.

---

## 3. Astro

### Reglas duras

- **0 KB JS por defecto.** No usar `client:load` salvo justificación. Preferir `client:idle` o `client:visible`.
- **Imágenes:** siempre `<Image>` o `<Picture>` de `astro:assets`. **Nunca** `<img>` directo (excepto inline en MDX donde no sea evitable).
- **Enlaces internos:** `<a href="/ruta">` normal. Sin `<Link>` propio.
- **TypeScript strict.** Sin `any` salvo último recurso justificado.
- **Output:** `'server'` con adapter `@astrojs/node`. **Toda página `.astro` lleva `export const prerender = true;`** salvo los endpoints `/api/*` que son dinámicos.
- **Trailing slash:** `never` (configurado en `astro.config.mjs`).

### Variables de entorno

- En **endpoints API** (`src/pages/api/*.ts`) y código que se ejecuta server-side en runtime: usar **`process.env.X`**.
- Para vars que sí queremos inlinear en build (PUBLIC_*): usar `import.meta.env.PUBLIC_X`.
- **Nunca** `import.meta.env.SECRET_X` — Vite lo reemplaza estáticamente en build, así que el valor que inyecte docker-compose en runtime no llega al código. Ver ADR-009.

### Cuando añadas una nueva ruta

- Si es **estática** (lo normal): añadir `export const prerender = true;` al inicio del frontmatter.
- Si es **dinámica** con `getStaticPaths()`: también `prerender = true`. El render se hace en build, las rutas se enumeran con `getStaticPaths`.
- Si es un **endpoint API o página verdaderamente dinámica**: `export const prerender = false;` y vivirá en runtime.

### Componentes

- Props tipadas con `interface Props` arriba del frontmatter.
- Defaults en la desestructuración: `const { title = '...' } = Astro.props;`.
- Slots con nombre cuando hay más de uno.
- Estilos en `<style>` scoped si son específicos del componente. Tailwind para todo lo demás.

### Frontmatter en MDX

Todo MDX debe pasar el schema Zod definido en `web/src/content.config.ts`. Si Astro rompe el build con un error de schema, **arreglar el contenido**, no aflojar el schema.

**Para crear/editar contenido:** ver [`contenido.md`](contenido.md). Reglas de slug (kebab-case, sin acentos), plantillas y voz/estilo están allí.

---

## 4. Tailwind / CSS

- Usar **tokens del tema** (`@theme` en `globals.css`), no valores literales:
  - ✅ `bg-[--color-bg]`, `text-[--color-fg-soft]`
  - ❌ `bg-white`, `text-[#525252]`
- Espaciado por escala Tailwind cuando aplique; valores fluidos `clamp()` cuando necesitemos respuesta tipográfica grande.
- Una clase de utilidad por intención. Si una combinación se repite > 3 veces, extraer a un componente.
- Nada de CSS-in-JS.

---

## 5. Accesibilidad (AA mínimo)

Reglas que se aplican **siempre, no al final**:

- Contraste texto/fondo ≥ 4.5:1 (texto normal) y ≥ 3:1 (texto grande > 18px o > 14px bold).
- Una `<h1>` por página. Jerarquía `h2`/`h3`/`h4` sin saltos.
- `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>` semánticos.
- Foco visible siempre. Si rediseñamos el outline, debe ser **más visible**, no menos.
- Imágenes con `alt` descriptivo. Decorativas → `alt=""`.
- Botones que disparan acciones JS son `<button>`, no `<div onclick>`.
- Enlaces que navegan son `<a href>`, no `<button>`.
- Formularios con `<label for="...">` asociados.
- Mensajes de error de formulario asociados con `aria-describedby`.
- Animaciones respetan `prefers-reduced-motion`. Si una animación es decorativa, ofrecer versión estática.
- Audit con axe-core en Fase 6.

---

## 6. SEO (técnico, no copywriting)

- Cada página debe pasar por `BaseLayout` y definir `title` y `description` propios.
- `title` ≤ 60 chars, `description` ≤ 160 chars.
- Canonical correcto en cada página.
- OG image disponible para compartibilidad (default global, override por página opcional).
- JSON-LD según tipo de página (ver `arquitectura.md#6-seo`).
- Sitemap automático.
- robots.txt apunta a sitemap.
- Imágenes con `width`/`height` para evitar CLS.
- Imágenes con `alt` real (impacta SEO).
- URLs lowercase, sin acentos, separadas por guiones.
- No URLs con queries para contenido principal.
- Sin meta `keywords` (irrelevante hoy).

---

## 7. Performance

- Cualquier dependencia nueva justifica peso. Comprobar bundle con `npm run build` antes y después.
- Imágenes nunca en formato original sin pasar por `<Image>`.
- Fuentes self-hosted, subset latin, `font-display: swap`.
- `_astro/` con cache inmutable, HTML con cache corta (configurado en `nginx.conf`).
- Preconnect/preload solo cuando aporte.
- Sin librerías JS pesadas en cliente. GSAP es la excepción justificada.

---

## 8. Estilo de código (no Prettier todavía, pero criterio)

- 2 espacios indentación.
- Comillas simples en JS/TS, dobles en JSX/Astro y HTML.
- Punto y coma sí.
- Líneas ≤ 100 chars cuando sea cómodo.
- Imports ordenados: dependencias externas → alias internos → relativos → estilos.
- Comentarios solo cuando expliquen el **por qué**, no el qué.

---

## 9. Mensajes al usuario en respuestas

- Español neutro, registro profesional pero directo.
- No emojis salvo petición.
- Resumir al final de cada fase con: qué se hizo, qué falta, próximo paso.
- Preguntar antes de avanzar si hay duda real. No preguntar lo ya respondido en `CLAUDE.md` o `docs/`.

---

## 10. Variables de entorno

- Todo secreto en `.env` (nunca en git).
- `.env.example` documentado y actualizado.
- Variables expuestas al cliente prefijadas con `PUBLIC_` (Astro convention).
- Nunca usar `import.meta.env` para secretos servidor en código que se envíe al cliente.

---

## 11. Ejemplo de cambio "bien hecho"

> Tarea: añadir componente `Marker` que muestre `// 00.01°` en mono, gris, espaciado tipo letterspacing.

```
1. Crear web/src/components/ui/Marker.astro con props {label: string}.
2. Reemplazar el texto hardcoded en index.astro por <Marker label="00.00°" />.
3. Añadir Marker a /_styleguide con dos variantes.
4. git add web/src/components/ui/Marker.astro web/src/pages/index.astro web/src/pages/_styleguide.astro
5. git commit -m "feat(web): añadir componente Marker reutilizable para etiquetas mono"
```

Lo que NO se hace:
- Añadir Marker + Button + Tag en el mismo commit.
- Refactorizar el header "de paso".
- Cambiar tokens corporativos sin acuerdo.
- Eliminar el placeholder de la home antes de tener el reemplazo real.
