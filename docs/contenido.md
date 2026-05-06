# Guía de contenido — gesdiweb

> **Objetivo de este documento.** Cualquier persona (o LLM) que reciba este archivo debe poder, con solo leerlo, **crear o editar un post de blog, un servicio o un proyecto del portfolio** sin tocar el código de las páginas. El sistema está diseñado para que el contenido viva en archivos Markdown (`.mdx`) versionados en Git y se publique automáticamente al hacer `git push`.
>
> **Lectura recomendada antes de tocar nada:** las primeras 3 secciones son obligatorias. El resto puedes consultarlo según necesites.

---

## 1. Conceptos básicos (lectura obligatoria)

### Qué es un "content collection"

`gesdiweb` usa **Astro Content Collections**: cada tipo de contenido (servicios, portfolio, blog) es una **carpeta** dentro de `web/src/content/`, y cada **archivo `.mdx`** dentro de esa carpeta es **una entrada** que se publica automáticamente como una página de la web.

### Cómo se relaciona el archivo con la URL

| Archivo en disco | URL pública |
|---|---|
| `web/src/content/blog/mi-post.mdx` | `https://gesdiweb.es/blog/mi-post` |
| `web/src/content/services/seo-local.mdx` | `https://gesdiweb.es/servicios/seo-local` |
| `web/src/content/portfolio/web-restaurante.mdx` | `https://gesdiweb.es/portfolio/web-restaurante` |

**Regla:** el nombre del archivo (sin extensión) **es el slug**. Debe ser:
- En **minúsculas**.
- Con **palabras separadas por guiones** (`-`), nunca espacios ni guiones bajos.
- Sin **acentos** ni caracteres especiales (`ñ` → `n`, `á` → `a`...).
- Descriptivo, breve, **rico en palabras clave** (es la URL que rankeará en Google).

✅ `seo-local-pymes-2026.mdx`
❌ `Mi Nuevo Post.mdx` · `seo_local.mdx` · `pymes-españolas.mdx`

### Qué es el "frontmatter"

Todo `.mdx` empieza con un bloque YAML entre `---` que contiene los **metadatos** de la entrada (título, fecha, etiquetas, etc.). Después de ese bloque va el **contenido** en Markdown.

```mdx
---
title: "Título del post"
excerpt: "Resumen breve."
publishedAt: 2026-06-01
readingMinutes: 6
categories: ["SEO técnico"]
tags: ["rendimiento"]
---

Aquí empieza el contenido real del post en Markdown.

## Subtítulo

Texto, **negritas**, [enlaces](https://...), listas, etc.
```

### Validación automática

Cada colección tiene un **schema Zod** definido en `web/src/content.config.ts`. Si un `.mdx` tiene un campo mal escrito, falta uno obligatorio o el tipo no encaja, **el build rompe** con un error claro. Esto es deseado: prefiero que falle al desplegar a publicar contenido roto.

---

## 2. Tabla resumen de colecciones

| Colección | Carpeta | URL base | Para qué sirve |
|---|---|---|---|
| `services` | `web/src/content/services/` | `/servicios/<slug>` | Páginas de servicio (qué ofrecemos) |
| `portfolio` | `web/src/content/portfolio/` | `/portfolio/<slug>` | Casos de estudio de proyectos |
| `blog` | `web/src/content/blog/` | `/blog/<slug>` | Artículos del blog |

Cuando se publica una entrada nueva, **aparece automáticamente** también en:
- Listados (`/servicios`, `/portfolio`, `/blog`)
- Secciones de la home (Servicios numerados, Portfolio destacado, Posts recientes)
- Sitemap XML

No hace falta tocar ninguna página `.astro`.

---

## 3. Schemas detallados (qué campos llevan)

### 3.1 — Blog (`web/src/content/blog/<slug>.mdx`)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `title` | string | ✅ | Título del post (50-60 chars ideal para SEO) |
| `excerpt` | string | ✅ | Resumen 1-2 frases (150-160 chars ideal) |
| `publishedAt` | fecha `YYYY-MM-DD` | ✅ | Fecha visible al público |
| `readingMinutes` | número entero | ✅ | Calcular: ≈ palabras / 220 |
| `categories` | array de strings | ✅ | Mínimo 1, máximo 2 (ej: `["SEO técnico"]`) |
| `tags` | array de strings | ✅ | Mínimo 1, máximo 5 (ej: `["Core Web Vitals"]`) |
| `author` | string | opcional | Por defecto `"Jota"` |
| `seoTitle` | string | opcional | Override del title para `<title>` |
| `seoDescription` | string | opcional | Override de la meta description |
| `status` | `'draft'` / `'scheduled'` / `'published'` | opcional | Por defecto `'published'`. Los `'draft'` no se publican |
| `lang` | string | opcional | Por defecto `"es"` |

