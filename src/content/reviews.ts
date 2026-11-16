/**
 * Las reseñas de clientes.
 *
 * ## Está vacío a propósito, y no es lo mismo que estar sin hacer
 *
 * La sección existe, está maquetada y sabe apañarse sin contenido — igual que
 * el blog sabía apañarse sin fotos de portada. Lo que **no** hay aquí es ni
 * una reseña de ejemplo, y eso es deliberado: **una reseña inventada en una
 * web es una reseña falsa aunque se haya puesto de relleno**, y si se queda
 * ahí sin querer el día que esto se publique, el problema deja de ser de
 * diseño. Se rellena con las de verdad y punto.
 *
 * ## Cómo se rellena
 *
 * Una entrada por reseña, copiando el texto tal cual de la ficha de Google.
 * `author` es el nombre que aparece allí; si quien la escribe prefiere que
 * salga su empresa, se pone la empresa. `date` en ISO, como en el blog.
 *
 * ## Y cuando se ligue con Google de verdad
 *
 * **Traerlas por la API desde el navegador convierte a Google en un tercero**,
 * así que caería en el mismo consentimiento que los mapas y la mayoría no las
 * vería. Lo que no tiene ese problema es traerlas **en el servidor** y
 * guardarlas aquí: se actualizan solas y el visitante no habla con Google.
 * Es más trabajo y es el camino que no mete a nadie en un lío.
 */

export type Review = {
  /** El texto, tal cual lo escribió quien lo escribió. */
  text: string;
  author: string;
  /** Empresa, pueblo o cargo. Opcional: no todas lo traen. */
  from?: string;
  /** De 1 a 5. */
  rating: number;
  /** Fecha en ISO. */
  date: string;
  /**
   * Foto de quien firma, si la hay (las reseñas de Google traen la del
   * perfil). Sin ella, la tarjeta pone las iniciales.
   */
  photo?: string;
};

export const reviews: Review[] = [];

/**
 * La ficha de Google, para «leerlas todas».
 *
 * `null` mientras no esté la dirección: un enlace a ninguna parte es peor que
 * no tener enlace. Ver los huecos `[PENDIENTE: ...]` de las páginas legales,
 * que funcionan igual.
 */
export const GOOGLE_PROFILE: string | null = null;

/** Las más recientes primero, que es como se leen. */
export function sortedReviews() {
  return [...reviews].sort((a, b) => b.date.localeCompare(a.date));
}
