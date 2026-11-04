'use client';

import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { writeProgress, writeSceneProgress } from '@/lib/store';

/**
 * Timeline maestra: traduce el scroll de la página a progreso 0 → 1 (global y
 * por escena) dentro del store. No mueve nada por sí misma; de eso se encargan
 * los componentes 3D leyendo el store.
 */
/**
 * `scrub: 1` y no `true`: con `true` la escena va clavada a la rueda, así que
 * un acelerón la teletransporta. Con un segundo de margen para alcanzar al
 * scroll, todo coge peso. Los demás disparadores de la intro llevan el mismo
 * valor para que no se desincronicen entre ellos.
 */
export default function ScrollChoreography() {
  useEffect(() => {
    // Ojo con el elemento: **tiene que ser `body`, no `documentElement`**. El
    // que hace scroll es el propio `html`, así que su altura medida es la de
    // la ventana y el disparador salía de largo cero: el progreso global se
    // quedaba en 0 para siempre y, como nadie lo leía, no se notó hasta que el
    // raíl de la ruta lo necesitó. `body` sí mide el alto del contenido.
    const master = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => writeProgress(self.progress),
    });

    const sections = gsap.utils.toArray<HTMLElement>('[data-scene]');
    const triggers = sections.map((section) => {
      const index = Number(section.dataset.scene) - 1;
      // El hero ya está en pantalla al cargar, así que su progreso arranca
      // arriba del todo en vez de cuando entra por abajo.
      //
      // Las demás arrancan al asomar por abajo (`top bottom`), que es lo
      // correcto **mientras lo que haya encima deje ver el 3D**. Si encima hay
      // una sección opaca, esa regla se vuelve en contra: la escena se anima
      // entera detrás del panel y, cuando el panel por fin sale, lo que ya ha
      // pasado no se ha visto. Por eso una sección puede pedir otro arranque
      // con `data-scene-start`.
      const start =
        index === 0 ? 'top top' : section.dataset.sceneStart || 'top bottom';
      // Y termina cuando su borde inferior llega al borde inferior de la
      // pantalla, no al superior. Ahí es justo donde su bloque `sticky` suelta
      // el titular, así que la animación entera transcurre con el texto
      // delante; con `bottom top` sobraba una pantalla al final, sin titular y
      // con el camión convertido en una tira al fondo. De paso, la sección
      // siguiente empieza a contar exactamente cuando esta acaba, en vez de
      // una pantalla antes: eso es lo que hacía que el camión arrancase con la
      // lona todavía abierta.
      //
      // Y una sección puede pedir otro final con `data-scene-end`, por el
      // mismo motivo por el que el hero lo cambió: si su bloque `sticky` se
      // suelta antes de que el disparador llegue a 1, **el último tramo de la
      // coreografía ocurre con el bloque ya subiendo**, o sea sin que se vea.
      const end =
        index === 0 ? 'bottom bottom' : section.dataset.sceneEnd || 'bottom top';

      return ScrollTrigger.create({
        trigger: section,
        start,
        end,
        scrub: 1,
        onUpdate: (self) => writeSceneProgress(index, self.progress),
      });
    });

    ScrollTrigger.refresh();

    return () => {
      master.kill();
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}
