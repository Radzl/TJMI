/**
 * Hoja de contactos de candidatos para los huecos de foto.
 *
 * Busca en un banco de imágenes libre, saca los identificadores de la página
 * de resultados y monta una rejilla de miniaturas numeradas en un PNG, para
 * poder **mirar** las fotos antes de elegir ninguna. Elegir por el título del
 * resultado, sin verlas, es como se acaba publicando una foto de un avión en
 * un artículo sobre palés.
 *
 * Uso:
 *   node scripts/fotos/contactos.mjs pexels   "warehouse pallet" salida.png [n]
 *   node scripts/fotos/contactos.mjs unsplash "truck logistics" salida.png [n]
 *
 * Deja al lado un `.txt` con los identificadores en el mismo orden que la
 * rejilla, para poder pedirlos después por número.
 *
 * ## Por qué cada banco se lee de una manera
 *
 * - **Pexels** sirve la página de resultados ya montada, así que basta con
 *   `curl`. Con el `fetch` de Node **no**: la misma dirección devuelve una
 *   página vacía aunque se le ponga el mismo `User-Agent`. Comprobado con las
 *   dos a la vez: `curl` 36 identificadores, `fetch` ninguno.
 * - **Unsplash** devuelve **401** a `curl`, así que hay que abrir su búsqueda
 *   en un navegador de verdad y leer las imágenes del DOM.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const banco = process.argv[2];
const consulta = process.argv[3];
const salida = process.argv[4] ?? 'contactos.png';
const limite = Number(process.argv[5] ?? 16);

if (!['pexels', 'unsplash'].includes(banco) || !consulta) {
  console.log('  uso: contactos.mjs pexels|unsplash "consulta" salida.png [n]');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

/** Devuelve las direcciones de miniatura de cada candidato. */
async function buscar() {
  if (banco === 'pexels') {
    const html = execFileSync(
      'curl',
      [
        '-sL',
        '--max-time',
        '25',
        '-A',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        `https://www.pexels.com/search/${encodeURIComponent(consulta)}/`,
      ],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    );

    return [
      ...new Set([...html.matchAll(/pexels-photo-(\d+)/g)].map((m) => m[1])),
    ]
      .slice(0, limite)
      .map((id) => ({
        id,
        mini: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=420&h=280&fit=crop`,
      }));
  }

  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto(
    `https://unsplash.com/s/photos/${encodeURIComponent(consulta).replace(/%20/g, '-')}`,
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForTimeout(3500);
  // Un par de empujones para que cargue más de la primera fila.
  for (let i = 0; i < 3; i += 1) {
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(900);
  }

  const urls = await page.evaluate(() =>
    [...document.querySelectorAll('img')]
      .map((img) => img.currentSrc || img.src)
      .filter((u) => u.includes('images.unsplash.com/photo-')),
  );
  await page.close();

  const ids = [
    ...new Set(urls.map((u) => u.match(/photo-[0-9a-f-]+/)?.[0]).filter(Boolean)),
  ].slice(0, limite);

  return ids.map((id) => ({
    id,
    mini: `https://images.unsplash.com/${id}?w=420&h=280&fit=crop&q=70&fm=jpg`,
  }));
}

const candidatos = await buscar();

if (!candidatos.length) {
  console.log('  sin resultados para: ' + consulta);
  await browser.close();
  process.exit(1);
}

const celdas = candidatos
  .map(
    (c, i) => `
      <figure>
        <img src="${c.mini}" />
        <figcaption>${i + 1} · ${c.id}</figcaption>
      </figure>`,
  )
  .join('');

const pagina = `<!doctype html><meta charset="utf-8">
<style>
  body { margin:0; background:#222; font:12px/1.3 system-ui; color:#fff }
  .rejilla { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:8px }
  figure { margin:0 }
  img { width:100%; aspect-ratio:3/2; object-fit:cover; display:block; background:#444 }
  figcaption { padding:3px 2px; font-variant-numeric:tabular-nums }
</style>
<div class="rejilla">${celdas}</div>`;

const hoja = await browser.newPage({
  viewport: { width: 1200, height: 900 },
  deviceScaleFactor: 1,
});
await hoja.setContent(pagina);
await hoja.waitForLoadState('networkidle').catch(() => {});
await hoja.waitForTimeout(2500);
await hoja.screenshot({ path: salida, fullPage: true });
await browser.close();

fs.writeFileSync(
  salida.replace(/\.png$/, '.txt'),
  candidatos.map((c) => c.id).join('\n'),
);
console.log(`  ${candidatos.length} candidatos · ${salida}`);
