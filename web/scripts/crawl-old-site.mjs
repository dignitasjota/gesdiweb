#!/usr/bin/env node
/**
 * Crawler del sitio ANTIGUO (WordPress en https://gesdiweb.es) para inventariar
 * las URLs que hoy devuelven 200. Es una de las dos fuentes del mapa de 301 de
 * la Fase 8 (la otra es el export de Search Console).
 *
 * USO
 *   node scripts/crawl-old-site.mjs [--base <url>] [--out <fichero>]
 *                                   [--max <n>] [--delay <ms>] [--json]
 *
 *   --base   Origen a rastrear (por defecto https://gesdiweb.es).
 *   --out    Fichero de salida (por defecto ../seo/urls-old.txt).
 *   --max    Tope de páginas a visitar (por defecto 2000; corta runaways).
 *   --delay  Espera entre lotes en ms (por defecto 150; sé cortés con el server).
 *   --insecure  Ignora errores de certificado TLS (la WP actual puede tener el
 *               cert caducado durante la migración). Úsalo solo contra el sitio
 *               antiguo que controlas, nunca contra terceros.
 *   --json   Vuelca el detalle (status por URL) como JSON en vez del resumen.
 *
 * Rastrea SOLO el mismo host, siguiendo <a href>. Siembra además desde los
 * sitemaps típicos de WordPress. Salida: lista ordenada y única de URLs 200
 * (páginas HTML), lista para pasar a validate-redirects.mjs o verify-migration.mjs.
 *
 * Zero-dep (fetch nativo de Node ≥18). No modifica el sitio: solo GET.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, extname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const getFlag = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const BASE = getFlag('--base', 'https://gesdiweb.es').replace(/\/$/, '');
const OUT = resolve(__dirname, '..', '..', getFlag('--out', 'seo/urls-old.txt'));
const MAX = Number(getFlag('--max', '2000'));
const DELAY = Number(getFlag('--delay', '150'));
const AS_JSON = argv.includes('--json');
const CONCURRENCY = 4;

// La WordPress antigua puede tener el certificado caducado durante la migración.
if (argv.includes('--insecure')) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Host sin `www.`: la WP puede canonicalizar a www (o al revés) y queremos
// tratar ambos como el mismo sitio al seguir enlaces.
const BARE_HOST = new URL(BASE).host.replace(/^www\./, '');

const ASSET_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.ico',
  '.css', '.js', '.pdf', '.zip', '.mp4', '.webm', '.woff', '.woff2', '.ttf',
]); // prettier-ignore

// Rutas de WP que no queremos rastrear ni inventariar como contenido.
const SKIP_RE =
  /\/(wp-admin|wp-login|wp-json|xmlrpc|wp-content|feed|comments\/feed)|\?replytocom=/i;

function normalize(u, base = BASE) {
  try {
    const url = new URL(u, base);
    if (url.host.replace(/^www\./, '') !== BARE_HOST) return null;
    if (!/^https?:$/.test(url.protocol)) return null;
    url.hash = '';
    // Normaliza barra final (salvo raíz) para deduplicar.
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return null;
  }
}

function looksLikeAsset(u) {
  const p = new URL(u).pathname;
  return ASSET_EXT.has(extname(p));
}

function extractLinks(html, pageUrl) {
  const out = new Set();
  for (const m of html.matchAll(/<a\s[^>]*href=["']([^"'#>]+)["']/gi)) {
    const n = normalize(m[1], pageUrl);
    if (n) out.add(n);
  }
  return out;
}

async function fetchSitemapSeeds() {
  const seeds = new Set();
  const candidates = ['/sitemap_index.xml', '/sitemap.xml', '/wp-sitemap.xml'];
  for (const path of candidates) {
    try {
      const res = await fetch(BASE + path, { redirect: 'follow' });
      if (!res.ok) continue;
      const xml = await res.text();
      for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
        // Puede apuntar a sub-sitemaps .xml o a URLs de página.
        const loc = m[1].trim();
        if (loc.endsWith('.xml')) {
          try {
            const sub = await fetch(loc, { redirect: 'follow' });
            if (sub.ok) {
              const subXml = await sub.text();
              for (const mm of subXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
                const n = normalize(mm[1].trim());
                if (n && !looksLikeAsset(n) && !SKIP_RE.test(n)) seeds.add(n);
              }
            }
          } catch {
            /* ignora sub-sitemap ilegible */
          }
        } else {
          const n = normalize(loc);
          if (n && !looksLikeAsset(n) && !SKIP_RE.test(n)) seeds.add(n);
        }
      }
    } catch {
      /* ese candidato de sitemap no existe */
    }
  }
  return seeds;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.error(`Rastreando ${BASE} (host ~${BARE_HOST}, máx ${MAX} páginas)…`);

  const queue = [normalize(BASE)];
  const seen = new Set(queue);
  const results = new Map(); // url -> status
  const errors = [];

  const seeds = await fetchSitemapSeeds();
  for (const s of seeds) {
    if (!seen.has(s)) {
      seen.add(s);
      queue.push(s);
    }
  }
  console.error(`  Semillas desde sitemap: ${seeds.size}`);

  let visited = 0;
  while (queue.length && visited < MAX) {
    const batch = queue.splice(0, CONCURRENCY);
    await Promise.all(
      batch.map(async (url) => {
        visited++;
        try {
          const res = await fetch(url, {
            redirect: 'follow',
            headers: { 'user-agent': 'gesdiweb-migration-crawler' },
          });
          results.set(url, res.status);
          const ctype = res.headers.get('content-type') || '';
          if (res.ok && ctype.includes('text/html')) {
            const html = await res.text();
            for (const link of extractLinks(html, url)) {
              if (seen.has(link) || looksLikeAsset(link) || SKIP_RE.test(link)) continue;
              seen.add(link);
              queue.push(link);
            }
          }
        } catch (err) {
          errors.push({ url, error: String(err.message || err) });
        }
      }),
    );
    if (visited % 50 === 0) console.error(`  …${visited} visitadas, ${queue.length} en cola`);
    await sleep(DELAY);
  }

  const ok = [...results.entries()].filter(([, s]) => s === 200).map(([u]) => u).sort(); // prettier-ignore
  const nonOk = [...results.entries()].filter(([, s]) => s !== 200).sort();

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, ok.join('\n') + '\n', 'utf8');

  if (AS_JSON) {
    console.log(JSON.stringify({ ok, nonOk, errors, visited }, null, 2));
    return;
  }

  console.error(`\nResumen del crawl`);
  console.error(`─────────────────`);
  console.error(
    `  Páginas visitadas: ${visited}${queue.length ? ` (cortado; quedaban ${queue.length} en cola — sube --max)` : ''}`,
  );
  console.error(`  URLs 200 (HTML) guardadas en ${OUT}: ${ok.length}`);
  if (nonOk.length) {
    console.error(`  URLs con status ≠200 encontradas durante el crawl: ${nonOk.length}`);
    for (const [u, s] of nonOk.slice(0, 20)) console.error(`    ${s}  ${u}`);
    if (nonOk.length > 20) console.error(`    …y ${nonOk.length - 20} más`);
  }
  if (errors.length) console.error(`  Errores de red: ${errors.length}`);
}

main().catch((e) => {
  console.error('Fallo del crawler:', e);
  process.exit(1);
});
