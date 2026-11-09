/**
 * ¿Cuántos bytes de JavaScript descarga de verdad la portada?
 *
 * Mirar el tamaño de los trozos en disco no sirve: lo que cuenta es lo que el
 * navegador **pide**, y eso depende de qué se renderiza. Esto carga la
 * portada en móvil y en escritorio, recorre el scroll para que se monte todo
 * y suma lo que ha pasado por la red.
 *
 * Uso: node tests/perf/medidas/bytes.mjs [base]
 */
import { chromium } from 'playwright-core';

const BASE = process.argv[2] ?? 'http://localhost:3100';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

for (const [nombre, ancho, alto] of [
  ['móvil', 412, 823],
  ['escritorio', 1280, 900],
]) {
  const ctx = await browser.newContext({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
  });
  await ctx.addInitScript(() => {
    document.cookie = `tjmi_consent=${encodeURIComponent(
      JSON.stringify({ version: 1, date: new Date().toISOString(), maps: false }),
    )};path=/`;
  });
  const page = await ctx.newPage();

  const js = new Map();
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\.js(\?|$)/.test(u)) return;
    try {
      const b = (await r.body()).length;
      js.set(u, b);
    } catch {
      /* una respuesta cancelada no cuenta */
    }
  });

  await page.goto(BASE + '/es', { waitUntil: 'load' });
  // Se baja un poco para que la escena se monte (va diferida a propósito).
  await page.evaluate(async () => {
    for (let i = 0; i < 6; i += 1) {
      window.scrollBy(0, 400);
      await new Promise((r) => setTimeout(r, 180));
    }
  });
  await page.waitForTimeout(3500);

  const total = [...js.values()].reduce((a, b) => a + b, 0);
  const mayores = [...js.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([u, b]) => `${(b / 1024).toFixed(0)} KB ${u.split('/').pop()}`);

  console.log(
    `  ${nombre.padEnd(11)} ${String(js.size).padStart(3)} archivos  ${(
      total / 1024
    ).toFixed(0)} KB`,
  );
  for (const m of mayores) console.log('      ' + m);

  await ctx.close();
}

await browser.close();
