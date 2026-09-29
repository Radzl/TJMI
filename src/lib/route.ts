import { range, smoothstep } from './utils';

/**
 * Tramo de la escena 5 en el que el camión recorre la carretera.
 *
 * Ocupa casi la mitad de la sección a propósito: el recorrido son 420 km y
 * con un tramo corto se despachaba en dos golpes de rueda. Si se toca esto,
 * hay que mover también el fundido final (`closing` en `Scene.tsx`) y la
 * salida del texto en `RoadIntro`, que van detrás de la llegada.
 */
export const ROAD_RUN = { from: 0.46, to: 0.88 };

/**
 * Avance por la carretera, de 0 a 1. Lo comparten el camión, el trazado que se
 * dibuja y el cuentakilómetros para que los tres vayan clavados.
 */
export function roadProgress(route: number) {
  return smoothstep(range(route, ROAD_RUN.from, ROAD_RUN.to));
}
