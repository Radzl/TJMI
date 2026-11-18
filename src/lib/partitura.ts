/**
 * **La partitura de la intro: los tramos del scroll que comparten el 3D y la
 * página, escritos una sola vez.**
 *
 * El problema que viene a resolver estaba escrito por todo `CLAUDE.md` en
 * forma de avisos —«si tocas `closeUp`, toca también estos números», «dos
 * disparadores que miden tramos distintos no comparten fracciones»— y ya había
 * dado dos fallos de verdad:
 *
 *  - El fundido del texto del hero caía medio pantallazo antes de que el
 *    primer plano empezara a cerrarse, porque su disparador medía otro tramo.
 *  - El cuentakilómetros marcaba **393 km** con el camión ya aparcado, porque
 *    se había quedado con el final antiguo del disparador de la carretera
 *    (que ya no existe: ver la nota al final de `PARTITURA`).
 *
 * Las dos cosas pasaban porque cada pieza llevaba **su copia** de dos datos:
 * el tramo de scroll que mide (`start` / `end`) y la fracción a la que actúa.
 * Ahora los dos datos tienen un solo dueño:
 *
 *  - **El tramo** lo dicta la sección: `tramoDeEscena()` lee sus atributos
 *    `data-scene`, `data-scene-start` y `data-scene-end` con las mismas reglas
 *    que `ScrollChoreography`. Cualquier pieza de HTML que viva dentro de una
 *    sección con escena mide exactamente lo mismo que el 3D, sin escribirlo.
 *  - **Las fracciones** viven en `PARTITURA`, con nombre. El 3D y los textos
 *    las importan de aquí.
 *
 * **Por qué no se lee directamente el progreso que escribe el 3D.** Sería lo
 * más corto, y dejaría textos invisibles: la coreografía solo se monta cuando
 * hay WebGL (y con hasta 1,2 s de espera), así que sin 3D el progreso se
 * queda en 0 y un texto que entra en 0,30 no entraría nunca. Cada pieza sigue
 * con su propio disparador, pero midiendo el mismo tramo con los mismos
 * números, que es lo que de verdad hacía falta.
 */

/** Un compás: desde qué fracción hasta qué fracción de su escena. */
export type Compas = readonly [desde: number, hasta: number];

export const PARTITURA = {
  /** Escena 1, el hero: la carga del camión. */
  hero: {
    /**
     * El primer plano del camión: la cámara se cierra sobre él cuando la
     * carretilla ya se va. Es el único rato en que el camión está solo.
     */
    primerPlano: [0.84, 1],
    /**
     * El texto del hero se aparta para dejar ver ese primer plano. Arranca a
     * la vez que el plano y acaba un poco antes, para que el camión llegue a
     * verse entero sin nada encima.
     */
    textoSale: [0.84, 0.98],
    /**
     * El lote entra en el semirremolque deslizando por el costado (`insert`
     * en `Scene.tsx`). Antes de esto se coloca detrás de la cola, ya a la
     * altura del piso.
     */
    loteEntra: [0.63, 0.78],
    /**
     * **Solo en móvil**: el párrafo del hero aparece cuando el lote está a
     * punto de entrar, y antes no. En una pantalla estrecha el texto va
     * encima de la escena, no al lado, y durante la maniobra en tres cuartos
     * (de 0,15 a 0,40) las torres de contenedores suben hasta él y se le
     * meten debajo. A partir de 0,45 la cámara ya está de perfil y debajo del
     * texto solo queda la nave, así que el párrafo entra ahí sin pisar nada y
     * acaba de aparecer justo cuando el lote empieza a entrar.
     */
    subtituloMovil: [0.55, 0.63],
  },
  /** Escena 3, en ruta: el camión se va y sube el azul noche. */
  enRuta: {
    /**
     * Se retira antes de que el suelo oscuro se vaya: si no, el texto claro se
     * quedaría en blanco sobre el crema. Estuvo en 0,90 → 0,98 de un
     * disparador que medía **una pantalla más** que el de la escena; pasado a
     * su tramo son estos números, y la salida cae en el mismo píxel.
     */
    textoSale: [0.873, 0.975],
  },
  // Hubo una escena 5, la carretera en cenital, con su telón y su texto. Se
  // quitó: la intro acaba en `InRoute` y lo que viene detrás es el mapa de la
  // red (`MapaRed`), que lleva su propio disparador porque no es 3D.
} as const satisfies Record<string, Record<string, Compas>>;

/**
 * El tramo de scroll que mide la escena de una sección, con las mismas reglas
 * que `ScrollChoreography`:
 *
 *  - El hero (`data-scene="1"`) va de `top top` a `bottom bottom`: ya está en
 *    pantalla al cargar, y acaba donde su bloque fijo suelta el titular.
 *  - Las demás, de `top bottom` a `bottom top`, salvo que la sección pida
 *    otro arranque o final con `data-scene-start` / `data-scene-end`.
 *
 * Devuelve `null` si la sección no tiene escena: entonces quien llama usa su
 * propio tramo.
 */
export function tramoDeEscena(seccion: HTMLElement | null) {
  const escena = seccion?.dataset.scene;
  if (!seccion || !escena) return null;
  const primera = escena === '1';
  return {
    start: primera ? 'top top' : seccion.dataset.sceneStart || 'top bottom',
    end: primera ? 'bottom bottom' : seccion.dataset.sceneEnd || 'bottom top',
  };
}
