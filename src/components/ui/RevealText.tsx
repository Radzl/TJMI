'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/gsap';

/**
 * Párrafo que asoma al entrar en pantalla.
 *
 * Usa `IntersectionObserver` y no ScrollTrigger a propósito: aquí arriba hay
 * un vídeo a pantalla completa que cambia la altura de la página al cargar, y
 * un disparador calculado antes de eso deja el texto escondido para siempre.
 * El observador no depende de posiciones medidas de antemano.
 *
 * El texto está en el HTML desde el principio y solo se esconde desde JS: si
 * el efecto no llega a correr, se ve igual.
 */
export default function RevealText({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;

    element.style.opacity = '0';
    element.style.transform = 'translateY(26px)';

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        element.style.transition =
          'opacity 640ms var(--ease-casa), transform 640ms var(--ease-casa)';
        element.style.opacity = '1';
        element.style.transform = 'none';
        observer.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return <p ref={ref}>{children}</p>;
}
