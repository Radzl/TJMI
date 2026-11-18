'use client';

import { useEffect, useId, useRef } from 'react';
import Container from '@/components/ui/Container';
import { prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';
import { PENINSULA, RAMAS, SEDES, VIEWBOX } from '@/lib/red';
import { range, smoothstep } from '@/lib/utils';
import { ROUTE_MAP } from './routeMapPaths';

export type TextosMapaRed = {
  titulo: string;
  subtitulo: string;
  km: string;
  unidad: string;
  etiqueta: string;
  red: string;
  diaria: string;
  resto: string;
  mapa: string;
};

/**
 * El mapa de la red: la ruta diaria Castellón ⇄ Madrid y, desde las dos naves,
 * las rutas al resto de la península.
 *
 * ## Por qué sustituye a la carretera en 3D
 *
 * La escena de la carretera en cenital se leía como un circuito de juguete: un
 * camión enorme sobre una «S» de cien metros no cuenta 420 km de autovía, la
 * cinta negra pasaba por detrás del titular y la llegada eran cajas grises. Y
 * contaba una sola ruta, cuando la empresa **llega a toda España**. Esto cuenta
 * las dos cosas, con la geografía de verdad y sin dejar de subrayar la ruta
 * principal, que es lo que pidió el cliente.
 *
 * Es dibujo plano y no 3D: se ve nítido en cualquier pantalla, pesa unos pocos
 * KB y no compite con la maqueta del patio, que es lo que el 3D hace bien.
 *
 * ## Tres actos, atados al scroll
 *
 * La sección se queda fija mientras bajas (como hacía la carretera, pero en
 * menos de la mitad de recorrido) y el progreso se reparte así:
 *
 *  1. **La ruta diaria se dibuja** de Almazora a Fuenlabrada, con un punto que
 *     la recorre y el cuentakilómetros subiendo de 0 a 420 (0,04 → 0,42).
 *  2. **Se marcan las dos provincias**, que es donde están las naves
 *     (0,36 → 0,48).
 *  3. **La red se abre** desde las dos naves a la vez, de la ciudad más cercana
 *     a la más lejana, y entra la frase que lo dice (0,46 → 0,90).
 *
 * El último décimo es de reposo: el mapa entero, quieto, antes de soltarse.
 *
 * ## Reglas que vienen del resto de la web
 *
 * - **El marcado sale completo y visible; lo apaga el JavaScript al montar.**
 *   Sin JS, con movimiento reducido o en `/cobertura` (`estatico`) se ve el
 *   mapa entero desde el principio.
 * - **Nada de estado de React por fotograma**: el disparador escribe estilos
 *   directamente, igual que la barra del desfile de servicios.
 * - **Al pasar el ratón por una ciudad** se enciende su ruta y sale su nombre.
 *   Es CSS puro (`group-hover`), sin JavaScript. No se elige nada: el cliente
 *   pidió explícitamente que el mapa no sea un selector de provincias.
 * - **Solo península, y lo internacional no sale**: también es decisión del
 *   cliente. La ruta principal manda.
 */
export default function MapaRed({
  textos,
  estatico = false,
}: {
  textos: TextosMapaRed;
  estatico?: boolean;
}) {
  const raiz = useRef<HTMLElement>(null);
  // Los `id` del degradado y la máscara del SVG, únicos aunque el mapa salga
  // dos veces en la misma página.
  const ids = useId().replace(/:/g, '');

  useEffect(() => {
    const el = raiz.current;
    if (!el || estatico || prefersReducedMotion()) return;

    const ruta = el.querySelector<SVGPathElement>('[data-ruta]');
    const camion = el.querySelector<SVGGElement>('[data-camion]');
    const km = el.querySelector<HTMLElement>('[data-km]');
    if (!ruta || !camion || !km) return;

    const sedes = Array.from(el.querySelectorAll<SVGElement>('[data-sede]'));
    const fase2 = Array.from(el.querySelectorAll<HTMLElement>('[data-fase2]'));
    const ramas = Array.from(el.querySelectorAll<SVGGElement>('[data-rama]')).map(
      (g) => ({
        orden: Number(g.dataset.rama),
        linea: g.querySelector<SVGPathElement>('path'),
        punto: g.querySelector<SVGCircleElement>('[data-punto]'),
      }),
    );
    const largo = ruta.getTotalLength();
    const total = Number(textos.km) || 0;

    const pintar = (p: number) => {
      const viaje = smoothstep(range(p, 0.04, 0.42));
      ruta.style.strokeDashoffset = String(1 - viaje);
      const punto = ruta.getPointAtLength(largo * viaje);
      camion.setAttribute('transform', `translate(${punto.x} ${punto.y})`);
      km.textContent = String(Math.round(total * viaje));

      const marcadas = smoothstep(range(p, 0.36, 0.48));
      sedes.forEach((s) => {
        s.style.opacity = String(marcadas);
      });

      const red = smoothstep(range(p, 0.46, 0.56));
      fase2.forEach((f) => {
        f.style.opacity = String(red);
        f.style.transform = `translateY(${(1 - red) * 10}px)`;
      });

      // Cada rama tarda una décima de sección en dibujarse, y empiezan
      // escalonadas según su distancia a la nave: la red se abre como una onda.
      for (const rama of ramas) {
        const desde = 0.48 + rama.orden * 0.32;
        const t = smoothstep(range(p, desde, desde + 0.1));
        if (rama.linea) rama.linea.style.strokeDashoffset = String(1 - t);
        if (rama.punto) {
          rama.punto.style.opacity = String(smoothstep(range(p, desde + 0.06, desde + 0.1)));
        }
      }
    };

    const disparador = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => pintar(self.progress),
      onRefresh: (self) => pintar(self.progress),
    });
    pintar(disparador.progress);

    return () => disparador.kill();
  }, [estatico, textos.km]);

  const [destX, destY] = SEDES.madrid.punto;

  return (
    <section
      ref={raiz}
      data-bg="night"
      className={`bg-night-depth relative z-10 bg-night ${
        estatico ? 'py-20 lg:py-28' : 'min-h-[250svh] motion-reduce:min-h-0'
      }`}
    >
      <div
        className={
          estatico
            ? ''
            : 'sticky top-20 flex min-h-[calc(100svh-5rem)] items-center py-8 motion-reduce:static motion-reduce:py-20 lg:py-10'
        }
      >
        <Container className="w-full">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.5fr)] lg:gap-12">
            <div>
              <h2 className="font-display text-display-md uppercase text-white">
                {textos.titulo}
              </h2>
              <p className="mt-5 hidden max-w-sm text-lg leading-relaxed text-white/70 sm:block">
                {textos.subtitulo}
              </p>

              <p className="mt-6 flex items-baseline gap-2 lg:mt-10">
                <span
                  data-km
                  className="font-display text-5xl leading-none tracking-tight text-white tabular-nums sm:text-7xl"
                >
                  {textos.km}
                </span>
                <span className="font-display text-xl uppercase tracking-tight text-brand-red-soft sm:text-2xl">
                  {textos.unidad}
                </span>
              </p>
              <p className="mt-2 font-display text-xs uppercase tracking-[0.18em] text-white/60 sm:tracking-[0.3em]">
                {textos.etiqueta}
              </p>

              {/* La segunda mitad del mensaje: entra cuando la red empieza a
                  abrirse, no antes, para que se lea como lo que pasa en el
                  mapa y no como un párrafo más. */}
              <div data-fase2 className="mt-6 lg:mt-10">
                <p className="max-w-sm text-base leading-relaxed text-white sm:text-lg">
                  {textos.red}
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-sm text-white/70">
                  <li className="flex items-center gap-3">
                    <span aria-hidden="true" className="block h-[3px] w-8 rounded-full bg-brand-red-soft" />
                    {textos.diaria}
                  </li>
                  <li className="flex items-center gap-3">
                    <span aria-hidden="true" className="block h-px w-8 bg-white/45" />
                    {textos.resto}
                  </li>
                </ul>
              </div>
            </div>

            {/* El mapa va a sangre en móvil: con el margen del contenedor se
                quedaba en un sello y los nombres de las naves no se leían. */}
            <svg
              viewBox={VIEWBOX}
              role="img"
              aria-label={textos.mapa}
              className="-mx-6 h-auto w-[calc(100%+3rem)] max-w-none sm:mx-0 sm:w-full"
            >
              {/* Lo que rodea a la península: Portugal y lo que asoma de Francia
                  y del norte de África, en un tono casi del fondo, solo para
                  que la península no flote en el vacío. No son destinos.

                  Van con un fundido hacia los bordes: sin él, Francia y Argelia
                  se cortaban contra el borde del dibujo y se veía un
                  rectángulo en las esquinas. */}
              <defs>
                <radialGradient id={`${ids}-fundido`} cx="48%" cy="50%" r="62%">
                  <stop offset="55%" stopColor="#fff" />
                  <stop offset="100%" stopColor="#000" />
                </radialGradient>
                <mask id={`${ids}-mascara`}>
                  <rect x="10" y="8" width="910" height="735" fill={`url(#${ids}-fundido)`} />
                </mask>
              </defs>
              <g mask={`url(#${ids}-mascara)`}>
                <path d={ROUTE_MAP.neighbours} fill="rgb(255 255 255 / 0.03)" stroke="rgb(255 255 255 / 0.07)" strokeWidth={1} />
                <path d={ROUTE_MAP.portugal} fill="rgb(255 255 255 / 0.035)" stroke="rgb(255 255 255 / 0.09)" strokeWidth={1} />
              </g>
              <path d={PENINSULA} fill="#18263f" stroke="#2f4263" strokeWidth={1.2} strokeLinejoin="round" />

              {/* Las dos provincias de las naves. */}
              <path
                data-sede
                d={SEDES.castellon.provincia}
                fill="rgb(222 90 94 / 0.24)"
                stroke="#de5a5e"
                strokeWidth={1.2}
                strokeLinejoin="round"
              />
              <path
                data-sede
                d={SEDES.madrid.provincia}
                fill="rgb(142 168 214 / 0.26)"
                stroke="#8ea8d6"
                strokeWidth={1.2}
                strokeLinejoin="round"
              />

              {/* La red: una rama por capital de provincia. Al pasar el ratón,
                  la rama se enciende y sale el nombre. El círculo grande y
                  transparente es solo la zona que recoge el ratón: el punto
                  visible es demasiado pequeño para acertarle. */}
              {RAMAS.map((rama) => (
                <g key={rama.nombre} data-rama={rama.orden} className="group/ciudad">
                  <path
                    d={rama.d}
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={0}
                    fill="none"
                    strokeWidth={1.3}
                    strokeLinecap="round"
                    className="stroke-white/30 transition-[stroke] duration-200 group-hover/ciudad:stroke-white"
                  />
                  <circle cx={rama.x} cy={rama.y} r={14} fill="transparent" />
                  <circle data-punto cx={rama.x} cy={rama.y} r={3.4} className="fill-white/85" />
                  <text
                    x={rama.x + 8}
                    y={rama.y - 7}
                    className="pointer-events-none fill-white font-sans text-[15px] opacity-0 transition-opacity duration-200 group-hover/ciudad:opacity-100"
                  >
                    {rama.nombre}
                  </text>
                </g>
              ))}

              {/* La ruta diaria, encima de todo lo demás: es la que manda. La
                  discontinua de debajo la anuncia antes de dibujarse. */}
              <path
                d={ROUTE_MAP.corridor}
                fill="none"
                stroke="rgb(255 255 255 / 0.18)"
                strokeWidth={2}
                strokeDasharray="3 6"
                strokeLinecap="round"
              />
              <path
                data-ruta
                d={ROUTE_MAP.corridor}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={0}
                fill="none"
                stroke="#de5a5e"
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Las dos naves. */}
              {Object.values(SEDES).map((sede) => (
                <g key={sede.nombre}>
                  <circle cx={sede.punto[0]} cy={sede.punto[1]} r={11} fill="rgb(255 255 255 / 0.14)" />
                  <circle cx={sede.punto[0]} cy={sede.punto[1]} r={5.5} fill="#fff" />
                </g>
              ))}
              <text
                x={SEDES.castellon.punto[0] + 16}
                y={SEDES.castellon.punto[1] - 12}
                className="fill-white font-display text-[22px] uppercase tracking-tight"
              >
                {SEDES.castellon.nombre}
              </text>
              <text
                x={SEDES.madrid.punto[0] - 16}
                y={SEDES.madrid.punto[1] - 16}
                textAnchor="end"
                className="fill-white font-display text-[22px] uppercase tracking-tight"
              >
                {SEDES.madrid.nombre}
              </text>

              {/* El punto que recorre la ruta. En el marcado está ya en
                  Fuenlabrada, que es su sitio final: sin JS se ve llegado. */}
              <g data-camion transform={`translate(${destX} ${destY})`}>
                <circle r={13} fill="rgb(222 90 94 / 0.3)" />
                <circle r={6.5} fill="#fff" stroke="#de5a5e" strokeWidth={3} />
              </g>
            </svg>
          </div>
        </Container>
      </div>
    </section>
  );
}
