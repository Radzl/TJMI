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
