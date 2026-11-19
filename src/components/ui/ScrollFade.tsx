'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { SCRUB_INTRO, tramoDeEscena } from '@/lib/partitura';
import { range } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  /** Tramos de la sección, de 0 a 1, en los que entra y sale el contenido. */
  inFrom?: number;
  inTo?: number;
  outFrom?: number;
  outTo?: number;
  /**
   * Dónde empieza y acaba el disparador.
   *
   * Por defecto mide la sección entera cruzando la pantalla, que es lo que
   * quiere un bloque que entra y sale por su cuenta. Pero cuando el fundido
   * tiene que **cuadrar con un momento del 3D** hay que pasarle el mismo
   * `start` y `end` que usa `ScrollChoreography` para esa escena: los dos
   * disparadores miden tramos distintos, así que una fracción del uno no es la
   * misma fracción del otro, y a ojo el fundido cae medio pantallazo antes.
   */
  start?: string;
  end?: string;
  /**
   * Consulta de medios en la que actúa el fundido. Fuera de ella el bloque se
   * queda tal cual, visible. Sirve para coreografías que solo hacen falta en
   * un ancho: en móvil el texto va encima del 3D y en escritorio al lado.
   */
  media?: string;
};

/**
 * Encadena la entrada y la salida de un bloque con el scroll de su sección.
 * Sirve para que nunca haya dos actos hablando a la vez ni texto sobre un
 * fondo que todavía no le corresponde.
 */
export default function ScrollFade({
  children,
  className,
  inFrom = 0,
  inTo = 0,
  outFrom = 1,
  outTo = 1,
  start,
  end,
  media,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const section = element?.closest('section');
    if (!element || !section || prefersReducedMotion()) return;

    const pintar = (progress: number) => {
      const appear = inTo > inFrom ? range(progress, inFrom, inTo) : 1;
      const leave = outTo > outFrom ? range(progress, outFrom, outTo) : 0;
      element.style.opacity = String(appear * (1 - leave));
    };

    const montar = () => {
      // Dentro de una sección con escena 3D mide **el mismo tramo que la
      // escena** (ver `lib/partitura.ts`), así que una fracción de aquí es la
      // misma fracción de allí. Fuera de ellas, el tramo de siempre: mientras
      // la sección cruza la pantalla entera.
      const tramo = tramoDeEscena(section) ?? { start: 'top bottom', end: 'bottom top' };
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: start ?? tramo.start,
        end: end ?? tramo.end,
        scrub: SCRUB_INTRO,
        onUpdate: (self) => pintar(self.progress),
      });
      // **Se pinta ya, sin esperar al primer scroll.** ScrollTrigger solo
      // llama a `onUpdate` cuando el progreso cambia, y al cargar arriba del
      // todo no cambia: un bloque que tiene que *entrar* se quedaría visible
      // desde el principio. Con uno que solo sale no se notaba, porque en 0
      // ya está visible.
      pintar(trigger.progress);

      return () => {
        trigger.kill();
        element.style.opacity = '';
      };
    };

    if (!media) return montar();

    // Con consulta de medios, `gsap.matchMedia` monta y desmonta el
    // disparador al cruzar el corte (girar el teléfono, cambiar la ventana),
    // y al desmontar el bloque vuelve a su opacidad normal.
    const mm = gsap.matchMedia();
    mm.add(media, montar);
    return () => mm.revert();
  }, [inFrom, inTo, outFrom, outTo, start, end, media]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
