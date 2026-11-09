/**
 * Genera los iconos cuadrados de la web a partir de `public/logo.png`.
 *
 * ## Por qué hacía falta
 *
 * El único icono que había era `src/app/icon.png`, que es **el logo tal cual:
 * 420 × 286**. Un favicon no es rectangular: el navegador lo mete en una caja
 * cuadrada de 16 px, así que el escudo salía aplastado a 16 × 11 con dos
 * franjas vacías. Y no había `apple-icon`, de modo que quien guardaba la web
 * en la pantalla de inicio de un iPhone se llevaba **una captura de la
 * página** en vez del logo.
 *
 * ## Por qué con el navegador y no con una librería
 *
 * Este proyecto evita dependencias nativas a propósito (`check-media.mjs` lee
 * las cabeceras de los JPEG a mano justo por eso, y `sharp` no está instalado
 * como dependencia propia). Aquí ya hay un Chrome y ya hay `playwright-core`
 * para el arnés visual, así que componer la imagen en una página y capturarla
 * no añade **nada** al proyecto y sale pixel a pixel igual en cada pasada.
 *
 * ## Las decisiones
 *
 * - **Fondo crema, no transparente.** Un icono de Apple no admite
 *   transparencia —iOS la rellena de negro— y en un favicon sobre pestaña
 *   oscura el azul del escudo se pierde. El crema es el papel de esta web, así
 *   que el icono se lee como parte de ella.
 * - **El logo ocupa el 76 % del ancho.** A sangre, iOS le recorta las esquinas
 *   redondeadas y se come las puntas del escudo.
 * - **Cuatro tamaños**: 512 y 192 para el manifiesto, 180 para Apple y 48 para
 *   el favicon, que es el que de verdad se ve pequeño.
 *
 * Uso: node scripts/gen-iconos.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const CREMA = '#f7f3ec';
const PROPORCION = 0.76;

/** Dónde va cada tamaño y para qué sirve. */
const SALIDAS = [
  { px: 512, ruta: 'public/icon-512.png', para: 'manifiesto' },
  { px: 192, ruta: 'public/icon-192.png', para: 'manifiesto' },
  { px: 180, ruta: 'src/app/apple-icon.png', para: 'pantalla de inicio de iOS' },
  { px: 48, ruta: 'src/app/icon.png', para: 'favicon' },
];

const logo = readFileSync('public/logo.png').toString('base64');

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

for (const { px, ruta, para } of SALIDAS) {
  const page = await browser.newPage({
    viewport: { width: px, height: px },
    deviceScaleFactor: 1,
  });

  await page.setContent(
    `<!doctype html><html><body style="margin:0;width:${px}px;height:${px}px;background:${CREMA};display:flex;align-items:center;justify-content:center">
       <img src="data:image/png;base64,${logo}" style="width:${Math.round(px * PROPORCION)}px;image-rendering:auto">
     </body></html>`,
  );
  await page.waitForLoadState('networkidle');

  const png = await page.screenshot({ type: 'png' });
  writeFileSync(ruta, png);
  console.log(
    `  ${String(px).padStart(3)} × ${String(px).padEnd(3)}  ${ruta.padEnd(28)} ${para}`,
  );
  await page.close();
}

await browser.close();
console.log('');
console.log('  Listo. Son archivos generados: si cambia el logo, se vuelve a lanzar.');
