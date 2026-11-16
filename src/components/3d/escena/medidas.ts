/**
 * Las medidas de la escena 3D: dónde está cada cosa y por qué.
 *
 * ## Por qué están aquí y no en `Scene.tsx`
 *
 * `Scene.tsx` eran **1.678 líneas**, y de ellas casi quinientas eran esto:
 * constantes con su explicación medida al lado. Tener la coreografía y las
 * medidas en el mismo archivo hacía que para cambiar un número hubiera que
 * bajar por delante de todo el bucle de render, y al revés.
 *
 * **El corte es puro:** aquí no hay ni una línea de lógica. Todo lo que hay
 * son números, cuentas entre números y una función sin estado. Nada depende
 * de React, de three en marcha ni del scroll.
 *
 * ## Cómo se comprobó que el corte era correcto
 *
 * Con el arnés visual: **0,00 % en las quince tomas**. Un movimiento de
 * constantes que cambie un píxel es un movimiento mal hecho, así que esa es
 * exactamente la comprobación que valía.
 *
 * ## Qué NO se movió, y por qué
 *
 * Los `Vector3` de scratch que `useFrame` reutiliza cada fotograma se quedan
 * en `Scene.tsx`. No son medidas: son memoria de trabajo del bucle de
 * render, y leerlos lejos de donde se usan haría más difícil ver que **no
 * se puede crear un objeto dentro de `useFrame`**, que es la regla que
 * justifica que existan.
 */

import { CONTAINER } from '../models/ContainerModel';
import { FORKLIFT } from '../models/ForkliftModel';
import { FACILITY_CENTRE_X } from '../models/Facility';
import { PALLET, PALLET_LOAD, PALLET_STACKS } from '../models/Pallets';
import { TRUCK } from '../models/TruckModel';
import { Color } from 'three';
import type { Contacto } from '../models/ContactShadow';

// Distribución de la maqueta, en metros. El camión mira hacia +X.
export const TRUCK_X = 0;

/**
 * Lo que sobresalen las horquillas por delante de la máquina.
 *
 * Sustituye al alcance variable de la pluma, que iba de 3,81 m con la carga
 * en alto a casi 4,5 con ella en el suelo. Una carretilla no tiene alcance:
 * tiene horquillas, y miden lo que miden. Esto es lo que más cambia la
 * coreografía — la máquina pasa de estar a cuatro metros del lote a estar
 * pegada a él.
 */
export const FORK_REACH = 1.25;

/**
 * Profundidad a la que acaba el lote dentro del semirremolque.
 *
 * El camión ya viene cargado por dentro, así que el lote no busca un hueco:
 * se queda pegado a la lona, por delante de lo que ya hay. Con cámara
 * ortográfica de perfil eso no se distingue de estar "dentro", y a cambio
 * evita atravesar la carga del modelo. Lo justo para que la lona lo tape al
 * cerrarse.
 */
export const CARGO_Z = 0.5;

/**
 * Dónde se posa el lote antes de entrar: **sobre el piso, en el borde de la
 * cola**.
 *
 * Estuvo 3,4 m por detrás del camión y 15 cm por encima del piso, o sea
 * flotando en el aire sin nada debajo. Daba igual mientras la pluma lo
 * sujetaba hasta el fondo de la caja, pero en cuanto la pluma dejó de entrar
 * —que es lo correcto— el lote se quedaba colgado de nada.
 *
 * Ahora cae justo dentro del borde del piso, apoyado: hay chapa debajo y la
 * pluma lo suelta encima de algo.
 */
export const STAGE = { x: TRUCK_X + 0.9 };
/** Y dónde acaba, ya dentro de la caja. */
export const DROP = { x: TRUCK_X + 2.2 };
/**
 * Dónde espera el lote antes de entrar, con la carretilla ya encarada.
 *
 * El metro y medio que lo separa de `STAGE` es lo que da los **dos tiempos**:
 * primero se arrima y solo entonces empuja. Con un solo movimiento continuo
 * la maniobra se lee como un empujón, no como una máquina trabajando. Es la
 * misma idea que tenía la grúa con `place` y `lower`, solo que aquí los dos
 * tiempos son horizontales: una carretilla no baja la carga, la mete.
 */
