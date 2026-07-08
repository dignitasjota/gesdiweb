// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  site: 'https://gesdiweb.es',
  // 'server' permite endpoints dinámicos (formulario de contacto via Resend).
  // Cada página se prerendera por defecto con `export const prerender = true`,
  // así el sitio sigue siendo casi 100% estático y solo /api/* corre en runtime.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'never',
  // Rechaza POST/PUT/... form-encoded cuya cabecera Origin no coincida con el
  // host. Protege el endpoint de contacto (/api/contact) contra CSRF/spam
  // cross-site. Solo afecta a rutas renderizadas bajo demanda.
  security: { checkOrigin: true },
  // Los enlaces externos del contenido (blog) se abren en pestaña nueva con
  // rel de seguridad. MDX hereda esta config de markdown por defecto.
  markdown: {
    rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]],
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  // Variables de entorno con tipado y validación.
  // El runtime las carga de .env (dev) o del entorno del proceso (prod).
  // Acceso vía `import { RESEND_API_KEY } from 'astro:env/server';`
  env: {
    schema: {
      RESEND_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      RESEND_FROM_EMAIL: envField.string({
        context: 'server',
        access: 'secret',
        default: 'hola@gesdiweb.es',
      }),
      LEAD_NOTIFICATION_EMAIL: envField.string({
        context: 'server',
        access: 'secret',
        default: 'hola@gesdiweb.es',
      }),
    },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-ES' },
      },
      // /styleguide es interna. Aviso legal y privacidad se excluyen MIENTRAS
      // lleven datos [PENDIENTE] + noindex (quitar de aquí al completarlos).
      filter: (page) =>
        !page.includes('/styleguide') &&
        !page.includes('/aviso-legal') &&
        !page.includes('/politica-privacidad'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  compressHTML: true,
});
