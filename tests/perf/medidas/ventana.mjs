// Busca la altura de scroll donde el bloque de `InRoute` esta a plena vista:
// opacidad 1 y los cuatro pasos ya encendidos (`data-shown="true"`).
//
// Hace falta porque la primera medicion de contraste cayo en dos estados
// transitorios y dio numeros que no son los del estado final:
//   - los pasos sin encender van a `opacity: 0.18` (regla .route-steps)
//   - al final de la seccion el bloque entero se desvanece (ScrollFade)
// Medir el contraste en cualquiera de los dos da un falso fallo.

import { chromium } from 'playwright-core';

const URL = 'http://localhost:3100/es';
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

console.log(
  'at'.padEnd(7) +
    'scrollY'.padEnd(9) +
    'opac.bloque'.padEnd(13) +
    'pasos encendidos'.padEnd(18) +
    'h3 dentro'.padEnd(11) +
    'h4 dentro',
);
console.log('-'.repeat(76));

for (let at = 0.5; at <= 1.001; at += 0.05) {
  const y = await page.evaluate((f) => {
    const s = document.querySelector('[data-scene="3"]');
    const run = Math.max(1, s.offsetHeight - window.innerHeight);
    const v = Math.round(s.offsetTop + run * f);
    window.scrollTo(0, v);
    return v;
  }, at);
  await sleep(1400);

  const info = await page.evaluate(() => {
    const sec = document.querySelector('[data-scene="3"]');
    const li = [...sec.querySelectorAll('.route-steps li')];
    const encendidos = li.filter(
      (x) => x.getAttribute('data-shown') !== 'false',
    ).length;

    // La opacidad del bloque: la menor de la cadena de ancestros del titular.
    const h2 = sec.querySelector('h2');
    let op = 1;
    for (let el = h2; el && el !== document.body; el = el.parentElement) {
      const o = parseFloat(getComputedStyle(el).opacity);
      if (Number.isFinite(o)) op = Math.min(op, o);
    }

    const dentro = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top > 4 && r.bottom < window.innerHeight - 4;
    };
    const h3 = sec.querySelector('h3');
    const h4s = [...sec.querySelectorAll('h4')];

    return {
      op: Math.round(op * 100) / 100,
      encendidos,
      total: li.length,
      h3: dentro(h3),
      h4: h4s.filter(dentro).length + '/' + h4s.length,
    };
  });

  console.log(
    at.toFixed(2).padEnd(7) +
      String(y).padEnd(9) +
      String(info.op).padEnd(13) +
      (info.encendidos + '/' + info.total).padEnd(18) +
      (info.h3 ? 'si' : 'no').padEnd(11) +
      info.h4,
  );
}

await browser.close();
