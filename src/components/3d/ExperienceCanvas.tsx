'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from '@/lib/gsap';
import { marcarSin3D, soportaWebGL } from '@/lib/sin3d';
import Canvas3DBoundary from './Canvas3DBoundary';
import ScrollChoreography from './ScrollChoreography';

/**
 * Tope de espera antes de montar la escena, en milisegundos.
 *
 * Es el seguro de `requestIdleCallback`: en una pestaña que no se queda
 * quieta nunca puede no llegar jamás. Mismo criterio que el tope de 4 s del
 * `Preloader`, solo que más corto, porque aquí no se está esperando a que
 * descargue nada: se está esperando un hueco que normalmente llega en el
 * primer cuadro libre.
 */
const TOPE_ARRANQUE = 1200;

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

  // **El 3D no se carga hasta que el navegador tiene un hueco libre.**
  //
  // Medido en una compilación de producción con el móvil frenado: el texto
  // del hero tardaba **6,2 s** en pintarse, y de eso solo 0,45 era el
  // servidor; los otros **5,7 s eran «render delay»**, o sea el párrafo
  // esperando a que el hilo principal lo dejara pintar. Y lo que lo ocupaba
  // son **8,8 s de evaluación de JavaScript**, con un solo trozo de 1,1 MB
  // —three, r3f, drei y el postprocesado— que bloquea casi un segundo.
  //
  // `dynamic(..., { ssr: false })` ya parte ese trozo en un archivo aparte,
  // pero **no lo aparta del momento crítico**: en cuanto React hidrata, el
  // componente se renderiza y el trozo se pide y se evalúa, justo mientras la
  // portada intenta pintar su primera línea. Lo que hace falta no es
  // separarlo, es **no renderizarlo todavía**.
  //
  // El hueco se abre con **lo primero de tres cosas**, y las tres hacen
  // falta:
  //
  //  1. Que el navegador diga que está libre (`requestIdleCallback`), y no
  //     antes del primer pintado: de ahí los dos cuadros de espera. Sin
  //     ellos, «libre» puede llegar antes de que se haya pintado nada y no se
  //     gana nada.
  //  2. **Que alguien toque la página.** Si se baja el dedo antes de que haya
  //     hueco, la escena tiene que montarse ya: nadie debe entrar en cuatro
  //     pantallas de intro vacía por esperar a que el hilo se calme.
  //  3. **Un tope de tiempo.** Si la pestaña no se queda quieta nunca,
  //     `requestIdleCallback` puede no llegar jamás. Mismo criterio que el
  //     tope de 4 s del `Preloader`: un mecanismo que puede quedarse
  //     esperando para siempre es peor que no tenerlo.
  //
  // **Esto no cambia lo que ve el visitante**, y es lo que lo hace barato: el
  // `Preloader` vive dentro de `Experience`, así que ya hoy aparece **después**
  // del primer pintado —sobre 1,5 s con red normal, está medido en
  // `CLAUDE.md`—. Lo que se mueve son unos centenares de milisegundos de algo
  // que ya pasaba en ese orden.
  const [arrancado, setArrancado] = useState(false);

  useEffect(() => {
    if (reducedMotion || webgl !== true || arrancado) return;

    const eventos = ['scroll', 'pointerdown', 'keydown'] as const;
    let hecho = false;
    let hueco: number | undefined;

    const abrir = () => {
      if (hecho) return;
      hecho = true;
      recoger();
      setArrancado(true);
    };

    function recoger() {
      window.clearTimeout(tope);
      if (hueco !== undefined) {
        if (typeof window.cancelIdleCallback === 'function') {
          window.cancelIdleCallback(hueco);
        } else {
          window.clearTimeout(hueco);
        }
      }
      for (const nombre of eventos) window.removeEventListener(nombre, abrir);
    }

    const tope = window.setTimeout(abrir, TOPE_ARRANQUE);
    for (const nombre of eventos) {
      window.addEventListener(nombre, abrir, { passive: true });
    }

    const pedirHueco = () => {
      hueco =
        typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback(abrir, { timeout: TOPE_ARRANQUE })
          : window.setTimeout(abrir, 200);
    };

    // Dos cuadros: el primero es el que pinta, el segundo ya está después.
    const cuadro = requestAnimationFrame(() =>
      requestAnimationFrame(pedirHueco),
    );

    return () => {
      cancelAnimationFrame(cuadro);
      recoger();
    };
  }, [reducedMotion, webgl, arrancado]);

  if (reducedMotion || webgl !== true || !arrancado) return null;

  return (
    <Canvas3DBoundary>
      <Experience />
      <ScrollChoreography />
    </Canvas3DBoundary>
  );
}
