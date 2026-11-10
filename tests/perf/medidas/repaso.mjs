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

// ── Y una pasada con movimiento reducido ─────────────────────────────────
//
// Esta web se puso una regla a sí misma: «nunca escondas algo en el marcado y
// lo enseñes solo por animación». Con movimiento reducido no se monta Lenis,
// no se monta el 3D y los componentes animados salen por `prefersReducedMotion`
// dejando su estado final puesto.
//
// **Hasta ahora nada comprobaba que eso siguiera siendo verdad.** Un
// componente nuevo que se olvide del respaldo deja su texto en `opacity: 0`
// para siempre, y quien tiene esa preferencia activada —que no es poca
// gente— se encuentra una página con huecos y sin un solo error en consola.
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
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

  console.log('\n### movimiento reducido · 390×844');

  for (const ruta of RUTAS) {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/es${ruta}`, { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const invisible = await page.evaluate(() => {
      const malos = [];
      for (const el of document.querySelectorAll(
        'h1, h2, h3, p, li, dd, dt, blockquote',
      )) {
        const texto = (el.textContent ?? '').trim();
        if (texto.length < 20) continue;

        // Lo que está escondido a propósito no cuenta: el lector de pantalla
        // (`sr-only`), lo marcado como oculto, y lo que no ocupa sitio.
        if (el.closest('[aria-hidden="true"], [hidden]')) continue;
        const caja = el.getBoundingClientRect();
        if (caja.width < 2 || caja.height < 2) continue;

        // La opacidad se acumula por los padres, así que hay que subir.
        let opacidad = 1;
        for (let a = el; a; a = a.parentElement) {
          const o = Number(getComputedStyle(a).opacity);
          if (!Number.isNaN(o)) opacidad *= o;
          if (opacidad < 0.1) break;
        }
        if (opacidad < 0.1) malos.push(texto.slice(0, 50));
      }
      return malos;
    });

    const mal = invisible.length ? [`${invisible.length} texto(s) invisibles`] : [];
    console.log(
      `  ${mal.length ? 'MAL ' : 'OK  '} ${('es' + ruta || '/').padEnd(36)} ${mal.join(', ')}`,
    );
    if (invisible.length)
      for (const x of invisible.slice(0, 2)) console.log(`         «${x}»`);
    if (mal.length) problemas.push(`es${ruta} (mov. reducido): ${mal.join(', ')}`);

    await page.close();
  }

  await ctx.close();
}

await browser.close();

console.log('');
console.log(
  problemas.length === 0
    ? '  Las 32 páginas cargan limpias, sin desbordes, con un solo h1 y sin texto\n  invisible con movimiento reducido.'
    : `  ${problemas.length} página(s) con algo que mirar:\n   · ${problemas.join('\n   · ')}`,
);
process.exit(problemas.length === 0 ? 0 : 1);
