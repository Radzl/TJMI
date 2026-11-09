/**
 * ¿Cuánto rojo de marca hay en cada página, y dónde?
 *
 * El brief quiere el rojo «solo como acentos, bordes y detalles, nunca como
 * fondos masivos», y la medida anterior dio **0,13 % de toda la web**, con
 * `/faq` y `/contacto` a cero. Eso no es un acento, es un resto: lo que hace
 * que un color se lea como sistema no es su superficie, es que **aparezca a
 * propósito en todas partes**.
 *
 * Esto recorre las páginas, captura la página entera y cuenta los píxeles
 * cercanos a los tres rojos de la casa. Además mide **el bloque más grande**,
 * porque no es lo mismo repartir el rojo en filetes de 1 px que tener una
 * aparición con cuerpo: una raya de 2 px cruzando la pantalla y un cuadrado
 * de 40 × 40 dan superficies parecidas y se leen completamente distinto.
 *
 * Uso: node tests/perf/medidas/rojo.mjs [base] [margen]
 *
 * **El margen importa y es la trampa de esta medida.** Con 34 niveles por
 * canal la cuenta se dispara, pero no por el rojo de marca: por los tonos
 * cálidos de las fotos de azulejo y por el rojo de la lona del camión en el
 * 3D. Con 10 se mide el color de la casa y no el barro que se le parece.
 */
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

const BASE = process.argv[2] ?? 'http://localhost:3000';

const PAGINAS = [
  ['portada', '/es'],
  ['servicios', '/es/servicios'],
  ['grupaje', '/es/servicios/grupaje'],
  ['nosotros', '/es/nosotros'],
  ['faq', '/es/faq'],
  ['contacto', '/es/contacto'],
  ['blog', '/es/blog'],
];

/** Los tres rojos de la casa. */
const ROJOS = [
  [0xd0, 0x3b, 0x40], // brand-red
  [0xb8, 0x30, 0x35], // brand-red-ink
  [0xde, 0x5a, 0x5e], // brand-red-soft
];

/** Margen por canal. Generoso a propósito: el antialias y el revelado de las
 *  fotos mueven unos cuantos niveles, y lo que se busca es «esto se lee como
 *  el rojo de la casa», no una igualdad exacta. */
const MARGEN = Number(process.argv[3] ?? 10);

function esRojo(r, g, b) {
  for (const [rr, gg, bb] of ROJOS) {
    if (
      Math.abs(r - rr) <= MARGEN &&
      Math.abs(g - gg) <= MARGEN &&
      Math.abs(b - bb) <= MARGEN
    )
      return true;
  }
  return false;
}

/** El bloque conectado más grande, en píxeles. Recorrido iterativo: una
 *  página entera son millones de píxeles y la recursión revienta la pila. */
function bloqueMayor(mascara, ancho, alto) {
  const visto = new Uint8Array(mascara.length);
  const pila = new Int32Array(mascara.length);
  let mayor = 0;

  for (let i = 0; i < mascara.length; i += 1) {
    if (!mascara[i] || visto[i]) continue;
    let cima = 0;
    pila[cima++] = i;
    visto[i] = 1;
    let tam = 0;

    while (cima > 0) {
      const p = pila[--cima];
      tam += 1;
      const x = p % ancho;
      const y = (p / ancho) | 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= ancho || ny >= alto) continue;
        const q = ny * ancho + nx;
        if (mascara[q] && !visto[q]) {
          visto[q] = 1;
          pila[cima++] = q;
        }
      }
    }
    if (tam > mayor) mayor = tam;
  }
  return mayor;
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});

// Con el consentimiento ya dado: el banner taparía parte de la página y mete
// su propio color en la cuenta.
await ctx.addInitScript(() => {
  document.cookie = `tjmi_consent=${encodeURIComponent(
    JSON.stringify({ version: 1, date: new Date().toISOString(), maps: false }),
  )};path=/`;
});

console.log('  página        rojo        píxeles  bloque mayor');
console.log('  ' + '-'.repeat(52));

let totalRojo = 0;
let totalPx = 0;

for (const [nombre, ruta] of PAGINAS) {
  const page = await ctx.newPage();
  // **`load`, no `networkidle`:** /nosotros lleva un vídeo en bucle, así que
  // la red no se queda en silencio nunca y la espera expira.
  await page.goto(BASE + ruta, { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  const buf = await page.screenshot({ fullPage: true, type: 'png' });
  const png = PNG.sync.read(buf);
  const { width, height, data } = png;

  const mascara = new Uint8Array(width * height);
  let rojos = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    if (esRojo(data[i], data[i + 1], data[i + 2])) {
      mascara[p] = 1;
      rojos += 1;
    }
  }

  const total = width * height;
  const mayor = bloqueMayor(mascara, width, height);
  totalRojo += rojos;
  totalPx += total;

  console.log(
    '  ' +
      nombre.padEnd(13) +
      ((rojos / total) * 100).toFixed(3).padStart(7) +
      ' %  ' +
      String(rojos).padStart(8) +
      '  ' +
      String(mayor).padStart(7) +
      ' px' +
      (mayor < 400 ? '   ← sin una sola aparición con cuerpo' : ''),
  );

  await page.close();
}

console.log('  ' + '-'.repeat(52));
console.log(
  '  toda la web  ' + ((totalRojo / totalPx) * 100).toFixed(3).padStart(7) + ' %',
);

await browser.close();
