#!/usr/bin/env node
/**
 * Valida el mapa de redirecciones 301 (docs/redirecciones-301.md) contra una
 * exportación de Google Search Console (informe "Páginas", CSV) y contra el
 * inventario real de URLs del sitio nuevo.
 *
 * USO
 *   node scripts/validate-redirects.mjs [export-gsc.csv] [--strict] [--json]
 *
 *   - Sin CSV: solo valida que TODOS los destinos del mapa existan en el sitio
 *     nuevo (útil ya, antes de tener el export de GSC).
 *   - Con CSV: además cruza las URLs que rankean en GSC contra el mapa.
 *
 * QUÉ DETECTA (antes del switch DNS de la Fase 8)
 *   1. [CRÍTICO] URLs que rankean en GSC sin redirección ni equivalente en el
 *      sitio nuevo → darían 404 y perderían posicionamiento.
 *   2. [CRÍTICO] Redirecciones cuyo destino NO existe en el sitio nuevo → 301
 *      hacia un 404.
 *   3. [aviso]   Fuentes duplicadas con destinos distintos en el mapa.
 *   4. [info]    Redirecciones del mapa que no aparecen en GSC (normal: enlaces
 *      internos que nunca rankearon).
 *   5. [info]    URLs de GSC que son adjuntos (wp-content, imágenes, feeds).
 *
 * No modifica nada. Sale con código 1 si hay problemas críticos.
 *
 * El export de GSC se obtiene en: Search Console → Rendimiento → pestaña
 * "Páginas" → Exportar → CSV (o el ZIP, y se usa el fichero de páginas).
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, extname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(__dirname, '..'); // web/
const ROOT = resolve(WEB, '..'); // raíz del repo
const MAP_FILE = join(ROOT, 'docs', 'redirecciones-301.md');

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const csvPath = args.find((a) => !a.startsWith('--'));
const asJson = flags.has('--json');

// Extensiones que NO son páginas HTML (adjuntos: imágenes, docs, feeds...).
const ASSET_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.avif',
  '.svg',
  '.ico',
  '.pdf',
  '.zip',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.mp4',
  '.webm',
  '.css',
  '.js',
]);

// ── Normalización de rutas ────────────────────────────────────────────────
// Compara por PATH (ignora protocolo/host: así www y no-www son equivalentes),
// sin barra final, minúsculas y sin query/fragmento.
function normalizePath(input) {
  let p = String(input).trim();
  try {
    p = p.startsWith('http') ? new URL(p).pathname : new URL(p, 'https://x').pathname;
  } catch {
    /* se usa tal cual */
  }
  p = p.split('#')[0].split('?')[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    /* deja el crudo si el % está mal formado */
  }
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p.toLowerCase();
}

function isAsset(path) {
  if (path.includes('/wp-content/') || path.includes('/wp-json') || path.includes('/feed')) {
    return true;
  }
  if (path.endsWith('.xml')) return true; // sitemaps, feeds
  return ASSET_EXT.has(extname(path));
}

// ── 1. Parsear el mapa de redirecciones desde el markdown ─────────────────
function parseRedirectMap() {
  const text = readFileSync(MAP_FILE, 'utf8');
  const lines = text.split(/\r?\n/);
  const entries = []; // { old, new, line }
  for (const line of lines) {
    // La sección "Pendientes" NO son redirecciones: paramos ahí.
    if (/^##\s+Pendientes/i.test(line)) break;
    if (!line.trimStart().startsWith('|')) continue;
    const tokens = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    if (tokens.length < 2) continue;
    const oldUrl = tokens[0];
    const newUrl = tokens[1];
    if (!/^https?:\/\//i.test(oldUrl)) continue; // salta cabeceras/separadores
    if (!newUrl.startsWith('/')) continue;
    entries.push({ old: normalizePath(oldUrl), new: normalizePath(newUrl), raw: oldUrl });
  }
  return entries;
}

// ── 2. Inventario de URLs válidas del sitio nuevo ─────────────────────────
function collectValidUrls() {
  const set = new Set(['/']);

  // Páginas estáticas: src/pages/*.astro y src/pages/*/index.astro
  const pagesDir = join(WEB, 'src', 'pages');
  for (const entry of readdirSync(pagesDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.astro')) {
      const base = entry.name.replace(/\.astro$/, '');
      if (['404', 'styleguide', 'index'].includes(base)) continue;
      if (base.startsWith('[')) continue; // ruta dinámica: se cubre con el contenido
      set.add('/' + base.toLowerCase());
    } else if (entry.isDirectory() && entry.name !== 'api') {
      if (existsSync(join(pagesDir, entry.name, 'index.astro'))) {
        set.add('/' + entry.name.toLowerCase());
      }
    }
  }

  // Colecciones de contenido → rutas dinámicas
  const collections = [
    { dir: 'blog', prefix: '/blog', ext: '.md' },
    { dir: 'services', prefix: '/servicios', ext: '.mdx' },
    { dir: 'portfolio', prefix: '/portfolio', ext: '.mdx' },
  ];
  for (const { dir, prefix, ext } of collections) {
    const full = join(WEB, 'src', 'content', dir);
    if (!existsSync(full)) continue;
    for (const f of readdirSync(full)) {
      if (f.endsWith(ext)) set.add(normalizePath(prefix + '/' + f.slice(0, -ext.length)));
    }
  }
  return set;
}

// ── 3. Parsear el export CSV de Search Console ────────────────────────────
function parseCsvLine(line, delim) {
  const fields = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) {
      fields.push(cur);
      cur = '';
    } else cur += c;
  }
  fields.push(cur);
  return fields;
}