export const HOLD = { x: STAGE.x - 1.6 };

/**
 * La altura a la que viaja el lote, y es **constante**.
 *
 * Esta es la consecuencia grande de cambiar de máquina. La grúa levantaba la
 * carga del suelo y la llevaba en alto; la carretilla **no eleva** —el mástil
 * de este modelo va en la misma malla que las ruedas, así que no se puede
 * animar—, de modo que el lote viaja a la altura del piso del camión desde el
 * primer fotograma: la carretilla llega del almacén **ya cargada**, que es lo
 * que de verdad pasa.
 *
 * 1,20 m de piso + medio lote (0,86) = 2,06 m al centro.
 */
export const CARRY_Y = TRUCK.deckTop + PALLET_LOAD.height / 2;

/** Dónde trabaja la carretilla en profundidad: alineada con el lote. */
export const FORKLIFT_Z = CARGO_Z;

/** Cuánto recula para salir de plano. Ver la nota de `exit`. */
export const EXIT_RUN = 18;

/**
 * Cuánto se abre el encuadre de la carretera al irse la escena.
 *
 * **La escena entraba moviéndose y se iba apagándose**, y eso es lo que se
 * notaba como «desaparece de golpe» aunque el fundido durase lo mismo: la
 * entrada gira la cámara entera de perfil a cenital (`topView`) mientras el
 * telón se abre, y la salida no movía nada. El telón tapaba una escena
 * congelada.
 *
 * Ahora la cámara **se aleja**: el encuadre se abre al 190 %, así que la
 * nave, el camión y la carretera se van haciendo pequeños mientras el telón
 * se cierra encima.
 *
 * **Y se hace abriendo el encuadre, no subiendo la cámara.** Con cámara
 * ortográfica alejarse no encoge nada —un plano ocupa lo que ocupa esté donde
 * esté—, y subirla mirando al mismo punto lo que haría es **enderezar la
 * vista a plomo**, que es otro efecto distinto y le quita al camión el poco
 * volumen que tiene. Lo único que aleja de verdad aquí es el ancho de mundo.
 */
export const LEAVE_WIDEN = 0.9;

/**
 * Dónde termina el acercamiento, en profundidad.
 *
 * **Son los mismos −4,5 de la grúa, y eso no es pereza: es que la cámara está
 * afinada contra ese recorrido.** Lo puse primero en `FORKLIFT_Z` (0,5),
 * pensando que la máquina debía llegar ya alineada con el lote, y la dejé
 * fuera de cuadro: el encuadre en tres cuartos sigue a la máquina solo al
 * 50 % en profundidad (`followZ`), así que cinco metros de más la sacan por
 * abajo. La alineación con la lona se hace después, en el relevo.
 */
export const STAGING_Z = -4.5;

/**
 * Altura a la que se apoya el primer contenedor de cada pila.
 *
 * **Era `PALLET_LOAD.height / 2` y estaba mal: los contenedores llevaban
 * tiempo enterrados 37 cm.**
 *
 * Esto se llamaba `GROUND_Y` y era «la altura del centro del lote de palés
 * apoyado en el suelo»: lo usaba la grúa para saber de dónde recogerlo. Las
 * pilas del patio tiraban de la misma constante como altura de apoyo, y un
 * contenedor no mide lo que un lote de palés. Quedó anotado como sospecha y
 * esta es la pasada que lo comprobó. Los números:
 *
 *   · lote de palés    1,72 m de alto → centro a **0,860**
 *   · contenedor       2,45 m de alto → centro a **1,227**
 *
 * O sea que la base de cada pila caía en **−0,367 m**: por debajo del suelo,
 * un 15 % del alto del contenedor. Como el suelo lo tapa, no se veía como un
 * fallo —se veía como contenedores un poco bajos—, que es la forma que tienen
 * estas cosas de durar meses.
 *
 * El origen del modelo **es su centro**, no su base: `ContainerModel`
 * compensa el centro del GLB con `RAW_CENTER` y pone el logo del techo en
 * `+CONTAINER.height / 2`. Comprobado antes de tocar nada, porque con la otra
 * convención el arreglo habría sido justo al revés.
 *
 * **Y es la única cosa que usa esta constante** (las dos rejillas de pilas),
 * así que no arrastra nada más.
 */
