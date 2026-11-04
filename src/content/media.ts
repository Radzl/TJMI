/**
 * Las fotos de la casa, en un solo sitio.
 *
 * Antes la lista estaba **copiada en dos archivos** (la portada y la página de
 * Servicios), así que cambiar una foto era cambiarla en dos sitios y acordarse
 * de los dos. Ahora salen de aquí.
 *
 * Cada hueco declara además **el ancho que necesita de verdad** (`needs`) y
 * **qué debería verse** (`brief`). No es documentación de adorno:
 *
 *  - `needs` es lo que mide el hueco en píxeles de pantalla en el peor caso
 *    (pantalla de las de doble densidad). `npm run check:fotos` compara el
 *    ancho real de cada archivo con ese número y canta las que no llegan. Hoy
 *    no llegan tres, y por eso se ven blandas: no es cosa de la cámara, es que
 *    están ampliadas al triple.
 *  - `brief` es el encargo para cuando se hagan fotos nuevas. Está aquí y no
 *    en un documento aparte porque aquí es donde se mira al cambiarlas.
 *
 * El `alt` va vacío a propósito en las tarjetas: al lado de cada foto está su
 * titular, así que describirla otra vez se lo lee dos veces quien usa lector de
 * pantalla. Si alguna foto pasa a contar algo que el texto no diga, entonces sí
 * lleva `alt`.
 */

export type Photo = {
  src: string;
  /** Ancho que necesita el hueco más grande donde se usa, en píxeles reales. */
  needs: number;
  /** Proporción a la que se recorta. Una foto vertical aquí pierde medio encuadre. */
  ratio: number;
  /** Qué tendría que verse. Es el encargo para la sesión de fotos. */
  brief: string;
};

/** Las seis de servicio, en el mismo orden que los textos de `messages`. */
export const SERVICE_PHOTOS: Photo[] = [
  {
    src: '/media/grupaje.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'Varios palés de clientes distintos esperando juntos en el muelle, con sus etiquetas a la vista. Lo que cuenta el grupaje es que son envíos de varios en el mismo camión.',
  },
  {
    src: '/media/ftl.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'El semirremolque cargado a tope y la lona cerrándose, o el tráiler entero de perfil en la nave. Tiene que leerse "esto va solo para ti".',
  },
  {
    src: '/media/intl.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'El CMR o el albarán firmándose sobre el capó, con el camión detrás desenfocado. La internacional se cuenta con papeles, no con mapas.',
  },
  {
    src: '/media/almacen.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'Pasillo de la nave con las estanterías llenas, hacia el fondo. Que se vea altura y que se vea que está lleno.',
  },
  {
    src: '/media/picking.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'Manos retractilando un palé o pegando la etiqueta. En primer plano las manos y el producto, el resto fuera de foco.',
  },
  {
    src: '/media/contenedores.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'La carretilla metiéndose en el contenedor abierto, vista desde fuera. El hueco oscuro del contenedor hace de marco.',
  },
];

/** El bloque destacado de la portada: azulejo y material de construcción. */
export const FEATURED_PHOTO: Photo = {
  src: '/media/camion-02.jpg',
  needs: 1600,
  ratio: 1.2,
  brief:
    'El camión de la casa cargando azulejo en fábrica, con la lona abierta y la carretilla entrando. Es la foto que más se ve de toda la web.',
};

/** Fotograma de arranque del vídeo corporativo. */
export const VIDEO_POSTER: Photo = {
  src: '/media/camion-01.jpg',
  needs: 1600,
  ratio: 1.77,
  brief:
    'La tractora blanca de perfil, entera, con las rayas de la casa bien visibles. Es lo primero que se ve en Nosotros antes de que arranque el vídeo.',
};

/**
 * Las fotos de las dos sedes, en el mismo orden que `contact.sites`.
 *
 * **Están declaradas y vacías a propósito.** El hueco existe, el encargo está
 * escrito y el día que lleguen los archivos es una línea por sede. Lo que no
 * se hace es rellenarlo con una foto de otro sitio: `camion-02.jpg` es el
 * patio de Almazora y es verdad, pero ya es la foto grande de Servicios, y la
 * misma imagen dos veces en la misma página se lee como que no hay más.
 *
 * Mientras no haya foto, el hueco del mapa enseña lo de siempre: la dirección
 * y el enlace a Maps.
 */
export const SITE_PHOTOS: Array<Photo | null> = [
  null, // Almazora (Castellón)
  null, // Fuenlabrada (Madrid)
];

/** Qué tendría que verse en cada una. Es el encargo para la sesión de fotos. */
export const SITE_PHOTO_BRIEF = {
  needs: 1100,
  ratio: 1.6,
  brief:
    'La nave entera desde fuera, de día y con un camión de la casa delante o en el muelle. Tiene que leerse que es un sitio grande y en marcha, no una fachada vacía. Mejor en horizontal y desde una esquina, para que se vea profundidad.',
};

/**
 * Las fotos de las páginas que hoy no tienen ninguna.
 *
 * **Por qué hacían falta.** `/faq` y `/contacto` son tipografía sobre crema de
 * arriba abajo. La portada va cargadísima —intro 3D, mosaico, desfile, banda
 * de cifras— y las interiores van desnudas, y ese salto entre unas y otras se
 * nota: parecen dos sitios distintos.
 *
 * **Están declaradas y vacías a propósito**, igual que las de las sedes. Hasta
 * que lleguen los archivos el hueco lo pinta `CoverPlaceholder`, que es la
 * misma pieza que usa el blog: un bloque en los tonos de la casa, con la
 * proporción exacta que tendrá la foto. Así se puede juzgar la página que va a
 * quedar y no la de ahora, y no hay nada que quitar el día que lleguen: basta
 * con rellenar el `src`.
 *
 * Lo que **no** se hace es rellenarlas con una foto de otro sitio. Las ocho que
 * hay ya están todas colocadas, y la misma imagen dos veces en la misma web se
 * lee como que no hay más.
 */
export const PAGE_PHOTOS: Record<'faq' | 'contacto', Photo | null> = {
  faq: null,
  contacto: null,
};

/** El encargo de cada una. Aquí es donde se mira al hacer las fotos. */
export const PAGE_PHOTO_BRIEF: Record<'faq' | 'contacto', Omit<Photo, 'src'>> = {
  faq: {
    needs: 1150,
    ratio: 2.4,
    brief:
      'El puesto de tráfico: alguien al teléfono con los albaranes delante y las pantallas detrás. Apaisada y ancha. Es quien contesta estas preguntas, y que se le vea trabajando es lo que convierte una lista de respuestas en una conversación con alguien.',
  },
  contacto: {
    needs: 700,
    ratio: 1,
    brief:
      'La oficina por dentro, de día y con gente. Cuadrada o casi: va en la columna estrecha, al lado del formulario. No un retrato de estudio ni la fachada —la fachada ya va en las sedes—: lo que tiene que decir es que al otro lado del teléfono hay una mesa y una persona.',
  },
};

export const ALL_PHOTOS: Photo[] = [
  ...SERVICE_PHOTOS,
  FEATURED_PHOTO,
  VIDEO_POSTER,
];

/** Solo las rutas, que es lo que piden los componentes. */
export const SERVICE_IMAGE_SRCS = SERVICE_PHOTOS.map((photo) => photo.src);
