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
 * Un hueco de foto que puede estar **preparado y vacío**: con su medida y su
 * encargo, pero sin archivo todavía (`src: null`). Mientras esté vacío se
 * pinta un bloque en los tonos de la casa (`fondoHueco` en
 * `CoverPlaceholder.tsx`); el día que llegue la foto, se pone su ruta aquí y
 * aparece sola.
 *
 * `npm run check:fotos` busca `src: '…'` entre comillas, así que un hueco
 * vacío no se comprueba —no hay archivo que medir— y vuelve a comprobarse en
 * cuanto tenga ruta.
 */
export type Hueco = Omit<Photo, 'src'> & { src: string | null; position?: string };

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

/**
 * **Si el vídeo corporativo que se sirve lleva sonido.** Hoy no: el archivo de
 * `public/media/video-corporativo.mp4` solo tiene pista de imagen —comprobado
 * leyendo el propio archivo: hay manejador de vídeo y ninguno de sonido, y al
 * reproducirlo el navegador decodifica cero bytes de audio—. Seguramente se le
 * quitó al comprimirlo.
 *
 * Con esto en `false` no sale el botón «Ver con sonido» de Nosotros, que está
 * hecho y probado: prometería sonido y daría silencio. **El día que llegue el
 * original con audio** (el mismo que hay que pedir en 1080p), se cambia el
 * archivo y esto a `true`, y nada más.
 */
export const VIDEO_CON_AUDIO = false;

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
 * **Hoy llevan fotos de banco de operaciones, sin caras** (Pexels, 2026-11-18),
 * igual que las cabeceras de estas dos páginas y los paneles de Servicios y
 * Preguntas del índice. Lo eligió el cliente: fotos de banco, nunca fotogramas
 * del vídeo, y solo operaciones —palés, muelles, almacén, camiones— para que
 * nadie pueda tomarlas por el equipo o la nave de la casa. La de `/faq` es un
 * patio de palés visto desde arriba; la de `/contacto`, palés apilados.
 *
 * **Se descartaron las que llevaban la marca de otra empresa** —lonas
 * rotuladas, pegatinas de una empresa de alquiler, el logo de una tienda en
 * línea en los remolques—: en la web de una transportista, una flota ajena
 * se lee como la competencia. Se miraron a tamaño completo, que es donde se ve.
 *
 * El `brief` sigue siendo el encargo para las fotos propias; el día que
 * lleguen, es cambiar la ruta en `src`. Los `needs` son el hueco medido en
 * escritorio (el de `/faq` mide 1.072 × 447 y el de `/contacto` 400 × 400) con
 * margen para pantallas de doble densidad.
 */
