# Mapa de redirecciones 301 — Migración SEO (Fase 8)

> Generado durante la reparación de enlaces internos del blog importado de WordPress.
> **Objetivo:** que las URLs antiguas que rankean en Google redirijan (301 permanente) a su
> equivalente en el sitio nuevo, sin perder autoridad SEO al hacer el switch de DNS.
>
> **IMPORTANTE — validar antes de aplicar:**
> - Los slugs de los posts se asumen idénticos al permalink original de WordPress
>   (los ficheros `.md` conservan el slug de origen; confirmado con los enlaces internos
>   cruzados del propio contenido). **Contrastar con la exportación real de Google Search
>   Console** antes del switch para cazar permalinks con estructura distinta
>   (p. ej. `/aaaa/mm/slug/` o con categoría en la ruta).
> - Aquí SOLO figuran redirecciones defendibles. Los enlaces dudosos quedan al final.
> - Dominio canónico nuevo: elegir `https://gesdiweb.es` **o** `https://www.gesdiweb.es`
>   (recomendado sin www) y forzar además el redirect www→no-www a nivel de proxy.

## 1. Posts del blog — `/<slug>/` → `/blog/<slug>`

| URL antigua (WordPress) | URL nueva |
|---|---|
| `https://gesdiweb.es/5-consejos-top-google/` | `/blog/5-consejos-top-google` |
| `https://gesdiweb.es/acciones-marketing-san-valentin/` | `/blog/acciones-marketing-san-valentin` |
| `https://gesdiweb.es/actualizacion-google-pinguino/` | `/blog/actualizacion-google-pinguino` |
| `https://gesdiweb.es/adsensei-monetizar-adsense/` | `/blog/adsensei-monetizar-adsense` |
| `https://gesdiweb.es/asuntos-email-marketing/` | `/blog/asuntos-email-marketing` |
| `https://gesdiweb.es/atencion-cliente-redes-sociales/` | `/blog/atencion-cliente-redes-sociales` |
| `https://gesdiweb.es/aumentar-visitas-blog/` | `/blog/aumentar-visitas-blog` |
| `https://gesdiweb.es/autogestion-redes-sociales/` | `/blog/autogestion-redes-sociales` |
| `https://gesdiweb.es/bancos-de-imagenes/` | `/blog/bancos-de-imagenes` |
| `https://gesdiweb.es/bases-datos-email-marketing/` | `/blog/bases-datos-email-marketing` |
| `https://gesdiweb.es/blog-marca-personal/` | `/blog/blog-marca-personal` |
| `https://gesdiweb.es/como-vender-internet/` | `/blog/como-vender-internet` |
| `https://gesdiweb.es/comprar-criptomoneda-ripple-binance/` | `/blog/comprar-criptomoneda-ripple-binance` |
| `https://gesdiweb.es/consejos-articulos-blog/` | `/blog/consejos-articulos-blog` |
| `https://gesdiweb.es/contenido-duplicado/` | `/blog/contenido-duplicado` |
| `https://gesdiweb.es/contenido-en-verano/` | `/blog/contenido-en-verano` |
| `https://gesdiweb.es/contenido-viral-en-facebook/` | `/blog/contenido-viral-en-facebook` |
| `https://gesdiweb.es/content-manager/` | `/blog/content-manager` |
| `https://gesdiweb.es/cosas-saber-comprar-dominio-web/` | `/blog/cosas-saber-comprar-dominio-web` |
| `https://gesdiweb.es/crear-canal-youtube-trucos/` | `/blog/crear-canal-youtube-trucos` |
| `https://gesdiweb.es/crear-contenido-seo-local/` | `/blog/crear-contenido-seo-local` |
| `https://gesdiweb.es/crear-una-landing-page/` | `/blog/crear-una-landing-page` |
| `https://gesdiweb.es/curacion-contenidos-blog/` | `/blog/curacion-contenidos-blog` |
| `https://gesdiweb.es/deshabilitar-amp-wordpress/` | `/blog/deshabilitar-amp-wordpress` |
| `https://gesdiweb.es/diseno-web-efectivo-amigable/` | `/blog/diseno-web-efectivo-amigable` |
| `https://gesdiweb.es/el-email-de-agradecimiento/` | `/blog/el-email-de-agradecimiento` |
| `https://gesdiweb.es/elegir-mejor-vps-web/` | `/blog/elegir-mejor-vps-web` |
| `https://gesdiweb.es/email-marketing/` | `/blog/email-marketing` |
| `https://gesdiweb.es/errores-marketing-contenidos/` | `/blog/errores-marketing-contenidos` |
| `https://gesdiweb.es/escaleta-de-contenidos/` | `/blog/escaleta-de-contenidos` |
| `https://gesdiweb.es/estrategia-de-contenidos/` | `/blog/estrategia-de-contenidos` |
| `https://gesdiweb.es/google-contenidos/` | `/blog/google-contenidos` |
| `https://gesdiweb.es/google-mobile-friendly-21-abril/` | `/blog/google-mobile-friendly-21-abril` |
| `https://gesdiweb.es/google-pigeon/` | `/blog/google-pigeon` |
| `https://gesdiweb.es/hosting-java/` | `/blog/hosting-java` |
| `https://gesdiweb.es/hosting-variedades/` | `/blog/hosting-variedades` |
| `https://gesdiweb.es/imagenes-creacion-paginas-web/` | `/blog/imagenes-creacion-paginas-web` |
| `https://gesdiweb.es/importancia-blog-marketing-online/` | `/blog/importancia-blog-marketing-online` |
| `https://gesdiweb.es/inbound-marketing/` | `/blog/inbound-marketing` |
| `https://gesdiweb.es/keywords-seo/` | `/blog/keywords-seo` |
| `https://gesdiweb.es/marketing-para-navidad/` | `/blog/marketing-para-navidad` |
| `https://gesdiweb.es/marketing-rebajas/` | `/blog/marketing-rebajas` |
| `https://gesdiweb.es/mejora-tasa-apertura-newsletter/` | `/blog/mejora-tasa-apertura-newsletter` |
| `https://gesdiweb.es/novedades-email-marketing-mailrelay/` | `/blog/novedades-email-marketing-mailrelay` |
| `https://gesdiweb.es/novedades-facebook/` | `/blog/novedades-facebook` |
| `https://gesdiweb.es/pasar-seguidores-instagram-clientes/` | `/blog/pasar-seguidores-instagram-clientes` |
| `https://gesdiweb.es/pasos-auditoria-seo/` | `/blog/pasos-auditoria-seo` |
| `https://gesdiweb.es/phishing/` | `/blog/phishing` |
| `https://gesdiweb.es/por-que-necesitas-pagina-web/` | `/blog/por-que-necesitas-pagina-web` |
| `https://gesdiweb.es/porque-dropshipping/` | `/blog/porque-dropshipping` |
| `https://gesdiweb.es/posicionamiento-en-buscadores/` | `/blog/posicionamiento-en-buscadores` |
| `https://gesdiweb.es/posicionar-en-instagram/` | `/blog/posicionar-en-instagram` |
| `https://gesdiweb.es/producto-importante-empresa/` | `/blog/producto-importante-empresa` |
| `https://gesdiweb.es/redes-sociales-en-verano/` | `/blog/redes-sociales-en-verano` |
| `https://gesdiweb.es/redes-sociales-errores/` | `/blog/redes-sociales-errores` |
| `https://gesdiweb.es/redes-sociales-pymes/` | `/blog/redes-sociales-pymes` |
| `https://gesdiweb.es/redes-sociales-visuales/` | `/blog/redes-sociales-visuales` |
| `https://gesdiweb.es/remarketing/` | `/blog/remarketing` |
| `https://gesdiweb.es/requisitos-video-viral/` | `/blog/requisitos-video-viral` |
| `https://gesdiweb.es/seguidores-en-twitter/` | `/blog/seguidores-en-twitter` |
| `https://gesdiweb.es/sistema-operativo-windows/` | `/blog/sistema-operativo-windows` |
| `https://gesdiweb.es/storytelling/` | `/blog/storytelling` |
| `https://gesdiweb.es/tendencias-de-logotipos-para-2019/` | `/blog/tendencias-de-logotipos-para-2019` |
| `https://gesdiweb.es/titulares-para-tus-articulos/` | `/blog/titulares-para-tus-articulos` |
| `https://gesdiweb.es/troll-en-redes-sociales/` | `/blog/troll-en-redes-sociales` |
| `https://gesdiweb.es/usabilidad-web-mobile-friendly/` | `/blog/usabilidad-web-mobile-friendly` |
| `https://gesdiweb.es/ventajas-coworking-valencia/` | `/blog/ventajas-coworking-valencia` |
| `https://gesdiweb.es/ventajas-crear-tienda-online/` | `/blog/ventajas-crear-tienda-online` |
| `https://gesdiweb.es/viralizar-el-contenido/` | `/blog/viralizar-el-contenido` |

