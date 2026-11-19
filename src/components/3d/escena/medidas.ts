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
import { NAVE, PUERTA_CARRETILLA } from '../models/NaveAlmazora';
import { PALLET, PALLET_LOAD, PALLET_STACKS } from '../models/Pallets';
import { TRUCK } from '../models/TruckModel';
import { Color } from 'three';
import type { Contacto } from '../models/ContactShadow';
import { CIELO } from './dia';

// Distribución de la maqueta, en metros. El camión mira hacia +X.
export const TRUCK_X = 0;

/**
 * De la punta de las horquillas al centro del lote, a lo largo.
 *
 * Una carretilla no tiene alcance: tiene horquillas, y miden lo que miden. El
 * lote mide 3,6 m en el sentido de la marcha, así que con su centro 0,95 por
 * delante de la punta, su cara de atrás queda a 0,85 por detrás de ella: las
 * horquillas (1,18 m) entran 0,85 bajo la carga y queda a la vista un palmo
 * de horquilla entre la carga y el carro.
 *
 * **Fue 1,25 con la carretilla de antes, y no se puede bajar más de 0,95**
 * (2026-11-19). Con el lote pegado al carro (0,64) la carretilla acabaría la
 * maniobra con el mástil metido 25 cm en la cola del semirremolque: el lote se
 * para con su cara de atrás en x = 0,4 y el mástil va 0,15 por detrás del
 * carro. A 0,95 el frente del mástil se queda justo fuera, en −0,06.
 */
export const FORK_REACH = 0.95;

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
 * La carretilla **no anima la elevación**: el lote viaja a la altura del piso
 * del camión desde el primer fotograma, porque la carretilla sale del almacén
 * **ya cargada**, que es lo que de verdad pasa. Desde 2026-11-19 las
 * horquillas del modelo van subidas a esta misma altura (ver
 * `ForkliftModel.tsx`), así que el lote ya no flota sobre unas horquillas a
 * ras de suelo: va apoyado en ellas.
 *
 * 1,20 m de piso + medio lote (0,86) = 2,06 m al centro.
 */
export const CARRY_Y = TRUCK.deckTop + PALLET_LOAD.height / 2;

/** Dónde trabaja la carretilla en profundidad: alineada con el lote. */
export const FORKLIFT_Z = CARGO_Z;

/** Cuánto recula para salir de plano. Ver la nota de `exit`. */
export const EXIT_RUN = 18;

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

// Escena 0: la carretilla sale de la nave con el lote en las horquillas, se
// acerca al primer plano y gira a la derecha hasta encarar la cola del camión.
//
// **Sale del portón izquierdo de la nave** (2026-11-18) y no de la pila de
// contenedores. Ir a buscar el lote a la pila obligaba a la cámara alta a irse
// a la izquierda, y entonces la nave quedaba detrás del titular.
//
// **Sale marcha atrás**, con las horquillas hacia dentro (mirando a −Z, de ahí
// el ángulo π/2). Se probó saliendo de frente y desde la cámara alta el lote
// —1,7 m de alto, por encima del techo de la máquina— la tapaba entera: solo
// se veía una caja avanzando sola. Recular con una carga que tapa la vista es
// además lo que manda hacer cualquier manual de carretillero. Espera dentro,
// tapada por la fachada, mientras el camión entra y se cuadra: con la máquina
// hacia la puerta, basta con que su largo quede detrás de ella.
export const APPROACH_FROM = {
  x: PUERTA_CARRETILLA,
  z: NAVE.z - FORKLIFT.length - 0.3,
  angle: Math.PI / 2,
};
export const APPROACH_TO = {
  x: HOLD.x - FORK_REACH,
  z: STAGING_Z,
  angle: 0,
};

/**
 * La pila de contenedores del fondo.
 *
 * **Los números están clavados a mano a propósito.** Salían de dónde empezaba
 * la carretilla (y antes, del alcance de la pluma de la grúa). Desde que la
 * carretilla sale de la nave la pila es solo decorado del patio, y se queda
 * donde estaba.
 */
export const PILE = { x: -24, z: -28.47 };
/** Hueco entre contenedores de la pila, a lo ancho. */
export const PILE_GAP = CONTAINER.width + 0.9;
/** Fondo entre una fila de contenedores y la siguiente. */
export const PILE_ROW_DEPTH = CONTAINER.length + 1.4;

/**
 * El color al que vira la niebla en la sección azul noche.
 *
 * Aquí estuvieron también el color de la bruma de día (`FOG_DAY`, un arena
 * claro) y su alcance por vista (`FOG_QUARTER`, `FOG_SIDE`, `FOG_CLOSE`), que
 * eran de la cámara plana: con ella la cámara se iba a 60 m en perfil y a ~40
 * en tres cuartos, y cada vista necesitaba su alcance. Con la cámara con
 * perspectiva (2026-11-18) la bruma tiene el color del horizonte del cielo
 * (`CIELO.horizonte` en `dia.ts`) y su alcance se calcula desde la distancia
 * real de la cámara en `Scene.tsx`. Lo que aquellas notas enseñaban —que la
 * niebla se mide desde la cámara y que un gris en el aire se lee como mal
 * tiempo— sigue escrito en `CLAUDE.md`.
 */
