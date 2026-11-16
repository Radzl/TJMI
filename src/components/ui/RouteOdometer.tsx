'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { tramoDeEscena } from '@/lib/partitura';
import { roadProgress } from '@/lib/route';

type Props = {
  total: string;
  className?: string;
  /** El tramo que mide. Tiene que ser el mismo que el de la escena 3D. */
  start?: string;
  end?: string;
};

/**
 * Cuentakilómetros atado al mismo tramo de scroll que recorre el camión en la
 * carretera: los kilómetros suben exactamente al ritmo al que avanza.
 */
export default function RouteOdometer({
  total,
  className,
  start,
  end,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    const section = element?.closest('section');
    const target = Number(total);
    if (!element || !section || !Number.isFinite(target)) return;
    if (prefersReducedMotion()) return;

    element.textContent = '0';

    // El tramo de la escena en la que vive (ver `lib/partitura.ts`): así el
    // avance de aquí es el mismo que el del camión, sin copiar `start` ni
    // `end`. Es lo que evita el contador en 393 km con el camión aparcado.
    const tramo = tramoDeEscena(section) ?? { start: 'top bottom', end: 'bottom top' };
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: start ?? tramo.start,
      end: end ?? tramo.end,
      scrub: 1,
      // Misma curva de avance que usa la escena 3D para mover el camión, para
      // que los kilómetros cierren justo cuando el camión llega.
      onUpdate: (self) => {
        const advance = roadProgress(self.progress);
        element.textContent = String(Math.round(advance * target));
      },
    });

    return () => {
      trigger.kill();
      element.textContent = total;
    };
  }, [total, start, end]);

  return (
    <span ref={ref} className={className}>
      {total}
    </span>
  );
}