export const PILE_BASE_Y = CONTAINER.height / 2;

// Escena 0: la carretilla cruza el patio con el lote en las horquillas, se
// acerca al primer plano y gira a la derecha hasta encarar la cola del camión.
export const APPROACH_FROM = { x: -24, z: -24, angle: Math.PI / 2 };
export const APPROACH_TO = {
  x: HOLD.x - FORK_REACH,
  z: STAGING_Z,
  angle: 0,
};

/**
 * La pila de contenedores del fondo.
 *
 * **El número está clavado a mano a propósito.** Antes salía de
 * `APPROACH_FROM.z - PICK_POSE.reach`, o sea del alcance de la pluma al
 * agarrar del suelo (4,47 m). Esa pluma ya no existe, pero la pila es
 * decorado y moverla cambiaría el encuadre de apertura, que está afinado. Se
 * queda donde estaba.
 */
export const PILE = {
  x: APPROACH_FROM.x,
  z: APPROACH_FROM.z - 4.47,
};
/** Hueco entre contenedores de la pila, a lo ancho. */
export const PILE_GAP = CONTAINER.width + 0.9;
/** Punto al que mira la cámara mientras la grúa todavía está en la pila. */
export const PILE_VIEW = { x: PILE.x - PILE_GAP, z: PILE.z + 2 };
/** Fondo entre una fila de contenedores y la siguiente. */
export const PILE_ROW_DEPTH = CONTAINER.length + 1.4;

/**
 * La bruma de distancia.
 *
 * **No es el crema de la página, y ahí está el cambio.** Antes lo era exacto,
 * así que lo que estaba lejos no se alejaba: desaparecía. Las dos filas de
 * contenedores salían del mismo valor y la pila se leía como una pared de
 * rayas en vez de como dos filas, una detrás de otra.
 *
 * Ahora es un pelo más fría y más oscura que el fondo. Lo justo para que lo
 * lejano se asiente en un valor propio en vez de fundirse con el papel, que es
 * lo que de verdad da aire. Si se oscurece más, el patio se vuelve gris y deja
 * de parecer un día claro.
 */
/**
 * El color de la bruma.
 *
 * Estuvo en `#e9e7e3`, que es un **gris**, y ese era el motivo real de que el
 * arranque se leyera como un día lluvioso. Durante varias pasadas se intentó
 * arreglar subiendo la **luz**, que es otra cosa: por mucha luz que se eche,
 * si lo que está a treinta metros se tiñe de gris, la escena sigue pareciendo
 * encapotada.
 *
 * Este es cálido —tira a arena, no a ceniza— y solo siete puntos por debajo
 * del crema de la página. Sigue sin ser el color del fondo, que es lo que no
 * puede pasar: si fueran idénticos, lo lejano no se alejaría, desaparecería.
 */
export const FOG_DAY = new Color('#f0e9dd');
export const FOG_NIGHT = new Color('#0f1a2e');

/**
 * Y el alcance. Va **por vista, no fijo**, y aquí está el detalle que más
 * fácil se pasa por alto:
 *
 * la niebla se mide **desde la cámara**, y las dos vistas no están a la misma
 * distancia ni de lejos. En perfil la cámara se planta a 60 m del camión; en
 * tres cuartos está a unos 20 m del primer término y a 41 del fondo de la
 * pila. Con un único alcance no hay manera: el que separa las dos filas de
 * contenedores en el arranque deja el camión lavado en perfil, y el que
 * respeta el camión no hace nada en el arranque. (Comprobado: con 26 → 118
 * el camión salía translúcido y el rótulo rosa.)
 *
 * Así que cada vista lleva el suyo y se interpolan con la propia cámara.
 */
