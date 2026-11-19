'use client';

import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { SCRUB_INTRO, tramoDeEscena } from '@/lib/partitura';
import { writeProgress, writeSceneProgress } from '@/lib/store';

/**
 * Timeline maestra: traduce el scroll de la página a progreso 0 → 1 (global y
 * por escena) dentro del store. No mueve nada por sí misma; de eso se encargan
 * los componentes 3D leyendo el store.
 */
/**
 * `scrub` con margen y no `true`: con `true` la escena va clavada a la rueda,
 * así que un acelerón la teletransporta. Con margen para alcanzar al scroll
 * (`SCRUB_INTRO`, dos segundos), todo coge peso. Los textos de la intro llevan
 * el mismo valor para que no se desincronicen.
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
      scrub: SCRUB_INTRO,
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
      // **Las reglas del tramo viven en `tramoDeEscena` (`lib/partitura.ts`)**
      // y no aquí, para que las piezas de HTML que acompañan a cada escena
      // —el fundido del texto, el cuentakilómetros, la barra de avance— midan
      // exactamente lo mismo sin llevar su propia copia de `start` y `end`.
      const { start, end } = tramoDeEscena(section)!;

      return ScrollTrigger.create({
        trigger: section,
        start,
        end,
        scrub: SCRUB_INTRO,
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
