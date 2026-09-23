'use client';

import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { writeProgress, writeSceneProgress } from '@/lib/store';

/**
 * Timeline maestra: traduce el scroll de la página a progreso 0 → 1 (global y
 * por escena) dentro del store. No mueve nada por sí misma; de eso se encargan
 * los componentes 3D leyendo el store.
 */
export default function ScrollChoreography() {
  useEffect(() => {
    const master = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => writeProgress(self.progress),
    });

    const sections = gsap.utils.toArray<HTMLElement>('[data-scene]');
    const triggers = sections.map((section) => {
      const index = Number(section.dataset.scene) - 1;
      // El hero ya está en pantalla al cargar, así que su progreso arranca
      // arriba del todo en vez de cuando entra por abajo.
      const start = index === 0 ? 'top top' : 'top bottom';

      return ScrollTrigger.create({
        trigger: section,
        start,
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => writeSceneProgress(index, self.progress),
      });
    });

    ScrollTrigger.refresh();

    return () => {
      master.kill();
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}
