'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const COLORS: Record<string, string> = {
  bone: '#f6f4f1',
  night: '#0f1a2e',
};

/**
 * Fondo de toda la página. Cada sección declara su color con `data-bg` y aquí
 * se funde de uno a otro. Así los cambios de fondo son un fundido y no un
 * rectángulo opaco entrando por abajo y cortando lo que haya detrás.
 */
export default function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-bg]'),
    );
    if (sections.length === 0) return;

    let current = '';

    const update = () => {
      const middle = window.innerHeight / 2;
      const active = sections.find((section) => {
        const box = section.getBoundingClientRect();
        return box.top <= middle && box.bottom >= middle;
      });

      const next = COLORS[active?.dataset.bg ?? 'bone'] ?? COLORS.bone;
      if (next === current) return;

      current = next;
      gsap.to(element, {
        backgroundColor: next,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: true,
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <div ref={ref} aria-hidden="true" className="fixed inset-0 -z-10 bg-bone" />;
}