/** Arranque en tres cuartos: cámara cerca, la bruma trabaja dentro del patio. */
/**
 * En el arranque la bruma empieza mucho más lejos y satura mucho más tarde.
 *
 * Estaba en 24–120, y la cuenta de cuánto lava un objeto es
 * `(distancia − near) / (far − near)`. Con aquello, las naves del fondo a
 * unos 100 m salían lavadas al **79 %**: de ahí la sensación de niebla. Con
 * 40–200 se quedan en el 37 %, que todavía las separa del primer término sin
 * borrarlas.
 */
export const FOG_QUARTER = { near: 40, far: 200 };
/** Perfil: la cámara se va a 60 m, así que todo se corre hacia atrás. */
export const FOG_SIDE = { near: 70, far: 280 };

/**
 * Y la cenital de la carretera: **prácticamente sin niebla**.
 *
 * Aquí la cámara está a 70 m de altura y lo que se ve —asfalto, camión,
 * naves de los extremos— está todo a una distancia parecida. La niebla no
 * tiene nada que separar: lo único que hace es lavar, y lava justo lo que
 * hay que mirar. Con el alcance del perfil el camión salía como un fantasma
 * gris sobre el asfalto negro en la segunda mitad del recorrido.
 *
 * Así que se manda el fondo de la niebla lejísimos. Lo que da profundidad en
 * esta escena no es el aire, es el contraste: asfalto negro, camión claro.
 */
export const FOG_ROAD = { near: 95, far: 420 };

/**
 * Y el primer plano del camión, que cierra el fondo sin tocar al camión.
 *
 * Es el sustituto del desenfoque de maqueta: `TiltShift2` revienta el render
 * con estas versiones (está probado y documentado), así que el fondo se
 * difumina **acercando el fondo de la niebla** en vez de desenfocándolo. El
 * `near` casi no se mueve a propósito: el camión está a 60 m y bajarlo lo
 * difuminaría a él, que es justo lo contrario de lo que se busca.
 */
export const FOG_CLOSE = { near: 56, far: 150 };

/**
 * El patio, en coordenadas de rejilla: `slot` cuenta hacia la izquierda y
 * `row` hacia el fondo, desde el hueco que deja el contenedor que se lleva la
 * grúa. La fila 0 es la que se lee (ese hueco más cuatro cajas); las de atrás
 * son patio, para que el plano no quede vacío mientras la grúa se acerca.
 */
export const PILE_ROWS = [
  { slot: -1, row: 0, colors: ['#27406b'] },
  { slot: 1, row: 0, colors: ['#8d949f', '#27406b'] },
  { slot: 2, row: 0, colors: ['#c4623c', '#8d949f'] },
  { slot: -1, row: 1, colors: ['#8d949f', '#c4623c'] },
  { slot: 0, row: 1, colors: ['#27406b', '#8d949f'] },
  { slot: 1, row: 1, colors: ['#8d949f'] },
  { slot: 2, row: 1, colors: ['#8d949f', '#c4623c'] },
];

/**
 * Cuánto se lleva la bruma el color de cada fila.
 *
 * La niebla ya hace parte de esto sola, pero a 13 m de separación hace poca,
 * y la pila es justo donde más falta hace que se note: es lo primero que se
 * ve y ocupa media pantalla. Esto la ayuda a mano, tirando el color de la fila
 * de atrás hacia la bruma antes de que lo haga la distancia.
 *
 * Se calcula **una vez, fuera del componente**: son colores fijos y no tienen
 * por qué recalcularse en cada render.
 */
export const ROW_HAZE = 0.22;

export function hazed(hex: string, amount: number) {
  return '#' + new Color(hex).lerp(FOG_DAY, amount).getHexString();
}

export const PILE_STACKS = PILE_ROWS.map((pile) => ({
  ...pile,
  colors: pile.colors.map((color) =>
    pile.row ? hazed(color, ROW_HAZE) : color,
  ),
}));

