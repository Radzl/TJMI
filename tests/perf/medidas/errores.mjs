// Provoca a propósito lo que hace un visitante de verdad y cuenta los errores
// que salen en la consola. Sirve para cazar los fallos que no rompen nada a la
// vista y por eso no se ven: transiciones de página canceladas, promesas sin
// recoger, escuchadores duplicados.
//
// Uso:
//   node tests/perf/medidas/errores.mjs [base] [--sin-arreglo]
//
// `--sin-arreglo` desactiva el envoltorio de `lib/transiciones.ts` antes de que
// cargue la página, para comprobar que el error existía y que lo que lo quita
// es ese arreglo y no la casualidad.
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const sinArreglo = args.includes('--sin-arreglo');
const BASE = args.find((a) => a.startsWith('http')) ?? 'http://localhost:3000';
const cookie = {
  name: 'tjmi_consent',
  value: encodeURIComponent(JSON.stringify({ maps: false, version: 1, date: new Date().toISOString() })),
  url: BASE,
};
// Ruido conocido que no depende de este código (ver `check:repaso`).
const PERDONADOS = [/THREE\.Clock/, /X4122/, /willReadFrequently/, /Download the React DevTools/];

const b = await chromium.launch({ channel: 'chrome' });
const resultados = [];

async function escenario(nombre, ancho, alto, pasos) {
  const c = await b.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  await c.addCookies([cookie]);
  const p = await c.newPage();
  // **Se hace pasar por un Chrome nuevo**, y cuenta las transiciones. El
  // Chrome instalado para pruebas (157) cancela con el mensaje antiguo, «…
  // because of invalid state», que React ya reconoce y calla; los navegadores
  // del cliente dan el nuevo, con la causa pegada al final («. Document
  // hidden», «. Viewport size changed»), y ese es el que salía como error.
  // Esto le pega la causa al mensaje para que la prueba vea lo mismo que ve
  // el cliente. Con `--sin-arreglo` marca la función como ya envuelta, y el
  // script de la cabecera no se pone.
  await p.addInitScript((sinArreglo) => {
    window.__transiciones = 0;
    const nativo = Document.prototype.startViewTransition;
    if (!nativo) return;
    const imitado = function (...a) {
      window.__transiciones += 1;
      const t = nativo.apply(this, a);
      const ready = t.ready.catch((e) => {
        if (e && e.name === 'InvalidStateError') {
          throw new DOMException(`${e.message}. Viewport size changed`, 'InvalidStateError');
        }
        throw e;
      });
      Object.defineProperty(t, 'ready', { value: ready, configurable: true });
      return t;
    };
    if (sinArreglo) imitado.__tjmi = true;
    Document.prototype.startViewTransition = imitado;
  }, sinArreglo);
  const errores = [];
  p.on('response', (r) => {
    if (r.status() >= 400) errores.push(`${r.status()} ${r.url().replace(BASE, '')}`);
  });
  p.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  p.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // El aviso del navegador por una respuesta 4xx ya lo apunta, con su
    // dirección, el escuchador de respuestas.
    if (t.startsWith('Failed to load resource')) return;
    if (!PERDONADOS.some((r) => r.test(t))) errores.push(t.slice(0, 220));
  });
  try {
    await pasos(p, c);
  } catch (e) {
    errores.push(`el escenario falló: ${e.message.split('\n')[0]}`);
  }
  await p.waitForTimeout(1200);
  const transiciones = await p.evaluate(() => window.__transiciones).catch(() => '?');
  resultados.push({ nombre, errores, transiciones });
  await c.close();
}

const esperarCarga = (p) =>
  p.waitForSelector('.carga', { state: 'detached', timeout: 15000 }).catch(() => {});

// 1. La ventana cambia de tamaño mientras carga la portada (la transición de
//    los 0,84 s, cuando termina de montarse el 3D).
await escenario('portada: cambio de tamaño al cargar', 1280, 800, async (p) => {
  await p.goto(`${BASE}/es`, { waitUntil: 'commit' });
  for (let i = 0; i < 12; i++) {
    await p.waitForTimeout(150);
    await p.setViewportSize({ width: i % 2 ? 1280 : 1180, height: i % 2 ? 800 : 760 });
  }
  await esperarCarga(p);
});

