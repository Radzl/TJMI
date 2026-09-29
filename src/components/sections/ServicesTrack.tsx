'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap, useReducedMotion } from '@/lib/gsap';

type ServiceItem = {
  title: string;
  description: string;
};

type Props = {
  word: string;
  items: ServiceItem[];
  images: string[];
};

/**
 * Las tarjetas de servicio desfilando en horizontal mientras la sección se
 * queda fija.
 *
 * El scroll vertical de la página se traduce en desplazamiento lateral de la
 * fila: se fija el bloque, se mide cuánto sobresale la fila por la derecha y
 * se pide a ScrollTrigger exactamente ese recorrido de scroll. Así la última
 * tarjeta queda a la vista justo cuando el bloque se suelta.
 *
 * Con movimiento reducido no se fija nada: la fila pasa a ser una rejilla
 * normal con las clases `motion-reduce:` y las tarjetas se leen en vertical.
 */
export default function ServicesTrack({ word, items, images }: Props) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track || reducedMotion) return;

    // Cuánto sobresale la fila por la derecha. Se recalcula en cada refresco
    // porque depende del ancho de la ventana.
    const overflow = () => Math.max(0, track.scrollWidth - pin.clientWidth);

    const tween = gsap.to(track, {
      x: () => -overflow(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${overflow()}`,
        pin: true,
        // Un punto de inercia: pegado al scroll 1:1 se siente brusco.
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'transform' });
    };
  }, [reducedMotion]);

  return (
    <div
      ref={pinRef}
      className="relative flex h-[100svh] items-center overflow-hidden motion-reduce:h-auto motion-reduce:overflow-visible motion-reduce:py-16"
    >
      {/* La palabra gigante se queda detrás de las tarjetas todo el rato que
          dura el desfile: es el fondo del bloque, no un adorno de paso. */}
      <span
        aria-hidden="true"
        className="text-stroke pointer-events-none absolute left-0 top-1/2 w-full -translate-y-1/2 select-none whitespace-nowrap font-display text-[22vw] uppercase leading-none opacity-20"
      >
        {word}
      </span>

      <ul
        ref={trackRef}
        className="relative flex gap-6 px-6 motion-reduce:flex-wrap motion-reduce:justify-center lg:px-10"
      >
        {items.map((item, index) => (
          <li
            key={item.title}
            className="group w-[78vw] shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-night/80 backdrop-blur transition-colors hover:border-white/40 sm:w-[46vw] lg:w-[27vw] lg:max-w-[400px]"
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={images[index]}
                alt=""
                fill
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 27vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8">
              <span className="font-display text-xs tracking-widest text-brand-red">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-display text-xl uppercase tracking-tight">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
