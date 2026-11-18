/**
 * Puente entre el 3D y la pantalla de carga.
 *
 * El 3D carga **dentro** del lienzo, que se monta tarde y aparte
 * (`ExperienceCanvas`), y la pantalla de carga vive **fuera**, en el layout,
 * para estar en el HTML desde el primer pintado. Las dos no se pueden pasar
 * nada por props, y meter el progreso de drei en la pantalla de carga
 * arrastraría drei entero al primer paquete de JavaScript.
 *
 * Así que el 3D escribe aquí (`AvisoCarga`, dentro de `Experience`) y la
 * pantalla de carga escucha. Es un evento del navegador y una copia del último
 * estado, para quien llegue tarde a escuchar.
 */
export const EVENTO_CARGA = 'tjmi:carga-3d';

export type EstadoCarga = {
  /** Todo lo del 3D descargado. */
  listo: boolean;
  /** De 0 a 100. */
  progreso: number;
};

let ultimo: EstadoCarga = { listo: false, progreso: 0 };

export function escribirCarga(estado: EstadoCarga) {
  ultimo = estado;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<EstadoCarga>(EVENTO_CARGA, { detail: estado }));
}

export function leerCarga(): EstadoCarga {
  return ultimo;
}
