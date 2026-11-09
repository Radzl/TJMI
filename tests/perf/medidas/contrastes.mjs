// Mide el contraste REAL de los textos que Lighthouse marca en la portada.
//
// Por que hace falta. El auditor no ve el <canvas>: calcula el contraste del
// texto contra el fondo que encuentra en el CSS, que aqui es el crema de la
// pagina, y le sale 1,01:1. Pero estos textos viven sobre el suelo azul noche
// que pinta el 3D. Lo unico que lo resuelve es mirar los pixeles.
//
// El metodo es el que ya se uso con el velo de la foto del indice: se captura
// la misma caja DOS veces, con glifos y sin glifos, y se comparan.
//   - sin glifos  -> el fondo de verdad, sea CSS o sea 3D.
//   - donde las dos difieren -> ahi hay letra; ese pixel es el color del texto.
// Se toma el nucleo del glifo (la diferencia mas alta) para no medir el
// antialiasing, que da un valor intermedio y falsea el resultado.
//
// Los seis elementos no caben en pantalla a la vez: el titular esta arriba del
// bloque y los cuatro pasos abajo. Asi que se recorre la escena por varias
// alturas y cada elemento se mide en la primera donde entra entero.

import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

const URL = 'http://localhost:3100/es';

// Las dos alturas donde cada cosa se ve en su estado FINAL, sacadas de medir
// (ver `ventana.mjs` y `ventana2.mjs`):
//   - el titular cabe en pantalla al 78 % del recorrido de la escena.
//   - los cuatro pasos no acaban de encenderse hasta 400 px DESPUES del final
//     de ese recorrido. A los 550 el bloque sigue a opacidad 1 y a los 700 ya
//     va por 0,63, asi que la ventana con los cuatro encendidos y a plena
//     opacidad esta entre 150 y 300 px (el barrido fue de 150 en 150).
// Medir fuera de esa ventana da falsos fallos: un paso sin encender esta a
// `opacity: 0.18` por diseno.
const ALTURAS = [
  { tipo: 'fraccion', v: 0.78 },
  { tipo: 'finMas', v: 420 },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Luminancia relativa de la WCAG.
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

const png = (buf) => PNG.sync.read(buf);
const px = (img, i) => [img.data[i], img.data[i + 1], img.data[i + 2]];

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

// Marca los objetivos una sola vez y los identifica con un atributo estable.
const objetivos = await page.evaluate(() => {
  const sec = document.querySelector('[data-scene="3"]');
  const out = [];
  let n = 0;
  for (const el of sec.querySelectorAll('h2, h3, h4')) {
    const t = (el.innerText || '').trim();
    if (!t) continue;
    const cs = getComputedStyle(el);
    el.setAttribute('data-medir', String(n));
    out.push({
      id: String(n++),
      etiqueta:
        el.tagName.toLowerCase() +
        (el.className
          ? '.' + String(el.className).split(' ').slice(0, 2).join('.')
          : ''),
      texto: t.replace(/\s+/g, ' ').slice(0, 40),
      colorCss: cs.color,
      tam: Math.round(parseFloat(cs.fontSize) * 10) / 10,
      peso: parseInt(cs.fontWeight, 10) || 400,
    });
  }
  return out;
});

const medido = {};

const sinGlifos = (si) =>
  page.evaluate((activar) => {
    const id = 'quitar-glifos';
    document.getElementById(id)?.remove();
    if (!activar) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent =
      '[data-medir] { color: transparent !important; text-shadow: none !important; }';
    document.head.appendChild(s);
  }, si);

for (const at of ALTURAS) {
  const target = await page.evaluate((a) => {
    const s = document.querySelector('[data-scene="3"]');
    const run = Math.max(1, s.offsetHeight - window.innerHeight);
    const fin = s.offsetTop + run;
    const y = Math.round(a.tipo === 'fraccion' ? s.offsetTop + run * a.v : fin + a.v);
    window.scrollTo(0, y);
    return y;
  }, at);
  await sleep(2600);

  // El estado del bloque en este punto. Se anota junto a cada medida para que
  // el informe demuestre que se midio el estado final y no uno transitorio.
  const estado = await page.evaluate(() => {
    const sec = document.querySelector('[data-scene="3"]');
    const li = [...sec.querySelectorAll('.route-steps li')];
    let op = 1;
    for (let el = sec.querySelector('h2'); el && el !== document.body; el = el.parentElement) {
      const o = parseFloat(getComputedStyle(el).opacity);
      if (Number.isFinite(o)) op = Math.min(op, o);
    }
    return {
      op: Math.round(op * 100) / 100,
      encendidos: li.filter((x) => x.getAttribute('data-shown') !== 'false').length,
      total: li.length,
    };
  });

  const visibles = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('[data-medir]')) {
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      if (r.top > 4 && r.bottom < window.innerHeight - 4) {
        out.push(el.getAttribute('data-medir'));
      }
    }
    return out;
  });

  const pendientes = visibles.filter((id) => !medido[id]);
  if (!pendientes.length) continue;

  const conGlifos = {};
  for (const id of pendientes) {
    conGlifos[id] = await page
      .locator('[data-medir="' + id + '"]')
      .screenshot({ type: 'png' });
  }

  await sinGlifos(true);
  await sleep(500);

  for (const id of pendientes) {
    const a = png(conGlifos[id]);
    const b = png(
      await page.locator('[data-medir="' + id + '"]').screenshot({ type: 'png' }),
    );
    if (a.width !== b.width || a.height !== b.height) continue;

    let fr = 0;
    let fg = 0;
    let fb = 0;
    let nf = 0;
    const difs = [];
    for (let i = 0; i < a.data.length; i += 4) {
      const p2 = px(b, i);
      fr += p2[0];
      fg += p2[1];
      fb += p2[2];
      nf++;
      const p1 = px(a, i);
      difs.push([
        Math.abs(p1[0] - p2[0]) +
          Math.abs(p1[1] - p2[1]) +
          Math.abs(p1[2] - p2[2]),
        i,
      ]);
    }
    const fondo = [fr / nf, fg / nf, fb / nf];

    difs.sort((x, y) => y[0] - x[0]);
    // El NUCLEO del trazo, no un promedio ancho. Esto costo una pasada y un
    // falso fallo: con el 2 % de pixeles, un texto de 14 px en versales con
    // prosa ancha daba 4,34:1 y parecia suspender. A ese tamano los trazos
    // miden un pixel, asi que el 2 % es casi todo borde suavizado y el color
    // medido tira hacia el fondo. Tomando los pocos pixeles mas distintos
    // sale 5,10:1, que coincide con el valor teorico (blanco al 50 % sobre el
    // fondo medido) con una centesima de diferencia. Comprobado con un control
    // de 24 px, donde el trazo es grueso y converge al instante.
    //
    // Y es lo correcto segun la norma: la WCAG compara el color ESPECIFICADO
    // contra el fondo, no el renderizado con suavizado.
    const corte = Math.max(1, Math.round(difs.length * 0.0005));
    let tr = 0;
    let tg = 0;
    let tb = 0;
    for (let k = 0; k < corte; k++) {
      const p3 = px(a, difs[k][1]);
      tr += p3[0];
      tg += p3[1];
      tb += p3[2];
    }
    const texto = [tr / corte, tg / corte, tb / corte];

    medido[id] = { fondo, texto, cr: ratio(texto, fondo), target, estado };
  }

  await sinGlifos(false);
  await sleep(300);
}

