'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { roadProgress } from '@/lib/route';

type Props = {
  total: string;
  className?: string;
};

/**
 * Cuentakilómetros atado al mismo tramo de scroll que recorre el camión en la
 * carretera: los kilómetros suben exactamente al ritmo al que avanza.
 */
export default function RouteOdometer({ total, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    const section = element?.closest('section');
    const target = Number(total);
    if (!element || !section || !Number.isFinite(target)) return;
    if (prefersReducedMotion()) return;

    element.textContent = '0';

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
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
  }, [total]);

  return (
    <span ref={ref} className={className}>
      {total}
    </span>
  );
}
