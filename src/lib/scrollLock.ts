/**
 * Bloqueo del scroll de la página mientras hay algo encima (de momento, el
 * modal de servicios).
 *
 * ## Lo que NO hay que hacer, porque ya se hizo y rompía la página
 *
 * Esto ponía `overflow: hidden` en el `<html>`. Parecía lo obvio y tenía un
 * efecto que tardó en achacarse a esto: **al abrir un modal, la página se iba
 * al principio**. Medido, abriendo el detalle de un servicio con la página en
 * el píxel 10.200: al abrir saltaba al 1.308 y al cerrar al 0.
 *
 * El motivo es que **el elemento que hace scroll aquí es el propio `<html>`**.
 * Volverlo no desplazable no congela la posición: la deja sin sitio donde
 * estar, y el navegador la recorta. El alto del documento no cambia —se
 * comprobó, 16.283 px antes y después—, lo que se pierde es el desplazamiento.
 *
 * ## Lo que se hace ahora
 *
 * **Con Lenis montado basta con pararlo.** Lenis engancha la rueda y el dedo
 * en toda la página y les hace `preventDefault` para mover el scroll él mismo;
 * parado, sigue cancelando el evento, así que la página no se mueve por sí
 * sola. No hace falta tocar el `overflow` para nada, y por eso ya no se toca.
 * (El panel del modal se libra con `data-lenis-prevent`, que es lo que le deja
 * hacer scroll a él.)
 *
 * **Sin Lenis sí hace falta otra cosa**, porque entonces no hay nadie
 * cancelando la rueda: con movimiento reducido `SmoothScroll` no llega a
 * montarlo. Ahí se usa la técnica del cuerpo fijo, que **sí conserva la
 * posición** porque la guarda en un `top` negativo y la devuelve al soltar.
 *
 * Se lleva la cuenta de cuántos bloqueos hay abiertos para que cerrar uno no
 * desbloquee lo que haya abierto otro.
 */

type Scroller = { stop: () => void; start: () => void };

let scroller: Scroller | null = null;
let locks = 0;
/** Dónde estaba la página al bloquear, para devolverla ahí. */
let saved = 0;
/** Si hubo que recurrir al cuerpo fijo, para deshacer solo lo que se hizo. */
let pinnedBody = false;

/** Lo llama `SmoothScroll` al crear y al destruir la instancia de Lenis. */
export function registerScroller(next: Scroller | null) {
  scroller = next;
}

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;

  saved = window.scrollY;

  if (scroller) {
    scroller.stop();
    return;
  }

  // Sin scroll suave no hay nadie cancelando la rueda, así que hay que fijar
  // el cuerpo. El `top` negativo es lo que conserva la posición: el documento
  // se queda quieto, pero exactamente donde estaba.
  const { body } = document;
  body.style.position = 'fixed';
  body.style.top = `-${saved}px`;
  body.style.left = '0';
  body.style.right = '0';
  pinnedBody = true;
}

export function unlockScroll() {
  if (locks === 0) return;
  locks -= 1;
  if (locks > 0) return;

  if (pinnedBody) {
    const { body } = document;
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    pinnedBody = false;
    window.scrollTo(0, saved);
    return;
  }

  scroller?.start();
}
