/**
 * ¿Quién es exactamente el párrafo del LCP, y por qué el banner no está fijo?
 *
 * Uso: node tests/perf/medidas/quien-lcp.mjs [url]
 */
import { chromium } from 'playwright-core';

const URL = process.argv[2] ?? 'http://localhost:3100/es';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });

for (const js of [false, true]) {
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1,
    javaScriptEnabled: js,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: js ? 'load' : 'domcontentloaded' });
  if (js) await page.waitForTimeout(4000);

  const r = await page.evaluate(() => {
    const salida = [];
    for (const el of document.querySelectorAll(
      'p.mt-3, [data-banner-cookies]',
    )) {
      const c = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      salida.push({
        et: el.tagName.toLowerCase(),
        cl: String(el.className).slice(0, 46),
        pos: c.position,
        top: Math.round(b.top),
        alto: Math.round(b.height),
        ancho: Math.round(b.width),
        texto: (el.textContent || '').trim().slice(0, 44),
      });
    }
    // ¿Quién le quita el «fixed» al banner? Se sube por los padres buscando
    // lo que crea un bloque contenedor.
    const banner = document.querySelector('[data-banner-cookies]');
    const culpables = [];
    for (let p = banner?.parentElement; p; p = p.parentElement) {
      const c = getComputedStyle(p);
      const motivos = [];
      if (c.transform !== 'none') motivos.push('transform: ' + c.transform.slice(0, 30));
      if (c.filter !== 'none') motivos.push('filter');
      if (c.perspective !== 'none') motivos.push('perspective');
      if (c.contain && c.contain !== 'none') motivos.push('contain: ' + c.contain);
      if (c.willChange && c.willChange !== 'auto') motivos.push('will-change: ' + c.willChange);
      if (motivos.length)
        culpables.push(
          p.tagName.toLowerCase() + '.' + String(p.className).slice(0, 30) + ' → ' + motivos.join(', '),
        );
    }
    return { salida, culpables };
  });

  console.log(`\n### JavaScript ${js ? 'encendido' : 'apagado'}`);
  for (const e of r.salida)
    console.log(
      `  ${e.et} ${e.pos.padEnd(9)} top ${String(e.top).padStart(6)}  ${e.ancho}×${e.alto}  «${e.texto}»`,
    );
  if (r.culpables.length) {
    console.log('  padres que crean bloque contenedor:');
    for (const c of r.culpables) console.log('    ' + c);
  } else {
    console.log('  ningún padre crea bloque contenedor');
  }

  await ctx.close();
}

await browser.close();