/**
 * Dos torres en primerísimo término, cortadas por el borde del encuadre.
 *
 * Es la pista de profundidad que faltaba, y no se arregla añadiendo cosas al
 * fondo: la escena tenía **dos distancias** —la grúa y la pila— y nada
 * delante. Algo grande, simple y cortado por el borde se lee como «muy cerca»
 * y empuja todo lo demás hacia atrás de golpe.
 *
 * Es además el sustituto del desenfoque de maqueta, que con estas versiones no
 * se puede montar: si no se puede desenfocar el primer término, se **solapa**.
 *
 * Van a `x < -19` como todo lo del patio, así que en la vista de perfil
 * quedan fuera de plano por la izquierda y no estorban al camión. Y van a
 * `z` positiva, o sea por delante de la pila: eso es lo que las pone cerca.
 */
export const FOREGROUND_STACKS = [
  { x: -27, z: 7, rotation: 0.05, colors: ['#8d949f', '#27406b', '#8d949f'] },
  { x: -31.5, z: -3, rotation: -0.03, colors: ['#c4623c', '#8d949f'] },
];

// Se probó a poner aquí la nave de `Facility` como fondo del patio y no vale:
// está modelada para verse desde arriba y, sin perspectiva que la achique, se
// come el plano entero y su franja de marca cruza el titular. El patio se
// llena con contenedores, que sí están a escala.

/**
 * Dónde toca el suelo cada cosa del patio.
 *
 * Las coordenadas **no se escriben a mano**: salen de las mismas constantes
 * que colocan los contenedores y los palés, así que mover una torre mueve su
 * sombra. Duplicarlas sería garantizar que algún día una pila esté en un sitio
 * y su sombra en otro.
 *
 * Las huellas van **un pelo mayores que el objeto** —un 15 % en contenedores,
 * un 30 % en palés—: lo justo para que el desvanecido quede por fuera del
 * borde y no se vea el corte, pero no tanto como para que la mancha asome y se
 * lea como una forma propia.
 */
export const YARD_CONTACTS: Contacto[] = [
  // Las torres de la pila: el contenedor va girado 90°, así que su largo cae
  // sobre X y su ancho sobre Z.
  ...PILE_STACKS.map((pile) => ({
    x: PILE.x - pile.slot * PILE_GAP,
    z: PILE.z - pile.row * PILE_ROW_DEPTH,
    width: CONTAINER.length * 1.15,
    depth: CONTAINER.width * 1.15,
  })),
  // Las dos del primerísimo término, con su mismo giro.
  ...FOREGROUND_STACKS.map((stack) => ({
    x: stack.x,
    z: stack.z,
    width: CONTAINER.length * 1.15,
    depth: CONTAINER.width * 1.15,
    rotation: stack.rotation,
  })),
  // Y las pilas de palés.
  ...PALLET_STACKS.map((stack) => ({
    x: stack.x,
    z: stack.z,
    width: PALLET.width * 1.3,
    depth: PALLET.depth * 1.3,
  })),
];

/**
 * Dónde apoya el camión, en coordenadas suyas (el origen va en la cola).
 *
 * Son **dos huellas y no una**: un vehículo articulado toca el suelo en dos
 * sitios, el tren del semirremolque y el de la tractora, y entre los dos hay
 * siete metros de chasis al aire. Una sola mancha de punta a punta sería la
 * silueta de una barcaza, no la de un camión.
 *
 * Las posiciones **están medidas sobre una captura**, no calculadas: a 1280 px
 * el conjunto ocupa de 478 a 1200, o sea 41,7 px por metro, y las ruedas caen
 * donde dicen estos números. Es el mismo método que `CENTRE_NUDGE`.
 */
export const TRUCK_CONTACTS: Contacto[] = [
  { x: 1.9, z: 0, width: 3.8, depth: 2.7 },
  { x: 13.0, z: 0, width: 5.6, depth: 2.7 },
];

