/**
 * Descarga los candidatos elegidos y los enseña **en el recorte de su hueco**.
 *
 * Esto segundo es la parte que importa y la que no se puede saltar: las
 * portadas del blog se recortan a **3:2 en el listado y a 21:9 en el
 * artículo**, la de `/faq` a **2,4:1** y la de `/contacto` a **cuadrado**. Una
 * foto que se ve perfecta en la hoja de contactos puede perder el sujeto
 * entero al recortarla a 21:9, y eso solo se ve mirándola recortada.
 *
 * Uso: node scripts/fotos/traer.mjs eleccion.json salida.png
 *
 * El JSON es una lista de `{ id, destino, ancho, ratios: [..] }`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';

const eleccion = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const salida = process.argv[3] ?? 'revision.png';

/** El ancho en píxeles de cada archivo, leído de su cabecera JPEG. */
function medirJpeg(ruta) {
  const b = fs.readFileSync(ruta);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marca = b[i + 1];
    // Los SOF que traen las medidas, saltando los que no las traen.
    if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) {
      return { alto: b.readUInt16BE(i + 5), ancho: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

const hechas = [];

for (const foto of eleccion) {
  const destino = path.join('public', foto.destino);
  fs.mkdirSync(path.dirname(destino), { recursive: true });

  const url = `https://images.pexels.com/photos/${foto.id}/pexels-photo-${foto.id}.jpeg?auto=compress&cs=tinysrgb&w=${foto.ancho}`;

  execFileSync('curl', ['-sL', '--max-time', '60', '-o', destino, url]);

  const medida = medirJpeg(destino);
  const kb = Math.round(fs.statSync(destino).size / 1024);
  hechas.push({ ...foto, ...medida, kb });

  console.log(
    `  ${String(foto.id).padEnd(10)} ${medida ? `${medida.ancho}×${medida.alto}` : '¿?'}`.padEnd(
      26,
    ) + `${String(kb).padStart(4)} KB  ${foto.destino}`,
  );
}

// ── La hoja de revisión: cada foto en todos los recortes de su hueco ──────
const filas = hechas
  .map(
    (f) => `
    <section>
      <h2>${f.destino} · ${f.ancho}×${f.alto} · ${f.kb} KB</h2>
      <div class="recortes">
        ${f.ratios
          .map(
            (r) => `
          <figure style="--r:${r}">
            <img src="file:///${path.resolve(path.join('public', f.destino)).replace(/\\/g, '/')}" />
            <figcaption>${r}</figcaption>
          </figure>`,
          )
          .join('')}
      </div>
    </section>`,
  )
  .join('');

const pagina = `<!doctype html><meta charset="utf-8">
<style>
  body { margin:0; background:#1b1b1b; font:12px/1.4 system-ui; color:#eee }
  section { padding:10px 12px; border-bottom:1px solid #333 }
  h2 { margin:0 0 6px; font-size:12px; font-weight:600; color:#9fd }
  .recortes { display:flex; gap:10px; align-items:flex-start }
  figure { margin:0; flex:1 }
  img { width:100%; aspect-ratio:var(--r); object-fit:cover; display:block; background:#333 }
  figcaption { padding-top:3px; color:#999 }
</style>
${filas}`;

// **La hoja se escribe a disco y se abre con `goto`, no con `setContent`.**
// Una página montada con `setContent` no tiene origen, así que el navegador
// le bloquea las direcciones `file://` y la hoja sale con doce recuadros
// grises. Abierta como archivo, las rutas relativas funcionan.
const htmlPath = path.resolve(salida.replace(/\.png$/, '.html'));
fs.writeFileSync(htmlPath, pagina);

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: 1180, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto('file:///' + htmlPath.replace(/\\/g, '/'));
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(1500);
await page.screenshot({ path: salida, fullPage: true });
await browser.close();

console.log('');
console.log('  hoja de revisión · ' + salida);
