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

- [`docs/docker-explicado.md`](docs/docker-explicado.md) — Docker desde cero aplicado a este proyecto
- [`docs/decisiones.md`](docs/decisiones.md) — Decisiones técnicas (ADRs)
- [`docs/runbook.md`](docs/runbook.md) — Runbook de operaciones (despliegue, backups, troubleshooting)

## Estado del proyecto

Fase 0 (setup base) — en curso. Ver el briefing del proyecto para el plan de fases completo.
