// Comprueba si el antialiasing esta falseando la medida del texto pequeno.
//
// La sospecha: a 14 px en versales con mucha prosa entre letras, los trazos
// miden cerca de un pixel, asi que puede que NINGUN pixel sea glifo puro. Si
// es asi, el color medido tira hacia el fondo y el contraste sale mas bajo del
// que la WCAG mide, porque la norma compara el color ESPECIFICADO, no el
// renderizado con suavizado.
//
// La prueba: tomar el pixel mas distinto, luego el 0,1 %, el 0,5 %, el 2 %...
// Si la serie converge hacia el valor teorico (blanco al 50 % sobre el fondo),
// la sospecha queda confirmada y el metodo de pixeles no vale para este caso.
//
// Y de control se mide lo mismo en un h4 de 24 px, donde los trazos son
// gruesos y deberia dar el color nominal sin discusion.

import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

const URL = 'http://localhost:3100/es';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const lum = (r, g, b) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(...a), lum(...b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const hex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

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

await page.evaluate(() => {
  const s = document.querySelector('[data-scene="3"]');
  const run = Math.max(1, s.offsetHeight - window.innerHeight);
  window.scrollTo(0, Math.round(s.offsetTop + run + 420));
});
await sleep(2600);

const marcados = await page.evaluate(() => {
  const sec = document.querySelector('[data-scene="3"]');
  const out = [];
  const h3 = sec.querySelector('h3');
  const h4 = sec.querySelector('h4');
  [h3, h4].forEach((el, i) => {
    if (!el) return;
    el.setAttribute('data-aa', String(i));
    const cs = getComputedStyle(el);
    out.push({
      id: String(i),
      etiqueta: el.tagName.toLowerCase(),
      texto: (el.innerText || '').trim().slice(0, 32),
      tam: cs.fontSize,
      // Ojo: Tailwind v4 emite `oklab(...)` para cualquier color con opacidad.
      // Se imprime en crudo a proposito, para no parsearlo como RGB.
      colorCrudo: cs.color,
    });
  });
  return out;
});

const conGlifos = {};
for (const m of marcados) {
  conGlifos[m.id] = await page.locator('[data-aa="' + m.id + '"]').screenshot({ type: 'png' });
}
await page.evaluate(() => {
  const s = document.createElement('style');
  s.id = 'qg';
  s.textContent = '[data-aa] { color: transparent !important; text-shadow: none !important; }';
  document.head.appendChild(s);
});
await sleep(500);

for (const m of marcados) {
  const a = PNG.sync.read(conGlifos[m.id]);
  const b = PNG.sync.read(
    await page.locator('[data-aa="' + m.id + '"]').screenshot({ type: 'png' }),
  );
  const px = (img, i) => [img.data[i], img.data[i + 1], img.data[i + 2]];

  let fr = 0;
  let fg = 0;
  let fb = 0;
  let n = 0;
  const difs = [];
  for (let i = 0; i < a.data.length; i += 4) {
    const p2 = px(b, i);
    fr += p2[0];
    fg += p2[1];
    fb += p2[2];
    n++;
    const p1 = px(a, i);
    difs.push([
      Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]) + Math.abs(p1[2] - p2[2]),
      i,
    ]);
  }
  const fondo = [fr / n, fg / n, fb / n];
  difs.sort((x, y) => y[0] - x[0]);

  // El valor teorico: blanco al 50 % (h3) o al 100 % (h4) sobre ese fondo.
  const alfa = m.etiqueta === 'h3' ? 0.5 : 1;
  const teorico = fondo.map((c) => c + (255 - c) * alfa);

  console.log('');
  console.log(
    '=== <' + m.etiqueta + '> ' + m.tam + '  "' + m.texto + '"',
  );
  console.log('    color en CSS (crudo): ' + m.colorCrudo);
  console.log('    fondo medido: ' + hex(fondo));
  console.log(
    '    teorico (blanco al ' +
      alfa * 100 +
      ' % sobre ese fondo): ' +
      hex(teorico) +
      '  ->  ' +
      ratio(teorico, fondo).toFixed(2) +
      ':1',
  );
  console.log('');
  console.log('    pixeles tomados      color medido   contraste');
  for (const frac of [null, 0.0005, 0.001, 0.005, 0.02, 0.05, 0.1]) {
    const corte = frac === null ? 1 : Math.max(1, Math.round(difs.length * frac));
    let tr = 0;
    let tg = 0;
    let tb = 0;
    for (let k = 0; k < corte; k++) {
      const p = px(a, difs[k][1]);
      tr += p[0];
      tg += p[1];
      tb += p[2];
    }
    const t = [tr / corte, tg / corte, tb / corte];
    const etq = frac === null ? 'el mas distinto (1)' : (frac * 100).toFixed(2) + ' % (' + corte + ')';
    console.log(
      '    ' + etq.padEnd(21) + hex(t).padEnd(15) + ratio(t, fondo).toFixed(2),
    );
  }
}

await browser.close();
