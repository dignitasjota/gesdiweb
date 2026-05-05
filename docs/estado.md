# Estado del proyecto

> **Snapshot dinámico.** Se actualiza al cerrar cada fase. Si entras nuevo al proyecto, este documento te dice **dónde estamos exactamente y qué hacer ahora**.

**Última actualización:** 2026-05-05
**Última fase cerrada:** Fase 7 — artefactos de despliegue listos
**Pendiente:** ejecutar el despliegue real en Hetzner siguiendo [`despliegue.md`](despliegue.md)

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
🟡 Fase 7  Despliegue Hetzner           [artefactos listos · ejecución pendiente del dueño]
⏳ Fase 8  Migración SEO + switch DNS
```

---

## Lo que está listo en el repo

- ✅ **GitHub Actions workflow** (`.github/workflows/deploy.yml`):
  - Build Docker buildx en push a main (solo paths relevantes)
  - Push a `ghcr.io/dignitasjota/gesdiweb-web` con tags `latest` + `sha-<short>`
  - Cache de GitHub Actions
  - Webhook a Portainer si `PORTAINER_WEBHOOK_URL` secret existe
- ✅ **Dockerfile producción** verificado en local (`docker run` → 200 OK + endpoint funcional)
- ✅ **docker-compose.yml** con imagen GHCR, healthcheck, logging rotation, env vars con valores por defecto y obligatorias marcadas con `:?`
- ✅ **Bug fix crítico:** `/api/contact.ts` ahora lee `process.env` en lugar de `import.meta.env` (que se reemplazaba estáticamente en build, ignorando vars de docker-compose en runtime)
- ✅ **Guía completa** [`docs/despliegue.md`](despliegue.md) con pasos en orden estricto
- ✅ **Runbook** [`docs/runbook.md`](runbook.md) con operaciones día-a-día, rollback, troubleshooting

## Lo que falta (requiere ejecución del dueño)

Pasos del dueño según [`docs/despliegue.md`](despliegue.md):

1. **Subdominio QA:** crear DNS `new.gesdiweb.es` → `157.180.44.59` (TTL 300s)
2. **Resend:** crear cuenta, generar API key, verificar dominio con SPF/DKIM/DMARC, probar envío con curl
3. **GitHub:**
   - Settings → Actions → Workflow permissions → "Read and write"
   - Verificar primer build del workflow funciona
   - Hacer pública la imagen GHCR (o configurar Portainer con PAT)
4. **VPS Hetzner (SSH):**
   - UFW: 22 + 80 + 443
   - fail2ban con jail SSH
5. **Portainer:**
   - Crear stack `gesdiweb` como repo Git
   - Env vars (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL`)
   - Activar webhook GitOps, copiar URL
   - Guardar URL como secret `PORTAINER_WEBHOOK_URL` en GitHub
6. **Nginx Proxy Manager:**
   - Proxy host `new.gesdiweb.es` → `gesdiweb_web:4321`
   - SSL Let's Encrypt automático
   - Force SSL + HTTP/2 + HSTS
7. **Validación post-deploy:**
   - Recorrer URLs en QA
   - Lighthouse 95+ contra `new.gesdiweb.es`
   - axe-core 0 violaciones críticas
   - Rich Results Test sobre 1 URL de cada tipo
   - **Probar formulario de contacto real** y recibir email
8. **Backups:** activar snapshots diarios en panel Hetzner

Detalle completo, comandos exactos y troubleshooting en [`despliegue.md`](despliegue.md).

## Lo que NO se hace en Fase 7

- **Cambio del dominio principal** `gesdiweb.es` → ese va en Fase 8 con migración SEO completa.
- **Migración del blog WordPress** → Fase 8.
- **Redirecciones 301** desde URLs antiguas → Fase 8.

---

## Detalle de Fase 7 (artefactos cerrados)

**Commits añadidos en `main`:**

```
cb33cdb docs: actualizar CLAUDE/README con Fase 7 lista pendiente de ejecución
f0bb2cf docs: guía completa de despliegue (Fase 7) y runbook actualizado
53bc411 chore(infra): docker-compose producción con imagen GHCR + healthcheck + logging
d73e8a7 ci: workflow GitHub Actions build + push GHCR + webhook Portainer
f35cbc2 fix(api): leer secrets de Resend con process.env en runtime, no import.meta.env
```

**Archivos creados:**

- `.github/workflows/deploy.yml` — workflow CI/CD
- `docs/despliegue.md` — guía paso-a-paso de despliegue inicial

**Archivos modificados:**

- `web/src/pages/api/contact.ts` — `process.env` en lugar de `import.meta.env`
- `docker-compose.yml` — imagen GHCR, IMAGE_TAG variable, healthcheck, logging, vars con :?
- `docker-compose.dev.yml` — build local + puerto 8090:4321
- `docs/runbook.md` — operaciones día-a-día, rollback, troubleshooting
- `CLAUDE.md`, `README.md` — referencias al nuevo doc

**Validación local:**
- `npm run build` → 22 páginas + endpoint, 0 errores
- `docker build` → imagen construida en ~6s
- `docker run` con `RESEND_API_KEY` → endpoint llama a Resend (devuelve 502 con key inválida, comportamiento correcto)
- `docker run` sin `RESEND_API_KEY` → endpoint devuelve `devMode: true` (modo seguro)

---

## Próximo paso concreto

**Para el dueño:** seguir el procedimiento en [`docs/despliegue.md`](despliegue.md), idealmente en este orden:

1. Empezar por **§3 Resend** (15 min, no requiere VPS).
2. Después **§4 GitHub Actions** — verificar que el workflow funciona y la imagen se publica en GHCR.
3. Después **§5 VPS** (UFW + fail2ban).
4. Después **§6 Portainer** (stack + webhook).
5. Después **§7 NPM** (proxy host + SSL).
6. **§8 Validación** — confirmar que todo carga, formulario envía, métricas Lighthouse.

Si te encuentras con un error en cualquier paso, abre el [`runbook.md` §9](runbook.md#9-troubleshooting) o pregúntame.

**Cuando todo el checklist de [`despliegue.md` §12`](despliegue.md#12-checklist-final-de-fase-7) esté ✅:** Fase 7 cerrada y listos para Fase 8 (migración del dominio principal y switch DNS).

---

## Notas de sesiones

### 2026-05-05 — Fase 7

Bug crítico encontrado durante validación local: el endpoint `/api/contact` leía `import.meta.env.RESEND_API_KEY`, que Astro reemplaza estáticamente en build. Las vars inyectadas por docker-compose en runtime no llegaban. Cambiado a `process.env.X` que sí funciona en runtime con el adapter Node. Verificado con un container real: con key presente intenta llamar a Resend (resultado correcto).

Decisión sobre CI/CD: GitHub Actions con webhook Portainer en lugar de SSH directo. Razones:
- No expone la clave SSH en GitHub
- Portainer se encarga del orquestación (rollback, recreate, healthcheck)
- Si el webhook no está configurado, el workflow no falla — solo loguea warning. Esto permite empezar con build-only y conectar el deploy más tarde.

La guía de despliegue está pensada para ejecutarla **una sola vez**. Para operaciones recurrentes (cambios de variables, rollback, troubleshooting) → `runbook.md`.
