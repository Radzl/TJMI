/**
 * La escena de día: cámara con perspectiva y cielo.
 *
 * Fue la «prueba D1» (2026-11-18), detrás de un interruptor `?d1` en la
 * dirección mientras el cliente la valoraba. Aprobada el mismo día, es ya la
 * única escena: la cámara plana (ortográfica) y todo lo que solo existía por
 * ella —la caja del suelo oscuro, el paralaje falso, las vigas de «luz de
 * nave», el suelo crema— se quitaron. Ver «La escena de día» en `CLAUDE.md`.
 */

/** Apertura vertical de la cámara, en grados. Un tele medio: da profundidad
 *  sin deformar el camión en los bordes. */
export const FOV = 34;

/** Colores del día. Sacados de `public/media/camion-02.jpg`, el patio de
 *  Almazora con sol: cielo azul limpio arriba y bruma clara en el horizonte.
 *  El horizonte es también el color de la niebla, para que el suelo lejano se
 *  funda con el cielo sin línea. */
export const CIELO = {
  cenit: '#4a84d4',
  horizonte: '#d4e3f6',
};
