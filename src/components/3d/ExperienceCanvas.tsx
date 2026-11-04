'use client';

import dynamic from 'next/dynamic';
import { useEffect, useSyncExternalStore } from 'react';
import { useReducedMotion } from '@/lib/gsap';
import { marcarSin3D, soportaWebGL } from '@/lib/sin3d';
import Canvas3DBoundary from './Canvas3DBoundary';
import ScrollChoreography from './ScrollChoreography';

// Todo el 3D se carga solo en cliente: nada de WebGL en el render del servidor.
const Experience = dynamic(() => import('./Experience'), { ssr: false });

/**
 * Decide si esta visita lleva escena 3D, y si no la lleva, lo dice.
 *
 * Hay dos motivos para no montarla, y los dos piden exactamente lo mismo de
 * la maquetación:
 *
 *  - **El sistema pide reducir movimiento.** Además de accesibilidad es
 *    ahorro de batería en móviles viejos.
 *  - **El navegador no puede con WebGL**: tarjeta en lista negra, navegador
 *    antiguo, o WebGL desactivado a mano.
 *
 * En los dos casos las secciones de la portada se apañan solas con la
 * variante `sin3d:` de Tailwind.
 *
 * ## La comprobación va antes de montar, y esa es toda la gracia
 *
 * Se intentó primero con un *error boundary* a secas y **no vale**: three
 * lanza «Error creating WebGL context» fuera de la fase de render, así que el
 * boundary no se entera. Comprobado simulando una tarjeta bloqueada: el error
 * se escapaba, quedaba un `<canvas>` muerto y el hero seguía midiendo cuatro
 * pantallas de nada.
 *
 * Por eso el primer render no pinta nada: espera un tick a saber si hay
 * WebGL. No cuesta nada —`Experience` ya se carga aparte y solo en cliente—
 * y garantiza que three no llega a arrancar donde no puede.
 *
 * El boundary sigue puesto, pero para lo otro: lo que sí revienta dentro del
 * render, como un GLB que no se puede leer.
 *
 * ## La coreografía va dentro del mismo boundary
 *
 * A propósito: sin Canvas no tiene a quién escribirle, y dejarla viva solo
 * serviría para mantener fijadas unas secciones que ya no enseñan nada. Al
 * desmontarla, sus disparadores de scroll se recogen solos.
 */
export default function ExperienceCanvas() {
  const reducedMotion = useReducedMotion();

  // Va con `useSyncExternalStore` y no con un `useState` dentro de un efecto,
  // que es la forma antigua: así no hay un render de más ni avisos de
  // hidratación. Es el mismo patrón que usan el consentimiento y el modal de
  // servicios.
  //
  // Son **tres** estados y no dos, y esto costó una pasada: en el servidor no
  // se puede saber si hay WebGL, así que el valor de partida no puede ser
  // `false`. Puesto a `false`, el primer render del navegador —el de la
  // hidratación— marcaba la página como «sin 3D» en todas las visitas, y
  // nadie lo volvía a quitar. `null` significa «todavía no se sabe».
  const webgl = useSyncExternalStore<boolean | null>(
    () => () => {},
    soportaWebGL,
    () => null,
  );

  useEffect(() => {
    if (!reducedMotion && webgl === false) {
      marcarSin3D('este navegador no abre WebGL');
    }
  }, [reducedMotion, webgl]);

  if (reducedMotion || webgl !== true) return null;

  return (
    <Canvas3DBoundary>
      <Experience />
      <ScrollChoreography />
    </Canvas3DBoundary>
  );
}