// 2. Se navega con el menú y la ventana cambia de tamaño en plena transición,
//    que es lo que hace la barra de direcciones de un móvil.
await escenario('navegación: cambio de tamaño durante el fundido', 1280, 800, async (p) => {
  await p.goto(`${BASE}/es/servicios`, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  for (const destino of ['/es/nosotros', '/es/faq', '/es/contacto', '/es/blog']) {
    await p.locator(`header a[href="${destino}"]`).first().click();
    await p.waitForTimeout(40);
    await p.setViewportSize({ width: 1100, height: 760 });
    await p.waitForTimeout(60);
    await p.setViewportSize({ width: 1280, height: 800 });
    await p.waitForTimeout(900);
  }
});

// 3. La pestaña se oculta en plena transición (otra pestaña pasa delante).
await escenario('navegación: pestaña oculta durante el fundido', 1280, 800, async (p, c) => {
  await p.goto(`${BASE}/es/servicios`, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const otra = await c.newPage();
  for (const destino of ['/es/nosotros', '/es/faq']) {
    await p.bringToFront();
    await p.locator(`header a[href="${destino}"]`).first().click();
    await p.waitForTimeout(30);
    await otra.bringToFront();
    await p.waitForTimeout(700);
  }
  await p.bringToFront();
});

// 4. Dos clics seguidos en el menú, atrás y adelante.
await escenario('navegación: clics seguidos, atrás y adelante', 1280, 800, async (p) => {
  await p.goto(`${BASE}/es/servicios`, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  await p.locator('header a[href="/es/nosotros"]').first().click();
  await p.locator('header a[href="/es/faq"]').first().click({ delay: 10 });
  await p.waitForTimeout(1200);
  await p.goBack();
  await p.waitForTimeout(800);
  await p.goForward();
  await p.waitForTimeout(800);
});

// 5. El modal de servicios: abrir, cerrar con Escape, abrir otro y cerrar con el aspa.
await escenario('portada: modal de servicios', 1280, 800, async (p) => {
  await p.goto(`${BASE}/es`, { waitUntil: 'load' });
  await esperarCarga(p);
  const tarjeta = p.locator('li button', { hasText: /ver detalle/i }).first();
  await tarjeta.scrollIntoViewIfNeeded();
  await p.waitForTimeout(1500);
  await tarjeta.click({ force: true });
  await p.waitForTimeout(500);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  await tarjeta.click({ force: true });
  await p.waitForTimeout(500);
  await p.locator('dialog[open] button').first().click();
  await p.waitForTimeout(400);
});

// 6. Las flechas del carrusel de reseñas avanzan una tarjeta por clic.
await escenario('portada: flechas de reseñas', 1280, 800, async (p) => {
  await p.goto(`${BASE}/es`, { waitUntil: 'load' });
  await esperarCarga(p);
  const fila = p.locator('.reviews-track ul').first();
  if (!(await fila.count())) return; // en producción, sin reseñas, no hay sección
  await fila.scrollIntoViewIfNeeded();
  await p.waitForTimeout(1500);
  const paso = await fila.evaluate((ul) => ul.children[1].offsetLeft - ul.children[0].offsetLeft);
  await p.locator('[data-arrow="next"]').click();
  await p.waitForTimeout(900);
  const avance = await fila.evaluate((ul) => ul.scrollLeft);
  if (Math.abs(avance - paso) > 4) throw new Error(`la flecha avanzó ${avance} px y la tarjeta mide ${paso}`);
});

// 7. Una transición que tarda más de 4 s en cambiar la página (hilo principal
//    ocupado, como un móvil lento montando el 3D). Lo que llega a quien llama
//    tiene que ser el error que React reconoce y calla.
await escenario('transición que caduca', 1280, 800, async (p) => {
  await p.goto(`${BASE}/es/faq`, { waitUntil: 'load' });
  const llega = await p.evaluate(
    () =>
      new Promise((ok) => {
        const t = document.startViewTransition(() => new Promise((fin) => setTimeout(fin, 6000)));
        t.ready.then(() => ok('ready'), (e) => ok(`${e.name}: ${e.message}`));
      }),
  );
  const esperado = 'InvalidStateError: Transition was aborted because of invalid state';
  if (!sinArreglo && llega !== esperado) throw new Error(`a React le llegaría «${llega}»`);
});

let total = 0;
console.log(sinArreglo ? '\n  (sin el arreglo de las transiciones)\n' : '');
for (const r of resultados) {
  total += r.errores.length;
  console.log(`  ${r.errores.length ? 'FALLA' : 'OK  '} ${r.nombre}  ·  transiciones: ${r.transiciones}`);
  for (const e of r.errores) console.log(`         ${e}`);
}
console.log(total ? `\n  ${total} error(es).` : '\n  Ningún error en consola en ningún escenario.');
await b.close();
process.exit(total ? 1 : 0);
