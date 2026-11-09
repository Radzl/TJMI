// Mide si la escena de la carretera se ALEJA al final, y cuando.
//
// La camara es ortografica, asi que «alejarse» es abrir el ancho de mundo del
// encuadre: todo encoge a la vez. Lo que se mide es el tamano en pantalla de
// la huella de la escena —la nave, el camion y el asfalto— a lo largo del
// tramo final.
//
// Hace falta medirlo y no mirarlo por un motivo concreto: la variable que
// abre el encuadre estuvo TAPADA por otra del mismo nombre declarada mas
// adentro, asi que el encuadre se abria en otro momento. Eso compila, no da
// ningun aviso, y a ojo pasa desapercibido.

import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

const URL = 'http://localhost:3000/es';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
});
await context.addCookies([
  {
    name: 'tjmi_consent',
    value: encodeURIComponent(
      JSON.stringify({ maps: false, version: 1, date: new Date().toISOString() }),
    ),
    url: URL,
  },
]);
const page = await context.newPage();
await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => !!document.querySelector('canvas'), { timeout: 45000 });

// El tramo del disparador. `offsetTop` NO vale: se desvia del valor real
// cuando hay un ancestro posicionado. Aqui daba 81 px de error.
const tramo = await page.evaluate(() => {
  const s = document.querySelector('[data-scene="5"]');
  const abs = s.getBoundingClientRect().top + window.scrollY;
  return { ini: Math.round(abs - window.innerHeight), largo: s.offsetHeight };
});

console.log('tramo: ' + tramo.largo + ' px desde ' + tramo.ini);
console.log('');
// Solo hasta 0,90: a partir de ahi el telon tapa demasiado y el umbral de
// color deja de distinguir la escena del fondo. En ese tramo el telon va de 0
// a 0,12, asi que el area que se mide es la de los objetos y no la del velo.
console.log('fracción  área de escena (px)   relativo   esperado');
console.log('-'.repeat(56));

let base = null;
for (const f of [0.84, 0.86, 0.88, 0.90]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(tramo.ini + tramo.largo * f));
  await sleep(2600);
  const img = PNG.sync.read(await page.screenshot({ type: 'png' }));

  // El AREA de lo que no es fondo. Al abrirse el encuadre cada objeto encoge
  // con el cuadrado del factor, asi que el area baja aunque entre mas campo
  // vacio alrededor. La mitad derecha, que es donde esta la nave y donde no
  // hay texto de la pagina encima.
  let area = 0;
  for (let py = 40; py < img.height - 40; py += 2) {
    for (let px = img.width >> 1; px < img.width; px += 2) {
      const i = (img.width * py + px) << 2;
      const r = img.data[i];
      const g = img.data[i + 1];
      const b = img.data[i + 2];
      if (!(r > 225 && g > 220 && b > 208)) area++;
    }
  }
  if (base === null) base = area;
  // Lo que deberia encoger: el ancho de mundo va a (1 + 0,9 · leaving), y el
  // area va con el cuadrado.
  const t = Math.max(0, Math.min(1, (f - 0.86) / 0.14));
  const leaving = t * t * (3 - 2 * t);
  const esperado = Math.round((1 / (1 + 0.9 * leaving) ** 2) * 100);
  console.log(
    '  ' + f.toFixed(2).padEnd(10) + String(area).padStart(7) +
    '            ' + String(Math.round((area / base) * 100) + ' %').padStart(6) +
    '      ' + esperado + ' %',
  );
}

await browser.close();