function parseGsc(path) {
  const text = readFileSync(path, 'utf8').replace(/^﻿/, ''); // quita BOM
  const rows = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (rows.length < 2) throw new Error('El CSV no tiene filas de datos.');
  const delim =
    (rows[0].match(/\t/g)?.length ?? 0) > (rows[0].match(/,/g)?.length ?? 0) ? '\t' : ',';

  const header = parseCsvLine(rows[0], delim);
  const dataRows = rows.slice(1).map((r) => parseCsvLine(r, delim));

  // Detecta la columna de URL (la que contiene valores http en la 1ª fila).
  let urlIdx = dataRows[0].findIndex((v) => /^https?:\/\//i.test(v.trim()));
  if (urlIdx === -1) {
    // Fallback: por nombre de cabecera.
    urlIdx = header.findIndex((h) => /p[áa]gina|page|url/i.test(h));
  }
  if (urlIdx === -1) {
    throw new Error(
      'No se encontró una columna de URL en el CSV. ¿Es el informe "Páginas" de Search Console?',
    );
  }
  const clicksIdx = header.findIndex((h) => /clic|click/i.test(h));
  const imprIdx = header.findIndex((h) => /impres/i.test(h));

  const num = (v) => {
    const n = Number(
      String(v ?? '')
        .replace(/[.\s]/g, '')
        .replace(',', '.'),
    );
    return Number.isFinite(n) ? n : 0;
  };

  const out = [];
  for (const cols of dataRows) {
    const url = (cols[urlIdx] ?? '').trim();
    if (!url) continue;
    out.push({
      url,
      clicks: clicksIdx >= 0 ? num(cols[clicksIdx]) : 0,
      impressions: imprIdx >= 0 ? num(cols[imprIdx]) : 0,
    });
  }
  return out;
}

// ── Ejecución ─────────────────────────────────────────────────────────────
function main() {
  if (!existsSync(MAP_FILE)) {
    console.error(`No existe el mapa: ${MAP_FILE}`);
    process.exit(2);
  }

  const map = parseRedirectMap();
  const validUrls = collectValidUrls();
  const mapByOld = new Map();
  const duplicates = [];
  for (const e of map) {
    if (mapByOld.has(e.old) && mapByOld.get(e.old) !== e.new) {
      duplicates.push({ old: e.old, a: mapByOld.get(e.old), b: e.new });
    }
    mapByOld.set(e.old, e.new);
  }

  // Check independiente del GSC: todos los destinos del mapa deben existir.
  const brokenDest = map.filter((e) => !validUrls.has(e.new));

  const report = {
    mapEntries: map.length,
    validUrls: validUrls.size,
    duplicates,
    brokenDest,
  };

  let gsc = null;
  if (csvPath) {
    if (!existsSync(csvPath)) {
      console.error(`No existe el CSV: ${csvPath}`);
      process.exit(2);
    }
    gsc = parseGsc(csvPath);

    const missing = []; // rankea y no hay redirección ni equivalente
    const redirectToBroken = []; // rankea, hay redirección, pero destino 404
    const assets = [];
    let okIdentity = 0;
    let okRedirected = 0;
    const usedSources = new Set();

    for (const row of gsc) {
      const p = normalizePath(row.url);
      if (isAsset(p)) {
        assets.push(row);
        continue;
      }
      if (validUrls.has(p)) {
        okIdentity++; // misma ruta ya existe en el sitio nuevo
        continue;
      }
      if (mapByOld.has(p)) {
        usedSources.add(p);
        const dest = mapByOld.get(p);
        if (validUrls.has(dest)) okRedirected++;
        else redirectToBroken.push({ ...row, dest });
        continue;
      }
      missing.push(row);
    }

    const byTraffic = (a, b) => b.clicks - a.clicks || b.impressions - a.impressions;
    missing.sort(byTraffic);
    redirectToBroken.sort(byTraffic);

    const orphans = map.filter((e) => !usedSources.has(e.old));

    Object.assign(report, {
      gscUrls: gsc.length,
      okIdentity,
      okRedirected,
      missing,
      redirectToBroken,
      assets,
      orphanRedirects: orphans.length,
    });
  }

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, Boolean(csvPath));
  }

  // Código de salida: 1 si hay algo crítico.
  const critical =
    brokenDest.length > 0 ||
    (report.missing?.length ?? 0) > 0 ||
    (report.redirectToBroken?.length ?? 0) > 0;
  process.exit(critical ? 1 : 0);
}

