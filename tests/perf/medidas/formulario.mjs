/**
 * El formulario de presupuesto, de principio a fin y en el navegador.
 *
 * La ruta ya tiene su propia comprobación (`presupuesto.mjs`); esto mira lo
 * otro: que los tres pasos se recorran, que no deje pasar sin consentimiento,
 * que el botón se bloquee mientras envía y que **el desenlace sea el que
 * toca**.
 *
 * Sin claves de correo configuradas —que es como está hoy— el final correcto
 * es **WhatsApp**: la solicitud no se pierde, que es justo lo que este cambio
 * tenía que garantizar.
 *
 * Uso: node tests/perf/medidas/formulario.mjs [url]
 */
import { chromium } from 'playwright-core';

const URL = process.argv[2] ?? 'http://localhost:3000/es/contacto';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 1200 },
  deviceScaleFactor: 1,
});
await ctx.addInitScript(() => {
  document.cookie = `tjmi_consent=${encodeURIComponent(
    JSON.stringify({ version: 1, date: new Date().toISOString(), maps: false }),
  )};path=/`;
});

const page = await ctx.newPage();

// WhatsApp se abre en una pestaña nueva. Se queda apuntada y se cierra, que
// si no el navegador se llena de pestañas.
let whatsapp = null;
ctx.on('page', async (nueva) => {
  whatsapp = nueva.url();
  await nueva.close().catch(() => {});
});

const casos = [];
const comprobar = (nombre, bien, visto = '') => {
  casos.push(bien);
  console.log(`  ${bien ? 'OK  ' : 'MAL '} ${nombre.padEnd(44)} ${visto}`);
};

await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(1200);

const form = page.locator('form').first();

// ── El señuelo ───────────────────────────────────────────────────────────
//
// **Dos cosas que no valen aquí, y las dos dieron falso fallo.**
//
// 1. `isVisible()`: `sr-only` deja una caja de 1 × 1 px recortada, y para
//    Playwright eso sigue contando como visible.
// 2. Medir la caja **del propio campo**: sale 174 × 24, porque quien recorta
//    no es el campo, es su contenedor. El campo conserva su tamaño natural
//    dentro de un padre de 1 px con `overflow: hidden`.
//
// Lo que sí dice la verdad es la caja **del contenedor que recorta**, más el
// `aria-hidden` y que no llegue por tabulador.
{
  const senuelo = form.locator('#empresa-web');
  const hay = (await senuelo.count()) === 1;
  const medida = hay
    ? await senuelo.evaluate((el) => {
        const caja = el.closest('[aria-hidden="true"]');
        const r = caja?.getBoundingClientRect();
        return {
          ancho: Math.round(r?.width ?? 999),
          alto: Math.round(r?.height ?? 999),
          recorta: caja ? getComputedStyle(caja).overflow === 'hidden' : false,
          fuera: el.tabIndex === -1,
        };
      })
    : null;

  const escondido = Boolean(
    medida &&
      medida.ancho <= 2 &&
      medida.alto <= 2 &&
      medida.recorta &&
      medida.fuera,
  );

  comprobar(
    'el señuelo existe y no lo ve nadie',
    hay && escondido,
    medida
      ? `contenedor ${medida.ancho}×${medida.alto} px, recorta: ${medida.recorta}, fuera del tabulador: ${medida.fuera}`
      : '(no existe)',
  );
}

// ── Paso 1 ───────────────────────────────────────────────────────────────
await form.locator('input[name="pallets"]').fill('6');
await form.locator('textarea[name="details"]').fill('Comprobación automática.');
await form.getByRole('button', { name: /siguiente/i }).click();
await page.waitForTimeout(400);

// ── Paso 2 ───────────────────────────────────────────────────────────────
await form.locator('input[name="origin"]').fill('Onda, Castellón');
await form.locator('input[name="destination"]').fill('Fuenlabrada, Madrid');
await form.getByRole('button', { name: /siguiente/i }).click();
await page.waitForTimeout(400);

comprobar(
  'los tres pasos se recorren',
  await form.locator('input[name="email"]').isVisible(),
);

// ── Paso 3, primero SIN consentimiento ───────────────────────────────────
await form.locator('input[name="name"]').fill('Prueba Automática');
await form.locator('input[name="email"]').fill('prueba@example.com');
await form.locator('input[name="phone"]').fill('600000000');

await form.getByRole('button', { name: /enviar solicitud/i }).click();
await page.waitForTimeout(900);

comprobar(
  'sin consentimiento no envía',
  (await page.locator('[role="status"]').count()) === 0 && whatsapp === null,
);

// ── Ahora sí ─────────────────────────────────────────────────────────────
await form.locator('input[name="consent"]').check();
await form.getByRole('button', { name: /enviar solicitud/i }).click();

// El botón tiene que bloquearse mientras va. Se mira enseguida, porque sin
// claves configuradas la respuesta llega en milisegundos.
const bloqueado = await form
  .locator('button[type="submit"]')
  .isDisabled()
  .catch(() => false);

await page.waitForTimeout(2500);

const aviso = (await page.locator('[role="status"]').textContent()) ?? '';

comprobar(
  'el botón se bloquea al enviar',
  bloqueado,
  bloqueado ? '' : '(puede ir muy rápido)',
);
comprobar(
  'sale un aviso al terminar',
  aviso.trim().length > 0,
  aviso.trim().slice(0, 52),
);
comprobar(
  'sin correo configurado, cae a WhatsApp',
  // Ojo: `wa.me` redirige a `api.whatsapp.com`, así que la URL que se ve
  // abierta no es la que se pidió. Buscar solo `wa.me` daba un falso fallo.
  Boolean(whatsapp && /whatsapp|wa\.me/.test(whatsapp)),
  whatsapp ? whatsapp.slice(0, 46) + '…' : '(no se abrió)',
);
comprobar(
  'y el mensaje de WhatsApp lleva los datos',
  Boolean(whatsapp && decodeURIComponent(whatsapp).includes('Fuenlabrada')),
);

const fallos = casos.filter((x) => !x).length;
console.log('');
console.log(
  fallos === 0
    ? '  El formulario hace todo el recorrido y no pierde la solicitud.'
    : `  ${fallos} comprobación(es) han fallado.`,
);

await browser.close();
process.exit(fallos === 0 ? 0 : 1);