## 2. Post con slug cambiado en la migración

| URL antigua (WordPress) | URL nueva | Motivo |
|---|---|---|
| `https://gesdiweb.es/mobile-friendly/` | `/blog/usabilidad-web-mobile-friendly` | El post «Diseño web responsive y Mobile friendly» se importó con slug `usabilidad-web-mobile-friendly`. Coincidencia de título inequívoca. |

## 3. Landings de servicio antiguas → servicio nuevo

Detectadas en los enlaces internos del blog. Puede haber más landings antiguas rankeando:
**extraerlas de Search Console en Fase 8** y añadirlas aquí.

| URL antigua (WordPress) | URL nueva | Motivo |
|---|---|---|
| `https://gesdiweb.es/posicionamiento-web-valencia/` | `/servicios/posicionamiento-web` | Landing SEO local del servicio de posicionamiento. |
| `https://gesdiweb.es/hosting-web-valencia/` | `/servicios/hosting-web` | Landing del servicio de hosting. |
| `https://gesdiweb.es/marketing-online-en-valencia/` | `/servicios/marketing-online` | Landing del servicio de marketing online. |
| `https://gesdiweb.es/marketing-digital-valencia/` | `/servicios/marketing-online` | Consolidacion: no hay servicio «marketing digital» separado; el anchor original apunta a «marketing online». |
| `https://gesdiweb.es/disseny-web-valencia/` | `/servicios/diseno-web` | Landing en valenciano del servicio de diseño web. |

