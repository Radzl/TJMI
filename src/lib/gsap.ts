import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useSyncExternalStore } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);
  // **En el móvil, la barra del navegador no recoloca nada.** Al bajar, la
  // barra de direcciones se esconde y la ventana gana alto; sin esto,
  // ScrollTrigger lo toma por un cambio de tamaño y recalcula todos los
  // disparadores en mitad del gesto, que es un saltito en la intro. Las
  // secciones miden en `svh` (el alto con la barra puesta), así que no hay
  // nada que recalcular: el cambio de alto se puede ignorar sin perder nada.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText };

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Atajo para respetar la preferencia del sistema de reducir movimiento. */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(REDUCED_MOTION).matches
  );
}

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

const readMotion = () => window.matchMedia(REDUCED_MOTION).matches;
/** En el servidor no se puede saber: se asume que sí hay movimiento. */
const readMotionOnServer = () => false;

/**
 * La misma preferencia, pero reactiva y válida dentro de un componente. Se usa
 * para decidir si el 3D llega a montarse siquiera.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    readMotion,
    readMotionOnServer,
  );
}
