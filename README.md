# gesdiweb

Web corporativa de **gesdiweb** — diseño web y posicionamiento SEO.

## Stack

- **Frontend:** Astro 5 + Tailwind 4 (HTML estático generado en build)
- **Contenido:** MDX en `web/src/content/`
- **Animaciones:** GSAP + ScrollTrigger + Lenis (a partir de Fase 2)
- **Despliegue:** Docker en VPS Hetzner detrás de Nginx Proxy Manager
- **Email transaccional:** Resend (formulario de contacto)
- **Analítica:** Plausible/Umami autohospedado (pendiente decisión)

## Estructura del repositorio

```
gesdiweb/
├── docs/                    Documentación interna (Docker, decisiones, runbook)
├── web/                     Aplicación Astro
├── docker-compose.yml       Stack producción (Hetzner)
├── docker-compose.dev.yml   Override desarrollo local
├── .env.example             Variables de entorno requeridas
└── README.md
```

## Levantar el entorno local

Para desarrollo diario se usa el dev server de Astro directamente (más rápido que Docker):

```bash
cd web
npm install
npm run dev
```

Astro arrancará en `http://localhost:4321` con hot reload.

## Construir la imagen Docker (producción)

```bash
docker compose build
```

Para probar la imagen de producción en local:

```bash
docker run --rm -p 8080:80 gesdiweb-web
# y abrir http://localhost:8080
```

## Documentación

> **Para LLMs / agentes IA:** empezar por [`CLAUDE.md`](CLAUDE.md) en la raíz. Es el punto de entrada canónico.

| Documento | Para qué sirve |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Punto de entrada para cualquier LLM. Resumen ejecutivo + reglas + estado |
| [`docs/briefing.md`](docs/briefing.md) | Briefing original del dueño (alcance, marca, SEO, sistema de diseño) |
| [`docs/fases.md`](docs/fases.md) | Plan de 9 fases con estado y validaciones |
| [`docs/estado.md`](docs/estado.md) | Snapshot del estado actual (qué está hecho y qué toca) |
| [`docs/arquitectura.md`](docs/arquitectura.md) | Arquitectura, identidad visual, modelo de contenido |
| [`docs/decisiones.md`](docs/decisiones.md) | ADRs (Architecture Decision Records) |
| [`docs/convenciones.md`](docs/convenciones.md) | Commits, código, accesibilidad, SEO |
| [`docs/docker-explicado.md`](docs/docker-explicado.md) | Docker desde cero aplicado al proyecto |
| [`docs/runbook.md`](docs/runbook.md) | Procedimientos operativos |
| [`docs/seo-migracion.md`](docs/seo-migracion.md) | Plan de migración SEO desde la WordPress antigua |

## Estado del proyecto

Fase 0 (setup base) **completada**. Ver [`docs/estado.md`](docs/estado.md) para el snapshot vivo.
