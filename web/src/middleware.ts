import { defineMiddleware } from 'astro:middleware';

/**
 * Repone las cabeceras de seguridad que antes añadía el nginx interno (retirado
 * al pasar a Node standalone). Se aplican a las respuestas renderizadas bajo
 * demanda (endpoints /api/* y cualquier página no prerenderizada).
 *
 * NOTA: las páginas con `prerender = true` se sirven como HTML estático y el
 * middleware NO se ejecuta en cada request para ellas, así que estas cabeceras
 * deben añadirse también en el reverse proxy (Nginx Proxy Manager) para cubrir
 * el sitio completo. Ver docs/despliegue.md.
 */
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
};

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(name)) response.headers.set(name, value);
  }
  return response;
});
