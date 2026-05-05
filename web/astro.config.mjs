// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://gesdiweb.es',
  // 'server' permite endpoints dinámicos (formulario de contacto via Resend).
  // Cada página se prerendera por defecto con `export const prerender = true`,
  // así el sitio sigue siendo casi 100% estático y solo /api/* corre en runtime.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'never',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-ES' },
      },
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  compressHTML: true,
});
