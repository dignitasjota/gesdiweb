#!/usr/bin/env node
/**
 * Verificación post-switch de la Fase 8: recorre las URLs antiguas y comprueba
 * que TODAS resuelven a 200 (directo o vía 301/302), sin 404 ni 5xx.
 *
 * USO
 *   node scripts/verify-migration.mjs <urls.txt> [--base <url>] [--insecure]
 *                                     [--delay <ms>] [--json]
 *
 *   <urls.txt>  Lista de URLs antiguas, una por línea (p. ej. la salida de
 *               crawl-old-site.mjs → seo/urls-old.txt). Admite URLs absolutas.
 *   --base      Reescribe el host de cada URL para probar ANTES del switch
 *               contra el QA (p. ej. --base https://new.gesdiweb.es). Sin este
 *               flag se usa la URL tal cual (para verificar tras el switch).
 *   --insecure  Ignora errores de certificado TLS (útil si el QA/old aún no
 *               tiene cert válido).
 *   --delay     Espera entre lotes en ms (por defecto 120).
 *   --json      Vuelca el detalle como JSON.
 *
 * Clasifica cada URL:
 *   ✓ 200 directo · ✓ 301/302 → 200 · ✗ 404 · ✗ 5xx · ✗ cadena rota / error.
 *
 * Sale con código 1 si hay cualquier 404, 5xx o error → sirve de gate del
 * switch DNS. Solo hace GET; no modifica nada.
 */

import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const getFlag = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const listFile = argv.find((a) => !a.startsWith('--'));
const BASE = getFlag('--base', '');
const DELAY = Number(getFlag('--delay', '120'));
const AS_JSON = argv.includes('--json');
const CONCURRENCY = 4;

if (argv.includes('--insecure')) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

if (!listFile) {
  console.error(
    'Falta el fichero de URLs.\n  Uso: node scripts/verify-migration.mjs <urls.txt> [--base <url>] [--insecure]',
  );
  process.exit(2);
}

// Reescribe el host/origen de una URL contra --base (para probar en QA).
function withBase(url) {
  if (!BASE) return url;
  try {
    const u = new URL(url);
    const b = new URL(BASE);
    u.protocol = b.protocol;
    u.host = b.host;
    return u.toString();
  } catch {
    return url;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(originalUrl) {
  const target = withBase(originalUrl);
  try {
    // redirect: 'manual' para ver el primer salto; luego seguimos a mano hasta
    // el destino final, contando saltos y detectando bucles.
    let current = target;
    let hops = 0;
    let firstStatus = null;
    while (hops < 10) {
      const res = await fetch(current, {
        redirect: 'manual',
        headers: { 'user-agent': 'gesdiweb-migration-verifier' },
      });
      if (firstStatus === null) firstStatus = res.status;
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc)
          return {
            url: originalUrl,
            ok: false,
            firstStatus,
            final: res.status,
            note: 'redirección sin Location',
          };
        current = new URL(loc, current).toString();
        hops++;
        continue;
      }
      const ok = res.status === 200;
      return {
        url: originalUrl,
        ok,
        firstStatus,
        final: res.status,
        hops,
        redirectedTo: hops > 0 ? current : undefined,
      };
    }
    return {
      url: originalUrl,
      ok: false,
      firstStatus,
      final: 'loop',
      note: 'demasiados saltos (¿bucle?)',
    };
  } catch (err) {
    return {
      url: originalUrl,
      ok: false,
      firstStatus: null,
      final: 'error',
      note: String(err.message || err),
    };
  }
}

async function main() {
  const urls = readFileSync(listFile, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && /^https?:\/\//i.test(l));

  if (!urls.length) {
    console.error('El fichero no contiene URLs http(s).');
    process.exit(2);
  }
  console.error(`Verificando ${urls.length} URLs${BASE ? ` contra ${BASE}` : ''}…`);

  const results = [];
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    results.push(...(await Promise.all(batch.map(check))));
    await sleep(DELAY);
  }

  const direct = results.filter((r) => r.ok && r.hops === 0);
  const redirected = results.filter((r) => r.ok && r.hops > 0);
  const notFound = results.filter((r) => !r.ok && r.final === 404);
  const serverErr = results.filter((r) => !r.ok && typeof r.final === 'number' && r.final >= 500);
  const other = results.filter(
    (r) => !r.ok && r.final !== 404 && !(typeof r.final === 'number' && r.final >= 500),
  );

  if (AS_JSON) {
    console.log(
      JSON.stringify(
        { direct: direct.length, redirected: redirected.length, notFound, serverErr, other },
        null,
        2,
      ),
    );
  } else {
    const h = (s) => `\n${s}\n${'─'.repeat(s.length)}`;
    console.log(h('Verificación post-switch'));
    console.log(`  ✓ 200 directo:        ${direct.length}`);
    console.log(`  ✓ 301/302 → 200:      ${redirected.length}`);
    console.log(`  ✗ 404 (no existe):    ${notFound.length}`);
    console.log(`  ✗ 5xx (error server): ${serverErr.length}`);
    console.log(`  ✗ otros/errores:      ${other.length}`);

    const dump = (title, arr) => {
      if (!arr.length) return;
      console.log(h(title));
      for (const r of arr) console.log(`  ${r.final}  ${r.url}${r.note ? `  (${r.note})` : ''}`);
    };
    dump(`✗ CRÍTICO · 404 (${notFound.length})`, notFound);
    dump(`✗ CRÍTICO · 5xx (${serverErr.length})`, serverErr);
    dump(`✗ Otros/errores (${other.length})`, other);

    if (!notFound.length && !serverErr.length && !other.length) {
      console.log(
        '\n✓ Todas las URLs resuelven a 200 (directo o vía redirección). Switch verificado.',
      );
    }
  }

  process.exit(notFound.length || serverErr.length || other.length ? 1 : 0);
}

main().catch((e) => {
  console.error('Fallo del verificador:', e);
  process.exit(1);
});
