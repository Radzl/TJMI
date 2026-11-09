/**
 * Medidas de pantalla compartidas.
 *
 * Esto existe por un motivo muy concreto: `Experience` necesita saber el
 * umbral de móvil **sin importar `Postproceso`**, porque ese módulo se carga
 * de forma diferida justo para que no viaje al teléfono. Importarle una
 * constante lo traería entero y el aplazamiento no serviría de nada.
 *
 * Es el mismo caso que `roadFrameWidth` en `lib/route.ts`: dos sitios que
 * tienen que usar el mismo número y que, si se desincronizan, rompen algo en
 * silencio.
 */

/**
 * Por debajo de este ancho se considera móvil.
 *
 * Coincide con el `md` de Tailwind a propósito: si alguna vez se decide por
 * CSS y por JavaScript la misma cosa, que el corte caiga en el mismo sitio.
 */
export const ANCHO_MOVIL = 768;
