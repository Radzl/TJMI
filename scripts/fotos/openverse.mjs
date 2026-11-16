/**
 * Hoja de contactos a partir de Openverse, el buscador de imágenes con
 * licencia libre (Wikimedia Commons, rawpixel, StockSnap, Flickr…).
 *
 * **Por qué existe, teniendo ya `contactos.mjs`.** Aquel leía la página de
 * resultados de Pexels con `curl`, y Pexels puso delante un control
 * anti-robots: hoy devuelve un 403 con un «Just a moment…». Eso no se
 * esquiva. Openverse tiene una API pública pensada justo para esto, sin clave
 * y con la licencia de cada imagen en la respuesta.
 *
 * Tres filtros que no son opcionales:
 *
 *  - **Licencia.** Solo `cc0`, `pdm`, `by` y `by-sa`. Fuera las `nc` (esto es
 *    la web de una empresa: uso comercial) y las `nd` (se recortan y se les
 *    pasa el revelado común de `.photo`, que es una obra derivada).
 *  - **Tamaño.** Los huecos piden 1.150 px y Flickr sirve por aquí a 1.024,
 *    así que por defecto se busca en las fuentes que dan el original.
 *  - **Proporción.** Apaisadas: una vertical en un hueco apaisado pierde medio
 *    encuadre, que es el fallo que esta web ya tuvo con tres fotos.
 *
 * Deja al lado un `.json` con autor, licencia y enlaces de cada candidata, en
 * el mismo orden que la rejilla: es lo que hace falta después para
 * acreditarlas en el aviso legal.
 *
 * ## Las miniaturas se bajan de una en una, y no es lentitud gratuita
 *
 * - El servicio de miniaturas de la propia API **falla con las de Wikimedia**
 *   (devuelve un 424), así que para esas se pide la miniatura a Wikimedia.
 * - Wikimedia **corta en seco las ráfagas**: veinticuatro imágenes pedidas a la
 *   vez desde una página dan 429 en la mitad. Y solo sirve anchos de una
 *   lista fija (500, 960, 1280, 1920…): pedir 1600 es un 400.
 *
 * Por eso se descargan a disco con una pausa entre una y otra y la hoja se
 * monta con los archivos locales.
 *
 * Uso:
 *   node scripts/fotos/openverse.mjs "warehouse pallets" salida.png [n] [fuentes]
 *
 * `fuentes` es una lista separada por comas; por defecto
 * `wikimedia,rawpixel,stocksnap,wordpress`.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const consulta = process.argv[2];
const salida = process.argv[3] ?? 'openverse.png';
const limite = Number(process.argv[4] ?? 24);
const fuentes = process.argv[5] ?? 'wikimedia,rawpixel,stocksnap,wordpress';

if (!consulta) {
  console.log('  uso: openverse.mjs "consulta" salida.png [n] [fuentes]');
  process.exit(1);
}

const ANCHO_MINIMO = 1500;
const PROPORCION_MINIMA = 1.3;

// Un nombre de cliente genérico: las dos APIs lo piden para identificar el
// tráfico, y no hay por qué darles datos del proyecto ni de nadie.
const CABECERAS = { 'User-Agent': 'fotos-web/1.0 (uso editorial; cliente generico)' };

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

/** La miniatura de Wikimedia sale de la dirección del original. */
function miniaturaWikimedia(url, ancho) {
  const m = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(.\/..)\/([^/]+)$/);
  if (!m) return null;
  return `${m[1]}/thumb/${m[2]}/${m[3]}/${ancho}px-${m[3]}`;
}

async function pagina(n) {
  const url =
    'https://api.openverse.org/v1/images/?' +
    new URLSearchParams({
      q: consulta,
      license: 'cc0,pdm,by,by-sa',
      source: fuentes,
      page_size: '20',
      page: String(n),
    });

  // La API devuelve un 504 de vez en cuando; con un reintento suele bastar.
  for (let intento = 0; intento < 3; intento += 1) {
    try {
      const res = await fetch(url, { headers: CABECERAS });
      if (res.ok) return await res.json();
      if (res.status === 429) {
        console.log('  la API pide ir más despacio (429); paro aquí');
        return { results: [] };
      }
    } catch {
      // se reintenta
    }
    await pausa(2500);
  }
  return { results: [] };
}

