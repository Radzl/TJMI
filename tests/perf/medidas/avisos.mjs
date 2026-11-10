/**
 * ¿Se entera el servidor cuando algo se cae en el navegador de un visitante?
 *
 * No se prueba llamando a la función a mano: se **provoca un fallo de
 * verdad** —se bloquean los modelos 3D, que es exactamente lo que pasó en
 * producción cuando la cabecera de seguridad mataba el wasm— y se mira si el
 * aviso sale por la red.
 *
 * Uso: node tests/perf/medidas/avisos.mjs [base]
 */
import { chromium } from 'playwright-core';

const BASE = process.argv[2] ?? 'http://localhost:3000';

const casos = [];
const comprobar = (nombre, bien, visto = '') => {
  casos.push(bien);
  console.log(`  ${bien ? 'OK  ' : 'MAL '} ${nombre.padEnd(46)} ${visto}`);
};

// ── 1. La ruta acepta un aviso bien formado ──────────────────────────────
{
  const r = await fetch(`${BASE}/api/aviso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      motivo: 'prueba',
      mensaje: 'Comprobación automática de la ruta de avisos.',
      ruta: '/es',
    }),
  });
  comprobar('la ruta responde 204', r.status === 204, String(r.status));
}

// ── 2. Y un aviso basura no la revienta ──────────────────────────────────
{
  const r = await fetch(`${BASE}/api/aviso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{roto',
  });
  comprobar('un aviso roto no la revienta', r.status === 204, String(r.status));
}

// ── 3. Un fallo de verdad: sin modelos, la escena se cae ─────────────────
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});
await ctx.addInitScript(() => {
  document.cookie = `tjmi_consent=${encodeURIComponent(
    JSON.stringify({ version: 1, date: new Date().toISOString(), maps: false }),
  )};path=/`;
});
const page = await ctx.newPage();

const avisos = [];
page.on('request', (r) => {
  if (r.url().endsWith('/api/aviso')) avisos.push(r.postData() ?? '');
});

// Esto es lo que simula el fallo: los GLB no llegan, así que `useGLTF`
// lanza dentro del Canvas y `Canvas3DBoundary` lo atrapa.
await page.route('**/models/*.glb', (ruta) => ruta.abort());

await page.goto(`${BASE}/es`, { waitUntil: 'load' });
// El 3D va diferido a propósito, así que hay que darle su hueco y después
// esperar a que la escena intente montarse y se caiga.
await page.evaluate(() => window.scrollBy(0, 200));
await page.waitForTimeout(9000);

const sin3d = await page.evaluate(() =>
  document.documentElement.hasAttribute('data-sin-3d'),
);

comprobar('sin modelos, la página cae al modo sin 3D', sin3d);
comprobar(
  'y manda el aviso al servidor',
  avisos.length >= 1,
  avisos.length ? `${avisos.length} aviso(s)` : '(ninguno)',
);

if (avisos.length) {
  let cuerpo = null;
  try {
    cuerpo = JSON.parse(avisos[0]);
  } catch {
    /* se queda en null y falla abajo */
  }
  comprobar(
    'el aviso dice qué ha pasado',
    cuerpo?.motivo === 'sin-3d' && typeof cuerpo?.mensaje === 'string',
    cuerpo ? `${cuerpo.motivo}: ${String(cuerpo.mensaje).slice(0, 44)}` : '(ilegible)',
  );
  // **Ojo con cómo se comprueba esto.** El primer intento miraba que el
  // cuerpo no contuviera 'http' en ninguna parte, y daba fallo con todo
  // bien: el que lleva una URL es el MENSAJE del error —'Could not load
  // http://…/models/truck.glb'—, que es nuestro propio modelo y es justo lo
  // que hace falta para depurar. Lo que de verdad no puede viajar es la
  // dirección que está mirando el visitante.
  comprobar(
    'manda la ruta, no la URL del visitante',
    cuerpo?.ruta === '/es' &&
      !Object.values(cuerpo).some(
        (v) => typeof v === 'string' && v.includes(BASE + '/es'),
      ),
    cuerpo?.ruta ?? '(sin ruta)',
  );
  comprobar(
    'no se repite: el tope del cliente funciona',
    avisos.length <= 3,
    `${avisos.length} de 3 como mucho`,
  );
}

await browser.close();

const fallos = casos.filter((x) => !x).length;
console.log('');
console.log(
  fallos === 0
    ? '  Un fallo en el navegador de un visitante llega al servidor.'
    : `  ${fallos} comprobación(es) han fallado.`,
);
process.exit(fallos === 0 ? 0 : 1);
