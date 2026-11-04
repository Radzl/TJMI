'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { registerScroller } from '@/lib/scrollLock';

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);

    // Quien abra un modal necesita poder parar esto: el scroll suave no lee
    // `overflow: hidden`, va escribiendo la posición desde su propio bucle.
    registerScroller(lenis);

    // Lenis espera milisegundos y el ticker de GSAP entrega segundos.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      registerScroller(null);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