const candidatos = [];
for (let n = 1; n <= 5 && candidatos.length < limite; n += 1) {
  const datos = await pagina(n);
  for (const r of datos.results ?? []) {
    if (!r.width || !r.height) continue;
    if (r.width < ANCHO_MINIMO) continue;
    if (r.width / r.height < PROPORCION_MINIMA) continue;
    if (!/\.jpe?g$/i.test(r.url.split('?')[0]) && r.source === 'wikimedia') continue;
    candidatos.push({
      id: r.id,
      titulo: r.title ?? '',
      autor: r.creator ?? '',
      autorUrl: r.creator_url ?? '',
      licencia: `${r.license}${r.license_version ? ' ' + r.license_version : ''}`,
      licenciaUrl: r.license_url ?? '',
      fuente: r.source,
      ficha: r.foreign_landing_url,
      url: r.url,
      miniatura: r.thumbnail,
      ancho: r.width,
      alto: r.height,
    });
    if (candidatos.length >= limite) break;
  }
  if (!datos.page_count || n >= datos.page_count) break;
  await pausa(1200);
}

if (!candidatos.length) {
  console.log('  sin resultados que den la talla para: ' + consulta);
  process.exit(1);
}

// ── Miniaturas a disco, de una en una ─────────────────────────────────────
const carpeta = salida.replace(/\.png$/, '-mini');
fs.mkdirSync(carpeta, { recursive: true });

for (const [i, c] of candidatos.entries()) {
  const destino = path.join(carpeta, `${i + 1}.jpg`);
  c.local = null;
  const origen =
    c.fuente === 'wikimedia' ? miniaturaWikimedia(c.url, 500) : c.miniatura;
  if (!origen) continue;

  for (let intento = 0; intento < 3; intento += 1) {
    try {
      const res = await fetch(origen, { headers: CABECERAS });
      if (res.ok) {
        fs.writeFileSync(destino, Buffer.from(await res.arrayBuffer()));
        c.local = path.resolve(destino);
        break;
      }
      // Un 429 es «más despacio»: se espera bastante más antes de insistir.
      await pausa(res.status === 429 ? 9000 : 1500);
    } catch {
      await pausa(1500);
    }
  }
  await pausa(c.fuente === 'wikimedia' ? 1100 : 300);
}

const celdas = candidatos
  .map(
    (c, i) => `
      <figure>
        ${c.local ? `<img src="file:///${c.local.replace(/\\/g, '/')}" />` : '<div class="hueco">sin miniatura</div>'}
        <figcaption>${i + 1} · ${c.fuente} · ${c.licencia} · ${c.ancho}×${c.alto}</figcaption>
      </figure>`,
  )
  .join('');

const html = `<!doctype html><meta charset="utf-8">
<style>
  body { margin:0; background:#222; font:11px/1.3 system-ui; color:#fff }
  .rejilla { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:8px }
  figure { margin:0 }
  img, .hueco { width:100%; aspect-ratio:3/2; object-fit:cover; display:block; background:#444 }
  .hueco { display:grid; place-items:center; color:#999 }
  figcaption { padding:3px 2px; font-variant-numeric:tabular-nums }
</style>
<div class="rejilla">${celdas}</div>`;

// A disco y con `goto`: una página montada con `setContent` no tiene origen
// y el navegador le bloquea las direcciones `file://`.
const htmlPath = path.resolve(salida.replace(/\.png$/, '.html'));
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const hoja = await browser.newPage({
  viewport: { width: 1200, height: 900 },
  deviceScaleFactor: 1,
});
await hoja.goto('file:///' + htmlPath.replace(/\\/g, '/'));
await hoja.waitForTimeout(1200);
await hoja.screenshot({ path: salida, fullPage: true });
await browser.close();

fs.writeFileSync(salida.replace(/\.png$/, '.json'), JSON.stringify(candidatos, null, 1));
console.log(`  ${candidatos.length} candidatos · ${salida}`);