export const FOG_NIGHT = new Color('#0f1a2e');

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

// Hacia el horizonte del cielo, que es el color de la bruma desde que la
// escena es de día (2026-11-18); antes iba hacia el arena de la bruma vieja.
const BRUMA = new Color(CIELO.horizonte);

export function hazed(hex: string, amount: number) {
  return '#' + new Color(hex).lerp(BRUMA, amount).getHexString();
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
];
/** La de la tractora va aparte porque gira con ella cuando el camión se
 *  dobla al maniobrar (D3). */
export const TRACTOR_CONTACTS: Contacto[] = [
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
 * Va **solo debajo del cuerpo**, de la cola al frente de las ruedas
 * delanteras (`FORKLIFT.cuerpo`): desde 2026-11-19 las horquillas van en alto,
 * a la altura del piso del camión, y una mancha debajo de ellas sería sombra
 * de algo que no toca el suelo. El origen del modelo está en la punta de las
 * horquillas, así que el cuerpo queda detrás, en las x negativas.
 */
export const FORKLIFT_CONTACTS: Contacto[] = [
  {
    x: (FORKLIFT.cuerpo.desde + FORKLIFT.cuerpo.hasta) / 2,
    z: 0,
    width: FORKLIFT.cuerpo.hasta - FORKLIFT.cuerpo.desde + 0.3,
    depth: FORKLIFT.width + 0.1,
  },
];

// Avance del camión al arrancar, sobre la sección oscura. Es largo a
// propósito: con pocos metros no se leía como que avanzaba.
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
 * **Cómo mira la cámara alta la entrada del camión** (D3, 2026-11-18).
 *
 * Hasta D3 el primer fotograma se cerraba sobre la carretilla (`OPENING`),
 * porque era la única protagonista y a 34 m de encuadre medía 45 px. Ahora el
 * primer fotograma es del camión, que entra desde el fondo, así que la cámara
 * encuadra **el patio delante de la nave**: el punto de la acción va de
 * `desde` a `hasta` mientras el camión entra (en escritorio se le suma el
 * desplazamiento a la columna izquierda, `quarterShift`, como a todo lo de la
 * vista alta), y ahí se queda mientras la carretilla sale de la nave.
 *
 * **Casi quieta, y es lo que la hace funcionar.** Se probó a atarla al
 * camión, y con la cámara persiguiéndolo la nave acababa unos fotogramas
 * debajo del titular. Quieta, el encuadre abarca el patio entero: el camión
 * aparece junto a la nave, baja hacia la cámara y gira sin salirse del plano,
 * y la nave se queda arriba a la izquierda, con el rótulo por encima del
 * titular y nunca debajo de él. El travelling de `desde` a `hasta` es solo
 * para que la imagen no esté congelada.
 *
 * **El móvil lleva su propio encuadre**, porque allí el titular va arriba y
 * no al lado: con el de escritorio la nave quedaba justo detrás del titular.
 * En una pantalla alta lo natural es apilar: el titular arriba, la nave en
 * medio y el camión abajo. Por eso mira más al fondo (`z` negativa), y
 * empieza a la izquierda para que el camión se vea entrar por el carril.
 *
 * `ancho` multiplica el encuadre de tres cuartos de siempre.
 */
export const ENTRADA_VISTA = {
  pc: { desde: { x: -1.5, z: 5 }, hasta: { x: 0, z: 2 }, ancho: 1.25 },
  movil: { desde: { x: -6, z: -8 }, hasta: { x: 4, z: -10 }, ancho: 1 },
};

/**
 * **Encuadre de perfil mientras se carga, en escritorio** (D3).
 *
 * El cliente eligió el camión y la nave **a la izquierda del titular**. Con
 * los 34 m de siempre centrados en x = 2, la cola quedaba en mitad de la
 * pantalla y la cabina debajo del párrafo. Para que el camión entero quepa a
 * la izquierda **y** la carretilla siga entera detrás de la cola, hace falta
 * más campo: con 40 m centrados en 13,5 la carretilla cae en el borde
 * izquierdo, el camión llega hasta poco más de la mitad y el rótulo de la nave
 * se queda en la mitad izquierda.
 *
 * Solo manda durante la carga: el primer plano (`TRUCK_FRAME`) y el arranque
 * hacia `InRoute` siguen con sus encuadres de siempre.
 */
export const ENCUADRE_CARGA = { ancho: 40, x: 13.5 };

/**
 * Altura de la línea de suelo en el móvil mientras se carga (fracción de la
 * pantalla desde abajo). Con el plano cerrado de `LOADING_FRAME` las naves del
 * fondo crecen con todo lo demás, y a la altura de siempre (0,3) su borde de
 * arriba cruzaba la última línea del párrafo del hero.
 */
export const LOADING_GROUND = 0.2;

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
