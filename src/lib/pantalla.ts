/**
 * Medidas de pantalla compartidas.
 *
 * Nació para que `Experience` supiera el umbral de móvil sin importar
 * `Postproceso` (la viñeta, que ya no existe). Hoy lo usa el hero para saber
 * cuándo el párrafo entra con la carga, y la escena 3D usa el mismo corte:
 * dos sitios que tienen que usar el mismo número y que, si se desincronizan,
 * rompen algo en silencio.
 */

/**
 * Por debajo de este ancho se considera móvil.
 *
 * Coincide con el `md` de Tailwind a propósito: si alguna vez se decide por
 * CSS y por JavaScript la misma cosa, que el corte caiga en el mismo sitio.
 */
export const ANCHO_MOVIL = 768;
