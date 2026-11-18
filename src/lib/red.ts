import { ROUTE_MAP } from '@/components/sections/routeMapPaths';

/**
 * La geometría del mapa de la red: la península, las dos sedes, la ruta diaria
 * y las rutas al resto de España. La usa `MapaRed`, en la portada y en
 * `/cobertura`.
 *
 * **No descarga nada ni necesita otro archivo generado.** El contorno, las dos
 * provincias y el corredor ya están en `routeMapPaths.ts` (Natural Earth,
 * dominio público); aquí solo se recorta lo que sobra y se sitúan las ciudades
 * con **la misma proyección** que usa `scripts/gen-mapa.mjs`.
 *
 * Esa proyección está copiada, no importada, porque el guion es un archivo de
 * Node que no entra en el paquete. **Si cambia el encuadre allí, hay que
 * cambiarlo aquí**: lo comprueba `PROYECCION_CUADRA`, que mira que Almazora
 * caiga exactamente donde el guion la puso.
 */
const LON: [number, number] = [-9.6, 4.6];
const LAT: [number, number] = [35.8, 44.0];
const K = Math.cos(((LAT[0] + LAT[1]) / 2) * (Math.PI / 180));
const ESCALA = 1000 / ((LON[1] - LON[0]) * K);

export function proyectar(lon: number, lat: number): [number, number] {
  return [(lon - LON[0]) * K * ESCALA, (LAT[1] - lat) * ESCALA];
}

const almazora = proyectar(-0.061, 39.947);
/** `true` si la proyección de aquí y la del guion siguen siendo la misma. */
export const PROYECCION_CUADRA =
  Math.abs(almazora[0] - ROUTE_MAP.from[0]) < 0.2 &&
  Math.abs(almazora[1] - ROUTE_MAP.from[1]) < 0.2;

/**
 * **Solo la península**, y es decisión del cliente: el contorno de España del
 * mapa trae Baleares, Ceuta y algún islote, y ninguno es destino que se
 * anuncie. Se quitan por dónde empieza cada trozo del trazado: Baleares queda
 * a la derecha de x = 760 y Ceuta por debajo de y = 700, y la península no
 * llega a ninguna de las dos.
 */
export const PENINSULA = ROUTE_MAP.spain
  .split('M')
  .filter(Boolean)
  .filter((trozo) => {
    const [x, y] = trozo.split('L')[0].split(' ').map(Number);
    return x < 760 && y < 700;
  })
  .map((trozo) => 'M' + trozo)
  .join('');

/** Encuadre: la península con un poco de aire. Portugal asoma por la izquierda. */
export const VIEWBOX = '10 8 910 735';

export const SEDES = {
  castellon: { nombre: 'Almazora', punto: ROUTE_MAP.from, provincia: ROUTE_MAP.castellon },
  madrid: { nombre: 'Fuenlabrada', punto: ROUTE_MAP.to, provincia: ROUTE_MAP.madrid },
} as const;

/**
 * Los destinos: las capitales de provincia de la península, sin Madrid ni
 * Castellón, que son las sedes, y sin Valencia, que ya está en la ruta diaria
 * (el corredor pasa por ella) y su rama se montaría encima de la línea roja.
 *
 * **No afirman nada que la web no diga.** La web ya publica «cobertura en toda
 * España»; esto la dibuja. No llevan plazos ni frecuencias, porque eso solo lo
 * sabe el cliente. Las coordenadas son las de cada ciudad; a este tamaño la
 * diferencia con el punto exacto no se ve.
 */
