/**
 * Llamadas de dibujo de la intro 3D: cuántas son y a qué pieza se van.
 *
 * **Por qué esta medida y no los fotogramas por segundo.** Los fotogramas
 * dependen de lo ocupada que esté la máquina —tres pasadas seguidas al mismo
 * código han dado 26, 38 y 37 fps—. Las llamadas de dibujo no: salen iguales
 * hoy y dentro de un mes, así que son lo que se puede comparar entre sesiones.
 *
 * Hace dos cosas:
 *
 *  1. Recorre la intro parándose en varios puntos y dice cuántas llamadas cae
 *     por fotograma en cada uno.
 *  2. Con `--desglose`, se para en el peor punto y apaga cada grupo de primer
 *     nivel de la escena de uno en uno para ver cuánto cuesta cada pieza.
 *
 * **Cómo llega hasta la escena sin tocar el código de la web.** three avisa de
 * cada `Scene` y de cada renderizador que crea a través de
 * `__THREE_DEVTOOLS__`, si existe. Basta con definirlo antes de que cargue la
 * página para quedarse con la escena en la mano.
 *
 * Dos trampas, las dos pisadas:
 *
 *  - **Apagar `visible` no sirve en los grupos que `Scene.tsx` gobierna por
 *    fotograma** (el patio, las naves): se vuelven a encender solos y el
 *    desglose les da cero. Esos hay que leerlos por diferencia.
 *  - **Una pasada que no se ve no se apaga con `visible`.** Así se encontró el
 *    `<ContactShadows>` de drei, que renderizaba la escena entera otra vez en
 *    cada fotograma: el desglose del camión daba 332 llamadas para 97 mallas,
 *    y esa cuenta solo cuadra si todo se dibuja dos veces.
 *
 * Uso, con `next start` levantado:
 *   node tests/perf/medidas/llamadas.mjs [http://localhost:3100] [--desglose]
 */
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const BASE = args.find((a) => a.startsWith('http')) ?? 'http://localhost:3100';
const DESGLOSE = args.includes('--desglose');

const INICIO = `
  (() => {
    const bus = new EventTarget();
    window.__THREE_DEVTOOLS__ = bus;
    window.__escenas = [];
    bus.addEventListener('observe', (e) => {
      const o = e.detail;
      if (o && o.isScene) window.__escenas.push(o);
    });

    let cuenta = 0;
    window.__porFotograma = [];
    for (const Clase of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
      if (!Clase) continue;
      for (const metodo of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
        const original = Clase.prototype[metodo];
        if (!original) continue;
        Clase.prototype[metodo] = function (...a) {
          cuenta += 1;
          return original.apply(this, a);
        };
      }
    }
    const paso = () => {
      window.__porFotograma.push(cuenta);
      if (window.__porFotograma.length > 300) window.__porFotograma.shift();
      cuenta = 0;
      requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  })();
`;

/** Los puntos donde se mide: escena del guion, fracción de su sección y nombre. */
const PUNTOS = [
  ['1', 0.02, 'patio en reposo'],
  ['1', 0.3, 'carretilla acercándose'],
  ['1', 0.6, 'lona abierta'],
  ['1', 0.9, 'primer plano'],
  ['3', 0.05, 'camión arrancando'],
  ['3', 0.2, 'camión rodando'],
  ['3', 0.6, 'azul noche'],
  ['5', 0.45, 'carretera, media ruta'],
  ['5', 0.8, 'carretera, llegando'],
];

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

async function abrir(ancho, alto) {
  const ctx = await browser.newContext({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
  });
  // El consentimiento se escribe antes de cargar, como en `check:3d`.
  await ctx.addCookies([
    {
      name: 'tjmi_consent',
      value: encodeURIComponent(
        JSON.stringify({ version: 1, date: new Date().toISOString(), maps: false }),
      ),
      domain: new URL(BASE).hostname,
      path: '/',
    },
  ]);
  await ctx.addInitScript(INICIO);
  const page = await ctx.newPage();
  await page.goto(BASE + '/es', { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 20000 });
  await page.waitForTimeout(5000);
  return { ctx, page };
}

async function ir(page, escena, fraccion) {
  await page.evaluate(
    ([e, f]) => {
      const s = document.querySelector('[data-scene="' + e + '"]');
      const y =
        s.getBoundingClientRect().top +
        window.scrollY +
        (s.offsetHeight - window.innerHeight) * f;
      window.scrollTo(0, y);
    },
    [escena, fraccion],
  );
  // El scrub tarda un segundo en alcanzar al scroll y los muelles algo más.
  await page.waitForTimeout(3000);
}

async function medir(page) {
  await page.evaluate(() => {
    window.__porFotograma.length = 0;
  });
  await page.waitForTimeout(500);
  return page.evaluate(() => {
    const o = window.__porFotograma.slice().sort((a, b) => a - b);
    return o[Math.floor(o.length / 2)] ?? 0;
  });
}

let peor = { llamadas: 0, escena: '1', fraccion: 0.6 };

for (const [nombre, ancho, alto] of [
  ['escritorio', 1280, 900],
  ['móvil', 390, 844],
]) {
  const { ctx, page } = await abrir(ancho, alto);
  console.log('');
  console.log(`  ${nombre} ${ancho}x${alto}`);
  for (const [escena, fraccion, etiqueta] of PUNTOS) {
    await ir(page, escena, fraccion);
    const n = await medir(page);
    console.log(`    ${etiqueta.padEnd(26)} ${String(n).padStart(4)}`);
    if (nombre === 'escritorio' && n > peor.llamadas) {
      peor = { llamadas: n, escena, fraccion };
    }
  }
  await ctx.close();
}

if (DESGLOSE) {
  const { ctx, page } = await abrir(1280, 900);
  await ir(page, peor.escena, peor.fraccion);
  const total = await medir(page);

  // La escena buena es la que tiene más hijos: el `Environment` monta la suya.
  const grupos = await page.evaluate(() => {
    const escena = window.__escenas.sort((a, b) => b.children.length - a.children.length)[0];
    window.__escena = escena;
    return escena.children.map((hijo, i) => {
      let mallas = 0;
      let instanciadas = 0;
      let proyectan = 0;
      const nombres = new Set();
      hijo.traverse((o) => {
        if (!o.isMesh) return;
        mallas += 1;
        if (o.isInstancedMesh) instanciadas += 1;
        if (o.castShadow) proyectan += 1;
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        if (m && m.name) nombres.add(m.name);
      });
      return {
        i,
        tipo: hijo.type,
        visible: hijo.visible,
        mallas,
        instanciadas,
        proyectan,
        pista: [...nombres].slice(0, 3).join(', '),
      };
    });
  });

  console.log('');
  console.log(`  desglose en el peor punto (${total} llamadas)`);
  console.log('     #  mallas  inst  sombra  llamadas  pista');
  for (const g of grupos) {
    if (!g.mallas) continue;
    await page.evaluate((i) => {
      window.__escena.children[i].visible = false;
    }, g.i);
    const sin = await medir(page);
    await page.evaluate(
      ([i, v]) => {
        window.__escena.children[i].visible = v;
      },
      [g.i, g.visible],
    );
    console.log(
      `    ${String(g.i).padStart(2)}  ${String(g.mallas).padStart(6)} ${String(g.instanciadas).padStart(5)} ${String(g.proyectan).padStart(7)} ` +
        `${String(total - sin).padStart(9)}  ${g.pista.slice(0, 50)}`,
    );
  }
  await ctx.close();
}

await browser.close();
