'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { range } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  /** Tramos de la sección, de 0 a 1, en los que entra y sale el contenido. */
  inFrom?: number;
  inTo?: number;
  outFrom?: number;
  outTo?: number;
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
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const section = element?.closest('section');
    if (!element || !section || prefersReducedMotion()) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
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
  }, [inFrom, inTo, outFrom, outTo]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
