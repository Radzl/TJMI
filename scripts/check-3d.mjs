// Regresión visual de la intro 3D.
//
// # Qué problema resuelve
//
// La intro está gobernada por un puñado de constantes que dependen unas de
// otras: el alcance de la niebla por vista, el encuadre del primer plano, el
// reparto del scroll entre escenas. Tocar una
// mueve otras, y el fallo **no rompe nada**: compila, pasa el lint y el build,
// y simplemente se ve mal tres pantallazos más abajo. Hasta ahora eso se
// cazaba a ojo, mirando capturas de una en una, y a ojo se escapan cosas.
//
// Esto recorre la portada parándose en puntos fijos de la intro, captura, y
// compara contra unas capturas de referencia versionadas en el repositorio.
//
// # Las tres decisiones que lo hacen funcionar
//
// **1. Los puntos de parada se anclan a las secciones, no a píxeles.** Un
// `scrollY` absoluto queda inservible en cuanto cambia la altura de algo más
// arriba, y en este proyecto eso pasa constantemente. Cada toma se define como
// «la escena 5, al 40 % de su recorrido», y el sitio exacto se calcula en cada
// pasada leyendo el DOM. Las anclas son los `data-scene` que ya llevaban las
// secciones.
//
// **2. Espera a que la escena se pare, no un tiempo fijo.** Los disparadores
// van con `scrub: 1`, así que la escena llega **tarde** al scroll a propósito,
// y encima los muelles amortiguados se asientan despacio. Un `sleep(2000)`
// capturaría a veces antes y a veces después, y el script fallaría solo. Aquí
// se captura en bucle hasta que dos fotogramas seguidos son casi iguales.
//
// **3. Hay tolerancia, y no es pereza.** La carga respira y las ruedas giran:
// la escena **nunca** se queda absolutamente quieta. Sin tolerancia, todas las
// tomas fallarían siempre y el aviso dejaría de mirarse, que es la forma
// habitual de que una herramienta así acabe desinstalada. El umbral está
// puesto por encima del ruido del ralentí y muy por debajo de cualquier
// cambio que se vea.
//
// # Por qué estas dependencias
//
// `playwright-core` y no `playwright`: el segundo se descarga su propio
// Chromium al instalarlo, y en este equipo Control de aplicaciones de Windows
// ya bloquea binarios, y durante un tiempo eso obligo a compilar con
// `--webpack`. Ya no: con Next 16.4.5 Turbopack arranca.
// `playwright-core` no descarga nada y se le dice que use el Chrome que ya
// está instalado.
//
// `pngjs` y `pixelmatch` son JavaScript puro, sin nada nativo. Aquí sí tocaba
// usar librería: en `check-media.mjs` se leen cuatro bytes de cabecera a mano
// porque es razonable, pero escribir un decodificador de PNG a mano no lo es.

import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.CHECK_3D_URL ?? 'http://localhost:3000/es';
const BASELINE_DIR = 'tests/visual/baseline';
const OUTPUT_DIR = 'tests/visual/salida';

/** Reescribe las referencias en vez de comparar. */
const UPDATE = process.argv.includes('--update');

const DESKTOP = { name: 'pc', width: 1280, height: 800 };
const MOBILE = { name: 'movil', width: 390, height: 844 };

/**
 * Las tomas.
 *
 * `scene` es el `data-scene` de la sección y `at` la fracción de su recorrido.
 * El nombre sale en el informe, así que dice qué se está mirando y no un
 * número: cuando algo falla, lo primero que se quiere saber es qué momento de
 * la intro se ha roto.
 */
