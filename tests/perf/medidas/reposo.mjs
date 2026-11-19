// Cuánto dibuja la intro 3D cuando nadie toca nada (la «pausa en reposo»).
//
// Carga la portada, la deja en un punto del hero, espera a que se asiente y
// cuenta, durante tres segundos sin scroll ni ratón, cuántos fotogramas pinta
// el lienzo y cuántas llamadas de dibujo hace por segundo. Después mueve la
// rueda y vuelve a contar, para comprobar que al tocar algo recupera el ritmo.
//
// Uso:
//   node tests/perf/medidas/reposo.mjs [http://localhost:3000]
import { chromium } from 'playwright-core';

const BASE = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:3000';

const INICIO = `
  (() => {
    let cuenta = 0;
    window.__fotogramas = [];
    for (const Clase of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
      if (!Clase) continue;
      for (const metodo of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
        const original = Clase.prototype[metodo];
        if (!original) continue;
        Clase.prototype[metodo] = function (...a) {
          cuenta += 1;
          return original.apply(this, a);
        };
      }
    }
    const paso = (t) => {
      window.__fotogramas.push([t, cuenta]);
      if (window.__fotogramas.length > 2000) window.__fotogramas.shift();
      cuenta = 0;
      requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  })();
`;

async function contar(page, ms) {
  return page.evaluate(async (ms) => {
    const desde = performance.now();
    await new Promise((r) => setTimeout(r, ms));
    const tramo = window.__fotogramas.filter(([t]) => t >= desde);
    const pintados = tramo.filter(([, c]) => c > 0);
    const llamadas = tramo.reduce((s, [, c]) => s + c, 0);
    const seg = ms / 1000;
    return {
      fps: Math.round(pintados.length / seg),
      llamadasPorSegundo: Math.round(llamadas / seg),
    };
  }, ms);
}

const browser = await chromium.launch({ channel: 'chrome' });
for (const [nombre, ancho, alto] of [
  ['escritorio', 1280, 800],
  ['móvil', 390, 844],
]) {
  const ctx = await browser.newContext({ viewport: { width: ancho, height: alto } });
  await ctx.addCookies([
    {
      name: 'tjmi_consent',
      value: encodeURIComponent(JSON.stringify({ version: 1, date: new Date().toISOString(), maps: false })),
      domain: new URL(BASE).hostname,
      path: '/',
    },
  ]);
  await ctx.addInitScript(INICIO);
  const page = await ctx.newPage();
  await page.goto(BASE + '/es', { waitUntil: 'load' });
  await page.waitForSelector('.carga', { state: 'detached', timeout: 25000 }).catch(() => {});
  await page.evaluate(() => {
    const s = document.querySelector('[data-scene="1"]');
    scrollTo(0, s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * 0.3);
  });
  // Que se asienten el scrub y los muelles, y que pase el umbral de reposo.
  await page.waitForTimeout(5000);
  const quieto = await contar(page, 3000);
  await page.mouse.move(ancho / 2, alto / 2);
  await page.mouse.wheel(0, 120);
  const moviendo = await contar(page, 600);
  console.log(
    `  ${nombre.padEnd(11)} quieto: ${String(quieto.fps).padStart(3)} fps, ${String(quieto.llamadasPorSegundo).padStart(6)} llamadas/s` +
      `   ·   al mover: ${String(moviendo.fps).padStart(3)} fps, ${String(moviendo.llamadasPorSegundo).padStart(6)} llamadas/s`,
  );
  await ctx.close();
}
await browser.close();
