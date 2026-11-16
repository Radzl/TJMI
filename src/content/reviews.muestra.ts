import type { Review } from './reviews';

/**
 * Reseñas **de muestra**, para poder ver y juzgar el carrusel con contenido
 * mientras no haya reseñas de verdad.
 *
 * ## Por qué viven aparte y por qué no salen en producción
 *
 * El texto es lorem ipsum a propósito, y las caras son retratos de banco: nada
 * de esto lo ha dicho nadie. Una reseña inventada publicada es una reseña falsa,
 * aunque se pusiera de relleno, y si se queda ahí el día que esto se publique el
 * problema deja de ser de diseño. Por eso:
 *
 * - **No están en `reviews.ts`**, que es donde van las de verdad. Así nadie las
 *   confunde con contenido ni se olvida una entre las reales.
 * - **`Reviews.tsx` solo las usa si no hay ninguna real**, y solo en
 *   desarrollo (`npm run dev`) o si se enciende a mano la variable
 *   `NEXT_PUBLIC_RESENAS_MUESTRA=1` —por ejemplo en una vista previa para
 *   enseñársela al cliente—. En una compilación de producción normal, sin esa
 *   variable, la sección sigue sin existir mientras no haya reseñas reales.
 * - En cuanto se añade **una sola** reseña real a `reviews.ts`, estas dejan de
 *   salir en todas partes.
 *
 * ## Las fotos
 *
 * Seis retratos de **StockSnap, con licencia CC0** (dominio público: uso libre,
 * sin atribución obligatoria), recortados a cuadrado en
 * `public/media/resenas-muestra/`. Son gente que no tiene nada que ver con la
 * empresa, y ese es justo el motivo de que no puedan publicarse junto a una
 * opinión: le pondrían cara de cliente a alguien que no lo es. Para la maqueta
 * sirven; para la web, no.
 *
 * Origen, por si hay que rastrearlas (todas en stocksnap.io/photo/…):
 * senior-business-UTEZRDTKPP, business-woman-FPQIEQBMPA,
 * business-man-IVZBYWKEFM, business-woman-0XMV6LYGUZ,
 * black-portrait-T8VNJRQH7F y smiling-woman-W6GFOSFAXA.
 *
 * Son cinco y no tres a propósito: con tres caben en una pantalla de escritorio
 * y los mandos del carrusel se esconden solos, así que no se podría ver la
 * pieza entera.
 */
export const REVIEWS_MUESTRA: Review[] = [
  {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam.',
    author: 'Andrés Lorem',
    from: 'Fábrica de muestra',
    rating: 5,
    date: '2026-10-14',
    photo: '/media/resenas-muestra/persona-1.jpg',
  },
  {
    text: 'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.',
    author: 'Lucía Ipsum',
    from: 'Distribuidora de muestra',
    rating: 5,
    date: '2026-09-22',
    photo: '/media/resenas-muestra/persona-2.jpg',
  },
  {
    text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus, nulla gravida orci a odio.',
    author: 'Pablo Dolor',
    from: 'Almacén de muestra',
    rating: 4,
    date: '2026-08-30',
    photo: '/media/resenas-muestra/persona-3.jpg',
  },
  {
    text: 'Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.',
    author: 'Carmen Amet',
    from: 'Cerámica de muestra',
    rating: 5,
    date: '2026-07-18',
    photo: '/media/resenas-muestra/persona-4.jpg',
  },
  {
    text: 'Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit, etiam tempor.',
    author: 'Daniel Sit',
    from: 'Constructora de muestra',
    rating: 5,
    date: '2026-06-05',
    photo: '/media/resenas-muestra/persona-5.jpg',
  },
  {
    text: 'Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi.',
    author: 'Marta Elit',
    from: 'Tienda de muestra',
    rating: 4,
    date: '2026-05-11',
    photo: '/media/resenas-muestra/persona-6.jpg',
  },
];
