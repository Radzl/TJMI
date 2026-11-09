// Mide, en pixeles de scroll, cuanto tarda el telon de la carretera en
// cerrarse al salir y en abrirse al entrar.
//
// El telon es el mismo objeto para las dos cosas (`veilRef`, azul noche), asi
// que lo que separa «fundido» de «parpadeo» es solo cuanto dura. Y eso no se
// juzga leyendo fracciones: una fraccion no dice cuantos pixeles son hasta
// que sabes cuanto mide el tramo.
//
// Metodo: recorrer el scroll de 20 en 20 px y medir el BRILLO MEDIO del
// cuadro.
//
// El primer intento contaba pixeles «azul noche» y no servia, y conviene
// saber por que: a mitad de fundido el telon es semitransparente, asi que lo
// que hay en pantalla es una mezcla —un gris azulado— que no pasa el filtro
// de «es azul noche». El contador se quedaba plano durante todo el fundido y
// solo saltaba al final, de modo que un fundido largo salia como un corte.
// Mentia en la direccion mas peligrosa: confirmando lo que yo esperaba.
//
// El brillo medio no tiene ese problema: baja de forma continua segun el
// telon se cierra. El fundido es el tramo entre el 95 % del brillo de la
// escena y el 105 % del brillo del final.

import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

const URL = 'http://localhost:3000/es';
const PASO = 20;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Brillo medio del cuadro, de 0 a 255.

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

// El tramo del disparador de la carretera, que NO es el de la seccion.
const tramo = await page.evaluate(() => {
  const s = document.querySelector('[data-scene="5"]');
  const inicio = s.offsetTop - window.innerHeight;
  const fin = s.offsetTop + s.offsetHeight - window.innerHeight;
  return { inicio: Math.round(inicio), fin: Math.round(fin), largo: Math.round(fin - inicio) };
});
console.log('tramo de la carretera: ' + tramo.largo + ' px  (' + tramo.inicio + ' .. ' + tramo.fin + ')');
console.log('');

async function barrer(desdeF, hastaF, etiqueta) {
  const desde = Math.round(tramo.inicio + tramo.largo * desdeF);
  const hasta = Math.round(tramo.inicio + tramo.largo * hastaF);
  const serie = [];
  for (let y = desde; y <= hasta; y += PASO) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await sleep(420);
    const img = PNG.sync.read(await page.screenshot({ type: 'png' }));
    let suma = 0;
    let total = 0;
    // Una rejilla basta: no hace falta mirar el millon de pixeles.
    for (let py = 0; py < img.height; py += 6) {
      for (let px = 0; px < img.width; px += 6) {
        const i = (img.width * py + px) << 2;
        total++;
        suma += (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3;
      }
    }
    serie.push({ y, pct: suma / total });
  }

  // Las dos mesetas: lo mas claro y lo mas oscuro del barrido.
  const claro = Math.max(...serie.map((p) => p.pct));
  const oscuro = Math.min(...serie.map((p) => p.pct));
  const alto = claro - oscuro;
  const dentro = serie.filter(
    (p) => p.pct < oscuro + alto * 0.95 && p.pct > oscuro + alto * 0.05,
  );
  const ini = alto < 20 || !dentro.length ? null : dentro[0].y;
  const fin = alto < 20 || !dentro.length ? null : dentro[dentro.length - 1].y;

  console.log('=== ' + etiqueta + ' ===');
  console.log('  meseta clara ' + claro.toFixed(0) + '  ·  meseta oscura ' + oscuro.toFixed(0));
  for (const p of serie) {
    const barra = '#'.repeat(Math.round(p.pct / 8));
    console.log('  ' + String(p.y).padStart(6) + '  ' + p.pct.toFixed(0).padStart(4) + '  ' + barra);
  }
  console.log(
    ini === null
      ? '  (no se encuentra la transicion en este tramo)'
      : '  fundido: ' + (fin - ini + PASO) + ' px de scroll',
  );
  console.log('');
  return ini === null ? null : fin - ini + PASO;
}

const entrada = await barrer(0.22, 0.46, 'ENTRADA · el telon se abre y descubre la carretera');
const salida = await barrer(0.84, 1.0, 'SALIDA · el telon se cierra');

console.log('entrada: ' + entrada + ' px   ·   salida: ' + salida + ' px');
if (entrada && salida) {
  console.log('la salida dura un ' + Math.round((salida / entrada) * 100) + ' % de lo que dura la entrada');
}

await browser.close();
