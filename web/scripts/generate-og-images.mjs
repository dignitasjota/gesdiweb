/**
 * Genera OG images PNG por entry de cada colección.
 *
 * - blog/<slug>.md     → public/og/blog/<slug>.png
 * - portfolio/<slug>.mdx → public/og/portfolio/<slug>.png
 * - services/<slug>.mdx  → public/og/services/<slug>.png
 *
 * Lee el frontmatter (title, categories, year) de cada archivo.
 * Renderiza un HTML con Playwright headless 1200×630.
 *
 * Uso:
 *   node scripts/generate-og-images.mjs            # genera todos
 *   node scripts/generate-og-images.mjs --only=blog
 *   node scripts/generate-og-images.mjs --slug=hosting-java
 *   node scripts/generate-og-images.mjs --force    # sobrescribe existentes
 *
 * Por defecto NO regenera imágenes que ya existen (rápido + idempotente).
 */
import { chromium } from 'playwright';
import { readdir, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Rutas relativas al script (web/scripts/)
const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url));
const WEB_ROOT = join(SCRIPT_DIR, '..');
const CONTENT_DIR = join(WEB_ROOT, 'src/content');
const OG_OUT = join(WEB_ROOT, 'public/og');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

// ────────────────────────────────────────────────────────────
// Frontmatter parser ligero (sin dependencias)
// ────────────────────────────────────────────────────────────
function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = m[1];
  const get = (k) => {
    const r = fm.match(new RegExp(`^${k}:\\s*"?([^"\n]+?)"?\\s*$`, 'm'));
    return r ? r[1].trim() : null;
  };
  const getList = (k) => {
    const idx = fm.indexOf(`${k}:`);
    if (idx === -1) return [];
    const after = fm.slice(idx + k.length + 1);
    const items = [];
    for (const line of after.split('\n')) {
      const im = line.match(/^\s+-\s+"?(.+?)"?$/);
      if (im) items.push(im[1].replace(/^"|"$/g, ''));
      else if (line.trim() && !line.startsWith(' ')) break;
    }
    return items;
  };
  return {
    title: get('title'),
    year: get('year'),
    categories: getList('categories'),
    client: get('client'),
  };
}

// ────────────────────────────────────────────────────────────
// HTML del OG image (template responsive a tipo de colección)
// ────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Divide el título en `head` + `lastWord` para aplicarle Instrument Serif italic
// a la última palabra (patrón `.serif-em` del rediseño Claude Design).
function splitTitle(title) {
  const clean = title.replace(/[.\s]+$/, '');
  const parts = clean.split(/\s+/);
  if (parts.length <= 1) return { head: '', lastWord: clean };
  const lastWord = parts.pop();
  return { head: parts.join(' '), lastWord };
}

function titleSizing(len) {
  // Tamaño de fuente y max-width escalados por longitud (caracteres) del título.
  if (len <= 28) return { size: 104, maxCh: 14 };
  if (len <= 44) return { size: 88, maxCh: 16 };
  if (len <= 60) return { size: 72, maxCh: 18 };
  if (len <= 78) return { size: 60, maxCh: 22 };
  return { size: 52, maxCh: 26 };
}

