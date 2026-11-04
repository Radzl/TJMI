'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

/**
 * Un hito de la ruta.
 *
 * **Sin hora, y es a propósito.** Cada hito llevaba una (06:00, 09:00, 14:00,
 * «24 h») y ninguna era real: estaban puestas para que la lista pareciera un
 * horario. Una hora concreta en una web de transporte es un compromiso, y
 * publicar uno que no se cumple es peor que no publicar ninguno. Lo que sí es
 * cierto —el orden de los pasos y que la entrega es al día siguiente— lo
 * cuentan el propio orden de la lista y el texto de entrada.
 */
type Stop = { title: string; detail: string };

type Props = {
  title: string;
  intro: string;
  origin: string;
  destination: string;
  distance: string;
  stops: Stop[];
};

/**
 * Mapa de la península con el corredor Castellón → Madrid dibujándose con el
 * scroll.
 *
 * El contorno es una silueta simplificada, no un mapa cartográfico: está
 * trazado a partir de los puntos de costa más reconocibles, proyectando
 * longitud y latitud sobre el lienzo. Con las líneas rectas entre ellos se
 * lee como mapa estilizado, que es lo que pide la marca, y pesa unos pocos
 * cientos de bytes en vez de los cientos de kB de un SVG real.
 */

/** Silueta de la península, de La Coruña bajando por Portugal y subiendo por
 *  el Mediterráneo hasta los Pirineos. */
const IBERIA =
  'M185 57 L137 90 L75 131 L117 189 L123 281 L89 480 L95 621 L171 621 ' +
  'L241 604 L282 662 L331 704 L414 645 L545 637 L609 571 L643 513 ' +
  'L650 413 L678 372 L740 314 L764 281 L830 256 L905 181 L553 94 ' +
  'L470 94 L415 85 L283 77 Z';

/** Almazora y Fuenlabrada, en las mismas coordenadas del lienzo. */
const FROM = { x: 673, y: 377 };
const TO = { x: 430, y: 341 };
/** El corredor, con una ligera comba hacia el sur como la A-3. */
const CORRIDOR = `M${FROM.x} ${FROM.y} C 600 404, 505 384, ${TO.x} ${TO.y}`;

export default function RouteMap({
  title,
  intro,
  origin,
  destination,
  distance,
  stops,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const truckRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    const truck = truckRef.current;
    if (!section || !line || !truck) return;

    const length = line.getTotalLength();
    line.style.strokeDasharray = `${length}`;

    if (prefersReducedMotion()) {
      // Sin animación el trazado se ve entero y el camión, en destino.
      line.style.strokeDashoffset = '0';
      truck.setAttribute('transform', `translate(${TO.x} ${TO.y})`);
      return;
    }

    line.style.strokeDashoffset = `${length}`;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      end: 'bottom 75%',
      scrub: 1,
      onUpdate: (self) => {
        const advance = self.progress;
        line.style.strokeDashoffset = `${length * (1 - advance)}`;

        const point = line.getPointAtLength(length * advance);
        truck.setAttribute('transform', `translate(${point.x} ${point.y})`);
        truck.style.opacity = advance > 0.01 ? '1' : '0';
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-bg="bone"
      className="relative z-10 bg-bone py-24 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <h2 className="max-w-2xl font-display text-4xl uppercase leading-none tracking-tight text-ink sm:text-5xl">
          {title}
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {intro}
        </p>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <svg
            viewBox="0 0 1000 760"
            role="img"
            aria-label={`${origin} → ${destination}`}
            className="w-full"
          >
            <path
              d={IBERIA}
              fill="#efece6"
              stroke="#d9d4cc"
              strokeWidth={3}
              strokeLinejoin="round"
            />

            {/* Trazado del corredor. Se dibuja con el scroll. */}
            <path
              ref={lineRef}
              d={CORRIDOR}
              fill="none"
              stroke="#34548a"
              strokeWidth={10}
              strokeLinecap="round"
            />

            {[
              { point: FROM, label: origin, anchor: 'start' as const, dx: 18 },
              { point: TO, label: destination, anchor: 'end' as const, dx: -18 },
            ].map((city) => (
              <g key={city.label}>
                <circle
                  cx={city.point.x}
                  cy={city.point.y}
                  r={13}
                  fill="#d03b40"
                />
                <circle
                  cx={city.point.x}
                  cy={city.point.y}
                  r={24}
                  fill="none"
                  stroke="#d03b40"
                  strokeWidth={2}
                  opacity={0.4}
                />
                <text
                  x={city.point.x + city.dx}
                  y={city.point.y - 26}
                  textAnchor={city.anchor}
                  className="fill-ink font-display text-[26px] uppercase tracking-tight"
                >
                  {city.label}
                </text>
              </g>
            ))}

            {/* El camión recorriendo el trazado. A este tamaño una silueta de
                camión sería un borrón, así que va como marcador. */}
            <g ref={truckRef} style={{ opacity: 0 }}>
              <circle r={19} fill="#f6f4f1" />
              <circle r={13} fill="#34548a" />
            </g>

            <text
              x={(FROM.x + TO.x) / 2}
              y={FROM.y + 66}
              textAnchor="middle"
              className="fill-brand-blue font-display text-[30px] tracking-tight"
            >
              {distance}
            </text>
          </svg>

          <ol className="relative flex flex-col gap-10 border-l border-line pl-8">
            {stops.map((stop) => (
              <li key={stop.title} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[2.15rem] top-1.5 h-3 w-3 rounded-full border-2 border-brand-red-ink bg-bone"
                />
                <h3 className="font-display text-xl uppercase tracking-tight text-ink">
                  {stop.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {stop.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
