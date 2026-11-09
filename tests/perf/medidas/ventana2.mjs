// Continua el barrido MAS ALLA del recorrido de la escena 3.
//
// El primer barrido descubrio que al 100 % de la seccion solo hay 2 de 4 pasos
// encendidos: el encendido sigue mientras la pagina entra en la seccion
// siguiente. Esto mira hasta donde, y si el bloque todavia se ve cuando se
// enciende el cuarto.

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

const base = await page.evaluate(() => {
  const s = document.querySelector('[data-scene="3"]');
  return {
    fin: Math.round(s.offsetTop + Math.max(1, s.offsetHeight - window.innerHeight)),
    alto: s.offsetHeight,
    ventana: window.innerHeight,
  };
});
console.log('fin del recorrido de la escena 3: ' + base.fin + ' px');
console.log('');
console.log(
  'scrollY'.padEnd(9) +
    '(+desde fin)'.padEnd(14) +
    'opac'.padEnd(7) +
    'encendidos'.padEnd(12) +
    'h4 dentro'.padEnd(11) +
    'h3 dentro',
);
console.log('-'.repeat(68));

for (let d = -200; d <= 1600; d += 150) {
  const y = base.fin + d;
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await sleep(1300);

  const info = await page.evaluate(() => {
    const sec = document.querySelector('[data-scene="3"]');
    const li = [...sec.querySelectorAll('.route-steps li')];
    const encendidos = li.filter((x) => x.getAttribute('data-shown') !== 'false').length;
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
    const h4s = [...sec.querySelectorAll('h4')];
    return {
      op: Math.round(op * 100) / 100,
      encendidos,
      total: li.length,
      h4: h4s.filter(dentro).length + '/' + h4s.length,
      h3: dentro(sec.querySelector('h3')) ? 'si' : 'no',
    };
  });

  console.log(
    String(y).padEnd(9) +
      (d >= 0 ? '+' + d : String(d)).padEnd(14) +
      String(info.op).padEnd(7) +
      (info.encendidos + '/' + info.total).padEnd(12) +
      info.h4.padEnd(11) +
      info.h3,
  );
}

await browser.close();