/**
 * El apoyo de la grúa. Aquí sí va una sola huella: la máquina es compacta y
 * sus dos ejes están a tres metros, así que entre ellos no hay hueco que
 * contar.
 */
/**
 * La sombra de contacto de la carretilla.
 *
 * Era 6,4 × 3,4, la huella de la reach stacker. Una carretilla mide 3,12 de
 * largo por 1,15 de ancho, así que con la mancha vieja se habría leído como
 * una sombra que sobra por los cuatro lados. Va centrada en el cuerpo: el
 * origen del modelo está en la punta de las horquillas, y el cuerpo queda
 * detrás, en las x negativas.
 */
export const FORKLIFT_CONTACTS: Contacto[] = [
  { x: -FORKLIFT.length / 2, z: 0, width: FORKLIFT.length + 0.3, depth: 1.4 },
];

// Avance del camión antes de salir a ruta. Es largo a propósito: con pocos
// metros no se leía como que avanzaba. La carretera arranca justo donde lo
// deja la sección oscura, para que el salto a cenital no se note.
export const SETTLE_RUN = 120;
/** Cuánto acompaña la cámara al camión en ese arranque. Por debajo de 1 el
 *  camión gana terreno en pantalla: es lo que hace que se vea avanzar. */
/**
 * Ajuste fino del centrado, en metros, **medido sobre una captura**.
 *
 * El centro geométrico del conjunto (la mitad de los 17,3 m) no es su centro
 * visual: la tractora es mucho más maciza que la cola del semirremolque, así
 * que con el cálculo limpio el camión quedaba unos 120 px a la derecha del
 * centro en un encuadre de 1280. Esto lo compensa. Si se cambia el modelo o
 * el ancho de mundo, vuelve a mirarlo en `tests/visual/baseline`.
 */
export const CENTRE_NUDGE = 3.2;

/**
 * Encuadre del camión solo, cuando la grúa ya se ha ido: la cámara se cierra
 * y se centra en él. Es el único momento en que el camión está solo en
 * pantalla, y es cuando se le ven los detalles. Después, al arrancar, se abre
 * otra vez para que quepa el recorrido.
 */
export const TRUCK_FRAME = { width: 27, narrow: 20 };

/**
 * **En el móvil, la carga se encuadra a ella y no al camión.**
 *
 * Con el encuadre de escritorio estrechado, en un teléfono de 390 px cabían
 * 30 m de patio: el camión salía de 225 × 50 px, una tira, y casi un tercio de
 * la pantalla era crema o azul liso. La pantalla es alta y estrecha, así que
 * no hay forma de que quepan 17 m de camión **y** se vea algo de lo que pasa.
 *
 * Así que mientras se carga, la cámara mira solo **la acción**: la cola del
 * semirremolque, la lona abierta y la carretilla con el lote. Pasa todo entre
 * x = −5 (la carretilla detrás de la cola) y x = 8 (la mitad trasera de la
 * caja, que es lo que descubre la lona). 14 m centrados en 1,5 cubren eso con
 * aire: el semirremolque pasa de 50 a unos 110 px de alto.
 *
 * Cuando la carretilla se retira, el plano se abre hasta el camión entero
 * (`TRUCK_FRAME.narrow`) en el mismo movimiento con el que el escritorio se
 * cierra sobre él: un travelling de la cola a la cabina. En escritorio no
 * cambia nada, porque allí el camión entero ya cabe grande.
 */
export const LOADING_FRAME = { narrow: 14, x: 1.5 };

/**
 * **El arranque, cerrado sobre la carretilla.** En el primer fotograma la
 * cámara en tres cuartos abarcaba 34 m y la carretilla medía unos 45 px: la
 * protagonista del primer plano de la web era una mota. Ahora arranca con el
 * encuadre a esta fracción, mirando a la máquina, y se abre a lo normal en los
 * dos primeros compases, que de todas formas son de ralentí (el avance empieza
 * en 0,14).
 *
 * **No se puede cerrar más, y está mirado.** Se probó a 0,6 en escritorio y
 * 0,65 en móvil: la carretilla salía enorme, pero como la cámara la mira a
 * ella y la pila queda detrás, las torres de contenedores subían hasta la
 * barra superior en escritorio y hasta pisar el párrafo del hero en móvil.
 */