// **Las del hero se reapuntaron con D3 (2026-11-18).** El hero empieza ahora
// con la entrada del camión, que se lleva el primer 20 % (`ENTRADA` en
// `src/lib/partitura.ts`), y la carga va detrás. Las tomas de la carga siguen
// en el mismo momento de antes: fracción = 0,2 + 0,8 · antigua. Si cambia
// `ENTRADA`, hay que rehacerlas igual **y mirar las capturas**.
const SHOTS = [
  { id: 'patio-reposo', scene: 1, at: 0.02, label: 'El camión entrando, antes de tocar nada' },
  { id: 'camion-girando', scene: 1, at: 0.1, label: 'El camión girando, doblado por el enganche' },
  { id: 'grua-maniobra', scene: 1, at: 0.44, label: 'La carretilla acercando la carga' },
  { id: 'lona-abierta', scene: 1, at: 0.64, label: 'La lona abierta y el lote entrando' },
  { id: 'primer-plano', scene: 1, at: 0.944, label: 'Primer plano del camión' },
  // **Las de la escena 3 se reapuntaron al arreglar el parpadeo del camión.**
  // Su disparador empezaba una pantalla antes de la sección y ahora empieza
  // en la sección misma, así que la misma fracción de sección ya no cae en el
  // mismo momento de la coreografía. Los valores de aquí son los que vuelven
  // a dejar cada toma en el momento que dice su etiqueta; están calculados, no
  // probados a ojo: fracción = (0,29 + 0,42·antigua) / 0,71. Si alguien vuelve
  // a mover el arranque o el alto de `InRoute`, hay que rehacerlos **y mirar
  // las capturas**, que una etiqueta que ya no describe lo que mide es peor
  // que no tener la toma.
  // **Reapuntadas otra vez al adelantar el relevo de `InRoute`.** El camión
  // sale ahora en 0,30–0,40 de la escena y el azul llena en 0,40–0,50, así que
  // las fracciones de antes caían todas después del relevo y tres de las
  // cuatro etiquetas dejaron de describir lo que medían. Recordatorio de por
  // qué hay que rehacerlas: una toma se sitúa por fracción de la **sección** y
  // la coreografía va por fracción del **disparador**; mientras no se toque
  // nada da igual, pero en cuanto se mueve una, dejan de coincidir.
  { id: 'camion-centrado', scene: 3, at: 0.25, label: 'El camión centrado, con el azul ya montado' },
  { id: 'camion-listando', scene: 3, at: 0.39, label: 'Rodando centrado mientras se lista' },
  { id: 'camion-saliendo', scene: 3, at: 0.52, label: 'Saliendo por la derecha' },
  { id: 'azul-noche', scene: 3, at: 0.78, label: 'El azul noche ya lo llena todo' },

  // Hubo tres tomas más, de la carretera en cenital (escena 5), que se
  // buscaban por kilómetro. La escena se quitó y con ella las tomas y el
  // buscador: la intro acaba en `InRoute`, y la toma `azul-noche` es su
  // último fotograma.
];

/** En móvil solo las que de verdad cambian: el encuadre del patio. */
const MOBILE_SHOTS = new Set([
  'patio-reposo',
  'primer-plano',
]);

/**
 * Cuánta diferencia se tolera, en porcentaje de píxeles cambiados.
 *
 * `SETTLE` es para dar por parada la escena: por debajo de eso ya solo se
 * mueven la respiración de la carga y las ruedas. `FAIL` es el umbral del
 * informe. Entre los dos hay margen de sobra, que es lo que evita los falsos
 * positivos sin dejar pasar nada que se vea.
 */
const SETTLE = 0.08;
const FAIL = 1;

/** Cuánto se espera como mucho a que una toma se quede quieta. */
const SETTLE_TRIES = 14;
const SETTLE_WAIT = 320;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Porcentaje de píxeles distintos entre dos PNG del mismo tamaño. */
function compare(aBuffer, bBuffer, { wantDiff = false } = {}) {
  const a = PNG.sync.read(aBuffer);
  const b = PNG.sync.read(bBuffer);

  if (a.width !== b.width || a.height !== b.height) {
    return { ratio: 100, sizeChanged: true, a, b, diff: null };
  }

  const diff = wantDiff ? new PNG({ width: a.width, height: a.height }) : null;
  // `threshold` es por píxel: cuánto tiene que cambiar un color para contar.
  // 0.12 deja pasar el ruido de compresión y las sombras suaves, que en una
  // escena 3D bailan un punto entre fotogramas aunque no se mueva nada.
  const changed = pixelmatch(
    a.data,
    b.data,
    diff ? diff.data : null,
    a.width,
    a.height,
    { threshold: 0.12 },
  );

  return {
    ratio: (changed / (a.width * a.height)) * 100,
    sizeChanged: false,
    a,
    b,
    diff,
  };
}

