/**
 * ¿Qué elemento es el LCP de la portada y cuándo se pinta de verdad?
 *
 * Lighthouse da un número simulado; esto mira lo que el navegador declara, y
 * además comprueba lo único que de verdad distingue «está en el HTML» de
 * «aparece al hidratar»: cargar la página **con JavaScript apagado**.
 *
 * Uso: node tests/perf/medidas/lcp.mjs [url]
 */
import { chromium } from 'playwright-core';

const URL = process.argv[2] ?? 'http://localhost:3100/es';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

// ── 1. Sin JavaScript: lo que hay es exactamente lo que sirve el servidor ──
{
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1,
    javaScriptEnabled: false,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  const r = await page.evaluate(() => {
    const b = document.querySelector('[data-banner-cookies]');
    if (!b) return { hay: false };
    const caja = b.getBoundingClientRect();
    return {
      hay: true,
      visible: getComputedStyle(b).display !== 'none',
      alto: Math.round(caja.height),
      arriba: Math.round(caja.top),
    };
  });
  console.log('### con JavaScript apagado (o sea, el HTML servido)');
  console.log('  banner en el DOM   ' + r.hay);
  if (r.hay) {
    console.log('  visible            ' + r.visible);
    console.log('  caja               ' + r.alto + ' px de alto, arriba a ' + r.arriba);
  }
  await ctx.close();
}

// ── 2. Con JavaScript y la CPU frenada: los candidatos a LCP, en orden ────
{
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.addInitScript(() => {
    window.__lcp = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__lcp.push({
          t: Math.round(e.startTime),
          tam: Math.round(e.size),
          sel: e.element
            ? e.element.tagName.toLowerCase() +
              '.' +
              String(e.element.className).slice(0, 48)
            : '(sin elemento)',
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    window.__fcp = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        window.__fcp.push({ n: e.name, t: Math.round(e.startTime) });
    }).observe({ type: 'paint', buffered: true });
  });

  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(9000);

  const r = await page.evaluate(() => ({
    pintados: window.__fcp ?? [],
    lcp: window.__lcp ?? [],
  }));

  console.log('');
  console.log('### con JavaScript, CPU a 1/4');
  for (const p of r.pintados) console.log('  ' + String(p.t).padStart(6) + ' ms  ' + p.n);
  console.log('  — candidatos a LCP, por orden —');
  for (const c of r.lcp)
    console.log(
      '  ' + String(c.t).padStart(6) + ' ms  ' + String(c.tam).padStart(7) + ' px²  ' + c.sel,
    );

  await ctx.close();
}

await browser.close();
