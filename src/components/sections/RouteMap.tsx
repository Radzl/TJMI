'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { ROUTE_MAP } from './routeMapPaths';

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
  legend: { pickup: string; delivery: string; sea: string };
};

/**
 * Mapa de la península con el corredor Castellón → Madrid dibujándose con el
 * scroll.
 *
 * **Ahora es geografía de verdad.** Era un polígono de 24 puntos trazado a
 * mano: sin Portugal, sin Baleares y con el corredor como una curva que no
 * pasaba por ningún sitio. Los trazados salen de Natural Earth (dominio
 * público) y los genera `scripts/gen-mapa.mjs` en `routeMapPaths.ts`; aquí no
 * se escribe ninguna coordenada a mano.
 *
 * Lo que cuenta, además de la ruta:
 *
 *  - **Las dos provincias que importan van marcadas.** Castellón en rojo, que
 *    es donde se recoge, y Madrid en azul, que es donde se entrega. Es lo que
 *    el texto de al lado dice con palabras, dicho con el mapa.
 *  - **El corredor sigue la A-3** por los pueblos por los que pasa, bajando
 *    primero hasta la costa de Valencia. Por eso Valencia lleva su punto: sin
 *    él no se entiende por qué la línea baja antes de subir.
 *  - **Portugal va en otro tono que España**, con la frontera a la vista. Sin
 *    eso, la península entera se leía como «España», que no lo es.
 *
 * Los colores salen de la paleta de la casa: rellenos de arena para la
 * península y los dos acentos de marca, rebajados, para las provincias. Rojo y
 * azul solo como relleno suave y filete, nunca macizos.
 */
