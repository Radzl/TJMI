'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { tramoDeEscena } from '@/lib/partitura';
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
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const section = element?.closest('section');
    if (!element || !section || prefersReducedMotion()) return;

    // Dentro de una sección con escena 3D mide **el mismo tramo que la
    // escena** (ver `lib/partitura.ts`), así que una fracción de aquí es la
    // misma fracción de allí. Fuera de ellas, el tramo de siempre: mientras
    // la sección cruza la pantalla entera.
    const tramo = tramoDeEscena(section) ?? { start: 'top bottom', end: 'bottom top' };
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: start ?? tramo.start,
      end: end ?? tramo.end,
      scrub: 1,
      onUpdate: (self) => {
        const appear = inTo > inFrom ? range(self.progress, inFrom, inTo) : 1;
        const leave = outTo > outFrom ? range(self.progress, outFrom, outTo) : 0;
        element.style.opacity = String(appear * (1 - leave));
      },
    });

    return () => {
      trigger.kill();
      element.style.opacity = '';
    };
  }, [inFrom, inTo, outFrom, outTo, start, end]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
