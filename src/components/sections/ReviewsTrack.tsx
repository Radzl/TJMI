'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Cuántas tarjetas hay, para pintar un punto por cada una. */
  count: number;
  labels: { region: string; prev: string; next: string; goTo: string };
};

/**
 * El carrusel de reseñas: la fila que se desplaza y los mandos para moverla.
 *
 * ## Por qué un scroll nativo y no un carrusel montado a mano
 *
 * La fila es un `overflow-x-auto` con `scroll-snap`, así que **funciona sin
 * JavaScript**: se arrastra con el dedo, se mueve con las flechas del teclado
 * y se puede tabular. Lo que añade este componente son solo los mandos —los
 * puntos y las flechas—, que son una ayuda, no el contenido. Es la misma regla
 * que los cuatro pasos de la ruta: el marcado sale completo y el JavaScript
 * solo lo mejora.
 *
 * Un carrusel con `transform` y un índice en el estado habría necesitado
 * reimplementar el gesto táctil, el teclado y el enfoque, y los tres salen
 * gratis con el scroll del navegador.
 *
 * ## `data-lenis-prevent` es obligatorio
 *
 * Lenis engancha la rueda en toda la página y le hace `preventDefault` para
 * moverla él. Sin este atributo, la rueda sobre la fila movería la página en
 * vertical en vez de la fila en horizontal, y parecería que el carrusel está
 * roto cuando lo que pasa es que nunca recibe el evento. Es lo mismo que
 * necesita el panel del modal de servicios.
 *
 * ## Los mandos se esconden si no sobra nada
 *
 * Con dos reseñas en una pantalla de escritorio caben las dos, así que unas
 * flechas que no llevan a ninguna parte serían mobiliario. El `data-controls`
 * del contenedor se enciende solo cuando la fila mide más que su hueco, y se
 * vuelve a mirar al cambiar el tamaño de la ventana.
 *
 * ## Sin estado de React
 *
 * El punto activo se escribe como atributo sobre cada botón desde el
 * escuchador de scroll. Un `useState` aquí re-renderizaría la lista entera en
 * cada evento de scroll, que son decenas por gesto, y no hay ni un motivo:
 * lo único que cambia es qué punto va relleno. Misma regla que la barra del
 * desfile de servicios.
 */
export default function ReviewsTrack({ children, count, labels }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const dots = Array.from(
      wrap.querySelectorAll<HTMLButtonElement>('[data-dot]'),
    );
    const prev = wrap.querySelector<HTMLButtonElement>('[data-arrow="prev"]');
    const next = wrap.querySelector<HTMLButtonElement>('[data-arrow="next"]');

    /** El ancho de una tarjeta más el hueco, medido del DOM y no supuesto. */
    const paso = () => {
      const items = track.children;
      if (items.length < 2) return track.clientWidth;
      const a = (items[0] as HTMLElement).offsetLeft;
      const b = (items[1] as HTMLElement).offsetLeft;
      return b - a || track.clientWidth;
    };

    const pintar = () => {
      const sobra = track.scrollWidth - track.clientWidth;
      wrap.dataset.controls = sobra > 8 ? 'on' : 'off';

      const activo = sobra > 0 ? Math.round(track.scrollLeft / paso()) : 0;
      dots.forEach((dot, i) => {
        const esta = i === activo;
        dot.dataset.active = String(esta);
        // `aria-current` y no solo el color: quien usa lector de pantalla
        // necesita saber por cuál va, y el color no se lo dice.
        if (esta) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });

      // Al principio y al final las flechas no llevan a ninguna parte.
      if (prev) prev.disabled = track.scrollLeft < 8;
      if (next) next.disabled = track.scrollLeft > sobra - 8;
    };

    const irA = (i: number) => track.scrollTo({ left: paso() * i });
    const mover = (dir: number) =>
      track.scrollBy({ left: paso() * dir });

    dots.forEach((dot, i) => dot.addEventListener('click', () => irA(i)));
    prev?.addEventListener('click', () => mover(-1));
    next?.addEventListener('click', () => mover(1));

    track.addEventListener('scroll', pintar, { passive: true });
    const observer = new ResizeObserver(pintar);
    observer.observe(track);
    pintar();

    return () => {
      track.removeEventListener('scroll', pintar);
      observer.disconnect();
    };
  }, [count]);

  return (
    <div ref={wrapRef} data-controls="off" className="reviews-track">
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={labels.region}
        // `scroll-smooth` solo con `motion-safe`: quien pide movimiento
        // reducido quiere el salto seco, no el barrido.
        className="sin-barra -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-2 outline-none motion-safe:scroll-smooth focus-visible:ring-2 focus-visible:ring-brand-blue/40"
        data-lenis-prevent
      >
        {children}
      </ul>

      {/* Los mandos. Se esconden por CSS cuando no sobra fila que mover. */}
      <div className="reviews-controls mt-10 flex items-center justify-between gap-6">
        <ul className="flex items-center gap-2.5">
          {Array.from({ length: count }, (_, i) => (
            <li key={i}>
              <button
                type="button"
                data-dot
                data-active="false"
                aria-label={labels.goTo.replace('{n}', String(i + 1))}
                className="reviews-dot"
              />
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            data-arrow="prev"
            aria-label={labels.prev}
            className="reviews-arrow"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            data-arrow="next"
            aria-label={labels.next}
            className="reviews-arrow"
          >
            <Chevron dir="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${dir === 'left' ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