const CIUDADES: Array<[string, number, number]> = [
  ['A Coruña', -8.41, 43.36],
  ['Lugo', -7.56, 43.01],
  ['Ourense', -7.86, 42.34],
  ['Pontevedra', -8.65, 42.43],
  ['Oviedo', -5.85, 43.36],
  ['Santander', -3.8, 43.46],
  ['Bilbao', -2.93, 43.26],
  ['San Sebastián', -1.98, 43.32],
  ['Vitoria', -2.67, 42.85],
  ['Pamplona', -1.64, 42.81],
  ['Logroño', -2.45, 42.47],
  ['Burgos', -3.7, 42.34],
  ['León', -5.57, 42.6],
  ['Palencia', -4.53, 42.01],
  ['Valladolid', -4.72, 41.65],
  ['Zamora', -5.75, 41.5],
  ['Salamanca', -5.66, 40.97],
  ['Segovia', -4.12, 40.95],
  ['Ávila', -4.7, 40.66],
  ['Soria', -2.47, 41.76],
  ['Guadalajara', -3.17, 40.63],
  ['Zaragoza', -0.88, 41.65],
  ['Huesca', -0.41, 42.14],
  ['Lleida', 0.62, 41.62],
  ['Girona', 2.82, 41.98],
  ['Barcelona', 2.17, 41.39],
  ['Tarragona', 1.25, 41.12],
  ['Teruel', -1.11, 40.34],
  ['Cuenca', -2.13, 40.07],
  ['Toledo', -4.03, 39.86],
  ['Ciudad Real', -3.93, 38.99],
  ['Cáceres', -6.37, 39.47],
  ['Badajoz', -6.97, 38.88],
  ['Albacete', -1.86, 38.99],
  ['Alicante', -0.48, 38.35],
  ['Murcia', -1.13, 37.99],
  ['Almería', -2.46, 36.84],
  ['Granada', -3.6, 37.18],
  ['Jaén', -3.79, 37.77],
  ['Córdoba', -4.78, 37.89],
  ['Sevilla', -5.98, 37.39],
  ['Huelva', -6.95, 37.26],
  ['Cádiz', -6.29, 36.53],
  ['Málaga', -4.42, 36.72],
];

export type Rama = {
  nombre: string;
  /** Desde qué sede sale: la más cercana a la ciudad. */
  sede: keyof typeof SEDES;
  /** Punto de la ciudad. */
  x: number;
  y: number;
  /** El arco, de la sede a la ciudad. */
  d: string;
  /** Orden de aparición, de 0 a 1: de la más cercana a la más lejana. */
  orden: number;
};

/**
 * Cada ciudad cuelga de la sede que le queda más cerca, que es lo que pidió el
 * cliente: «rutas de Madrid o de Castellón a toda España».
 *
 * **Las ramas son arcos suaves y no rectas**, pero muy poco curvados (un 12 %
 * de la distancia). Rectas se leían como un esquema de cables; con más curva,
 * como rutas de avión, y esto es transporte por carretera.
 *
 * **Se dibujan de la más cercana a la más lejana**, mezclando las dos sedes, así
 * que la red se abre como una onda desde las dos naves a la vez.
 */
export const RAMAS: Rama[] = (() => {
  const lista = CIUDADES.map(([nombre, lon, lat]) => {
    const [x, y] = proyectar(lon, lat);
    const dC = Math.hypot(x - SEDES.castellon.punto[0], y - SEDES.castellon.punto[1]);
    const dM = Math.hypot(x - SEDES.madrid.punto[0], y - SEDES.madrid.punto[1]);
    const sede: keyof typeof SEDES = dC < dM ? 'castellon' : 'madrid';
    const [sx, sy] = SEDES[sede].punto;
    const dist = Math.min(dC, dM);
    // Punto de control: el medio del segmento, desplazado en perpendicular.
    const mx = (sx + x) / 2;
    const my = (sy + y) / 2;
    const px = -(y - sy) / (dist || 1);
    const py = (x - sx) / (dist || 1);
    const cx = mx + px * dist * 0.12;
    const cy = my + py * dist * 0.12;
    const r = (n: number) => Math.round(n * 10) / 10;
    return {
      nombre,
      sede,
      x: r(x),
      y: r(y),
      d: `M${r(sx)} ${r(sy)}Q${r(cx)} ${r(cy)} ${r(x)} ${r(y)}`,
      dist,
    };
  }).sort((a, b) => a.dist - b.dist);

  return lista.map((rama, i) => ({
    nombre: rama.nombre,
    sede: rama.sede,
    x: rama.x,
    y: rama.y,
    d: rama.d,
    orden: lista.length > 1 ? i / (lista.length - 1) : 0,
  }));
})();