### 3.2 — Servicios (`web/src/content/services/<slug>.mdx`)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `title` | string | ✅ | Nombre del servicio (corto: "Posicionamiento web") |
| `headline` | string | ✅ | Titular grande de la página de servicio (1 frase con punto) |
| `excerpt` | string | ✅ | Resumen 1-2 frases (aparece en listados y home) |
| `order` | número entero positivo | ✅ | Orden de aparición. **Único entre servicios** |
| `features` | array de strings | ✅ | 4-7 ítems. Lista "qué incluye" |
| `approach` | array de strings | ✅ | 4-6 ítems. Pasos del método |
| `seoTitle` | string | opcional | |
| `seoDescription` | string | opcional | |
| `status` | `'draft'` / `'published'` | opcional | Por defecto `'published'` |
| `lang` | string | opcional | Por defecto `"es"` |

> **Nota:** los servicios actualmente **no usan cuerpo MDX**. Todo se renderiza desde el frontmatter. El cuerpo puede dejarse vacío.

### 3.3 — Portfolio (`web/src/content/portfolio/<slug>.mdx`)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `title` | string | ✅ | Nombre del proyecto |
| `client` | string | ✅ | Nombre del cliente (o `"[PLACEHOLDER · cliente]"` si no público) |
| `year` | número entero | ✅ | Año del proyecto |
| `excerpt` | string | ✅ | Resumen 1-2 frases |
| `order` | número entero positivo | ✅ | Orden de aparición. **Único entre proyectos** |
| `featured` | booleano | ✅ | `true` aparece en home destacados, `false` solo en `/portfolio` |
| `techStack` | array de strings | ✅ | 3-6 tecnologías (ej: `["Astro", "Tailwind", "Cloudflare"]`) |
| `servicesUsed` | array de strings | ✅ | Slugs de servicios aplicados (ej: `["posicionamiento-web", "hosting-web"]`) |
| `url` | URL | opcional | URL pública del proyecto online |
| `seoTitle` | string | opcional | |
| `seoDescription` | string | opcional | |
| `status` | `'draft'` / `'published'` | opcional | |
| `lang` | string | opcional | |

> El cuerpo MDX del archivo se renderiza como **caso de estudio** en la página de detalle.

---

## 4. Cómo crear un nuevo post de blog (paso a paso)

### Paso 1 — Decidir el slug

Pensar la URL primero. Ejemplo:

> Tema: "Diferencias entre SEO local y SEO general"
> Slug propuesto: `seo-local-vs-seo-general`
> URL final: `https://gesdiweb.es/blog/seo-local-vs-seo-general`

### Paso 2 — Crear el archivo

Crear `web/src/content/blog/seo-local-vs-seo-general.mdx`.

### Paso 3 — Rellenar el frontmatter

Plantilla mínima copy-paste:

```mdx
---
title: "Diferencias entre SEO local y SEO general en 2026"
excerpt: "Cuándo conviene cada uno y cómo no perder tiempo aplicando el equivocado."
publishedAt: 2026-06-15
readingMinutes: 7
categories: ["SEO técnico"]
tags: ["SEO local", "estrategia", "pymes"]
---
```

### Paso 4 — Escribir el cuerpo

Usar Markdown estándar. **El primer encabezado del cuerpo debe ser `##` (no `#`)**, porque el `#` lo aporta automáticamente el sistema desde `title`.

```mdx
Si llevas un negocio físico y solo te ven los clientes que ya saben
que existes, **estás dejando dinero sobre la mesa**. El SEO local resuelve
exactamente eso.

## Qué es el SEO local

Texto del primer apartado...

## Qué es el SEO general

Texto del segundo apartado...

### Diferencias clave

- Punto uno
- Punto dos
- Punto tres

## Cuándo conviene cada uno

Texto final...

## En resumen

Cierre con la idea principal.
```

### Paso 5 — Verificar localmente (opcional pero recomendado)

```bash
cd web
npm run dev
# Abrir http://localhost:4321/blog/seo-local-vs-seo-general
```

### Paso 6 — Publicar

```bash
git add web/src/content/blog/seo-local-vs-seo-general.mdx
git commit -m "docs(blog): añadir post sobre SEO local vs SEO general"
git push origin main
```