## 4. Home

| URL antigua | URL nueva |
|---|---|
| `https://gesdiweb.es/` | `/` (sin cambios; solo forzar canónico/https/no-www) |

---

## Bloque para Nginx Proxy Manager

> En NPM: Proxy Host del dominio → pestaña **Advanced** → *Custom Nginx Configuration*.
> Coincidencia exacta (`location =`) con barra final (permalinks WP) devolviendo la ruta nueva.

```nginx
# ---- Redirecciones 301 migración WordPress -> Astro (Fase 8) ----

# 1. Posts del blog: /<slug>/ -> /blog/<slug>
location = /5-consejos-top-google/                   { return 301 /blog/5-consejos-top-google; }
location = /acciones-marketing-san-valentin/         { return 301 /blog/acciones-marketing-san-valentin; }
location = /actualizacion-google-pinguino/           { return 301 /blog/actualizacion-google-pinguino; }
location = /adsensei-monetizar-adsense/              { return 301 /blog/adsensei-monetizar-adsense; }
location = /asuntos-email-marketing/                 { return 301 /blog/asuntos-email-marketing; }
location = /atencion-cliente-redes-sociales/         { return 301 /blog/atencion-cliente-redes-sociales; }
location = /aumentar-visitas-blog/                   { return 301 /blog/aumentar-visitas-blog; }
location = /autogestion-redes-sociales/              { return 301 /blog/autogestion-redes-sociales; }
location = /bancos-de-imagenes/                      { return 301 /blog/bancos-de-imagenes; }
location = /bases-datos-email-marketing/             { return 301 /blog/bases-datos-email-marketing; }
location = /blog-marca-personal/                     { return 301 /blog/blog-marca-personal; }
location = /como-vender-internet/                    { return 301 /blog/como-vender-internet; }
location = /comprar-criptomoneda-ripple-binance/     { return 301 /blog/comprar-criptomoneda-ripple-binance; }
location = /consejos-articulos-blog/                 { return 301 /blog/consejos-articulos-blog; }
location = /contenido-duplicado/                     { return 301 /blog/contenido-duplicado; }
location = /contenido-en-verano/                     { return 301 /blog/contenido-en-verano; }
location = /contenido-viral-en-facebook/             { return 301 /blog/contenido-viral-en-facebook; }
location = /content-manager/                         { return 301 /blog/content-manager; }
location = /cosas-saber-comprar-dominio-web/         { return 301 /blog/cosas-saber-comprar-dominio-web; }
location = /crear-canal-youtube-trucos/              { return 301 /blog/crear-canal-youtube-trucos; }
location = /crear-contenido-seo-local/               { return 301 /blog/crear-contenido-seo-local; }
location = /crear-una-landing-page/                  { return 301 /blog/crear-una-landing-page; }
location = /curacion-contenidos-blog/                { return 301 /blog/curacion-contenidos-blog; }
location = /deshabilitar-amp-wordpress/              { return 301 /blog/deshabilitar-amp-wordpress; }
location = /diseno-web-efectivo-amigable/            { return 301 /blog/diseno-web-efectivo-amigable; }
location = /el-email-de-agradecimiento/              { return 301 /blog/el-email-de-agradecimiento; }
location = /elegir-mejor-vps-web/                    { return 301 /blog/elegir-mejor-vps-web; }
location = /email-marketing/                         { return 301 /blog/email-marketing; }
location = /errores-marketing-contenidos/            { return 301 /blog/errores-marketing-contenidos; }
location = /escaleta-de-contenidos/                  { return 301 /blog/escaleta-de-contenidos; }
location = /estrategia-de-contenidos/                { return 301 /blog/estrategia-de-contenidos; }
location = /google-contenidos/                       { return 301 /blog/google-contenidos; }
location = /google-mobile-friendly-21-abril/         { return 301 /blog/google-mobile-friendly-21-abril; }
location = /google-pigeon/                           { return 301 /blog/google-pigeon; }
location = /hosting-java/                            { return 301 /blog/hosting-java; }
location = /hosting-variedades/                      { return 301 /blog/hosting-variedades; }
location = /imagenes-creacion-paginas-web/           { return 301 /blog/imagenes-creacion-paginas-web; }
location = /importancia-blog-marketing-online/       { return 301 /blog/importancia-blog-marketing-online; }
location = /inbound-marketing/                       { return 301 /blog/inbound-marketing; }
location = /keywords-seo/                            { return 301 /blog/keywords-seo; }
location = /marketing-para-navidad/                  { return 301 /blog/marketing-para-navidad; }
location = /marketing-rebajas/                       { return 301 /blog/marketing-rebajas; }
location = /mejora-tasa-apertura-newsletter/         { return 301 /blog/mejora-tasa-apertura-newsletter; }
location = /novedades-email-marketing-mailrelay/     { return 301 /blog/novedades-email-marketing-mailrelay; }
location = /novedades-facebook/                      { return 301 /blog/novedades-facebook; }
location = /pasar-seguidores-instagram-clientes/     { return 301 /blog/pasar-seguidores-instagram-clientes; }
location = /pasos-auditoria-seo/                     { return 301 /blog/pasos-auditoria-seo; }
location = /phishing/                                { return 301 /blog/phishing; }
location = /por-que-necesitas-pagina-web/            { return 301 /blog/por-que-necesitas-pagina-web; }
location = /porque-dropshipping/                     { return 301 /blog/porque-dropshipping; }
location = /posicionamiento-en-buscadores/           { return 301 /blog/posicionamiento-en-buscadores; }
location = /posicionar-en-instagram/                 { return 301 /blog/posicionar-en-instagram; }
location = /producto-importante-empresa/             { return 301 /blog/producto-importante-empresa; }
location = /redes-sociales-en-verano/                { return 301 /blog/redes-sociales-en-verano; }
location = /redes-sociales-errores/                  { return 301 /blog/redes-sociales-errores; }
location = /redes-sociales-pymes/                    { return 301 /blog/redes-sociales-pymes; }
location = /redes-sociales-visuales/                 { return 301 /blog/redes-sociales-visuales; }
location = /remarketing/                             { return 301 /blog/remarketing; }
location = /requisitos-video-viral/                  { return 301 /blog/requisitos-video-viral; }
location = /seguidores-en-twitter/                   { return 301 /blog/seguidores-en-twitter; }
location = /sistema-operativo-windows/               { return 301 /blog/sistema-operativo-windows; }
location = /storytelling/                            { return 301 /blog/storytelling; }
location = /tendencias-de-logotipos-para-2019/       { return 301 /blog/tendencias-de-logotipos-para-2019; }
location = /titulares-para-tus-articulos/            { return 301 /blog/titulares-para-tus-articulos; }
location = /troll-en-redes-sociales/                 { return 301 /blog/troll-en-redes-sociales; }
location = /usabilidad-web-mobile-friendly/          { return 301 /blog/usabilidad-web-mobile-friendly; }
location = /ventajas-coworking-valencia/             { return 301 /blog/ventajas-coworking-valencia; }
location = /ventajas-crear-tienda-online/            { return 301 /blog/ventajas-crear-tienda-online; }
location = /viralizar-el-contenido/                  { return 301 /blog/viralizar-el-contenido; }

# 2. Post con slug cambiado
location = /mobile-friendly/                         { return 301 /blog/usabilidad-web-mobile-friendly; }

# 3. Landings de servicio antiguas
location = /posicionamiento-web-valencia/            { return 301 /servicios/posicionamiento-web; }
location = /hosting-web-valencia/                    { return 301 /servicios/hosting-web; }
location = /marketing-online-en-valencia/            { return 301 /servicios/marketing-online; }
location = /marketing-digital-valencia/              { return 301 /servicios/marketing-online; }
location = /disseny-web-valencia/                    { return 301 /servicios/diseno-web; }

# 4. www -> no-www y http -> https se gestionan en la config SSL del Proxy Host.
# ---- fin redirecciones ----
```