export const OPENING = { desktop: 0.75, narrow: 0.82, until: 0.22 };

/**
 * Altura de la línea de suelo en el móvil mientras se carga (fracción de la
 * pantalla desde abajo). Con el plano cerrado de `LOADING_FRAME` las naves del
 * fondo crecen con todo lo demás, y a la altura de siempre (0,3) su borde de
 * arriba cruzaba la última línea del párrafo del hero.
 */
export const LOADING_GROUND = 0.2;

export const ROAD_ORIGIN_X = TRUCK_X + SETTLE_RUN;
/** Desplazamiento lateral en cenital: deja la columna izquierda al texto. */
export const ROAD_SHIFT = 9;

/**
 * Cuánto se inclina el camión en la curva más cerrada, en radianes.
 *
 * **Está medido contra el trazado, no puesto a ojo.** El giro que el camión
 * tiene por delante llega como mucho a un seno de 0,44 en la curva de
 * entrada al patio de destino, así que con este factor la inclinación máxima
 * son unos 2,3 grados. Un camión real bascula entre 2 y 4; por encima de eso
 * deja de leerse como peso y pasa a leerse como que el modelo se cae.
 */
export const TRUCK_BANK = 0.09;
/** Cuánto se echa atrás la cámara cenital: unos 16° sobre la vertical. */

/** Rumbo del camión al entrar en el patio de destino. */
export const ARRIVAL_HEADING = Math.atan2(14, 20);

/** Dónde se planta la nave de llegada, en coordenadas del grupo de carretera. */
export const ARRIVAL_AT = { x: 201.6, z: -108.9 };

/**
 * El punto al que se posa la cámara al llegar: el centro de los edificios de
 * la nave de destino.
 *
 * **Por qué hace falta.** La cenital seguía al camión hasta el final, y el
 * camión frena en el muelle; los edificios quedan por delante de él, así que
 * la nave de llegada **no llegaba a entrar en cuadro nunca**. Lo que se veía
 * era un camión yéndose hacia la esquina de abajo a la derecha y la escena
 * fundiendo: el viaje no terminaba en ningún sitio. Y eso es justo lo que la
 * escena está para contar, ahora que la cubierta lleva el nombre escrito.
 *
 * Sale de la posición y el giro de la nave, no de un par de números a ojo: si
 * se mueve la nave o se cambia el trazado, la cámara la sigue sola.
 */
export const ARRIVAL_VIEW = {
  x:
    ROAD_ORIGIN_X +
    ARRIVAL_AT.x +
    FACILITY_CENTRE_X * Math.cos(ARRIVAL_HEADING + Math.PI),
  z: ARRIVAL_AT.z - FACILITY_CENTRE_X * Math.sin(ARRIVAL_HEADING + Math.PI),
};

// El camión **no se mueve** al recibir la carga, y es una decisión, no un
// olvido. Hubo un hundimiento con rebote (`LANDING_DIP`) para contar que lo
// que le acaban de dejar encima pesa veinte toneladas. El problema es dónde
// pasa: justo en el primer plano, que es el único momento en que el camión
// está solo en pantalla y se le miran los detalles. Un meneo ahí no se lee
// como peso, se lee como que el modelo baila. La carga se posa y ya está.

// Vista en tres cuartos del arranque: misma dirección que el perfil, pero la
// cámara sube 20 m y se echa 34 m atrás (unos 30° sobre el suelo). Cuanto más
// tendida, menos se dispara hacia arriba lo que queda al fondo.
export const QUARTER_CAM = { height: 20, back: 34 };
export const QUARTER_HYP = Math.hypot(QUARTER_CAM.height, QUARTER_CAM.back);
/** Cuánto sube en pantalla un metro de altura desde esa cámara. */
export const QUARTER_UP = QUARTER_CAM.back / QUARTER_HYP;