El despliegue automático en Hetzner (Fase 8 en adelante) reconstruye y publica en ~2 minutos.

---

## 5. Cómo añadir un nuevo servicio

### Paso 1 — Slug y URL

Slug breve y SEO-friendly. Ejemplo:

> Servicio: "Auditorías de seguridad"
> Slug: `auditorias-seguridad`
> URL: `/servicios/auditorias-seguridad`

### Paso 2 — Decidir el `order`

Mirar los `order` de los servicios existentes:

```bash
grep -h "^order:" web/src/content/services/*.mdx
```

Asignar el siguiente número disponible (o reordenar todos si quieres meterlo en medio — recordar reasignar `order` de los demás).

### Paso 3 — Plantilla copy-paste

`web/src/content/services/auditorias-seguridad.mdx`:

```mdx
---
title: "Auditorías de seguridad"
headline: "Detectar agujeros antes que los detecten otros."
excerpt: "Auditoría técnica y operativa de seguridad para pymes y entornos web."
order: 6
features:
  - "Análisis de vulnerabilidades técnicas"
  - "Revisión de buenas prácticas operativas"
  - "Test de penetración en aplicaciones web"
  - "Plan de remediación priorizado"
  - "Reporte ejecutivo y técnico separados"
approach:
  - "Reunión inicial para entender el alcance y los activos críticos."
  - "Auditoría no intrusiva en una primera pasada."
  - "Pruebas activas con permiso explícito y entorno controlado."
  - "Entrega de informe con riesgos y recomendaciones priorizadas."
  - "Reunión de cierre + plan de seguimiento opcional."
---
```

### Paso 4 — Asignar icono

El sistema usa un icono SVG por servicio. Mapping en estos archivos:

- `web/src/components/sections/ServicesNumberedList.astro`
- `web/src/pages/servicios/index.astro`

Buscar la constante `icons` y añadir la línea:

```ts
const icons: Record<string, IconName> = {
  'posicionamiento-web': 'seo',
  'apps-moviles': 'mobile',
  // ...
  'auditorias-seguridad': 'shield', // ← añadir aquí
};
```

Iconos disponibles: ver `web/src/components/ui/icon-names.ts`. Para servicios suelen encajar: `seo`, `mobile`, `server`, `megaphone`, `wrench`, `shield`, `bolt`, `eye`, `compass`.

### Paso 5 — Commit

```bash
git add web/src/content/services/auditorias-seguridad.mdx \
        web/src/components/sections/ServicesNumberedList.astro \
        web/src/pages/servicios/index.astro

git commit -m "feat(servicios): añadir servicio de auditorías de seguridad"
git push origin main
```

---

## 6. Cómo añadir un proyecto al portfolio

### Paso 1 — Slug

```
Proyecto: "Rediseño web de la asociación XYZ"
Slug: redisenio-web-asociacion-xyz
```

### Paso 2 — Plantilla

`web/src/content/portfolio/redisenio-web-asociacion-xyz.mdx`:

```mdx
---
title: "Rediseño web para la Asociación XYZ"
client: "Asociación XYZ"
year: 2026
excerpt: "Web moderna y accesible que multiplicó por tres las solicitudes de información."
order: 6
featured: true
techStack:
  - "Astro"
  - "Tailwind"
  - "Plausible"
servicesUsed:
  - "posicionamiento-web"
  - "hosting-web"
url: "https://www.asociacionxyz.org"
---

## El reto

La asociación tenía una web de 2014 muy lenta, no responsive y con un
embudo de captación inexistente. La gente que les buscaba en Google
abandonaba antes de encontrar el formulario de contacto.

## La solución

Rediseño completo con Astro estático, foco en accesibilidad AA y SEO
técnico. Captación con formulario destacado en cada página y CTA
contextual según el contenido.

## Resultados

- Lighthouse 99 en todas las páginas
- 3× solicitudes de información en 4 meses
- Tasa de rebote del 65% al 28%
```

### Paso 3 — Notas importantes

- **`featured: true`** → aparece en la home en la sección "Trabajo reciente". Mantener máximo **3** featured a la vez.
- **`servicesUsed`** debe contener **slugs exactos** de servicios existentes. Si pones uno que no existe, el link rompe (build no falla pero el chip no enlazará bien).
- El cuerpo MDX se renderiza como caso de estudio. Estructura recomendada: **El reto → La solución → Resultados** (3 secciones con `##`).

### Paso 4 — Commit