function printReport(r, hasGsc) {
  const h = (s) => `\n${s}\n${'─'.repeat(s.length)}`;
  console.log(h('Validación del mapa de redirecciones 301'));
  console.log(`  Redirecciones en el mapa: ${r.mapEntries}`);
  console.log(`  URLs válidas en el sitio nuevo: ${r.validUrls}`);

  if (r.duplicates.length) {
    console.log(h(`⚠  Fuentes duplicadas con destino distinto (${r.duplicates.length})`));
    for (const d of r.duplicates) console.log(`  ${d.old} → ${d.a}  vs  ${d.b}`);
  }

  if (r.brokenDest.length) {
    console.log(h(`✗  CRÍTICO · Redirecciones a un destino inexistente (${r.brokenDest.length})`));
    console.log('   (el 301 llevaría a un 404 en el sitio nuevo)');
    for (const e of r.brokenDest) console.log(`  ${e.raw} → ${e.new}   ✗ el destino no existe`);
  } else {
    console.log('\n✓ Todos los destinos del mapa existen en el sitio nuevo.');
  }

  if (!hasGsc) {
    console.log(
      '\nℹ  Sin export de GSC: solo se validaron los destinos. Para el cruce completo:\n' +
        '   node scripts/validate-redirects.mjs <export-gsc.csv>',
    );
    return;
  }

  console.log(h('Cruce con Search Console'));
  console.log(`  URLs en el export: ${r.gscUrls}`);
  console.log(`  ✓ Ya existen igual en el sitio nuevo (sin redirección): ${r.okIdentity}`);
  console.log(`  ✓ Cubiertas por una redirección válida: ${r.okRedirected}`);
  console.log(`  ↷ Adjuntos/feeds (no páginas): ${r.assets.length}`);
  console.log(`  ℹ Redirecciones del mapa no vistas en GSC: ${r.orphanRedirects}`);

  if (r.redirectToBroken.length) {
    console.log(
      h(`✗  CRÍTICO · Rankean y su redirección apunta a un 404 (${r.redirectToBroken.length})`),
    );
    for (const e of r.redirectToBroken) {
      console.log(`  ${e.url}  → ${e.dest}  [clics: ${e.clicks}, impr: ${e.impressions}]`);
    }
  }

  if (r.missing.length) {
    console.log(
      h(`✗  CRÍTICO · Rankean y NO tienen redirección ni equivalente (${r.missing.length})`),
    );
    console.log('   (darían 404 tras el switch DNS; ordenadas por tráfico)');
    for (const e of r.missing) {
      console.log(`  ${e.url}   [clics: ${e.clicks}, impr: ${e.impressions}]`);
    }
    console.log(
      '\n   → Decide para cada una: crear la redirección 301 en docs/redirecciones-301.md,\n' +
        '     o descartarla si ya no aplica (p. ej. /tag/, /author/, paginación).',
    );
  } else {
    console.log('\n✓ Ninguna URL con tráfico se quedaría sin redirección.');
  }
}

main();