/**
 * Lleva la página al punto de la toma y espera a que la escena se pare.
 *
 * Devuelve la captura y cuántos intentos hicieron falta, que es un dato útil:
 * si una toma necesita siempre el máximo, es que no llega a asentarse y el
 * punto de parada está mal elegido.
 */
async function capture(page, shot) {
  let target;

  {
    target = await page.evaluate((s) => {
      const section = document.querySelector(`[data-scene="${s.scene}"]`);
      if (!section) return null;
      // El recorrido útil de una sección `sticky` es su alto menos una
      // pantalla: la última ya no mueve nada porque el bloque se ha soltado.
      const run = Math.max(1, section.offsetHeight - window.innerHeight);
      return Math.round(section.offsetTop + run * s.at);
    }, shot);
  }

  if (target === null || target === undefined) {
    throw new Error(
      `No encuentro dónde situar la toma «${shot.id}» (escena ${shot.scene}).`,
    );
  }

  await page.evaluate((y) => window.scrollTo(0, y), target);

  let previous = null;
  let settled = null;
  for (let attempt = 1; attempt <= SETTLE_TRIES; attempt++) {
    await sleep(SETTLE_WAIT);
    const frame = await page.screenshot({ type: 'png' });

    if (previous) {
      const { ratio } = compare(previous, frame);
      if (ratio < SETTLE) {
        settled = { frame, attempts: attempt, target };
        break;
      }
    }
    previous = frame;
  }

  const result = settled ?? {
    frame: previous,
    attempts: SETTLE_TRIES,
    target,
    restless: true,
  };

  return result;
}

async function main() {
  if (!existsSync('package.json')) {
    throw new Error('Ejecuta esto desde la raíz del proyecto.');
  }

  await mkdir(BASELINE_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    // El Chrome que ya está instalado. Nada que descargar.
    channel: 'chrome',
  });

  const results = [];

  try {
    for (const viewport of [DESKTOP, MOBILE]) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        // Fijo a 1: con la escala del sistema, la misma página da capturas de
        // distinto tamaño en dos equipos y no habría referencia que valiera.
        deviceScaleFactor: 1,
        // El 3D no se monta con movimiento reducido, así que aquí se pide
        // explícitamente el normal y no se depende de lo que tenga el equipo.
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();

      try {
        await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60_000 });
      } catch {
        throw new Error(
          `No hay nadie escuchando en ${BASE_URL}.\n` +
            'Levanta el servidor antes:  npm run dev',
        );
      }

      // El banner de cookies se comía un quinto de cada captura, y taparlo con
      // CSS no valía: hay que acertar con el selector y, el día que cambie el
      // marcado, las referencias se invalidan por algo que no tiene nada que
      // ver con el 3D.
      //
      // Lo correcto es **entrar ya decidido**: se escribe la misma cookie que
      // escribiría alguien que ya ha contestado, así que el banner no llega a
      // montarse. Se rechazan los mapas, que es lo que elegiría la mayoría y
      // lo que deja la página más parecida a su estado normal.
      await context.addCookies([
        {
          name: 'tjmi_consent',
          value: encodeURIComponent(
            JSON.stringify({
              maps: false,
              version: 1,
              date: new Date().toISOString(),
            }),
          ),
          url: BASE_URL,
        },
      ]);

      // El Canvas tarda en pintar el primer fotograma. Sin esta espera, la
      // primera toma sale del crema vacío y la referencia nace mal.
      //
      // Lleva un reintento con recarga porque **ya falló una vez**, y en el
      // sitio menos evidente: el pase de escritorio terminó bien y el de móvil
      // se quedó sin canvas. Es un servidor de desarrollo compilando la página
      // para un contexto nuevo, no un fallo del 3D. Un arnés de regresión que
      // falla solo de vez en cuando se deja de mirar a la tercera, así que
      // antes de dar error se intenta otra vez.
      for (let attempt = 1; ; attempt++) {
        try {
          await page.waitForFunction(() => !!document.querySelector('canvas'), {
            timeout: 45_000,
          });
          break;
        } catch {
          if (attempt >= 2) {
            throw new Error(
              `El Canvas no llegó a montarse en ${viewport.name} después de dos intentos.\n` +
                'Abre la página a mano y mira la consola del navegador.',
            );
          }
          await page.reload({ waitUntil: 'load' });
        }
      }
      // La pantalla de carga tapa la portada hasta que el 3D ha descargado
      // (`PantallaCarga`). Se espera a que se quite del todo: capturar con ella
      // delante daría un fallo en todas las tomas que no lo es.
      await page
        .waitForSelector('.carga', { state: 'detached', timeout: 15_000 })
        .catch(() => {});
      await sleep(3500);

      const shots = SHOTS.filter(
        (s) => viewport.name === 'pc' || MOBILE_SHOTS.has(s.id),
      );

      for (const shot of shots) {
        const name = `${shot.id}-${viewport.name}.png`;
        const baselinePath = path.join(BASELINE_DIR, name);
        const { frame, attempts, restless } = await capture(page, shot);

        if (UPDATE || !existsSync(baselinePath)) {
          await writeFile(baselinePath, frame);
          results.push({
            name,
            label: shot.label,
            viewport: viewport.name,
            status: UPDATE ? 'actualizada' : 'nueva',
            attempts,
            restless,
          });
          continue;
        }

        const baseline = await readFile(baselinePath);
        const { ratio, sizeChanged, diff } = compare(baseline, frame, {
          wantDiff: true,
        });

        const limit = FAIL;
        if (ratio >= limit) {
          await writeFile(path.join(OUTPUT_DIR, `actual-${name}`), frame);
          if (diff) {
            await writeFile(
              path.join(OUTPUT_DIR, `diff-${name}`),
              PNG.sync.write(diff),
            );
          }
        }

        results.push({
          name,
          label: shot.label,
          viewport: viewport.name,
          status: ratio >= limit ? 'cambiada' : 'igual',
          ratio,
          sizeChanged,
          attempts,
          restless,
        });
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  report(results);
}

