# Guía de despliegue · gesdiweb

> Procedimiento ordenado para desplegar la web en el VPS Hetzner por primera vez (Fase 7) y mantenerla operativa. **Léelo entero antes de empezar.** Cada paso depende del anterior.

---

## 0. Resumen de la arquitectura de despliegue

```
[Push a main en GitHub]
        │
        ▼
[GitHub Actions]  build Docker image
        │  push
        ▼
[GHCR]  ghcr.io/dignitasjota/gesdiweb-web:latest
        │  webhook
        ▼
[Portainer]  pull + recreate
        │
        ▼
[Contenedor `gesdiweb_web` en Hetzner]   :4321 interno
        │
        ▼
[Nginx Proxy Manager]  SSL Let's Encrypt
        │
        ▼
[gesdiweb.es / www.gesdiweb.es]   :443 público
```

---

## 1. Pre-requisitos (tienes que tener todo esto antes)

### Cuentas y servicios

- [ ] **Hetzner** con VPS `157.180.44.59` accesible vía SSH con clave pública. 8GB / 80GB.
- [ ] **Portainer** y **Nginx Proxy Manager** ya corriendo en el VPS, con su red Docker compartida (típicamente `npm_default`). Si NPM no la tiene, crearla manualmente: `docker network create npm_default` y conectar NPM a ella.
- [ ] **Cuenta GitHub** `dignitasjota` con acceso al repo `dignitasjota/gesdiweb`.
- [ ] **Cuenta Resend** con plan free activo y dominio `gesdiweb.es` listo para verificar.
- [ ] **Acceso al panel DNS** del registrador del dominio `gesdiweb.es`.

### Información que necesitarás a mano

- IP del VPS: `157.180.44.59`
- URL pública de Portainer (ej: `https://portainer.tudominio.es`)
- URL pública de Nginx Proxy Manager (ej: `https://npm.tudominio.es`)

---

## 2. Crear el subdominio QA primero (recomendado)

Antes de tocar `gesdiweb.es` en producción (que sigue apuntando al WordPress antiguo), montamos la web nueva en un subdominio temporal para validarla. Por ejemplo: `new.gesdiweb.es`.

### 2.1 — DNS

Añadir en el panel del dominio:

```
Tipo  Host  Valor
A     new   157.180.44.59
```

TTL: 300 segundos (cambios rápidos durante QA).

Verificar resolución:

```bash
dig +short new.gesdiweb.es
# debe responder 157.180.44.59
```

---

## 3. Configurar Resend

### 3.1 — Crear API key

1. Login en https://resend.com → API Keys → "Create API Key"
2. Permisos: `Sending access` (no necesita más)
3. Guardar la key (formato `re_xxxxxxxxxxxx`). Solo se muestra una vez.

### 3.2 — Verificar el dominio

1. Resend → Domains → "Add Domain"
2. Introducir `gesdiweb.es`
3. Resend genera 3-4 registros DNS que hay que añadir en el panel del dominio:
   - **SPF** (TXT): `v=spf1 include:amazonses.com ~all` o el que indique Resend
   - **DKIM** (TXT con un selector específico, p.ej. `resend._domainkey`)
   - **DMARC** (TXT recomendado): `v=DMARC1; p=quarantine; rua=mailto:dmarc@gesdiweb.es`
   - **MX** (opcional, si quieres recibir bounces)

Añadir los registros y esperar propagación (5-30 min). Luego en Resend → Domains → "Verify".

### 3.3 — Probar envío

```bash
# Desde tu máquina con curl
curl -X POST 'https://api.resend.com/emails' \
  -H "Authorization: Bearer re_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "hola@gesdiweb.es",
    "to": "tu-email@ejemplo.com",
    "subject": "Test gesdiweb",
    "html": "<p>Funciona.</p>"
  }'
```

Si recibes el email: dominio verificado correctamente.

---

## 4. Configurar GitHub Actions

### 4.1 — Permisos del repo

Ajustes del repo en GitHub:

1. **Settings → Actions → General → Workflow permissions:**
   - Marcar "Read and write permissions" (necesario para publicar en GHCR).

2. **Settings → Packages:** verificar que el repo puede publicar paquetes.

### 4.2 — Secrets a configurar

> Settings → Secrets and variables → Actions → New repository secret

| Nombre | Valor | Cuándo se rellena |
|---|---|---|
| `PORTAINER_WEBHOOK_URL` | URL del webhook de la stack en Portainer | Después de crear la stack (paso 6) |

