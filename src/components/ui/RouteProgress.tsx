'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { roadProgress } from '@/lib/route';

type Props = {
  origin: string;
  destination: string;
};

/**
 * Barra de ruta entre las dos sedes. Se llena al mismo ritmo al que el camión
 * recorre la carretera, así que el visitante ve dónde va sin tener que
 * interpretar la escena 3D.
 */
export default function RouteProgress({ origin, destination }: Props) {
  const fillRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    const dot = dotRef.current;
    const section = fill?.closest('section');
    if (!fill || !dot || !section || prefersReducedMotion()) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const advance = roadProgress(self.progress) * 100;
        fill.style.width = `${advance}%`;
        dot.style.left = `${advance}%`;
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div className="mt-10">
      <div className="flex items-baseline justify-between gap-4 font-display text-[0.6rem] uppercase tracking-[0.2em] text-muted">
        <span>{origin}</span>
        <span className="text-right">{destination}</span>
      </div>

      <div className="relative mt-3 h-px bg-line">
        <span
          ref={fillRef}
          aria-hidden="true"
          className="absolute inset-y-0 left-0 block w-full bg-brand-blue"
        />
        <span
          ref={dotRef}
          aria-hidden="true"
          className="absolute -top-[3px] left-full block h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-brand-blue"
        />
      </div>
    </div>
  );
}