---

## Pendientes de decisión del dueño (NO redirigidos automáticamente)

### a) Enlaces a adjuntos `wp-content/uploads/*` (lightbox a imagen a tamaño completo)

Son wrappers `<a>` alrededor de imágenes que **sí renderizan** (la imagen usa ruta local
`./imagenes/...` importada). Solo se rompe el clic para ampliar a la imagen original, que ya no
existe. No se han tocado para no alterar el contenido. Opciones: (1) subir los originales a
`public/` y reescribir el destino, (2) quitar el wrapper `<a>` dejando solo la imagen, o
(3) dejarlo como está. Son 15 enlaces en 13 ficheros:

- `aumentar-visitas-blog.md` → `/wp-content/uploads/2015/04/Captura-de-pantalla-2015-12-21-a-las-16.46.40.png`
- `autogestion-redes-sociales.md` → `/wp-content/uploads/2015/07/autogestion-redes-sociales.jpg`
- `google-pigeon.md` → `/wp-content/uploads/2015/07/Captura-de-pantalla-2016-07-13-a-las-10.15.35.png`
- `hosting-variedades.md` → `/wp-content/uploads/2015/03/hosting.gif`
- `hosting-variedades.md` → `/wp-content/uploads/2015/03/hosting.jpg`
- `keywords-seo.md` → `/wp-content/uploads/2017/07/herramientas-seo-palabras-clave.png`
- `phishing.md` → `/wp-content/uploads/2015/07/phishing.jpg`
- `redes-sociales-en-verano.md` → `/wp-content/uploads/2016/08/redes-sociales-en-verano.jpg`
- `redes-sociales-visuales.md` → `/wp-content/uploads/2015/12/redes-sociales-visuales.jpg`
- `requisitos-video-viral.md` → `/wp-content/uploads/2015/05/Captura-de-pantalla-2015-05-13-a-las-22.39.03-1.jpg`
- `seguidores-en-twitter.md` → `/wp-content/uploads/2015/08/Captura-de-pantalla-2015-11-13-a-las-13.08.50-1.jpg`
- `usabilidad-web-mobile-friendly.md` → `/wp-content/uploads/2015/03/mobile-phones.jpg`
- `ventajas-crear-tienda-online.md` → `/wp-content/uploads/2015/06/Ecommerce-Valencia-1.jpg`
- `ventajas-crear-tienda-online.md` → `/wp-content/uploads/2015/06/comercioelectronicovalencia.jpg`
- `viralizar-el-contenido.md` → `/wp-content/uploads/2016/04/como-conseguir-contenido-viral.jpg`

### b) Otras URLs antiguas sin equivalente claro

Ninguna adicional detectada en el contenido del blog más allá de las anteriores. Las landings de
servicio que aún no aparecen en los enlaces internos (p. ej. `apps-moviles`,
`mantenimiento-informatico`) deberán localizarse en Search Console durante la Fase 8.