> Nota: `GITHUB_TOKEN` ya existe automáticamente, no hay que crearlo.

### 4.3 — Verificar el primer build

Hacer un commit trivial y push:

```bash
git commit --allow-empty -m "ci: probar workflow de build"
git push origin main
```

Ir a GitHub → Actions y verificar que `Build & Deploy` se ejecuta y termina en verde. Al final, en GHCR debería aparecer la imagen:

```
ghcr.io/dignitasjota/gesdiweb-web:latest
ghcr.io/dignitasjota/gesdiweb-web:sha-abcd1234
```

### 4.4 — Hacer público el paquete (opcional pero recomendado)

Por defecto las imágenes de GHCR son privadas y requieren autenticación para hacer pull. Para desplegar desde Portainer sin tener que loguearse a GHCR:

1. https://github.com/dignitasjota?tab=packages → `gesdiweb-web`
2. Package settings → Change visibility → Public

Si prefieres mantenerla privada, hay que crear un **Personal Access Token (PAT)** con scope `read:packages` y configurarlo en Portainer como Registry credentials.

---

## 5. Preparar el VPS (SSH al host)

### 5.1 — Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP (NPM redirige a HTTPS)
sudo ufw allow 443/tcp    # HTTPS
sudo ufw --force enable
sudo ufw status verbose
```

### 5.2 — fail2ban (protección SSH)

```bash
sudo apt update
sudo apt install -y fail2ban

# Configuración mínima
sudo tee /etc/fail2ban/jail.local > /dev/null <<'EOF'
[sshd]
enabled = true
port = 22
filter = sshd
maxretry = 3
findtime = 10m
bantime = 1h
EOF

sudo systemctl restart fail2ban
sudo systemctl status fail2ban
```

### 5.3 — Verificar Docker y la red NPM

```bash
docker --version
docker compose version
docker network ls | grep npm
# Debe aparecer "npm_default" (o como se llame en tu instalación)
```

Si la red de NPM tiene otro nombre, anotar para ajustar `docker-compose.yml`.

---

## 6. Crear la stack en Portainer

### 6.1 — Stack como repositorio Git (recomendado)

1. Portainer → Stacks → "Add stack"
2. Nombre: `gesdiweb`
3. Build method: **Repository**
4. Repository URL: `https://github.com/dignitasjota/gesdiweb`
5. Reference: `refs/heads/main`
6. Compose path: `docker-compose.yml`
7. Authentication: solo si el repo es privado (token)
8. **Environment variables:** rellenar con los valores reales:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=hola@gesdiweb.es
LEAD_NOTIFICATION_EMAIL=hola@gesdiweb.es
IMAGE_TAG=latest
```

9. **GitOps updates:** marcar **"Webhook"** (Portainer genera una URL única).
10. Copiar el webhook URL — lo guardamos como secret en GitHub (paso 4.2).
11. Click "Deploy the stack".

### 6.2 — Verificar que el contenedor arrancó

```bash
docker compose ps              # desde el VPS, en /portainer-stacks/gesdiweb (o donde Portainer la genere)
docker logs gesdiweb_web --tail 50
docker network inspect npm_default | grep gesdiweb_web
```

El contenedor debe estar `Up (healthy)` y aparecer en la red de NPM.

### 6.3 — Configurar el secret en GitHub

```
Repo → Settings → Secrets → Actions → New secret
Name: PORTAINER_WEBHOOK_URL
Value: <URL copiada del paso 6.1.10>
```

A partir de ahora, cada `git push origin main` que afecte a `web/`, `docker-compose.yml` o `.github/workflows/` hará:

1. GitHub Actions construye la imagen.
2. La sube a GHCR.
3. Llama al webhook de Portainer.
4. Portainer hace pull + recreate del contenedor.

---

## 7. Configurar Nginx Proxy Manager

### 7.1 — Crear el host de QA

NPM → Hosts → Proxy Hosts → Add Proxy Host

- **Domain Names:** `new.gesdiweb.es`
- **Scheme:** `http`
- **Forward Hostname / IP:** `gesdiweb_web` (el `container_name`)
- **Forward Port:** `4321`
- **Block Common Exploits:** ✅
- **Websockets Support:** ✅ (no estrictamente necesario, pero útil)

### 7.2 — SSL Let's Encrypt

Pestaña **SSL**:

- **SSL Certificate:** "Request a new SSL Certificate"
- **Force SSL:** ✅
- **HTTP/2 Support:** ✅
- **HSTS Enabled:** ✅
- **HSTS Subdomains:** depende, dejar `false` mientras `gesdiweb.es` siga apuntando a WordPress
- **Email Address for Let's Encrypt:** tu email
- **I Agree to the Let's Encrypt Terms of Service:** ✅
- Save

### 7.3 — Verificar

```bash
curl -I https://new.gesdiweb.es
# debe responder 200 con header HSTS
```

Abrir `https://new.gesdiweb.es` en el navegador → debería cargar la web con SSL válido.