export default function RouteMap({
  title,
  intro,
  origin,
  destination,
  distance,
  stops,
  legend,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const truckRef = useRef<SVGGElement>(null);

  const { from: FROM, to: TO, valencia: VALENCIA } = ROUTE_MAP;

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
      truck.setAttribute('transform', `translate(${TO[0]} ${TO[1]})`);
      truck.style.opacity = '1';
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
  }, [TO]);

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
          <figure>
            <svg
              viewBox={ROUTE_MAP.viewBox}
              role="img"
              aria-label={`${origin} → ${destination}, ${distance}`}
              className="w-full"
            >
              <defs>
                {/* Los vecinos se funden hacia los bordes. El guion los recorta
                    contra el lienzo, y ese recorte dejaba un canto recto en lo
                    alto de Francia y en el pie de Marruecos que se leía como
                    un mapa mal pegado. El degradado va centrado en la
                    península: junto a la frontera se ven enteros, y lejos de
                    ella desaparecen. */}
                <radialGradient id="mapa-fundido" cx="0.42" cy="0.5" r="0.62">
                  <stop offset="0.5" stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </radialGradient>
                <mask id="mapa-vecinos" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="753">
                  <rect width="1000" height="753" fill="url(#mapa-fundido)" />
                </mask>
              </defs>

              {/* Lo que asoma por los bordes: Francia, Andorra, el norte de
                  África. Casi del color del fondo: está para que la península
                  no flote en el vacío, no para que se mire. */}
              <path d={ROUTE_MAP.neighbours} fill="#ebe5d8" mask="url(#mapa-vecinos)" />

              <path
                d={ROUTE_MAP.portugal}
                fill="#efe9dd"
                stroke="#d6cdbb"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <path
                d={ROUTE_MAP.spain}
                fill="#e7dfcf"
                stroke="#d6cdbb"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />

              {/* Las dos provincias del servicio. */}
              <path
                d={ROUTE_MAP.castellon}
                fill="rgb(208 59 64 / 0.16)"
                stroke="#b83035"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <path
                d={ROUTE_MAP.madrid}
                fill="rgb(52 84 138 / 0.24)"
                stroke="#34548a"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />

              {/* Rótulos de contexto, en el gris de la casa y a cuerpo de
                  pie de foto: orientan, no compiten con la ruta.

                  **Los cuerpos van en clases y no en `fontSize`**, y es lo que
                  deja leerlos en el móvil. El texto de un SVG escala con el
                  dibujo: en un teléfono el mapa mide 340 px de ancho, así que
                  26 unidades salían a 9 px. Una clase con `max-sm:` le da otro
                  cuerpo solo ahí. */}
              <g className="fill-muted font-display text-[19px] uppercase tracking-[0.16em] max-sm:text-[28px]">
                <text x={118} y={402} textAnchor="middle">
                  Portugal
                </text>
                <text x={770} y={560} textAnchor="middle" opacity={0.75}>
                  {legend.sea}
                </text>
              </g>

              {/* Trazado del corredor. Se dibuja con el scroll. */}
              <path
                ref={lineRef}
                d={ROUTE_MAP.corridor}
                fill="none"
                stroke="#34548a"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Valencia: un punto pequeño y gris, solo para explicar por qué
                  la línea baja hasta la costa antes de subir a Madrid. */}
              <circle cx={VALENCIA[0]} cy={VALENCIA[1]} r={5} fill="#67625a" />
              <text
                x={VALENCIA[0] + 14}
                y={VALENCIA[1] + 24}
                className="fill-muted font-display text-[18px] uppercase tracking-[0.12em] max-sm:text-[26px]"
              >
                Valencia
              </text>

              {[
                { point: FROM, label: origin, anchor: 'start' as const, dx: 22 },
                { point: TO, label: destination, anchor: 'end' as const, dx: -22 },
              ].map((city) => {
                // «Almazora (Castellón)» va en dos líneas: el pueblo grande y
                // la provincia debajo, más pequeña. En una sola no cabía en el
                // móvil al cuerpo que hace falta para leerla.
                const [name, region] = city.label.split(/\s*(?=\()/);
                return (
                  <g key={city.label}>
                    <circle
                      cx={city.point[0]}
                      cy={city.point[1]}
                      r={20}
                      fill="none"
                      stroke="#d03b40"
                      strokeWidth={2}
                      opacity={0.45}
                    />
                    <circle cx={city.point[0]} cy={city.point[1]} r={10} fill="#d03b40" />
                    <text
                      x={city.point[0] + city.dx}
                      y={city.point[1] - 26}
                      textAnchor={city.anchor}
                      className="font-display uppercase"
                    >
                      <tspan
                        x={city.point[0] + city.dx}
                        dy="-1.05em"
                        className="fill-ink text-[28px] tracking-tight max-sm:text-[40px]"
                      >
                        {name}
                      </tspan>
                      {region && (
                        <tspan
                          x={city.point[0] + city.dx}
                          dy="1.3em"
                          className="fill-muted text-[18px] tracking-[0.12em] max-sm:text-[26px]"
                        >
                          {region}
                        </tspan>
                      )}
                    </text>
                  </g>
                );
              })}

              {/* El camión recorriendo el trazado. A este tamaño una silueta de
                  camión sería un borrón, así que va como marcador. */}
              <g ref={truckRef} style={{ opacity: 0 }}>
                <circle r={16} fill="#f7f3ec" />
                <circle r={10} fill="#34548a" />
              </g>

              <text
                x={(FROM[0] + TO[0]) / 2 + 10}
                y={Math.max(FROM[1], TO[1]) + 96}
                textAnchor="middle"
                className="fill-brand-blue font-display text-[32px] tracking-tight max-sm:text-[44px]"
              >
                {distance}
              </text>
            </svg>

            {/* La leyenda va en HTML y no dentro del dibujo: así se lee con
                lector de pantalla, se traduce sin tocar el SVG y no encoge con
                él en el móvil hasta volverse ilegible. */}
            <figcaption className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-sm border border-brand-red-ink bg-brand-red/20"
                />
                {legend.pickup}
              </span>
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-sm border border-brand-blue bg-brand-blue/20"
                />
                {legend.delivery}
              </span>
            </figcaption>
          </figure>

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