function ogHtml({ collection, title, sub }) {
  const trimTitle = title.length > 110 ? title.slice(0, 107) + '…' : title;
  const { head, lastWord } = splitTitle(trimTitle);
  const sizing = titleSizing(trimTitle.length);
  const labels = {
    blog: 'BLOG',
    portfolio: 'PORTFOLIO',
    services: 'SERVICIO',
  };
  const collectionLabel = labels[collection] || 'GESDIWEB';

  // Paleta del rediseño "Claude Design" (off-white #fafaf8 + brand #76c2da)
  const variants = {
    blog: {
      bg: '#fafaf8',
      text: '#0a0a0a',
      accent: '#76c2da',
      asteriskColor: 'rgba(118,194,218,0.10)',
      markerColor: '#52525b',
      footerStrong: '#0a0a0a',
    },
    portfolio: {
      bg: '#0a0a0a',
      text: '#fafaf8',
      accent: '#76c2da',
      asteriskColor: 'rgba(118,194,218,0.14)',
      markerColor: 'rgba(250,250,248,0.65)',
      footerStrong: '#fafaf8',
    },
    services: {
      bg: '#76c2da',
      text: '#0a0a0a',
      accent: '#fafaf8',
      asteriskColor: 'rgba(250,250,248,0.22)',
      markerColor: 'rgba(10,10,10,0.65)',
      footerStrong: '#0a0a0a',
    },
  };
  const v = variants[collection] || variants.blog;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px;overflow:hidden}
  body{background:${v.bg};color:${v.text};font-family:'Space Grotesk','Helvetica Neue',system-ui,sans-serif;position:relative;font-feature-settings:'ss01','ss02'}
  .border-top{position:absolute;top:0;left:0;right:0;height:8px;background:#76c2da;z-index:3}
  .grid{position:absolute;inset:0;padding:72px;display:flex;flex-direction:column;justify-content:space-between;z-index:2}
  .marker{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:18px;text-transform:uppercase;letter-spacing:0.18em;color:${v.markerColor};display:flex;align-items:center;gap:14px;font-weight:500}
  .dot{width:10px;height:10px;border-radius:9999px;background:#76c2da;box-shadow:0 0 0 4px rgba(118,194,218,0.18)}
  h1{font-family:'Space Grotesk','Helvetica Neue',system-ui,sans-serif;font-weight:500;font-size:${sizing.size}px;line-height:1.00;letter-spacing:-0.035em;color:${v.text};max-width:${sizing.maxCh}ch;margin-top:8px}
  h1 em{font-family:'Instrument Serif','Times New Roman',Georgia,serif;font-style:italic;font-weight:400;color:${v.accent};letter-spacing:-0.02em}
  h1 .accent{color:${v.accent};font-family:'Instrument Serif','Times New Roman',Georgia,serif;font-style:italic;font-weight:400}
  .footer{display:flex;justify-content:space-between;align-items:flex-end;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:15px;text-transform:uppercase;letter-spacing:0.18em;color:${v.markerColor};font-weight:500}
  .url-bold{color:${v.footerStrong};font-weight:500}
  .asterisk{position:absolute;right:-120px;bottom:-220px;color:${v.asteriskColor};font-size:820px;font-weight:400;line-height:1;transform:rotate(12deg);z-index:1;user-select:none;font-family:'Space Grotesk',sans-serif}
</style>
</head>
<body>
  <div class="border-top"></div>
  <div class="asterisk">✳</div>
  <div class="grid">
    <div class="marker">
      <span class="dot"></span>
      <span>// ${escapeHtml(collectionLabel)}${sub ? ` · ${escapeHtml(sub)}` : ''}</span>
    </div>
    <h1>${head ? `${escapeHtml(head)} ` : ''}<em>${escapeHtml(lastWord)}</em><span class="accent">.</span></h1>
    <div class="footer">
      <span><span class="url-bold">gesdiweb</span>.es</span>
      <span>// diseño web · seo</span>
    </div>
  </div>
</body>
</html>`;
}

// ────────────────────────────────────────────────────────────
// Recolección de entries
// ────────────────────────────────────────────────────────────
async function collectEntries() {
  const items = [];
  const collections = [
    { name: 'blog', exts: ['.md', '.mdx'] },
    { name: 'portfolio', exts: ['.mdx', '.md'] },
    { name: 'services', exts: ['.mdx', '.md'] },
  ];

  for (const col of collections) {
    if (args.only && args.only !== col.name) continue;
    const dir = join(CONTENT_DIR, col.name);
    if (!existsSync(dir)) continue;
    const files = await readdir(dir);
    for (const file of files) {
      if (!col.exts.some((ext) => file.endsWith(ext))) continue;
      const slug = file.replace(/\.(md|mdx)$/, '');
      if (args.slug && args.slug !== slug) continue;
      const content = await readFile(join(dir, file), 'utf-8');
      const fm = parseFrontmatter(content);
      if (!fm?.title) continue;

      let sub = null;
      if (col.name === 'blog' && fm.categories.length) sub = fm.categories[0];
      else if (col.name === 'portfolio' && fm.year) sub = fm.year;

      items.push({ collection: col.name, slug, title: fm.title, sub });
    }
  }
  return items;
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────
const items = await collectEntries();
console.log(`${items.length} entries a procesar`);

if (items.length === 0) {
  console.log('Nada que generar.');
  process.exit(0);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

let generated = 0;
let skipped = 0;

for (const item of items) {
  const outDir = join(OG_OUT, item.collection);
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, `${item.slug}.png`);

  if (existsSync(outPath) && !args.force) {
    skipped += 1;
    continue;
  }

  try {
    const html = ogHtml(item);
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`✓ og/${item.collection}/${item.slug}.png`);
    generated += 1;
  } catch (e) {
    console.error(`✗ ${item.slug}: ${e.message}`);
  }
}

await browser.close();
console.log(`\n✓ Generados: ${generated} · Saltados (existentes): ${skipped}`);
console.log(`Para regenerar todos: node scripts/generate-og-images.mjs --force`);