---

## 8. Validación post-deploy en QA

Recorrer manualmente para confirmar:

- [ ] Home `/` carga, animaciones funcionan
- [ ] `/servicios` y `/servicios/posicionamiento-web`
- [ ] `/portfolio` y `/portfolio/tienda-aceite-ecologico`
- [ ] `/blog` y `/blog/como-mejorar-core-web-vitals`
- [ ] `/contacto` — **probar envío real del formulario** (revisar inbox de leads)
- [ ] `/aviso-legal`, `/politica-privacidad`, `/politica-cookies`
- [ ] `view-source:` en cualquier página → JSON-LD presente, OG meta presente

Auditorías (procedimiento detallado en [`auditoria.md`](auditoria.md)):

- [ ] Lighthouse mobile sobre 7-8 URLs críticas → 95+ en cada categoría
- [ ] axe DevTools → 0 violaciones críticas/serias
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) sobre 1 URL de cada tipo

---

## 9. Backups

### 9.1 — Snapshot del VPS

Hetzner ofrece snapshots desde su panel:

- Activar snapshots automáticos diarios (≈ 1€/mes adicional, vale la pena).
- Retención: 7 días mínimo.

### 9.2 — Volúmenes (si los hay)

Actualmente la stack `gesdiweb` **no tiene volúmenes persistentes**: el código y el contenido viven en Git, las imágenes en GHCR, y no hay BD. Si en el futuro se añaden, ampliar este apartado.

### 9.3 — Backup del repo

GitHub ya es el backup principal del código + contenido. Adicional opcional: clonar a un segundo proveedor (Codeberg, GitLab) con un mirror.

---

## 10. Rollback

Cada imagen subida a GHCR lleva tag `sha-<commit>`. Para volver a una versión anterior:

1. **Desde Portainer:** editar la stack → cambiar `IMAGE_TAG` de `latest` a `sha-abcd123` (commit anterior estable) → Update.
2. **Desde el VPS via SSH:**
   ```bash
   cd <ruta-stack>
   IMAGE_TAG=sha-abcd123 docker compose up -d --pull always
   ```
3. **Volver a `latest`** cuando esté el fix:
   ```bash
   IMAGE_TAG=latest docker compose up -d --pull always
   ```

> Mientras `IMAGE_TAG` esté en un sha fijo, el webhook de GitHub Actions seguirá disparándose pero no aplicará la última versión hasta que se vuelva a `latest`.

---

## 11. Cambiar el dominio principal (Fase 8)

Esto **no se hace en Fase 7**, va aparte en Fase 8. Cuando llegue:

1. Bajar TTL del A record de `gesdiweb.es` a 300s.
2. Añadir `gesdiweb.es` y `www.gesdiweb.es` como hosts en NPM (igual que `new.gesdiweb.es`).
3. Cambiar el A record de `gesdiweb.es` a `157.180.44.59`.
4. Configurar redirecciones 301 desde URLs antiguas (ver [`seo-migracion.md`](seo-migracion.md)).
5. Eliminar el host de `new.gesdiweb.es` o dejarlo de redirección 301 a `gesdiweb.es`.

---

## 12. Checklist final de Fase 7

- [ ] DNS de `new.gesdiweb.es` apunta al VPS
- [ ] Resend con dominio verificado y API key generada
- [ ] GitHub Actions ejecuta y publica imagen en GHCR
- [ ] Stack `gesdiweb` en Portainer corriendo y healthy
- [ ] Webhook Portainer guardado como secret en GitHub
- [ ] Push a main → workflow → redeploy automático funciona
- [ ] NPM expone `new.gesdiweb.es` con SSL Let's Encrypt
- [ ] UFW + fail2ban configurados
- [ ] Lighthouse 95+ en QA
- [ ] axe-core 0 violaciones críticas
- [ ] Formulario de contacto envía email real a la cuenta destino
- [ ] Snapshots de Hetzner activados

Cuando todo esté ✅, la Fase 7 está cerrada.
