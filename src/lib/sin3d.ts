/**
 * Las tres formas de quedarse sin escena 3D, y cómo se avisa a la página.
 *
 * ## Por qué esto no es solo un `try/catch`
 *
 * El primer intento fue poner un *error boundary* de React alrededor del
 * Canvas y darlo por hecho. **No funciona, y se comprobó**: simulando una
 * tarjeta gráfica bloqueada (devolviendo `null` en `getContext('webgl2')`),
 * three lanza «Error creating WebGL context» **fuera de la fase de render**,
 * y un boundary solo atrapa lo que ocurre dentro del render, de un
 * constructor o de un método de ciclo de vida. El error se escapaba a la
 * consola, la página se quedaba con un `<canvas>` muerto, el hero seguía
 * midiendo cuatro pantallas y no se activaba ningún respaldo.
 *
 * Así que hay tres mecanismos, uno por cada forma de fallar:
 *
 * 1. **No hay WebGL** (tarjeta en lista negra, navegador antiguo, WebGL
 *    desactivado a mano). Se comprueba **antes de montar nada**, con
 *    `soportaWebGL()`. Es el caso común y el único que se puede prevenir.
 * 2. **Se pierde el contexto** en marcha: la GPU se reinicia o el sistema se
 *    lo quita a una pestaña en segundo plano. Llega como el evento
 *    `webglcontextlost` sobre el propio canvas. Es el que deja la pantalla en
 *    negro sin dar ningún error.
 * 3. **Algo revienta construyendo la escena** —un GLB que no se puede leer,
 *    un efecto incompatible con la versión de three—. Eso sí pasa por el
 *    render, así que lo atrapa `Canvas3DBoundary`.
 *
 * Los tres acaban llamando a `marcarSin3D()`, que es lo que pone la página en
 * el modo que ya sabe funcionar sin Canvas (ver la variante `sin3d` en
 * `globals.css`).
 */

import { avisar } from './avisar';

/**
 * ¿Puede este navegador abrir un contexto WebGL?
 *
 * Se crea uno de prueba y se tira. Cuesta menos de un milisegundo y se llama
 * una sola vez, pero el contexto se suelta a propósito con
 * `WEBGL_lose_context`: los navegadores limitan cuántos contextos vivos
 * admiten a la vez, y dejar este colgando podría costarle el suyo a la escena
 * de verdad.
 */
let cache: boolean | null = null;

export function soportaWebGL(): boolean {
  // El resultado se guarda, y no es por rendimiento: `useSyncExternalStore`
  // llama a su lectura en cada render y exige que devuelva **el mismo valor**
  // mientras nada cambie. Creando un canvas nuevo cada vez, el valor sería
  // estable pero el trabajo no, y un bucle de renders infinito está a un
  // despiste de distancia.
  if (cache !== null) return cache;
  if (typeof window === 'undefined') return false;

  try {
    const prueba = document.createElement('canvas');
    const gl = (prueba.getContext('webgl2') ??
      prueba.getContext('webgl')) as WebGLRenderingContext | null;
    cache = Boolean(gl);

    if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cache = false;
  }

  return cache;
}

/**
 * El nombre del atributo, en una constante.
 *
 * Se escribe a mano y no con `dataset`, y hay un motivo:
 * `dataset.sin3d` genera `data-sin3d` —sin el guion antes del número—, que no
 * es lo que busca el selector de la hoja de estilos. Costó una pasada: el
 * atributo se ponía, la consola avisaba, y la maquetación seguía igual porque
 * el CSS miraba otro nombre.
 */
export const ATRIBUTO_SIN_3D = 'data-sin-3d';

/**
 * Pone el documento en modo «sin 3D».
 *
 * El atributo es lo único que hace falta: la hoja de estilos ya tiene escrito
 * qué significa, y lo tiene escrito **una sola vez** para los tres casos.
 */
export function marcarSin3D(motivo: string, detalle?: unknown) {
  if (typeof document === 'undefined') return;

  document.documentElement.setAttribute(ATRIBUTO_SIN_3D, 'true');

  // Queda en la consola para quien depure.
  console.warn(`[3D] la página sigue sin la escena (${motivo})`, detalle ?? '');

  // **Y se avisa al servidor, que era lo que faltaba.** Por aquí pasan los
  // tres modos de fallo del 3D, así que este es el sitio: antes, que a
  // alguien se le cayera la escena no dejaba rastro en ninguna parte. Ver
  // `lib/avisar.ts` — no carga nada de terceros y no manda datos personales.
  //
  // **El primero de los tres no es un fallo y no se avisa:** que un navegador
  // no abra WebGL es un navegador viejo o una tarjeta en lista negra, o sea
  // algo que pasa y para lo que existe el respaldo. Avisar de eso llenaría el
  // registro de cosas que no hay que arreglar y taparía las dos que sí.
  if (motivo !== 'este navegador no abre WebGL') {
    avisar({
      motivo: 'sin-3d',
      mensaje: `${motivo}${detalle instanceof Error ? `: ${detalle.message}` : ''}`,
      traza: detalle instanceof Error ? detalle.stack : undefined,
    });
  }
}

/** Deshace lo anterior. Solo lo usa el desmontaje del boundary. */
export function limpiarSin3D() {
  if (typeof document === 'undefined') return;
  document.documentElement.removeAttribute(ATRIBUTO_SIN_3D);
}
