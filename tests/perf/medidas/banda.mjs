/**
 * ¿La banda rotulada responde de verdad a la velocidad del scroll?
 *
 * Esta comprobación existe porque en este proyecto ya ha habido **dos**
 * efectos montados, documentados y afinados que **no se estaban ejecutando**
 * —la viñeta y las sombras de contacto—, y los dos se cazaron midiendo, no
 * mirando el código. Aquí se mide la fuente: el `playbackRate` de la
 * animación, que es lo único que el componente toca.
 *
 * ## Dos trampas, las dos pisadas al escribir esto
 *
 * 1. **Hay que mover la rueda de verdad, no llamar a `window.scrollBy`.**
 *    Lenis gobierna el scroll de esta web, así que un `scrollBy` desde dentro
 *    de la página no produce la velocidad que produciría un usuario: medido,
 *    el pico de la banda se quedaba en **1,09** y parecía que el efecto no
 *    existía. Con `page.mouse.wheel`, que es un evento de entrada real, la
 *    velocidad mediana de un gesto normal son **3.067 px/s**.
 * 2. **Hay que medir el PICO, no el valor de después.** La tasa vuelve a 1 en
 *    cuanto el scroll para, y la amortiguación la devuelve en menos de un
 *    segundo: leerla al terminar el gesto da casi 1 aunque todo funcione.
 *
 * Uso: node tests/perf/medidas/banda.mjs [url]
 */
import { chromium } from 'playwright-core';

const URL = process.argv[2] ?? 'http://localhost:3000/es';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});
await ctx.addInitScript(() => {
  document.cookie = `tjmi_consent=${encodeURIComponent(
    JSON.stringify({ version: 1, date: new Date().toISOString(), maps: false }),
  )};path=/`;
});
const page = await ctx.newPage();

// Muestrea la tasa en cada fotograma y se queda con los extremos.
await page.addInitScript(() => {
  window.__banda = { max: 1, min: 1 };
  const mirar = () => {
    const a = document
      .querySelector('.animate-marquee')
      ?.getAnimations?.()[0];
    if (a) {
      window.__banda.max = Math.max(window.__banda.max, a.playbackRate);
      window.__banda.min = Math.min(window.__banda.min, a.playbackRate);
    }
    requestAnimationFrame(mirar);
  };
  requestAnimationFrame(mirar);
});

const extremos = () =>
  page.evaluate(() => {
    const r = { ...window.__banda };
    window.__banda = { max: 1, min: 1 };
    return r;
  });

const tasa = () =>
  page.evaluate(() => {
    const a = document
      .querySelector('.animate-marquee')
      ?.getAnimations?.()[0];
    return a ? Number(a.playbackRate.toFixed(3)) : null;
  });

await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(2500);

if ((await tasa()) === null) {
  console.log('  No hay animación en la banda. ¿Movimiento reducido?');
  await browser.close();
  process.exit(1);
}

const rueda = async (signo) => {
  await page.mouse.move(640, 450);
  for (let i = 0; i < 12; i += 1) {
    await page.mouse.wheel(0, signo * 400);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(150);
};

console.log('  en reposo, al cargar      ' + (await tasa()));

await extremos();
await rueda(1);
const picoBajando = (await extremos()).max;
console.log('  bajando, pico             ' + picoBajando.toFixed(2));

await page.waitForTimeout(2500);
const quieto = await tasa();
console.log('  parado, dos segundos      ' + quieto);

await extremos();
await rueda(-1);
const picoSubiendo = (await extremos()).min;
console.log('  subiendo, pico            ' + picoSubiendo.toFixed(2));

await page.waitForTimeout(2500);
console.log('  parado otra vez           ' + (await tasa()));

console.log('');
const bien =
  picoBajando > 1.8 && picoSubiendo < 0.5 && Math.abs(quieto - 1) < 0.25;
console.log(
  bien
    ? '  OK: acelera al bajar, se da la vuelta al subir y vuelve a 1 en reposo.'
    : '  MAL: la banda no está respondiendo al scroll.',
);

await browser.close();
process.exit(bien ? 0 : 1);
