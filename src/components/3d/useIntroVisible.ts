'use client';

import { useEffect, useState } from 'react';

/**
 * ¿Hay algo de la intro 3D en pantalla ahora mismo?
 *
 * ## Qué problema resuelve
 *
 * El Canvas está **fijo a pantalla completa detrás de todo** (`fixed inset-0`)
 * y nunca se desmonta: es el mismo lienzo durante las veinte pantallas de la
 * portada. Eso está bien para la intro, pero significa que **sigue
 * dibujándose a toda velocidad cuando ya no se ve nada de él**, tapado por
 * Servicios, por Cobertura y por el pie.
 *
 * Está medido, contando llamadas de dibujo del propio contexto WebGL:
 *
 *   en la intro ....... 184.000 llamadas por segundo
 *   en Servicios ....... 64.650
 *   en Cobertura ....... 64.650
 *   en el pie .......... 64.650
 *
 * O sea **unas 450 llamadas por fotograma, a 144 fps, durante dos tercios de
 * la página**, para pintar algo que ningún visitante puede ver. En un portátil
 * no se nota; en un teléfono es batería y calor a cambio de nada.
 *
 * ## Cómo se decide
 *
 * Mirando las secciones que **tienen** escena (`[data-scene]`). Son las únicas
 * que dejan ver el lienzo: todas las demás llevan fondo opaco por encima. Si
 * ninguna cruza la pantalla, no hay nada que dibujar.
 *
 * Se usa `IntersectionObserver` y no el scroll: no cuesta nada, no se ejecuta
 * en cada fotograma y no hay que recalcular posiciones cuando cambia el alto
 * de la página —que cambia, porque el desfile de servicios se fija y añade
 * recorrido—.
 *
 * ## Por qué volver no da un salto
 *
 * Al reanudar, la escena lee el store y se pone al día de golpe. Los muelles
 * amortiguados podrían pegar un latigazo con un `delta` enorme, pero eso ya
 * está resuelto desde antes: `Scene.tsx` acota el `delta` del fotograma a
 * 0,05 s, justo para el caso de volver de una pestaña en segundo plano. Aquí
 * vale lo mismo.
 */
export function useIntroVisible() {
  // Arranca en `true`: al cargar la página siempre se está en el hero, y
  // empezar en `false` dejaría el lienzo sin pintar el primer fotograma.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const secciones = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scene]'),
    );
    if (secciones.length === 0) return;

    // Se lleva la cuenta de cuántas se ven en vez de un simple booleano: con
    // varias secciones observadas, la que sale de pantalla dispara su evento
    // después de que haya entrado la siguiente, y con un booleano el último
    // aviso en llegar apagaría el render con la siguiente ya dentro.
    const dentro = new Set<Element>();

    const observer = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) dentro.add(e.target);
          else dentro.delete(e.target);
        }
        setVisible(dentro.size > 0);
      },
      // Un margen de media pantalla: así la escena ya está dibujando cuando
      // el borde de la sección asoma, y no se ve el primer fotograma llegar
      // tarde.
      { rootMargin: '50% 0px' },
    );

    secciones.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return visible;
}
