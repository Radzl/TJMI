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
 *    ancho real de cada archivo con ese número y canta las que no llegan.
 *    Llegó a haber tres que no llegaban, ampliadas al triple, y se veían
 *    blandas sin que nadie supiera por qué.
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

/**
 * Las seis de servicio, en el mismo orden que los textos de `messages`.
 *
 * **Las seis son de banco y son provisionales**, igual que las del blog. Las
 * que había antes no eran del cliente, aunque así constara: **dos llevaban
 * marca de agua** («Magnific» repetido en diagonal en la de contenedores, y
 * otra que solo se veía subiendo el contraste en la internacional), o sea que
 * eran previsualizaciones de un banco de pago sin licenciar, y una tercera
 * era una imagen generada, con letras que no existen en el rótulo del camión.
 * De las otras tres no se sabía de dónde habían salido. Se cambiaron las seis
 * para que de todas conste la licencia.
 *
 * Cinco son de Pexels y la internacional es de Wikimedia Commons (CC BY-SA
 * 4.0, que **obliga** a acreditar): los créditos van en el aviso legal.
 *
 * **Viven en `servicios/` y no en la raíz con el nombre de antes**, y no es
 * manía de orden: el optimizador de imágenes de Next guarda cada foto por su
 * dirección, así que cambiar el archivo sin cambiarle el nombre deja la vieja
 * servida durante horas.
 *
 * Se eligieron mirándolas ya recortadas a los cuatro huecos donde salen, que
 * no se parecen entre sí: la tarjeta del desfile, la fila de `/servicios`
 * (4:3), la cabecera de la ficha (2:1) y la franja del modal, que es la más
 * ancha de todas (más de 3:1). Si se cambia una, hay que mirarla en los
 * cuatro.
 *
 * El `brief` de cada una **sigue siendo el encargo para la foto de verdad**.
 */
export const SERVICE_PHOTOS: Photo[] = [
  {
    src: '/media/servicios/grupaje.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'Varios palés de clientes distintos esperando juntos en el muelle, con sus etiquetas a la vista. Lo que cuenta el grupaje es que son envíos de varios en el mismo camión.',
  },
  {
    src: '/media/servicios/ftl.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'El semirremolque cargado a tope y la lona cerrándose, o el tráiler entero de perfil en la nave. Tiene que leerse "esto va solo para ti".',
  },
  {
    src: '/media/servicios/intl.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'El CMR o el albarán firmándose sobre el capó, con el camión detrás desenfocado. La internacional se cuenta con papeles, no con mapas.',
  },
  {
    src: '/media/servicios/almacen.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'Pasillo de la nave con las estanterías llenas, hacia el fondo. Que se vea altura y que se vea que está lleno.',
  },
  {
    src: '/media/servicios/picking.jpg',
    needs: 1150,
    ratio: 1.9,
    brief:
      'Manos retractilando un palé o pegando la etiqueta. En primer plano las manos y el producto, el resto fuera de foco.',
  },
  {
    src: '/media/servicios/contenedores.jpg',
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
 * Las fotos de `/faq` y `/contacto`.
 *
 * **Por qué hacían falta.** Las dos eran tipografía sobre crema de arriba
 * abajo. La portada va cargadísima —intro 3D, mosaico, desfile, banda de
 * cifras— y las interiores iban desnudas, y ese salto entre unas y otras se
 * nota: parecen dos sitios distintos.
 *
 * **Las dos de ahora son de banco y son provisionales** (Pexels, licencia de
 * uso comercial sin atribución obligatoria; el crédito va igualmente en el
 * aviso legal). Se eligieron contra el `brief` de cada una y mirándolas **ya
 * recortadas al hueco**, que es donde se cae una foto que en el banco se veía
 * bien: la de `/faq` se recorta a 2,4:1 y la de `/contacto` a cuadrada.
 *
 * **Lo que una foto de banco puede hacer aquí y en las sedes no**: estas dos
 * ilustran —«hay gente trabajando», «alguien coge el teléfono»— y aquello
 * afirmaría —«esta es nuestra nave de Almazora»—. Por eso `SITE_PHOTOS` sigue
 * vacía y estas no. Si alguna de estas dos pasa a llevar un pie que diga que
 * es la casa, deja de valer.
 *
 * **El `brief` se queda aunque ya haya foto**: sigue siendo el encargo para
 * cuando el cliente mande la suya, y ese día esto es cambiar el `src`. Hubo
 * una constante aparte (`PAGE_PHOTO_BRIEF`) y se fundió aquí por dos motivos:
 * no la importaba nadie, y con el encargo en un sitio y la foto en otro los
 * `needs` y los `ratio` estaban duplicados y podían separarse sin que nadie se
 * enterara. Además `npm run check:fotos` lee este archivo a mano buscando
 * `src` + `needs` + `ratio` **en líneas seguidas**: repartido entre dos
 * constantes no las veía, así que las dos nuevas no se comprobaban.
 */
export const PAGE_PHOTOS: Record<'faq' | 'contacto', Photo | null> = {
  faq: {
    src: '/media/faq.jpg',
    needs: 1150,
    ratio: 2.4,
    brief:
      'El puesto de tráfico: alguien al teléfono con los albaranes delante y las pantallas detrás. Apaisada y ancha. Es quien contesta estas preguntas, y que se le vea trabajando es lo que convierte una lista de respuestas en una conversación con alguien.',
  },
  contacto: {
    src: '/media/contacto.jpg',
    needs: 700,
    ratio: 1,
    brief:
      'La oficina por dentro, de día y con gente. Cuadrada o casi: va en la columna estrecha, al lado del formulario. No un retrato de estudio ni la fachada —la fachada ya va en las sedes—: lo que tiene que decir es que al otro lado del teléfono hay una mesa y una persona.',
  },
};

/**
 * La medida de las portadas del blog.
 *
 * No van en `PAGE_PHOTOS` ni en `ALL_PHOTOS` porque las rutas viven en
 * `content/blog.ts`, una por artículo. Lo que vive aquí es **el hueco**, que
 * es igual para las diez, y `npm run check:fotos` lo usa para comprobarlas
 * todas sin que haya que escribir diez entradas.
 *
 * - `needs` sale del hueco más grande de los dos en los que se ve: el listado
 *   la pone a 30vw y el artículo a `64rem`, o sea **1.024 px**. Es la misma
 *   convención que el resto del manifiesto: píxeles de CSS del hueco mayor.
 * - `ratio` es el del **listado** (3:2) y no el del artículo (21:9), y es
 *   decisión. En el listado hay diez a la vez y es donde se ven primero; el
 *   artículo recorta más, y que las diez aguantan ese recorte está
 *   comprobado **mirándolas una a una ya recortadas**, no por umbral. Con
 *   21:9 aquí el comprobador cantaría las diez, porque no hay foto de banco
 *   que venga nativa a 2,33:1, y una comprobación que nace en rojo enseña a
 *   ignorar el aviso.
 */
export const BLOG_COVER = {
  needs: 1024,
  ratio: 1.5,
  brief:
    'Lo que cuenta el artículo, en el patio o en la nave: palés, muelle, carretilla, papeles. Apaisada, nunca vertical. Se ve a 3:2 en el listado y a 21:9 en el artículo, así que el sujeto tiene que aguantar una franja central ancha.',
};

export const ALL_PHOTOS: Photo[] = [
  ...SERVICE_PHOTOS,
  FEATURED_PHOTO,
  VIDEO_POSTER,
];

/** Solo las rutas, que es lo que piden los componentes. */
export const SERVICE_IMAGE_SRCS = SERVICE_PHOTOS.map((photo) => photo.src);
