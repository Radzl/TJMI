'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { clamp, damp } from '@/lib/utils';

type Props = {
  items: string[];
};

/**
 * A cuántos píxeles por segundo de scroll la banda dobla su velocidad.
 *
 * Sale de medir, no de probar: un golpe de rueda cómodo mueve la página unos
 * **1.200 px/s** y un arrastre decidido en móvil pasa de 3.000. Con este
 * valor, el gesto normal deja la banda a velocidad doble —se nota sin
 * pensarlo— y hay recorrido por encima para que un golpe fuerte se note más.
 */
const VELOCIDAD_REFERENCIA = 1200;

/** Lo más rápido que puede ir hacia delante, en veces su velocidad propia. */
const TOPE_ADELANTE = 5;

/**
 * Y lo más rápido hacia atrás.
 *
 * **Sí, hacia atrás: al subir, la banda se da la vuelta.** Es lo que la ata
 * de verdad al scroll en vez de dejarla como un adorno que corre más. Va con
 * menos recorrido que hacia delante porque subir es un gesto de volver, no de
 * avanzar, y una banda disparada al revés se lee como un error.
 */
const TOPE_ATRAS = 2;

/**
 * Banda de marca en movimiento continuo, atada a la velocidad del scroll.
 *
 * Es el gesto más «de transporte» que se le puede poner a una página: una
 * tira rotulada que no para. Cierra la sección de Servicios y, desde que esa
 * sección va en crema, es **el único bloque de color macizo de la portada**,
 * que es justo como el brief quiere el rojo.
 *
 * Son dos copias idénticas de la lista y la animación desplaza la mitad del
 * conjunto, así que el bucle no tiene costura. La segunda copia va oculta a
 * los lectores de pantalla, que si no leerían todo dos veces.
 *
 * ## La velocidad: por qué así y no con otra animación
 *
 * **El movimiento lo sigue haciendo el CSS**, y eso no es pereza: así la
 * banda se mueve sin JavaScript, con movimiento reducido se para sola
 * (`globals.css`) y no hay un tercer sistema de animación en el proyecto —que
 * es justo lo que llevó a quitar Motion—. Lo único que hace este componente
 * es **cambiarle la velocidad de reproducción** a esa animación, con
 * `Animation.playbackRate`, que es la herramienta que existe exactamente para
 * eso.
 *
 * Lo que **no** se puede hacer es tocar `animation-duration`: el navegador
 * recalcula el progreso con la duración nueva, así que la banda pega un salto
 * de posición en cada fotograma. `playbackRate` conserva dónde está y solo
 * cambia a qué ritmo sigue.
 *
 * ## Y por qué va amortiguado
 *
 * Porque la velocidad del scroll es ruidosa: un dedo en un móvil da lecturas
 * que saltan de 200 a 4.000 y vuelven. Puesta en crudo, la banda tiembla. Va
 * con `damp()`, que es independiente de los fps —igual que todo lo que se
 * mueve por fotograma en el 3D—, y en dos escalones: primero se suaviza la
 * velocidad medida y después la propia tasa. El retraso entre que empujas y
 * que la banda responde es lo que la hace pesada en vez de nerviosa.
 *
 * Va sobre `gsap.ticker` y no sobre un `requestAnimationFrame` propio para no
 * abrir un segundo bucle: ese ticker ya está corriendo por Lenis y por la
 * coreografía del 3D.
 */
export default function Marquee({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    // Con movimiento reducido el CSS deja la animación en `none`, así que
    // aquí no hay nada que acelerar y la lista sale vacía. Es la misma
    // comprobación por dos caminos, y las dos hacen falta: la de arriba evita
    // montar el bucle y esta evita reventar si alguien cambia el CSS.
    const animacion = el.getAnimations?.()[0];
    if (!animacion) return;

    let ultimaY = window.scrollY;
    let velocidad = 0;
    let tasa = 1;

    const paso = (_tiempo: number, delta: number) => {
      // El delta se acota como en el 3D: al volver de una pestaña en segundo
      // plano llega un salto enorme y la banda pegaría un latigazo.
      const dt = Math.min(delta, 50) / 1000;
      const y = window.scrollY;
      const cruda = (y - ultimaY) / Math.max(dt, 0.001);
      ultimaY = y;

      velocidad = damp(velocidad, cruda, 8, dt);

      const objetivo = clamp(
        1 + velocidad / VELOCIDAD_REFERENCIA,
        -TOPE_ATRAS,
        TOPE_ADELANTE,
      );
      tasa = damp(tasa, objetivo, 6, dt);
      animacion.playbackRate = tasa;
    };

    gsap.ticker.add(paso);
    return () => {
      gsap.ticker.remove(paso);
      animacion.playbackRate = 1;
    };
  }, []);

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-brand-red py-3.5">
      <div ref={ref} className="animate-marquee flex w-max">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1 ? true : undefined}
          >
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-8 whitespace-nowrap px-8 font-display text-sm uppercase tracking-[0.25em] text-white"
              >
                {item}
                <span
                  className="h-1.5 w-1.5 rotate-45 bg-white/60"
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