export const PAGE_PHOTOS: Record<'faq' | 'contacto', Hueco> = {
  faq: {
    src: '/media/paginas/faq.jpg',
    needs: 1150,
    ratio: 2.4,
    brief:
      'El puesto de tráfico: alguien al teléfono con los albaranes delante y las pantallas detrás. Apaisada y ancha (2,4:1). Es quien contesta estas preguntas, y que se le vea trabajando es lo que convierte una lista de respuestas en una conversación con alguien.',
  },
  contacto: {
    src: '/media/paginas/contacto.jpg',
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

/**
 * La imagen de la cabecera de cada página interior (la «pieza a la derecha»
 * de `PageHeader`).
 *
 * **Las cuatro son de la casa, ninguna de banco**, y esa es la decisión que
 * importa: es lo primero que se ve de cada página, y una cabecera con una foto
 * de banco dice «esto podría ser cualquier transportista».
 *
 * - Servicios y Cobertura llevan las dos fotos del cliente que ya había.
 * - **Contacto y Preguntas llevan fotos de banco de operaciones** (Pexels,
 *   2026-11-18): un camión entrando en un muelle cubierto y un pasillo de
 *   almacén. Llevaron fotogramas del vídeo y el cliente los quitó; ver
 *   `PAGE_PHOTOS`. Si se vacían (`src: null`), `HeaderPhoto` pinta el mismo
 *   marco relleno con los tonos de la casa.
 *
 * `needs` es el hueco de escritorio (media columna del `Container`) con algo
 * de margen; en móvil la foto va a lo ancho y mide menos. `ratio` es el del
 * recorte de la cabecera (4:3).
 *
 * `position` mueve el encuadre cuando el sujeto no está centrado.
 */
export const HEADER_PHOTOS: Record<'servicios' | 'cobertura' | 'contacto' | 'faq', Hueco> = {
  servicios: {
    src: '/media/camion-02.jpg',
    needs: 520,
    ratio: 1.33,
    brief: 'El camión cargando en el patio, con la lona abierta y la carretilla. Ya es la foto buena.',
  },
  cobertura: {
    src: '/media/camion-01.jpg',
    needs: 520,
    ratio: 1.33,
    brief: 'La tractora con su semirremolque, que es lo que recorre la ruta cada día. Ya es la foto buena.',
  },
  contacto: {
    src: '/media/paginas/contacto-cabecera.jpg',
    needs: 520,
    ratio: 1.33,
    brief: 'La oficina por dentro, con alguien al teléfono. Es la cara de «pide presupuesto»: tiene que decir que al otro lado hay una persona.',
  },
  faq: {
    src: '/media/paginas/faq-cabecera.jpg',
    needs: 520,
    ratio: 1.33,
    brief: 'Alguien de la casa atendiendo: en la ventanilla de recepción, con un conductor, o en el puesto de tráfico. Es quien contesta estas preguntas.',
  },
};

/**
 * Las fotos del índice en paneles de la portada (`IndicePaneles`).
 *
 * **Servicios y Preguntas llevan fotos de banco de operaciones** (Pexels,
 * 2026-11-18): semirremolques blancos vistos desde arriba y una carretilla
 * azul. Llevaron fotogramas del vídeo y el cliente los quitó; ver
 * `PAGE_PHOTOS`. Ninguna foto de aquí debe repetir una que ya salga en la
 * portada: el camión cargando ya es la foto grande de Servicios más abajo.
 *
 * **Nosotros no lleva foto: lleva el clip del vídeo** (`INDEX_VIDEO`). La del
 * blog es la portada de un artículo que **no** está entre los tres últimos,
 * porque esos tres ya salen al final de la página; la elige `Overview`.
 *
 * `needs` es el panel abierto en escritorio (algo menos de media fila) y
 * `ratio` su forma, casi cuadrada. En móvil son tarjetas apaisadas y miden
 * menos.
 */
export const INDEX_PHOTOS: Record<'servicios' | 'cobertura' | 'faq', Hueco> = {
  servicios: {
    src: '/media/indice/servicios.jpg',
    needs: 560,
    ratio: 1.1,
    brief: 'Los camiones de la casa en el patio de Almazora, maniobrando o cargando. Que no sea la del camión con la lona abierta: esa ya es la foto grande de Servicios.',
  },
  cobertura: {
    src: '/media/camion-01.jpg',
    needs: 560,
    ratio: 1.1,
    position: '30% 50%',
    brief: 'La tractora con su semirremolque, que es lo que recorre la ruta cada día.',
  },
  faq: {
    src: '/media/indice/preguntas.jpg',
    needs: 560,
    ratio: 1.1,
    brief: 'Alguien de la casa atendiendo: al teléfono, en la ventanilla o en el puesto de tráfico. Distinta de la cabecera de /faq.',
  },
};

/**
 * El clip en bucle del panel «Nosotros» del índice, en lugar de una foto.
 *
 * **Son diez segundos montados del vídeo corporativo**, con los planos que
 * cuentan la casa: la fachada con el rótulo, el equipo en la oficina, un
 * conductor con el chaleco en la ventanilla, los camiones maniobrando en el
 * patio y el semirremolque rotulado pasando. Cada tramo cae entero dentro de
 * un plano del original —los cortes se midieron—, así que no hay ningún
 * fogonazo de un plano que empieza y se corta.
 *
 * Lo monta `tests/visual/salida/montar-clip.mjs` (herramienta de trabajo) con
 * el Chrome instalado: sin ffmpeg ni dependencias. MP4 H.264 a 848 × 480 y
 * 1,3 Mbps: **1,1 MB**. No viaja con la portada: `IndicePaneles` no lo pide
 * hasta que la sección se acerca a la pantalla. Cuando llegue el original en
 * 1080p, se vuelve a montar de ahí con los mismos tramos.
 */
export const INDEX_VIDEO = {
  src: '/media/nosotros-clip.mp4',
};

export const ALL_PHOTOS: Photo[] = [
  ...SERVICE_PHOTOS,
  FEATURED_PHOTO,
  VIDEO_POSTER,
  ...[...Object.values(HEADER_PHOTOS), ...Object.values(INDEX_PHOTOS)].filter(
    (hueco): hueco is Photo => hueco.src !== null,
  ),
];

/** Solo las rutas, que es lo que piden los componentes. */
export const SERVICE_IMAGE_SRCS = SERVICE_PHOTOS.map((photo) => photo.src);
