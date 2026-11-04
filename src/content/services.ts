import { SERVICE_PHOTOS, type Photo } from './media';

/**
 * Los seis servicios, con su dirección propia.
 *
 * ## Por qué existe este archivo
 *
 * Hasta ahora los servicios solo vivían en `messages`, identificados por su
 * posición en la lista. Eso vale mientras se pintan todos juntos, pero **una
 * dirección web no puede depender de un índice**: si mañana se reordena la
 * lista, `/servicios/3` pasaría a ser otro servicio y los enlaces de fuera
 * apuntarían a lo que no es.
 *
 * Aquí viven las dos cosas que no se traducen —el `slug` y qué foto le toca—
 * atadas al índice de `messages`. El texto sigue donde estaba.
 *
 * ## Los slugs están en español en los dos idiomas, y es a propósito
 *
 * Las rutas de esta web no se traducen (`routing.ts` no declara `pathnames`),
 * así que la versión inglesa de grupaje es `/en/servicios/grupaje`. Traducirlos
 * obligaría a mantener dos tablas de rutas y a redirigir las antiguas, y lo que
 * se ganaría es posicionamiento en inglés para una empresa cuyo mercado es
 * Castellón y Madrid. No compensa.
 *
 * ## Si añades un servicio
 *
 * Tres sitios, y los tres hacen falta: el texto en `messages.services.items`,
 * la foto en `content/media.ts` y la entrada de aquí. Y el `slug` en
 * `SITE_PATHS` lo recoge solo `lib/seo.ts`, que lee esta lista.
 */
export type Service = {
  /** Lo que va en la dirección. No se traduce. */
  slug: string;
  /** Su sitio en `messages.services.items`. */
  index: number;
  photo: Photo;
};

export const SERVICES: Service[] = [
  { slug: 'grupaje', index: 0, photo: SERVICE_PHOTOS[0] },
  { slug: 'camion-completo', index: 1, photo: SERVICE_PHOTOS[1] },
  { slug: 'nacional-e-internacional', index: 2, photo: SERVICE_PHOTOS[2] },
  { slug: 'almacenaje', index: 3, photo: SERVICE_PHOTOS[3] },
  { slug: 'picking', index: 4, photo: SERVICE_PHOTOS[4] },
  { slug: 'contenedores', index: 5, photo: SERVICE_PHOTOS[5] },
];

export function findService(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

/** Las rutas de los seis, para el sitemap. */
export const SERVICE_PATHS = SERVICES.map(
  (service) => `/servicios/${service.slug}`,
);
