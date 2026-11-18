/**
 * ¿Tapa la pantalla de carga al navbar, o sale el logo dos veces?
 *
 * La pregunta no se contesta mirando el `z-index` en el código: el del
 * preloader competía **dentro** del `<main>`, así que el número no decía nada.
 * Lo que sí lo contesta es preguntarle al navegador **qué elemento hay en el
 * punto donde está el logo del navbar** mientras la pantalla de carga se ve.
 *
 * Cazarla cuesta (está escrito en `CLAUDE.md`): dura un par de segundos y
 * frenar la red es contraproducente, porque entonces el trozo de JavaScript
 * que la monta tarda más que la ventana de captura y la pantalla **ni siquiera
 * llega a existir**. Así que se sondea el DOM cada 25 ms.
 *
 * Uso: node tests/perf/medidas/preloader.mjs [url]
 */
import { chromium } from 'playwright-core';

const URL = process.argv[2] ?? 'http://localhost:3000/es';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 412, height: 823 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

await page.addInitScript(() => {
  window.__visto = null;
  const mirar = () => {
    const pre = document.querySelector('.carga');
    // **Solo mientras TAPA de verdad.** En cuanto termina, el preloader se
    // queda con `pointer-events-none` para dejar pasar los clics, y entonces
    // `elementFromPoint` lo salta y devuelve lo de debajo: se mide el fundido
    // de salida y parece que el navbar gana. Ya engañó una vez.
    const tapando = pre && getComputedStyle(pre).pointerEvents !== 'none';
    if (tapando && !window.__visto) {
      // El logo del navbar: el primer enlace de la cabecera.
      const logo = document.querySelector('header a');
      if (logo) {
        const c = logo.getBoundingClientRect();
        const x = Math.round(c.left + c.width / 2);
        const y = Math.round(c.top + c.height / 2);
        const encima = document.elementFromPoint(x, y);
        window.__visto = {
          punto: x + ',' + y,
          encima: encima
            ? encima.tagName.toLowerCase() +
              (encima.className ? '.' + String(encima.className).slice(0, 40) : '')
            : '(nada)',
          dentroDelPreloader: Boolean(encima && pre.contains(encima)),
          esElPreloader: encima === pre,
          opacidadPreloader: getComputedStyle(pre).opacity,
          padreDelPreloader: pre.parentElement
            ? pre.parentElement.tagName.toLowerCase()
            : '(ninguno)',
        };
      }
    }
    if (!window.__visto) requestAnimationFrame(mirar);
  };
  requestAnimationFrame(mirar);
});

await page.goto(URL, { waitUntil: 'domcontentloaded' });

let r = null;
for (let i = 0; i < 400 && !r; i += 1) {
  r = await page.evaluate(() => window.__visto);
  if (!r) await page.waitForTimeout(25);
}

if (!r) {
  console.log('  no se ha podido cazar la pantalla de carga en 10 s');
} else {
  console.log('  punto del logo del navbar     ' + r.punto);
  console.log('  elemento que hay encima       ' + r.encima);
  console.log('  es la pantalla de carga       ' + r.esElPreloader);
  console.log('  o algo de dentro de ella      ' + r.dentroDelPreloader);
  console.log('  opacidad de la pantalla       ' + r.opacidadPreloader);
  console.log('  padre de la pantalla          ' + r.padreDelPreloader);
  console.log('');
  console.log(
    r.dentroDelPreloader || r.esElPreloader
      ? '  OK: la pantalla de carga tapa el navbar, el logo sale una vez.'
      : '  MAL: el navbar se pinta por encima, el logo sale dos veces.',
  );
}

await browser.close();
