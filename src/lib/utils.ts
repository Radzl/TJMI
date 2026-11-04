export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/** Reescala `value` al tramo [start, end] y lo devuelve entre 0 y 1. */
export function range(value: number, start: number, end: number) {
  return clamp((value - start) / (end - start));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Suaviza los extremos de un 0 → 1 para que las transiciones no den tirones. */
export function smoothstep(t: number) {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
}

/** Arranca rápido y frena al final: sirve para que el camión "llegue". */
export function easeOut(t: number) {
  const x = clamp(t);
  return 1 - (1 - x) ** 3;
}

/**
 * Sale despacio y resuelve el final deprisa, pero llegando suave.
 *
 * `smoothstep` es **simétrico**: entra y sale exactamente igual. Eso está bien
 * para un fundido, y es justo lo que hace que un movimiento de cámara parezca
 * interpolado en vez de manejado: un operador de verdad arranca con mimo y
 * resuelve el final, no reparte el recorrido a partes iguales.
 *
 * Es `smoothstep` elevado, así que conserva lo que lo hacía útil —derivada
 * cero en los dos extremos, sin tirones— y solo mueve el grueso del recorrido
 * a la segunda mitad.
 */
export function easeLag(t: number) {
  return smoothstep(t) ** 1.4;
}

/**
 * Acercamiento amortiguado, independiente de los fotogramas por segundo.
 *
 * `lerp` a secas depende de cuántas veces se llame por segundo: a 120 fps va
 * el doble de rápido que a 60. Esto no: `smoothing` es cuánto se recorta la
 * distancia cada segundo, y el resultado es el mismo en cualquier máquina.
 */
export function damp(
  current: number,
  target: number,
  smoothing: number,
  delta: number,
) {
  return lerp(current, target, 1 - Math.exp(-smoothing * delta));
}