```bash
git add web/src/content/portfolio/redisenio-web-asociacion-xyz.mdx
git commit -m "feat(portfolio): añadir caso Asociación XYZ"
git push origin main
```

---

## 7. Cómo editar contenido existente

### Cambios menores (corrección, párrafo, enlace)

1. Localizar el archivo en `web/src/content/<colección>/<slug>.mdx`.
2. Editar.
3. Commit con mensaje descriptivo: `docs(blog): corregir typo en el post sobre Core Web Vitals`.
4. Push.

### Cambiar el slug (cambiar la URL)

Renombrar un archivo cambia la URL. **Esto rompe SEO y enlaces externos.** Si es imprescindible:

1. Renombrar el archivo.
2. **Crear redirección 301** desde la URL antigua a la nueva en Nginx Proxy Manager (Fase 8) o en `nginx.conf` del contenedor.
3. Avisar al dueño antes de hacerlo.

### Despublicar sin borrar

Cambiar `status: published` → `status: draft`. La entrada deja de aparecer en listados y rutas dinámicas. El archivo permanece para histórico.

### Borrar definitivamente

`git rm` del archivo + redirección 301 si ya estaba indexado.

---

## 8. Voz y estilo de redacción

Estas son **guidelines no negociables** para que el blog y los servicios suenen a una sola persona:

| Hacer | No hacer |
|---|---|
| Tono **directo y honesto**. Hablar de tú al lector. | Tono corporativo plural ("nuestro equipo de expertos") |
| Frases **cortas**. Un punto cuando puedas, antes de una coma. | Párrafos largos sin respirar |
| Ejemplos concretos con cifras reales | Promesas vacías ("los mejores", "líderes del sector") |
| Negritas con `**` para destacar **una idea** por párrafo | Negritas decorativas en cada frase |
| Subtítulos `##` y `###` con jerarquía clara | Saltarse niveles (de `##` a `####`) |
| Cierre con una idea sintetizada o un próximo paso | Postales tipo "y eso es todo, ¡un saludo!" |

### Plantilla de estructura para un post

```
[1 párrafo gancho con la idea principal]

## Sección con la primera tesis
[2-4 párrafos]

## Sección con la segunda tesis
[2-4 párrafos]

### Subapartado si hace falta
[1-2 párrafos]

## Cierre
[1 párrafo síntesis o llamada a la acción suave]
```

### Longitud orientativa

- Posts: **600–1.500 palabras** (3–7 minutos de lectura).
- Excerpt de cualquier tipo: **150–160 caracteres**.
- Headline de servicio: **una frase, máximo 8 palabras, terminada en punto**.
- Caso de estudio (cuerpo): **300–700 palabras**.

---

## Imágenes de portfolio (cover y galería)

Todas las imágenes del portfolio viven bajo una carpeta común `imagenes/` con una subcarpeta por proyecto. Mantiene la raíz de `portfolio/` limpia: solo los `.mdx`.

```
web/src/content/portfolio/
├── imagenes/                            ← carpeta común para todas las imágenes
│   ├── clinica-parc-central/            ← subcarpeta = slug del proyecto
│   │   ├── cover.jpg                    ← imagen principal
│   │   └── galeria-01.jpg               ← (opcional) imágenes secundarias
│   └── otro-proyecto/
│       └── cover.jpg
├── clinica-parc-central.mdx
├── otro-proyecto.mdx
└── (resto de .mdx)
```

**Convención:**
- Carpeta raíz `imagenes/` para todas las imágenes del portfolio.
- Subcarpeta = **slug del proyecto** (mismo nombre que el `.mdx` sin extensión).
- Dentro, nombres descriptivos: `cover.jpg`, `galeria-01.jpg`, etc.

### Cómo referenciar la cover en el frontmatter

```yaml
cover: ./imagenes/clinica-parc-central/cover.jpg
coverAlt: "Texto descriptivo para SEO + accesibilidad"
```

### Cómo referenciar una galería (opcional)

```yaml
gallery:
  - ./imagenes/clinica-parc-central/galeria-01.jpg
  - ./imagenes/clinica-parc-central/galeria-02.jpg
```

> El renderizado de la galería en la página de detalle todavía no está conectado — lo añadiré cuando se necesite. La estructura del schema ya está preparada.

### Especificaciones técnicas

