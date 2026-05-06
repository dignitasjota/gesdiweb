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
function ogHtml({ collection, title, sub }) {
  const trimTitle = title.length > 90 ? title.slice(0, 87) + '…' : title;
  const labels = {
    blog: 'BLOG',
    portfolio: 'PORTFOLIO',
    services: 'SERVICIO',
  };
  const collectionLabel = labels[collection] || 'GESDIWEB';

  // Colores por colección para diferenciar visualmente
  const variants = {
    blog: {
      bg: '#ffffff',
      text: '#0a0a0a',
      accent: '#77c2da',
      asteriskColor: '#e9f4f8',
      markerColor: '#525252',
    },
    portfolio: {
      bg: '#0a0a0a',
      text: '#ffffff',
      accent: '#77c2da',
      asteriskColor: 'rgba(119,194,218,0.15)',
      markerColor: 'rgba(255,255,255,0.7)',
    },
    services: {
      bg: '#77c2da',
      text: '#ffffff',
      accent: 'rgba(255,255,255,0.4)',
      asteriskColor: 'rgba(255,255,255,0.18)',
      markerColor: 'rgba(255,255,255,0.85)',
    },
  };
  const v = variants[collection] || variants.blog;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px;overflow:hidden}
  body{background:${v.bg};color:${v.text};font-family:'Bricolage Grotesque',system-ui,sans-serif;position:relative}
  .border-top{position:absolute;top:0;left:0;right:0;height:10px;background:#77c2da;z-index:3}
  .grid{position:absolute;inset:0;padding:64px;display:flex;flex-direction:column;justify-content:space-between;z-index:2}
  .marker{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:18px;text-transform:uppercase;letter-spacing:0.2em;color:${v.markerColor};display:flex;align-items:center;gap:12px}
  .dot{width:9px;height:9px;border-radius:9999px;background:#77c2da}
  h1{font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:700;font-size:74px;line-height:1.02;letter-spacing:-0.03em;color:${v.text};max-width:18ch;margin-top:24px}
  h1 .accent{color:${v.accent}}
  .sub{margin-top:16px;font-size:24px;color:${v.markerColor};max-width:30ch}
  .footer{display:flex;justify-content:space-between;align-items:flex-end;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:16px;text-transform:uppercase;letter-spacing:0.18em;color:${v.markerColor}}
  .url-bold{color:${v.text}}
  .asterisk{position:absolute;right:-100px;bottom:-180px;color:${v.asteriskColor};font-size:760px;font-weight:700;line-height:1;transform:rotate(15deg);z-index:1;user-select:none}
</style>
</head>
<body>
  <div class="border-top"></div>
  <div class="asterisk">✳</div>
  <div class="grid">
    <div class="marker">
      <span class="dot"></span>
      <span>// ${collectionLabel}${sub ? ` · ${sub}` : ''}</span>
    </div>
    <h1>${trimTitle.replace(/\.$/, '')}<span class="accent">.</span></h1>
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
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

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
