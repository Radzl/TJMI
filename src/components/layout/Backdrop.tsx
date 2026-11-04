'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const COLORS: Record<string, string> = {
  // **El crema bueno es `#f7f3ec`.** Aquí se quedó el anterior (`#f6f4f1`)
  // cuando se cambió el de la marca, así que el fondo que pinta este
  // componente y el del `body` eran dos cremas distintos por dos puntos. No
  // se ve de uno en uno; se ve en el borde donde uno tapa al otro.
  bone: '#f7f3ec',
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