| Campo | Recomendación |
|---|---|
| Formato | JPG (fotos), PNG (capturas con texto) o WebP. Astro genera AVIF/WebP automáticamente |
| Cover mínima | **1600×900** (16:9). Si la fuente tiene otro ratio se recorta con `object-cover` |
| Optimización | Astro la hace en build (typical: 412 KB → 45 KB en WebP) |
| Variantes responsive | Generadas automáticamente: 480/720/1080/1440/1920px |

### Sin imagen

Si un proyecto del portfolio no tiene cover (`cover` ausente del frontmatter), se renderiza un **placeholder brand-soft** automáticamente con el número y año del proyecto. La web sigue funcionando.

---

## 9. MDX disponible en este proyecto

### Markdown estándar que funciona

```markdown
**negrita**
*cursiva*
[texto enlace](https://url)
[enlace interno](/blog/otro-post)

## Subtítulo nivel 2
### Subtítulo nivel 3

- Lista
- Con
- Items

1. Lista
2. Numerada

> Cita en bloque

`código inline`

\```js
bloque de código con highlighting
\```
```

### Lo que NO se ha configurado todavía

- Imágenes en cuerpo MDX (sí en home/listados, pero los covers de portfolio/blog son placeholder hasta que el dueño aporte material — Fase 8).
- Componentes Astro embebidos dentro del MDX. La integración MDX lo permite (es la principal ventaja sobre Markdown puro), pero por ahora no hay componentes de uso pensados para el cuerpo de posts. Cuando los haya, se añadirán en este documento.
- Tablas (las soporta Markdown estándar pero todavía no hay estilos específicos).

### Estilos de prosa aplicados al cuerpo

- **Posts (`/blog/[slug]`):** estilos en `.post-body` (ver `web/src/pages/blog/[slug].astro`). H2 con `--text-xl`, párrafos con `line-height: 1.75`, enlaces subrayados con color brand.
- **Casos de estudio (`/portfolio/[slug]`):** estilos en `.prose-mimic` (en `web/src/pages/portfolio/[slug].astro`). Más compactos.

---

## 10. Si tu rol es "adaptar texto bruto al formato MDX"

Caso típico: el dueño manda un email con el contenido de un post y pide convertirlo a MDX. Pasos:

1. **Pensar el slug** (ver §1 reglas).
2. **Extraer del texto bruto:** título, excerpt, fecha, categorías, tags, tiempo de lectura.
3. **Detectar la estructura:** ¿qué frase es el gancho inicial (sin `##`)?, ¿qué van a ser los `##` (secciones principales)?, ¿hay `###` (subapartados)?
4. **Aplicar la voz** del §8 si el texto bruto suena demasiado corporativo.
5. **Escribir el MDX completo** y verificar que cumple el schema del §3.
6. **Devolver al usuario** el archivo `.mdx` listo para copiar a `web/src/content/blog/<slug>.mdx`.

### Ejemplo de conversión

> **Input bruto del dueño:**
>
> "Hola, quiero que escribas un post sobre por qué el hosting compartido es malo para el SEO. Resume que es lento, comparte IP con webs de mala reputación, y suele tener limitaciones de PHP/MySQL. Termina diciendo que un VPS es la opción razonable a partir de cierto volumen. Que sea fácil de leer."

> **Output esperado:**
>
> ```mdx
> ---
> title: "Por qué el hosting compartido te está costando posiciones en Google"
> excerpt: "Es barato pero el SEO te lo cobra: lentitud, IPs compartidas con webs penalizadas y límites técnicos. Cuándo dar el salto a un VPS."
> publishedAt: 2026-06-20
> readingMinutes: 5
> categories: ["SEO técnico"]
> tags: ["hosting", "rendimiento", "infraestructura"]
> ---
>
> Si tu web rankea peor de lo que debería, hay una variable que casi nadie
> revisa: **dónde está alojada**. Y si la respuesta es "un hosting compartido
> de toda la vida", probablemente ahí esté gran parte del problema.
>
> ## El problema 1: lentitud
>
> En un hosting compartido tu web convive con cientos (a veces miles) de
> otros sitios en el mismo servidor. Comparten CPU, RAM y ancho de banda.
> Si un vecino tiene un pico de tráfico, **tu web se vuelve más lenta sin
> que tú hayas hecho nada**.
>
> Google penaliza la lentitud directamente desde la actualización de Core
> Web Vitals. Una web a 5 segundos de LCP no rankea, da igual lo bueno
> que sea su contenido.
>
> ## El problema 2: vecinos tóxicos
>
> Las IPs en hosting compartido se reparten entre todos los sitios del
> servidor. Si uno de ellos es spam, phishing o tiene contenido para adultos
> de baja calidad, **tu dominio queda asociado a esa IP**. Google lo nota.
>
> ## El problema 3: límites técnicos
>
> Versiones antiguas de PHP, configuraciones de MySQL imposibles de
> tunear, falta de control sobre headers HTTP, sin acceso SSH...
> Cualquier optimización SEO técnica seria choca con la pared del hosting.
>
> ## La solución razonable: VPS
>
> Un VPS (servidor virtual privado) elimina los tres problemas:
> recursos dedicados, IP propia y control total sobre la configuración.
> A partir de **cierto volumen de tráfico o cuando el SEO importa de
> verdad**, es la inversión que más impacto tiene por euro gastado.
>
> ## En resumen
>
> El hosting compartido es perfecto para una web personal de fin de semana.
> Para un negocio que vive del tráfico orgánico, es un freno invisible que
> puedes quitar de un día para otro. Si llevas tiempo estancado en
> posiciones, mira primero ahí.
> ```

