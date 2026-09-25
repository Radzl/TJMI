'use client';

import { useEffect, useRef } from 'react';
import { SplitText, gsap, prefersReducedMotion } from '@/lib/gsap';

type Props = {
  text: string;
  className?: string;
};

/**
 * Titular que entra línea a línea, asomando desde detrás de su propia caja.
 * El texto está en el HTML desde el principio, así que ni el SEO ni los
 * lectores de pantalla ven nada raro; si falla el efecto, queda el titular.
 */
export default function RevealHeading({ text, className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;

    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let cancelled = false;

    // Hay que esperar a las fuentes: si se parte en líneas antes, el corte se
    // calcula con la tipografía equivocada y las líneas quedan mal.
    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;

      split = SplitText.create(ref.current, { type: 'lines', mask: 'lines' });
      tween = gsap.from(split.lines, {
        yPercent: 105,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
      });
    });

    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [text]);

  return (
    <h2 ref={ref} className={className}>
      {text}
    </h2>
  );
}