function report(results) {
  const pad = (s, n) => String(s).padEnd(n);
  const changed = results.filter((r) => r.status === 'cambiada');
  const fresh = results.filter(
    (r) => r.status === 'nueva' || r.status === 'actualizada',
  );
  const restless = results.filter((r) => r.restless);

  console.log('');
  for (const r of results) {
    const mark =
      r.status === 'cambiada' ? '✗' : r.status === 'igual' ? '·' : '+';
    const amount =
      r.ratio === undefined
        ? r.status
        : r.sizeChanged
          ? 'cambia de tamaño'
          : `${r.ratio.toFixed(2)} % distinto`;
    console.log(
      `  ${mark} ${pad(r.name, 34)} ${pad(amount, 20)} ${r.label}`,
    );
  }
  console.log('');

  if (restless.length) {
    console.log(
      `  ${restless.length} toma(s) no llegaron a quedarse quietas. ` +
        'Si se repite, ese punto de parada cae en mitad de un movimiento ' +
        'y conviene moverlo.',
    );
    console.log('');
  }

  if (fresh.length) {
    console.log(
      `  ${fresh.length} referencia(s) escritas en ${BASELINE_DIR}.`,
    );
    console.log(
      '  Míralas antes de hacer commit: una referencia mala da por bueno un fallo para siempre.',
    );
    console.log('');
  }

  if (!changed.length) {
    if (!fresh.length) console.log('  La intro 3D se ve igual que en las referencias.\n');
    return;
  }

  console.log(`  ${changed.length} toma(s) han cambiado.`);
  console.log(`  Las capturas y los mapas de diferencias están en ${OUTPUT_DIR}.`);
  console.log('');
  console.log('  Si el cambio es el que buscabas:  npm run check:3d -- --update');
  console.log('');
  process.exitCode = 1;
}

main().catch((error) => {
  console.error('\n  ' + error.message + '\n');
  process.exitCode = 1;
});
