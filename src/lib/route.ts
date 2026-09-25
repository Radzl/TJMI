import { range, smoothstep } from './utils';

/** Tramo de la escena 5 en el que el camión recorre la carretera. */
export const ROAD_RUN = { from: 0.48, to: 0.78 };

/**
 * Avance por la carretera, de 0 a 1. Lo comparten el camión, el trazado que se
 * dibuja y el cuentakilómetros para que los tres vayan clavados.
 */
export function roadProgress(route: number) {
  return smoothstep(range(route, ROAD_RUN.from, ROAD_RUN.to));
}
