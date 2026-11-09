/**
 * ¿Por qué esta página se pone en modo «sin 3D» en un Chrome sin pantalla?
 *
 * `marcarSin3D()` deja siempre un aviso en la consola con el motivo, y hay
 * tres: que el navegador no abra WebGL, que se pierda el contexto en marcha,
 * o que algo reviente montando la escena. Esto lee ese aviso, y de paso
 * cualquier otro error, en vez de deducirlo.
 *
 * Uso: node tests/perf/medidas/motivo-sin3d.mjs [url]
 */
import { chromium } from 'playwright-core';

const URL = process.argv[2] ?? 'http://localhost:3100/es';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: 412, height: 823 },
  deviceScaleFactor: 1,
});

page.on('console', (m) => {
  const t = m.type();
  if (t === 'warning' || t === 'error')
    console.log(`  [${t}] ${m.text().slice(0, 300)}`);
});
page.on('pageerror', (e) => console.log(`  [pageerror] ${String(e).slice(0, 300)}`));

await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

const estado = await page.evaluate(() => {
  const c = document.querySelector('canvas');
  return {
    sin3d: document.documentElement.hasAttribute('data-sin-3d'),
    canvas: c ? `${c.width}×${c.height}` : 'no hay canvas',
  };
});

console.log('');
console.log(`  atributo sin 3D   ${estado.sin3d}`);
console.log(`  canvas            ${estado.canvas}`);

await browser.close();