Esto es la salida deseada. Devolverla **directamente al usuario** sin envoltorios ni comentarios extra: solo el bloque MDX listo para guardar como archivo.

---

## 11. Despliegue (cómo se publica el cambio)

> **Nota:** este apartado se completa al cerrar la Fase 7 (despliegue Hetzner). De momento, el flujo es:
>
> 1. `git push origin main`
> 2. (Pendiente) GitHub Actions construye la imagen Docker y la sube a GHCR.
> 3. (Pendiente) Portainer en el VPS hace pull y recrea el contenedor `web`.
> 4. La web nueva está en producción en ~2 minutos.

Para verificar localmente antes del push:

```bash
cd web
npm run build           # debería terminar sin errores
npm run preview         # sirve el build estático en http://localhost:4321
```

---

## 12. Plantillas listas para copiar

### 12.1 — Plantilla post de blog mínima

```mdx
---
title: "TÍTULO DEL POST"
excerpt: "RESUMEN 1-2 FRASES (máximo 160 caracteres)."
publishedAt: AAAA-MM-DD
readingMinutes: N
categories: ["CATEGORÍA"]
tags: ["TAG1", "TAG2"]
---

PÁRRAFO GANCHO INICIAL.

## SECCIÓN 1

CONTENIDO.

## SECCIÓN 2

CONTENIDO.

## CIERRE

CONTENIDO.
```

### 12.2 — Plantilla servicio mínima

```mdx
---
title: "NOMBRE DEL SERVICIO"
headline: "TITULAR DE 1 FRASE."
excerpt: "RESUMEN 1-2 FRASES."
order: N
features:
  - "FEATURE 1"
  - "FEATURE 2"
  - "FEATURE 3"
  - "FEATURE 4"
approach:
  - "PASO 1."
  - "PASO 2."
  - "PASO 3."
  - "PASO 4."
---
```

### 12.3 — Plantilla proyecto portfolio mínima

```mdx
---
title: "NOMBRE DEL PROYECTO"
client: "NOMBRE DEL CLIENTE"
year: AAAA
excerpt: "RESUMEN 1-2 FRASES."
order: N
featured: false
techStack:
  - "TECH 1"
  - "TECH 2"
  - "TECH 3"
servicesUsed:
  - "slug-servicio-1"
  - "slug-servicio-2"
---

## El reto

DESCRIPCIÓN.

## La solución

DESCRIPCIÓN.

## Resultados

- MÉTRICA 1
- MÉTRICA 2
- MÉTRICA 3
```

---

## 13. Checklist final antes de hacer commit

- [ ] El nombre del archivo es **slug-correcto.mdx** (minúsculas, guiones, sin acentos).
- [ ] El frontmatter tiene **todos los campos obligatorios** del §3.
- [ ] La fecha es `AAAA-MM-DD` (no string).
- [ ] El cuerpo no empieza con `#` (lo aporta el sistema desde `title`).
- [ ] La jerarquía de subtítulos es coherente (`##` → `###` sin saltos).
- [ ] El excerpt no supera ~160 caracteres.
- [ ] El tono coincide con el §8 (directo, ejemplos concretos, frases cortas).
- [ ] (Si servicio nuevo) El icono está mapeado en los dos archivos `.astro` del §5.
- [ ] (Si proyecto nuevo) Los `servicesUsed` referencian slugs reales existentes.
- [ ] `npm run build` localmente termina sin errores.
- [ ] El mensaje de commit sigue Conventional Commits (`feat(blog):`, `docs(blog):`, etc.).
