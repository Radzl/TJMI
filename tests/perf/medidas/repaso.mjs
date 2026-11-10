/**
 * Un repaso de la web entera, página por página y en los dos idiomas.
 *
 * No sustituye a los arneses que ya hay —`check:3d` mira el 3D, `check:seo`
 * las cabeceras— sino que mira lo que ninguno de los dos mira: que **nada
 * reviente en la consola**, que no haya **desbordes horizontales en móvil** y
 * que cada página tenga su `h1`.
 *
 * El desborde horizontal es el que más fácil se cuela: no da error, no sale
 * en ningún arnés y en escritorio no se ve. Se nota solo en un teléfono, con
 * la página moviéndose de lado.
 *
 * Uso: node tests/perf/medidas/repaso.mjs [base]
 */
import { chromium } from 'playwright-core';

const BASE = process.argv[2] ?? 'http://localhost:3100';

const RUTAS = [
  '',
  '/servicios',
  '/servicios/grupaje',
  '/servicios/camion-completo',
  '/servicios/nacional-e-internacional',
  '/servicios/almacenaje',
  '/servicios/picking',
  '/servicios/contenedores',
  '/nosotros',
  '/cobertura',
  '/blog',
  '/faq',
  '/contacto',
  '/cookies',
  '/privacidad',
  '/aviso-legal',
];

/**
 * Avisos de consola que no son fallos nuestros y se dejan pasar.
 *
 * `THREE.Clock` es un aviso de la propia librería por una API retirada, y los
 * `X4122` son del compilador de sombreadores de Windows quejándose de
 * precisión en coma flotante. Ninguno de los dos depende de este código.
 */
const PERDONADOS = [
  /THREE\.Clock/,
  /X4122/,
  /willReadFrequently/,
  /Download the React DevTools/,
];

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

const problemas = [];

for (const [idioma, ancho, alto] of [
  ['es', 390, 844],
  ['en', 1280, 900],
]) {
  const ctx = await browser.newContext({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
  });
  await ctx.addInitScript(() => {
    document.cookie = `tjmi_consent=${encodeURIComponent(
      JSON.stringify({
        version: 1,
        date: new Date().toISOString(),
        maps: false,
      }),
    )};path=/`;
  });

  console.log(`\n### ${idioma} · ${ancho}×${alto}`);

  for (const ruta of RUTAS) {
    const page = await ctx.newPage();
    const errores = [];
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const texto = m.text();
      if (PERDONADOS.some((r) => r.test(texto))) return;
      errores.push(texto.slice(0, 120));
    });
    page.on('pageerror', (e) => errores.push(String(e).slice(0, 120)));

    const url = `${BASE}/${idioma}${ruta}`;
    const respuesta = await page.goto(url, { waitUntil: 'load' });
    // La portada lleva 3D diferido: hay que darle su hueco.
    await page.waitForTimeout(ruta === '' ? 5000 : 1600);

    const medida = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      // El desborde: lo que mide el documento contra lo que mide la ventana.
      desborde: Math.max(
        0,
        document.documentElement.scrollWidth - window.innerWidth,
      ),
    }));

    const estado = respuesta?.status() ?? 0;
    const mal = [];
    if (estado !== 200) mal.push(`estado ${estado}`);
    if (medida.h1 !== 1) mal.push(`${medida.h1} h1`);
    if (medida.desborde > 1) mal.push(`desborde ${medida.desborde} px`);
    if (errores.length) mal.push(`${errores.length} error(es)`);

    console.log(
      `  ${mal.length ? 'MAL ' : 'OK  '} ${(idioma + ruta || '/').padEnd(36)} ${mal.join(', ')}`,
    );
    if (errores.length) for (const e of errores.slice(0, 2)) console.log(`         ${e}`);
    if (mal.length) problemas.push(`${idioma}${ruta}: ${mal.join(', ')}`);

    await page.close();
  }

  await ctx.close();
}

await browser.close();

console.log('');
console.log(
  problemas.length === 0
    ? '  Las 32 páginas cargan limpias, sin desbordes y con un solo h1.'
    : `  ${problemas.length} página(s) con algo que mirar:\n   · ${problemas.join('\n   · ')}`,
);
process.exit(problemas.length === 0 ? 0 : 1);