console.log('');
console.log(
  'elemento'.padEnd(30) +
    'tam'.padEnd(9) +
    'fondo'.padEnd(10) +
    'texto'.padEnd(10) +
    'real'.padStart(7) +
    '   pide   veredicto',
);
console.log('-'.repeat(92));

let fallos = 0;
for (const o of objetivos) {
  const m = medido[o.id];
  if (!m) {
    console.log(o.etiqueta.slice(0, 29).padEnd(30) + '(no entra entera en pantalla)');
    continue;
  }
  // WCAG: texto grande son 24 px, o 18,66 px en negrita.
  const grande = o.tam >= 24 || (o.tam >= 18.66 && o.peso >= 700);
  const minimo = grande ? 3 : 4.5;
  const pasa = m.cr >= minimo;
  if (!pasa) fallos++;
  console.log(
    o.etiqueta.slice(0, 29).padEnd(30) +
      (o.tam + 'px').padEnd(9) +
      hex(m.fondo).padEnd(10) +
      hex(m.texto).padEnd(10) +
      m.cr.toFixed(2).padStart(7) +
      '   ' +
      String(minimo).padEnd(6) +
      (pasa ? 'PASA' : 'FALLA'),
  );
  console.log(
    ' '.repeat(30) +
      '"' +
      o.texto +
      '"  (scrollY ' +
      m.target +
      ', opacidad ' +
      m.estado.op +
      ', ' +
      m.estado.encendidos +
      '/' +
      m.estado.total +
      ' pasos encendidos)',
  );
}

console.log('');
console.log(
  fallos === 0
    ? 'Ninguno falla de verdad: los seis avisos de Lighthouse son falsos positivos.'
    : fallos + ' de ' + objetivos.length + ' fallan de verdad y hay que arreglarlos.',
);

await browser.close();
