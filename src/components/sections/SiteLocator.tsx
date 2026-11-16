import { ROUTE_MAP } from './routeMapPaths';

type Sede = 'castellon' | 'madrid';

/**
 * Mapa propio de la zona de cada sede, dibujado con los mismos trazados que el
 * mapa de la ruta (Natural Earth, dominio público).
 *
 * **Por qué existe.** El hueco del mapa de cada sede espera a que se acepten
 * las cookies de Google, y casi nadie las acepta: lo que veía la mayoría era
 * un párrafo centrado sobre crema con un botón azul, que **se lee como un error
 * de carga**. No se puede arreglar cargando el mapa de Google antes —es lo que
 * sanciona la AEPD—, así que el estado por defecto pasa a ser un dibujo
 * nuestro que no le pide nada a nadie: la provincia marcada, el punto de la
 * nave y el corredor saliendo de ella. Quien quiere calles tiene el mapa de
 * verdad a un clic.
 *
 * Es un recorte del mismo lienzo de 1000 × 753 del mapa de la ruta, centrado en
 * la nave, y va con `slice`: llena el hueco tenga la forma que tenga (casi
 * cuadrado en el móvil, apaisado en escritorio) sin dejar bandas vacías.
 */
const SEDES: Record<
  Sede,
  { provincia: string; punto: readonly number[]; etiqueta: string; color: string; borde: string }
> = {
  castellon: {
    provincia: ROUTE_MAP.castellon,
    punto: ROUTE_MAP.from,
    etiqueta: 'Almazora',
    color: 'rgb(208 59 64 / 0.16)',
    borde: '#b83035',
  },
  madrid: {
    provincia: ROUTE_MAP.madrid,
    punto: ROUTE_MAP.to,
    etiqueta: 'Fuenlabrada',
    color: 'rgb(52 84 138 / 0.3)',
    borde: '#34548a',
  },
};

export default function SiteLocator({ sede }: { sede: Sede }) {
  const { provincia, punto, etiqueta, color, borde } = SEDES[sede];
  const [x, y] = punto;
  // Un recorte de unos 300 × 190 unidades alrededor de la nave: lo bastante
  // abierto para que se lea la provincia entera y la costa, lo bastante
  // cerrado para que el punto no sea una mota.
  const ancho = 300;
  const alto = 190;
  // La nave va en el tercio de arriba y no en el centro: la mitad de abajo
  // del recuadro la ocupan el aviso y los botones. Con `xMidYMin` el recorte
  // se ancla arriba, así que el punto queda a 50 unidades del borde superior
  // tenga el hueco la forma que tenga.
  const viewBox = `${x - ancho / 2} ${y - 50} ${ancho} ${alto}`;

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      <rect x={x - 400} y={y - 400} width={800} height={800} fill="#f3eee4" />
      <path d={ROUTE_MAP.portugal} fill="#efe9dd" stroke="#d6cdbb" strokeWidth={0.8} />
      <path d={ROUTE_MAP.spain} fill="#e7dfcf" stroke="#d6cdbb" strokeWidth={0.8} strokeLinejoin="round" />
      <path d={provincia} fill={color} stroke={borde} strokeWidth={0.9} strokeLinejoin="round" />

      {/* El corredor sale de la nave: es lo que hace de ese punto una sede de
          la ruta y no una dirección cualquiera. */}
      <path
        d={ROUTE_MAP.corridor}
        fill="none"
        stroke="#34548a"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />

      <circle cx={x} cy={y} r={9} fill="none" stroke="#d03b40" strokeWidth={1.2} opacity={0.5} />
      <circle cx={x} cy={y} r={4.5} fill="#d03b40" />
      <text
        x={x + 12}
        y={y - 9}
        className="fill-ink font-display uppercase tracking-tight"
        fontSize={12}
      >
        {etiqueta}
      </text>
    </svg>
  );
}
