/**
 * ¿De dónde sale el CLS de 0,38 de la portada?
 *
 * Lighthouse señala un único desplazamiento, y se lleva 0,3827 de los 0,3830:
 * la sección del índice («EL CAMIÓN SALE IGUAL») aparece a 508 px del
 * principio de la página cuando, detrás de un hero de 420svh, tendría que
 * estar a más de 3.400. O sea que el hero se queda en media pantalla y
 * después crece, o al revés.
 *
 * Esto mide las dos cosas que lo explicarían: si el documento acaba con el
 * atributo «sin 3D» puesto, y cuánto se mueve el índice entre el primer
 * pintado y la página asentada.
 *
 * Uso: node tests/perf/medidas/cls.mjs [url]
 */
import { chromium } from 'playwright-core';

const URL = process.argv[2] ?? 'http://localhost:3100/es';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

for (const movil of [true, false]) {
  const context = await browser.newContext({
    viewport: movil ? { width: 412, height: 823 } : { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // El banner de cookies no pinta nada aquí, pero se escribe igual para medir
  // la misma página que el arnés visual.
  await page.addInitScript(() => {
    document.cookie = `tjmi_consent=${encodeURIComponent(
      JSON.stringify({ v: 1, fecha: new Date().toISOString(), maps: false }),
    )};path=/`;
  });

  // Se apunta cada desplazamiento que el navegador declara, igual que hace
  // Lighthouse, para no depender de interpretar una captura.
  await page.addInitScript(() => {
    window.__saltos = [];
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries()) {
        if (!e.hadRecentInput) window.__saltos.push(e.value);
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  const medir = () =>
    page.evaluate(() => {
      const hero = document.querySelector('main > section');
      const indice = document.querySelectorAll('main > section')[1];
      const r = (el) =>
        el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null;
      return {
        sin3d: document.documentElement.hasAttribute('data-sin-3d'),
        heroAlto: hero ? Math.round(hero.getBoundingClientRect().height) : null,
        indiceY: r(indice),
        pagina: Math.round(document.body.scrollHeight),
        cls: (window.__saltos ?? []).reduce((a, b) => a + b, 0),
      };
    });

  const antes = await medir();
  await page.waitForTimeout(5000);
  const despues = await medir();

  console.log(`\n### ${movil ? 'móvil 412×823' : 'escritorio 1280×900'}`);
  console.log('                   al cargar      asentada');
  console.log(
    `  atributo sin 3D   ${String(antes.sin3d).padEnd(14)} ${despues.sin3d}`,
  );
  console.log(
    `  alto del hero     ${String(antes.heroAlto).padEnd(14)} ${despues.heroAlto}`,
  );
  console.log(
    `  y del indice      ${String(antes.indiceY).padEnd(14)} ${despues.indiceY}`,
  );
  console.log(
    `  alto de pagina    ${String(antes.pagina).padEnd(14)} ${despues.pagina}`,
  );
  console.log(`  CLS acumulado     ${despues.cls.toFixed(4)}`);

  await context.close();
}

await browser.close();
