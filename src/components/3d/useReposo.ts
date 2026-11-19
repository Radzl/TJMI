'use client';

import { useEffect, useState } from 'react';

/**
 * ¿Lleva un rato el visitante sin tocar nada?
 *
 * **Para qué sirve.** Mientras la intro está en pantalla, el lienzo se
 * repintaba a toda la velocidad de la pantalla aunque nadie hiciera scroll:
 * medido, **142 fotogramas y 24.000 llamadas de dibujo por segundo** con la
 * escena quieta, solo para que el rotativo parpadee y la carga respire un
 * pelo. En un teléfono eso es batería y calor a cambio de casi nada. Con esto,
 * `Experience` baja el ritmo cuando no pasa nada (ver `RITMO_REPOSO`).
 *
 * **Qué cuenta como actividad**: el scroll (también el que anima Lenis después
 * de soltar la rueda, que dispara eventos de scroll igual), la rueda, el dedo,
 * el ratón —que mueve la cámara un par de grados—, el teclado y el cambio de
 * tamaño de la ventana.
 *
 * **Por qué tres segundos y no menos**: los disparadores van con un `scrub` de
 * dos segundos (`SCRUB_INTRO` en `lib/partitura.ts`), así que la escena sigue
 * deslizándose hasta dos segundos después del último scroll, y los muelles
 * amortiguados algo más. Con un umbral corto el ritmo bajaría a mitad de ese
 * movimiento y se vería a saltos. Fue de 2 s mientras el `scrub` era de uno.
 */
export const ESPERA_REPOSO = 3000;

export function useReposo() {
  const [reposo, setReposo] = useState(false);

  useEffect(() => {
    let temporizador = 0;
    const despertar = () => {
      setReposo(false);
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => setReposo(true), ESPERA_REPOSO);
    };
    const eventos = ['scroll', 'wheel', 'pointermove', 'pointerdown', 'touchmove', 'keydown', 'resize'];
    eventos.forEach((e) => window.addEventListener(e, despertar, { passive: true }));
    despertar();
    return () => {
      window.clearTimeout(temporizador);
      eventos.forEach((e) => window.removeEventListener(e, despertar));
    };
  }, []);

  return reposo;
}
