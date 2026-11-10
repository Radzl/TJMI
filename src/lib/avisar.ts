/**
 * Avisar de que algo se ha caído en el navegador de un visitante.
 *
 * ## Qué problema resuelve
 *
 * Hasta ahora **no había forma de enterarse**. Si a alguien se le caía una
 * página o la escena 3D, el error se escribía en la consola de **su**
 * navegador y ahí moría. Y no es hipotético: en este proyecto un efecto de
 * postprocesado ya dejó el Canvas en negro, y la cabecera de seguridad dejó
 * el 3D muerto en producción durante un despliegue entero. Las dos veces se
 * descubrieron porque alguien fue a mirar, no porque la web lo contara.
 *
 * `CLAUDE.md` ya decía dónde engancharlo: **`marcarSin3D()` y `error.tsx` son
 * los dos únicos puntos por los que pasa un fallo de esta web.** Esto es ese
 * enganche.
 *
 * ## Lo que NO hace, que es la mitad del diseño
 *
 * - **No carga nada de terceros.** Manda a `/api/aviso`, que es nuestro. Un
 *   servicio de errores de los normales mete un script en la página y eso
 *   caería dentro del consentimiento de cookies —o sea que la mayoría no lo
 *   tendría activo justo cuando más falta hace—. Si mañana se quiere mandar a
 *   Slack o a un servicio, se hace **desde el servidor**, que es donde no
 *   molesta a nadie.
 * - **No manda datos personales.** Va el mensaje, el principio de la traza,
 *   la **ruta** (no la URL entera, por si algún día hay parámetros) y el
 *   agente del navegador. Ni cookies, ni identificadores, ni nada que escriba
 *   el visitante.
 * - **No pone ninguna cookie ni guarda nada.** Lo que recuerda —qué ya ha
 *   avisado— vive en memoria y se va al cerrar la pestaña.
 *
 * ## Y sobre todo: no puede empeorar las cosas
 *
 * Esto se ejecuta **cuando algo ya ha fallado**, así que lo último que puede
 * hacer es fallar a su vez o ponerse pesado. De ahí las tres cautelas:
 *
 * 1. **Tope por sesión.** Un bucle de render puede lanzar el mismo error
 *    cientos de veces por segundo; sin tope, el aviso sería el ataque.
 * 2. **Sin repetidos.** El mismo motivo con el mismo mensaje se manda una
 *    vez.
 * 3. **`sendBeacon` primero.** Es el único envío que el navegador se
 *    compromete a terminar aunque la pestaña se esté cerrando, que es
 *    exactamente lo que pasa cuando una página se cae y alguien se va.
 */

/** Como mucho, tres avisos por pestaña. */
const TOPE = 3;

let mandados = 0;
const vistos = new Set<string>();

type Aviso = {
  /** Qué ha pasado, en una etiqueta corta: `sin-3d`, `pagina`, `documento`. */
  motivo: string;
  /** El mensaje del error, o el motivo si no hay error. */
  mensaje: string;
  /** El `digest` de Next, cuando lo hay: es lo que permite cruzarlo con el registro del servidor. */
  digest?: string;
  /** El principio de la traza. Se recorta en el servidor. */
  traza?: string;
};

export function avisar({ motivo, mensaje, digest, traza }: Aviso): void {
  if (typeof window === 'undefined') return;
  if (mandados >= TOPE) return;

  const huella = `${motivo}:${mensaje}`;
  if (vistos.has(huella)) return;
  vistos.add(huella);
  mandados += 1;

  const cuerpo = JSON.stringify({
    motivo,
    mensaje: String(mensaje).slice(0, 500),
    digest,
    traza: traza ? String(traza).slice(0, 1200) : undefined,
    // La **ruta**, no la URL entera: hoy esta web no tiene parámetros con
    // nada dentro, pero el día que los tenga este aviso no se los lleva.
    ruta: window.location.pathname,
    agente: navigator.userAgent.slice(0, 200),
  });

  try {
    // `sendBeacon` es el único envío que el navegador termina aunque la
    // pestaña se cierre. Si no está, se usa `fetch` con `keepalive`, que
    // intenta lo mismo.
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(
        '/api/aviso',
        new Blob([cuerpo], { type: 'application/json' }),
      );
      if (ok) return;
    }

    void fetch('/api/aviso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: cuerpo,
      keepalive: true,
    }).catch(() => {
      /* si el aviso falla, no hay nada más que hacer */
    });
  } catch {
    /* lo mismo: esto corre cuando algo ya se ha roto */
  }
}
