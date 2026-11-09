/**
 * ¿Cuánto cuesta preguntar si hay WebGL?
 *
 * La pregunta importa porque el arreglo del CLS consiste en hacer esa
 * comprobación en un script **que bloquea** en la cabecera, para que la
 * decisión esté tomada antes del primer pintado. Si abrir un contexto cuesta
 * decenas de milisegundos, el arreglo del CLS se paga en FCP y no compensa.
 *
 * Se mide con el reloj de rendimiento del propio navegador, diez veces, y se
 * da la primera —que es la que de verdad paga el arranque del proceso de la
 * GPU— aparte de la mediana.
 *
 * Uso: node tests/perf/medidas/sonda-webgl.mjs
 */
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage();
await page.goto('about:blank');

const r = await page.evaluate(() => {
  const tiempos = [];
  let hay = null;

  for (let i = 0; i < 10; i += 1) {
    const t = performance.now();
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') ?? c.getContext('webgl');
    tiempos.push(performance.now() - t);
    if (hay === null) hay = Boolean(gl);
    if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  const orden = [...tiempos].sort((a, b) => a - b);
  return {
    hay,
    primera: tiempos[0],
    mediana: orden[5],
    maxima: orden[9],
  };
});

console.log(`  ¿hay WebGL?   ${r.hay}`);
console.log(`  primera vez   ${r.primera.toFixed(2)} ms`);
console.log(`  mediana       ${r.mediana.toFixed(2)} ms`);
console.log(`  la peor       ${r.maxima.toFixed(2)} ms`);

await browser.close();
