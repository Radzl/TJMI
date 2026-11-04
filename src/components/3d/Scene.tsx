'use client';

import {
  ContactShadows,
  Environment,
  Lightformer,
  OrthographicCamera,
} from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  Vector3,
  Color,
  type Fog,
  type Mesh,
  type MeshStandardMaterial,
  type DirectionalLight,
  type Group,
  type MeshBasicMaterial,
  type OrthographicCamera as OrthoCamera,
} from 'three';
import ContainerModel, { CONTAINER } from './models/ContainerModel';
import ReachStackerModel, {
  SPREADER_TOP,
  boomPose,
} from './models/ReachStackerModel';
import Facility, { FACILITY_CENTRE_X } from './models/Facility';
import TerminalYard, { Sheds, TerminalYardNear } from './models/TerminalYard';
import YardMarkings from './models/YardMarkings';
import Pallets, {
  PalletLoad,
  PALLET,
  PALLET_LOAD,
  PALLET_STACKS,
} from './models/Pallets';
import ContactShadow, { type Contacto } from './models/ContactShadow';
import Road, { ROAD_CURVE } from './models/Road';
import TruckModel, { TRUCK } from './models/TruckModel';
import { ROAD_CAM, ROAD_LEAD, roadFrameWidth, roadProgress } from '@/lib/route';
import { useScrollStore, writeTravel } from '@/lib/store';
import { clamp, damp, easeLag, lerp, range, smoothstep } from '@/lib/utils';

// Distribución de la maqueta, en metros. El camión mira hacia +X.
const TRUCK_X = 0;
const STACKER_Z = -4.5;

/** Hueco entre el lote de palés y el spreader que lo agarra. */
const GRIP = PALLET_LOAD.height / 2 + 0.25;

/**
 * Profundidad a la que acaba el lote dentro del semirremolque.
 *
 * El camión ya viene cargado por dentro, así que el lote no busca un hueco:
 * se queda pegado a la lona, por delante de lo que ya hay. Con cámara
 * ortográfica de perfil eso no se distingue de estar "dentro", y a cambio
 * evita atravesar la carga del modelo. Lo justo para que la lona lo tape al
 * cerrarse.
 */
const CARGO_Z = 0.5;

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
const STAGE = {
  x: TRUCK_X + 0.9,
  y: TRUCK.deckTop + PALLET_LOAD.height / 2,
};
/** Y dónde acaba, ya dentro de la caja. */
const DROP = {
  x: TRUCK_X + 2.2,
  y: TRUCK.deckTop + PALLET_LOAD.height / 2,
};
// De dónde sale: en alto, con la pluma en su pose más levantada.
const PICK = { x: -3, y: SPREADER_TOP - GRIP };

/** Pose de la pluma con la carga arriba del todo, que es como la transporta. */
const REST_POSE = boomPose(SPREADER_TOP);
/** Altura del centro del lote apoyado en el suelo. */
const GROUND_Y = PALLET_LOAD.height / 2;
/** Y la pose con la que lo engancha del suelo, al principio de todo. */
const PICK_POSE = boomPose(GROUND_Y + GRIP);

// Escena 0: la grúa coge un contenedor de la pila del fondo, avanza hacia el
// primer plano y gira a la derecha hasta quedar de perfil frente al camión.
const APPROACH_FROM = { x: -24, z: -24, angle: Math.PI / 2 };
const APPROACH_TO = { x: PICK.x - REST_POSE.reach, z: STACKER_Z, angle: 0 };

/** Dónde queda el contenedor que se lleva: en la punta de la pluma. */
const PILE = {
  x: APPROACH_FROM.x,
  z: APPROACH_FROM.z - PICK_POSE.reach,
};
/** Hueco entre contenedores de la pila, a lo ancho. */
const PILE_GAP = CONTAINER.width + 0.9;
/** Punto al que mira la cámara mientras la grúa todavía está en la pila. */
const PILE_VIEW = { x: PILE.x - PILE_GAP, z: PILE.z + 2 };
/** Fondo entre una fila de contenedores y la siguiente. */
const PILE_ROW_DEPTH = CONTAINER.length + 1.4;

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
const FOG_DAY = new Color('#f0e9dd');
const FOG_NIGHT = new Color('#0f1a2e');

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
const FOG_QUARTER = { near: 40, far: 200 };
/** Perfil: la cámara se va a 60 m, así que todo se corre hacia atrás. */
const FOG_SIDE = { near: 70, far: 280 };

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
const FOG_ROAD = { near: 95, far: 420 };

/**
 * Y el primer plano del camión, que cierra el fondo sin tocar al camión.
 *
 * Es el sustituto del desenfoque de maqueta: `TiltShift2` revienta el render
 * con estas versiones (está probado y documentado), así que el fondo se
 * difumina **acercando el fondo de la niebla** en vez de desenfocándolo. El
 * `near` casi no se mueve a propósito: el camión está a 60 m y bajarlo lo
 * difuminaría a él, que es justo lo contrario de lo que se busca.
 */
const FOG_CLOSE = { near: 56, far: 150 };

/**
 * El patio, en coordenadas de rejilla: `slot` cuenta hacia la izquierda y
 * `row` hacia el fondo, desde el hueco que deja el contenedor que se lleva la
 * grúa. La fila 0 es la que se lee (ese hueco más cuatro cajas); las de atrás
 * son patio, para que el plano no quede vacío mientras la grúa se acerca.
 */
const PILE_ROWS = [
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
const ROW_HAZE = 0.22;

function hazed(hex: string, amount: number) {
  return '#' + new Color(hex).lerp(FOG_DAY, amount).getHexString();
}

const PILE_STACKS = PILE_ROWS.map((pile) => ({
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
const FOREGROUND_STACKS = [
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
const YARD_CONTACTS: Contacto[] = [
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
const TRUCK_CONTACTS: Contacto[] = [
  { x: 1.9, z: 0, width: 3.8, depth: 2.7 },
  { x: 13.0, z: 0, width: 5.6, depth: 2.7 },
];

/**
 * El apoyo de la grúa. Aquí sí va una sola huella: la máquina es compacta y
 * sus dos ejes están a tres metros, así que entre ellos no hay hueco que
 * contar.
 */
const STACKER_CONTACTS: Contacto[] = [
  { x: 0.1, z: 0, width: 6.4, depth: 3.4 },
];

// Avance del camión antes de salir a ruta. Es largo a propósito: con pocos
// metros no se leía como que avanzaba. La carretera arranca justo donde lo
// deja la sección oscura, para que el salto a cenital no se note.
const SETTLE_RUN = 120;
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
const CENTRE_NUDGE = 3.2;

/**
 * Encuadre del camión solo, cuando la grúa ya se ha ido: la cámara se cierra
 * y se centra en él. Es el único momento en que el camión está solo en
 * pantalla, y es cuando se le ven los detalles. Después, al arrancar, se abre
 * otra vez para que quepa el recorrido.
 */
const TRUCK_FRAME = { width: 27, narrow: 20 };
const ROAD_ORIGIN_X = TRUCK_X + SETTLE_RUN;
/** Desplazamiento lateral en cenital: deja la columna izquierda al texto. */
const ROAD_SHIFT = 9;

/**
 * Cuánto se inclina el camión en la curva más cerrada, en radianes.
 *
 * **Está medido contra el trazado, no puesto a ojo.** El giro que el camión
 * tiene por delante llega como mucho a un seno de 0,44 en la curva de
 * entrada al patio de destino, así que con este factor la inclinación máxima
 * son unos 2,3 grados. Un camión real bascula entre 2 y 4; por encima de eso
 * deja de leerse como peso y pasa a leerse como que el modelo se cae.
 */
const TRUCK_BANK = 0.09;
/** Cuánto se echa atrás la cámara cenital: unos 16° sobre la vertical. */

/** Rumbo del camión al entrar en el patio de destino. */
const ARRIVAL_HEADING = Math.atan2(14, 20);

/** Dónde se planta la nave de llegada, en coordenadas del grupo de carretera. */
const ARRIVAL_AT = { x: 201.6, z: -108.9 };

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
const ARRIVAL_VIEW = {
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
const QUARTER_CAM = { height: 20, back: 34 };
const QUARTER_HYP = Math.hypot(QUARTER_CAM.height, QUARTER_CAM.back);
/** Cuánto sube en pantalla un metro de altura desde esa cámara. */
const QUARTER_UP = QUARTER_CAM.back / QUARTER_HYP;
// Scratch reutilizado cada frame: nada de crear objetos dentro de useFrame.
const roadPoint = new Vector3();
const roadTangent = new Vector3();
/** Punto de la curva donde cae el morro del camión. Ver `heading`. */
const roadNose = new Vector3();
/** Punto medio del arco que ocupa el camión. Sirve para centrarlo. */
const roadBulge = new Vector3();

export default function Scene() {
  const cameraRef = useRef<OrthoCamera>(null);
  const boomRef = useRef<Group>(null);
  const stackerRef = useRef<Group>(null);
  const cargoRef = useRef<Group>(null);
  const truckRef = useRef<Group>(null);
  const bandRef = useRef<Group>(null);
  const roadRef = useRef<Group>(null);
  const terminalRef = useRef<Group>(null);
  const nearYardRef = useRef<Group>(null);
  const farFenceRef = useRef<Group>(null);
  const curtainRef = useRef<Group>(null);
  const roofRef = useRef<Group>(null);
  const shedsRef = useRef<Group>(null);
  const keyLightRef = useRef<DirectionalLight>(null);
  const fogRef = useRef<Fog>(null);
  // Estado de los muelles. Van en refs y no en estado de React: cambian en
  // cada fotograma y no deben provocar ni un solo render.
  const boomAngle = useRef(Number.NaN);
  const loadSwing = useRef(0);
  const loadSwingVel = useRef(0);
  const lastCargoX = useRef(0);
  const beaconRef = useRef<Mesh>(null);
  const veilRef = useRef<MeshBasicMaterial>(null);
  const trailRef = useRef<Group>(null);
  const trailNearRef = useRef<MeshBasicMaterial>(null);
  const trailFarRef = useRef<MeshBasicMaterial>(null);
  const speedRef = useRef(0);
  const lastRoadT = useRef(0);

  /**
   * Cuánto se inclina el camión hacia fuera en las curvas, en radianes.
   *
   * Va en una ref y amortiguado, como todo lo que se mueve por fotograma en
   * esta escena: la curvatura del trazado cambia de golpe al entrar y salir
   * de una curva, y un camión de veinte toneladas no se endereza de un
   * fotograma al siguiente. El retraso es justo lo que se lee como peso.
   */
  const truckBank = useRef(0);

  const roadLength = useMemo(() => ROAD_CURVE.getLength(), []);

  /**
   * Cuánto del trazado puede recorrer **la cola** del camión.
   *
   * **Esto arreglaba que el camión se saliera al llegar, y el fallo llevaba
   * ahí desde el principio.** El origen del modelo está en la cola, así que
   * los 17,3 m se extienden hacia delante: si la cola recorre la curva hasta
   * el final, el morro acaba **17 m más allá del último metro de asfalto**.
   * Medido recorriendo el trayecto entero y mirando las seis esquinas del
   * conjunto contra el eje: empezaba a salirse en el **95 %** del recorrido y
   * terminaba **12,35 m fuera**, flotando sobre el fondo sin carretera
   * debajo. Y pasaba justo en la llegada, que es cuando la cámara se cierra
   * sobre el camión, o sea en el peor momento posible.
   *
   * Mapeando el avance a este tramo, **el que llega al muelle es el morro** y
   * la cola se queda un camión por detrás, que es lo que pasa de verdad.
   * Medido igual: **0,00 m fuera, en ningún punto del trayecto**.
   *
   * Tiene un segundo efecto que viene de regalo: `noseT` ya nunca se pasa de
   * 1, así que **la cuerda no se queda nunca sin carretera por delante** y la
   * salvaguarda de abajo deja de dispararse.
   */
  const tailSpan = useMemo(
    () => 1 - TRUCK.length / roadLength,
    [roadLength],
  );

  const size = useThree((state) => state.size);
  const isNarrow = size.width < 768;
  const worldWidth = isNarrow ? 30 : 34;
  // Lo comparte con el trazado, que necesita el mismo dato para saber cuánta
  // carretera llevar dibujada por delante. Ver `lib/route.ts`.
  const roadWidth = roadFrameWidth(size.width);

  // Encuadre lateral: decidimos a qué altura de la pantalla cae la línea de
  // suelo (y = 0). En el hero va abajo, dejando ver la franja oscura del suelo
  // de la terminal; luego sube hasta que el oscuro llena la pantalla.
  const aspect = size.height / size.width;
  // La altura se saca del ancho de mundo que haya en ese momento, no del del
  // hero: al cerrar el plano sobre el camión el encuadre se estrecha, y con la
  // cuenta fija la línea de suelo se iba al borde de abajo.
  const groundAt = (fraction: number, width: number) =>
    width * aspect * (0.5 - fraction);
  // En móvil la línea de suelo sube algo respecto al borde inferior, para que
  // no quede un hueco enorme entre el texto del hero y el camión.
  // En móvil la línea de suelo sube bastante respecto al borde inferior. La
  // pantalla es muy alta y el camión es una tira horizontal: pegado abajo deja
  // media pantalla de crema vacía y queda lejísimos del texto del hero.
  const heroFraction = isNarrow ? 0.3 : 0.16;
  // El suelo no se queda a media pantalla: sigue subiendo hasta salirse por
  // arriba. Si no, el texto de la sección lo adelanta (sube a la velocidad del
  // scroll, el suelo a menos de la mitad) y acaba en blanco sobre crema.
  const filledFraction = 1.25;

  // Mismo cálculo para la vista en tres cuartos. Ahí la cámara está a 41°
  // sobre el suelo, así que un metro de altura sube QUARTER_UP en pantalla:
  // para dejar la maniobra en la franja baja (libre del titular) hay que
  // mirar a un punto en alto sobre ella.
  // En escritorio el titular ocupa la mitad derecha, así que la maniobra se
  // va a la columna izquierda y abajo, igual que el camión en la vista de
  // perfil. En móvil el texto va arriba y la maniobra puede ir centrada.
  const quarterWidth = worldWidth * (isNarrow ? 0.8 : 1);
  // En móvil sube más que en escritorio, y no es por gusto: allí el titular
  // vive arriba y la maniobra abajo, así que entre los dos quedaba una franja
  // de crema vacía de más o menos un octavo de pantalla. En escritorio no
  // pasa, porque el texto está al lado y no encima.
  const quarterDrop = isNarrow ? 0.29 : 0.15;
  const quarterShift = isNarrow ? 0 : 10.5;
  const quarterY =
    (((quarterWidth * aspect) / 2) * (1 - 2 * quarterDrop)) / QUARTER_UP;

  useFrame((state, frameDelta) => {
    // Se acota por si la pestaña ha estado en segundo plano: si no, al volver
    // llega un salto enorme y los muelles pegan un latigazo.
    const dt = Math.min(frameDelta, 0.05);

    const [hero, , inRoute, , route] = useScrollStore.getState().scenes;

    // Vida en reposo: antes de que nadie toque el scroll, la carga se balancea
    // un poco colgada de la pluma. Se apaga en cuanto empiezas a bajar.
    // Respiración de la carga colgada. Antes se apagaba al primer scroll y a
    // partir de ahí la escena se quedaba muerta mientras lees el titular;
    // ahora solo baja de intensidad, y sigue habiendo algo vivo.
    const idle = 1 - smoothstep(range(hero, 0, 0.1)) * 0.72;
    const sway = Math.sin(state.clock.elapsedTime * 0.9) * 0.14 * idle;

    // Rotativo naranja de la grúa: parpadeo lento, como el de verdad.
    const beacon = Math.sin(state.clock.elapsedTime * 3.6) > 0.35;
    if (beaconRef.current) beaconRef.current.visible = beacon;

    // Arranque del camión en llano, sobre la sección oscura. La curva es
    // cuadrática y no `smoothstep` a propósito: arranca parado y va ganando
    // velocidad, en vez de frenar al final. Así entrega el relevo a la
    // carretera todavía acelerando y no se nota el cambio.
    // El tramo va al principio de la sección a propósito. Antes ocupaba casi
    // toda (0.18 → 1) y no se veía: la cámara sube a llenar la pantalla de
    // azul noche a partir de 0.22, así que el camión salía de cuadro con el
    // recorrido recién empezado y parecía que no avanzaba. Se nota sobre todo
    // en monitores de PC, anchos y bajos, donde la cámara lo pierde antes que
    // en un móvil. Si tocas `fillGround`, revisa esto.
    // El arranque empieza en cuanto termina el hero, que ahora es exactamente
    // `inRoute = 0`. Y acaba **antes** de que la cámara suba a llenar de azul
    // noche (`fillGround`): a partir de ahí el camión ya no se ve y el
    // recorrido se gastaría en balde. Si tocas uno, revisa el otro.
    //
    // **Acababa en 0,52 y se ha adelantado a 0,40**, que es donde el bloque de
    // texto empieza a asomar por abajo. Con el reparto anterior el camión
    // seguía saliendo cuando el titular ya estaba en pantalla, o sea los dos
    // actos a la vez, que es justo lo que este orden existe para evitar.
    const groundT = range(inRoute, 0.03, 0.4);
    const groundRun = groundT * groundT * SETTLE_RUN;
    // El morro se levanta al tirar y se vuelve a posar: son cuarenta
    // toneladas saliendo de parado.
    const pull = Math.sin(Math.min(1, groundT * 2.2) * Math.PI);

    // --- Escena 5: la cámara gira a cenital y aparece la carretera -------
    // El suelo oscuro aguanta hasta que el texto claro de la escena 3 ha
    // salido de pantalla; si no, ese texto se queda en blanco sobre crema.
    // **El relevo a la carretera va con telón, y esto es lo que lo arregla.**
    //
    // La franja oscura que llena la pantalla en `InRoute` es un cajón de
    // 600 × 600, o sea **finito**. Se retiraba bajándola mientras la cámara
    // giraba a cenital, y al girar entraba en cuadro su borde: aparecía una
    // cuña de crema por una esquina, el giro la volvía a tapar y después
    // reaparecía. Medido de 25 en 25 px: el crema subía al 17 %, **volvía a
    // 0 %** y luego subía otra vez. Eso es lo que se veía como un parpadeo.
    //
    // No es un problema de tiempos, es de geometría: con cámara ortográfica un
    // plano no se encoge al alejarlo, así que mientras esté en escena ocupa lo
    // que ocupa, y su borde acaba cruzando el encuadre sí o sí.
    //
    // La solución es la que ya usa el cierre de la intro: **un telón pegado a
    // la cámara**, que no tiene bordes porque mide más que el encuadre. El
    // telón se funde a azul noche sobre la franja —son el mismo color, así que
    // no se nota—, la franja se apaga debajo cuando ya no se ve nada, la
    // cámara gira detrás del telón, y al final el telón se abre y descubre la
    // carretera ya empezándose a dibujar. Un fundido, no un borde moviéndose.
    //
    // `coverIn` se ata a `InRoute` y no a esta escena porque el telón tiene que
    // estar puesto **antes** de que la cámara se mueva, y la cámara se mueve
    // cuando esta escena ya ha empezado.
    const coverIn = smoothstep(range(inRoute, 0.52, 0.6));
    // El telón se abre en 0,14 de la escena, que a 4.320 px son **605 px**.
    // Estuvo en 0,09 (340 px) y se leía como un corte: un fundido de medio
    // segundo de scroll no es un fundido, es un parpadeo lento.
    const coverOut = smoothstep(range(route, 0.26, 0.4));
    const cover = coverIn * (1 - coverOut);
    // Y la cámara gira **más despacio que lo que tarda el telón en abrirse**,
    // así que al descubrirse todavía le queda un pelo de recorrido: se lee
    // como una cámara llegando, no como una cámara que ya estaba puesta.
    const topView = smoothstep(range(route, 0.19, 0.42));
    // Arranca despacio al salir de la nave y frena al llegar a la de destino.
    const roadT = roadProgress(route);

    // Velocidad suavizada, para las rodadas: cuanto más rápido bajas, más
    // marcadas quedan sobre el asfalto.
    const delta = Math.abs(roadT - lastRoadT.current);
    lastRoadT.current = roadT;
    speedRef.current = lerp(speedRef.current, Math.min(1, delta * 90), 0.15);
    // Y la intro se cierra fundiendo a azul noche desde el propio 3D, que es
    // el color al que ya ha virado el fondo de la página.
    // Se deja un respiro entre que el camión aparca y empieza el fundido: sin
    // esa pausa no se lee como "ha llegado", se lee como un corte.
    // Se deja un respiro **de verdad** entre que el camión aparca y empieza
    // el fundido: el camión llega en 0,84 y esto no arranca hasta 0,92, o sea
    // unos 300 px de llegada a la vista. Con el reparto anterior eran 76 px y
    // la nave de destino se veía ya oscurecida.
    const closing = smoothstep(range(route, 0.9, 0.99));

    // Cuánto queda de vista en tres cuartos. Se usa también para el suelo:
    // desde una cámara elevada la franja oscura deja de ser una franja y se
    // convierte en un plano que se come la pantalla, así que aún no está.
    //
    // Baja con `easeLag` y no con `smoothstep`: la cámara se queda arriba
    // viendo la maniobra y resuelve el descenso al final, en vez de repartir
    // el recorrido a partes iguales. Es la diferencia entre una cámara
    // manejada y una interpolada.
    const quarter = 1 - easeLag(range(hero, 0.3, 0.5));

    // El primer plano del camión se calcula aquí arriba porque lo necesitan
    // dos sitios: la cámara, que cierra el encuadre, y la niebla, que se
    // cierra con él para difuminar el fondo.
    const closeUp =
      smoothstep(range(hero, 0.84, 1)) *
      (1 - smoothstep(range(inRoute, 0.02, 0.14)));

    // --- Escena 0: coge el contenedor de la pila, avanza y gira ----------
    // Aquí manda la grúa: la carga va colgada de su pluma y la seguimos.
    // Tres tiempos encadenados: levanta la caja, viene hacia nosotros y gira
    // a la derecha hasta quedar de perfil delante del camión.
    const lift = smoothstep(range(hero, 0.02, 0.16));
    const advance = smoothstep(range(hero, 0.14, 0.3));
    const swing = smoothstep(range(hero, 0.28, 0.46));
    // Cómo sigue la cámara a la grúa. En profundidad solo la acompaña a
    // medias: así se ve que la máquina se acerca (baja por la pantalla) sin
    // que la pila del fondo se dispare hacia arriba y acabe detrás del
    // titular. De lado a lado, en cambio, va clavada durante el giro, y la
    // pila sale de plano limpiamente por la izquierda.
    const followZ = smoothstep(range(hero, 0.1, 0.3)) * 0.5;

    const craneX0 = lerp(APPROACH_FROM.x, APPROACH_TO.x, swing);
    const craneZ0 = lerp(APPROACH_FROM.z, APPROACH_TO.z, advance);
    const craneAngle = lerp(APPROACH_FROM.angle, APPROACH_TO.angle, swing);
    const cargoY0 = lerp(GROUND_Y, PICK.y, lift);

    // --- Escena 1: se abre la lona y el lote entra por el costado --------
    // A partir de aquí manda la carga y la grúa se coloca donde haga falta.
    // Son dos tiempos, no uno: primero el lote baja a la altura del piso,
    // detrás de la cola, y solo entonces entra deslizando hacia delante.
    // Entrar en diagonal parecería de juguete, y entrar por arriba es
    // imposible: este semirremolque tiene techo.
    const place = smoothstep(range(hero, 0.5, 0.62));
    const insert = smoothstep(range(hero, 0.63, 0.78));
    const cargoX1 = lerp(lerp(PICK.x, STAGE.x, place), DROP.x, insert);
    const cargoY1 = lerp(lerp(PICK.y, STAGE.y, place), DROP.y, insert);

    // La lona se abre antes de que el lote llegue y se cierra cuando ya está
    // dentro. Abrir mientras el lote entra se leería como que estorba.
    const curtain =
      smoothstep(range(hero, 0.44, 0.58)) *
      (1 - smoothstep(range(hero, 0.86, 0.96)));
    if (curtainRef.current) {
      // 1 = cerrada; el resto es el fuelle recogido contra el montante.
      curtainRef.current.scale.z = 1 - curtain * 0.92;
    }


    // --- Escena 2: suelta la carga y sale de plano -----------------------
    // Entre que se posa y que la pluma se separa hay un compás de silencio:
    // sin esa pausa no se lee "ya está", se lee "salió corriendo".
    const exit = smoothstep(range(hero, 0.78, 1));

    // Relevo entre los dos actos. Coinciden en el punto de unión, así que la
    // mezcla es corta y no se nota el cambio de quién manda a quién.
    const act = smoothstep(range(hero, 0.46, 0.5));

    // Altura de la carga: el balanceo, solo cuando ya cuelga; apoyada, quieta.
    const cargoY = lerp(cargoY0, cargoY1, act) + sway * lift;

    // **La pluma apunta a la carga y no la suelta levantándose.** Hubo un
    // levantamiento de 1,7 m al soltar y era imposible: la punta se iba a
    // 4,87 y el techo del semirremolque está a 4,30, o sea lo atravesaba.
    // Ahora la pluma se queda a la altura del lote y lo que la separa es que
    // la máquina retrocede, que es como se desengancha de verdad.
    const carryPose = boomPose(cargoY + GRIP);

    const cargoX = lerp(
      craneX0 + Math.cos(craneAngle) * carryPose.reach,
      cargoX1,
      act,
    );
    // En profundidad la carga acaba pegada a la lona mientras la grúa se
    // queda por detrás del camión: es la misma licencia que ya usaba la
    // escena de carga, y además es lo que deja al lote por delante de lo que
    // el semirremolque ya lleva dentro.
    const cargoZ = lerp(
      craneZ0 - Math.sin(craneAngle) * carryPose.reach,
      CARGO_Z,
      swing,
    );

    // **La pluma acompaña al lote solo hasta la cola, nunca dentro.**
    //
    // Antes seguía al lote hasta el fondo de la caja y eso es geométricamente
    // imposible: el techo del semirremolque está a 4,30 m, el spreader agarra
    // el lote a 3,17 —o sea ya dentro— y al soltar subía a 4,87, **atravesando
    // el techo**. Era lo que se veía y no había forma de disimularlo.
    //
    // Clavando el objetivo de la pluma en la cola, la máquina deja el lote en
    // el borde del piso y de ahí entra deslizando. De perfil y con la lona
    // abierta se lee como que lo empujan dentro, que es lo que pasa de verdad.
    const boomTargetX = Math.min(cargoX1, STAGE.x);
    // **La salida va con el scroll, no a 32 metros de golpe.** Estaba en
    // `exit * 32` repartido en el 12 % final de la sección: eso son casi tres
    // metros por cada punto de scroll, o sea que la máquina desaparecía de un
    // tirón. Con 14 m repartidos en un tramo más largo se retira al ritmo al
    // que uno baja, que es lo que se espera de una máquina de obra.
    const craneX = lerp(craneX0, boomTargetX - carryPose.reach, act) - exit * 14;
    const craneZ = lerp(craneZ0, APPROACH_TO.z, act);

    // La pluma no salta a su sitio: llega un pelo tarde, como un brazo
    // hidráulico de verdad. Es el detalle que más separa "animación" de
    // "maquinaria". En el primer fotograma se coloca de golpe, para no verla
    // entrar girando desde cero.
    if (boomRef.current) {
      boomAngle.current = Number.isFinite(boomAngle.current)
        ? damp(boomAngle.current, carryPose.rotation, 9, dt)
        : carryPose.rotation;
      boomRef.current.rotation.z = boomAngle.current;
    }

    // Balanceo de la carga colgada: un muelle empujado por su propia
    // velocidad. Al acelerar se queda atrás, al frenar se adelanta, y se va
    // parando sola. Solo mientras cuelga: una vez posada, quieta.
    const cargoSpeed = dt > 0 ? (cargoX - lastCargoX.current) / dt : 0;
    lastCargoX.current = cargoX;

    // El balanceo se apaga antes, porque el lote se posa antes.
    const hanging = 1 - smoothstep(range(hero, 0.56, 0.64));
    const swingTarget = clamp(-cargoSpeed * 0.011, -0.11, 0.11);
    loadSwingVel.current += (swingTarget - loadSwing.current) * 40 * dt;
    loadSwingVel.current *= Math.exp(-3.4 * dt);
    loadSwing.current += loadSwingVel.current * dt;
    if (stackerRef.current) {
      stackerRef.current.position.set(craneX, 0, craneZ);
      stackerRef.current.rotation.y = craneAngle;
    }

    // --- Camión y carga: primero en llano, después por la carretera ------
    //
    // **El avance manda el morro, no la cola.** `roadT` sigue siendo el viaje
    // de 0 a 1 —de ahí comen el cuentakilómetros y el asfalto que se va
    // dibujando—, pero la cola solo recorre hasta `tailSpan`, que es el
    // trazado menos un camión. Ver la nota de `tailSpan` arriba: sin esto, el
    // morro terminaba 12,35 m más allá del final del asfalto.
    const tailT = roadT * tailSpan;
    ROAD_CURVE.getPointAt(tailT, roadPoint);
    ROAD_CURVE.getTangentAt(tailT, roadTangent);

    // **El morro se apunta al trozo de curva que le toca, no a la tangente.**
    //
    // Esto es lo que hacía que el camión se saliera de la carretera en todas
    // las curvas, y la causa está en un detalle del modelo: **su origen está
    // en la cola**, así que los 17,3 m se extienden hacia delante desde el
    // punto de la curva, no 8,65 a cada lado. Orientándolo con la tangente de
    // la cola, el morro se va por la recta mientras la carretera gira, y en un
    // radio de 35 m eso son **4,27 m** de desvío. La media calzada son 5 m y
    // el camión mide 2,5 de ancho: el margen real es 3,75 m, así que el morro
    // se salía por el arcén.
    //
    // La cuerda lo arregla de raíz: se mira dónde cae la curva un camión más
    // allá y se apunta ahí. Entonces **la cola y el morro quedan los dos sobre
    // el eje** y lo único que se sale es el centro del remolque, por dentro de
    // la curva, que es exactamente lo que le pasa a un semirremolque de verdad
    // y mide 1,07 m: sobra margen.
    //
    // Y encima va **centrado sobre el eje**, no apoyado en él. Con la cuerda a
    // secas, la cola y el morro quedan clavados en el eje y todo el bombeo se
    // va hacia dentro de la curva. Corriendo el camión medio bombeo hacia
    // fuera, el error se reparte: lo que antes se desviaba 2,21 m del eje
    // ahora se desvía 1,31. Medido recorriendo la curva entera.
    const noseT = Math.min(1, tailT + TRUCK.length / roadLength);
    ROAD_CURVE.getPointAt(noseT, roadNose);
    ROAD_CURVE.getPointAt((tailT + noseT) / 2, roadBulge);

    // Medio bombeo del arco respecto a la cuerda. Se calcula por componentes
    // para no reservar vectores en cada fotograma.
    const centreX = (roadBulge.x - (roadPoint.x + roadNose.x) / 2) * 0.5;
    const centreZ = (roadBulge.z - (roadPoint.z + roadNose.z) / 2) * 0.5;

    roadNose.sub(roadPoint);
    // Salvaguarda, que desde que la cola para en `tailSpan` **ya no debería
    // dispararse nunca**: `noseT` cae siempre justo en el final de la curva o
    // antes, así que la cuerda mide un camión entero de principio a fin. Se
    // deja por si alguien cambia el tramo y vuelve a quedarse corto.
    if (roadNose.lengthSq() < 1) roadNose.copy(roadTangent);

    const onRoad = topView;
    const truckX = lerp(
      TRUCK_X + groundRun,
      ROAD_ORIGIN_X + roadPoint.x + centreX,
      onRoad,
    );
    const truckZ = lerp(0, roadPoint.z + centreZ, onRoad);
    const heading = Math.atan2(-roadNose.z, roadNose.x);

    // **El camión se inclina hacia fuera al girar.**
    //
    // Cuánto gira se saca del propio trazado y no de medir el rumbo entre
    // fotogramas: el producto vectorial entre la tangente de la cola y la
    // cuerda hasta el morro da **el seno del ángulo que el camión tiene por
    // delante**, con su signo. Sale gratis porque los dos vectores ya están
    // calculados para orientarlo, y además no depende de lo rápido que se
    // haga scroll, que es lo que pasaría midiendo diferencias por fotograma.
    const chord = Math.hypot(roadNose.x, roadNose.z) || 1;
    const turn =
      (roadTangent.x * roadNose.z - roadTangent.z * roadNose.x) / chord;
    truckBank.current = damp(truckBank.current, turn * TRUCK_BANK, 5, dt);

    if (truckRef.current) {
      truckRef.current.position.set(truckX, 0, truckZ);
      truckRef.current.rotation.y = heading * onRoad;
      // **Con el orden `YXZ`, `rotation.x` bascula sobre el eje del propio
      // camión** y no sobre el X del mundo. Con el orden por defecto el giro
      // en X se aplica por fuera del rumbo, así que en una curva el camión no
      // se habría inclinado: se habría ido de morro contra el suelo.
      truckRef.current.rotation.x = truckBank.current * onRoad;
      // Solo en llano: en cenital el morro levantado no se vería y además
      // pelearía con el giro del rumbo.
      truckRef.current.rotation.z = pull * 0.013 * (1 - onRoad);
    }
    // Metros hechos: de aquí sacan las ruedas su giro. Va con `tailT` y no
    // con `roadT` porque lo que tiene que cuadrar es el suelo que pisa la
    // rueda, y la cola recorre un camión menos que el trazado entero.
    writeTravel(groundRun + tailT * roadLength);

    // El logo del techo solo existe mirando desde arriba. En perfil la cámara
    // no va del todo horizontal, así que se vería aplastado sobre el techo.
    if (roofRef.current) roofRef.current.visible = topView > 0.08;

    if (trailRef.current) {
      trailRef.current.position.set(truckX, 0, truckZ);
      trailRef.current.rotation.y = heading * onRoad;
      trailRef.current.visible = topView > 0.05;
    }
    const trailAlpha = speedRef.current * 0.3 * topView;
    if (trailNearRef.current) trailNearRef.current.opacity = trailAlpha;
    if (trailFarRef.current) trailFarRef.current.opacity = trailAlpha * 0.45;
    // La carga va montada encima, con el mismo giro alrededor del camión.
    if (cargoRef.current) {
      const dropOffset = cargoX - TRUCK_X;
      const angle = heading * onRoad;
      cargoRef.current.position.set(
        truckX + Math.cos(angle) * dropOffset,
        cargoY,
        truckZ - Math.sin(angle) * dropOffset + cargoZ,
      );
      // Llega un pelo torcido y se endereza al posarse, como cuando el
      // operario corrige en el último momento.
      const skew = (1 - smoothstep(range(hero, 0.62, 0.78))) * 0.04;
      cargoRef.current.rotation.y = angle + craneAngle + skew * act;
      // La carga se inclina con el camión: si no, el contenedor se quedaría
      // plano mientras el morro sube.
      cargoRef.current.rotation.z =
        sway * 0.02 + pull * 0.013 * (1 - onRoad) + loadSwing.current * hanging;
    }

    // --- Suelo oscuro de la terminal y carretera --------------------------
    if (roadRef.current) {
      roadRef.current.visible = topView > 0.01;
    }
    // La grúa y la pila son de la terminal: en cuanto la cámara sube a
    // cenital estorban, porque el encuadre abarca decenas de metros.
    if (terminalRef.current) {
      // Se apaga tarde a propósito: mientras la cámara se levanta hace falta
      // que haya suelo debajo, o el encuadre se queda sin nada contra lo que
      // leerse. Para cuando la cenital se asienta ya no está.
      terminalRef.current.visible = topView < 0.12;
    }
    // El tramo de fondo que pasa por detrás del camión solo se enciende con la
    // cámara ya casi de perfil. En tres cuartos cruzaría por detrás del
    // titular, y para entonces todavía queda fuera de plano por la derecha,
    // así que encenderlo no se ve.
    if (nearYardRef.current) {
      nearYardRef.current.visible = quarter < 0.45;
    }
    // Las naves del fondo solo existen en perfil: desde la cámara en tres
    // cuartos se plantarían encima del titular. Se funden según baja, y el
    // fundido se hace al final de la bajada, cuando ya casi no se mueven.
    //
    // **Y entran escalonadas, una detrás de otra.** Las tres a la vez se leen
    // como un telón que se enciende; separadas por un suspiro, se leen como
    // que el mundo se va construyendo según baja la cámara. El orden de los
    // hijos del grupo es el de `SHEDS`, así que basta con el índice.
    const sheds = smoothstep(range(hero, 0.38, 0.62));
    if (shedsRef.current) {
      shedsRef.current.visible = sheds > 0.01;
      shedsRef.current.children.forEach((shed, index) => {
        const from = 0.38 + index * 0.04;
        const alpha = smoothstep(range(hero, from, from + 0.12));
        shed.traverse((child) => {
          const material = (child as Mesh).material as
            | MeshStandardMaterial
            | undefined;
          if (material) material.opacity = alpha;
        });
      });
    }

    // --- Parallax falso del fondo ---------------------------------------
    //
    // Con cámara ortográfica **no hay parallax**: no hay perspectiva, así que
    // todo se mueve clavado a la cámara y el patio entero se desliza como una
    // lámina. Hay que fingirlo, y se finge al revés de lo que parece: para
    // que algo avance *menos* en pantalla hay que moverlo **en la misma
    // dirección** que la cámara, una fracción de lo que ella se mueve.
    //
    // Se ata al avance del camión (`groundRun`), que es el tramo donde el
    // fondo pasa de largo y donde se nota; no a la bajada a perfil, donde el
    // desplazamiento es mucho mayor y el fondo acabaría metiéndose debajo del
    // titular.
    //
    // Las dos piezas del vallado llevan **la misma fracción**: están a la
    // misma profundidad y son la misma valla. Con fracciones distintas se
    // abriría un escalón justo en la junta.
    // Lo que de verdad ha andado la cámara. Antes era una fracción fija del
    // avance del camión; ahora la cámara tiene su propio recorrido (se adelanta
    // para centrarlo y se para para soltarlo), así que el parallax se ata a eso
    // o el fondo se despegaría del movimiento real.
    const follow = groundRun * 0.74;
    const profile = 1 - quarter;
    if (shedsRef.current) shedsRef.current.position.x = follow * 0.5 * profile;
    const fenceShift = follow * 0.26 * profile;
    if (farFenceRef.current) farFenceRef.current.position.x = fenceShift;
    if (nearYardRef.current) nearYardRef.current.position.x = fenceShift;
    // La niebla vira al azul noche cuando el fondo de la escena deja de ser
    // crema: mientras el suelo oscuro llena la pantalla y durante el cierre.
    // Si se quedase en crema, el fondo del patio se aclararía sobre el oscuro
    // y se vería el truco.
    if (fogRef.current) {
      const darkness = Math.max(
        smoothstep(range(inRoute, 0.48, 0.62)) * (1 - topView),
        closing,
      );
      fogRef.current.color.copy(FOG_DAY).lerp(FOG_NIGHT, darkness);
      // El alcance acompaña a la cámara: corto en tres cuartos (está cerca),
      // largo en perfil (se ha ido a 60 m) y cerrado por detrás en el primer
      // plano del camión, que es el desenfoque de maqueta que no se puede
      // montar con postprocesado.
      // Perfil → primer plano → tres cuartos → cenital, en ese orden. Cada
      // vista pone la cámara a una distancia distinta y la niebla se mide
      // desde la cámara, así que el alcance tiene que acompañarla.
      let fogNear = lerp(FOG_SIDE.near, FOG_CLOSE.near, closeUp);
      fogNear = lerp(fogNear, FOG_QUARTER.near, quarter);
      fogRef.current.near = lerp(fogNear, FOG_ROAD.near, topView);

      let fogFar = lerp(FOG_SIDE.far, FOG_CLOSE.far, closeUp);
      fogFar = lerp(fogFar, FOG_QUARTER.far, quarter);
      fogRef.current.far = lerp(fogFar, FOG_ROAD.far, topView);
    }

    if (veilRef.current) {
      // El mismo telón hace dos trabajos y van los dos en azul noche: tapar el
      // relevo a la carretera al principio de la escena y cerrar la intro al
      // final. No se solapan nunca, así que basta con quedarse con el mayor.
      const opacidad = Math.max(closing, cover);
      veilRef.current.opacity = opacidad;
      veilRef.current.visible = opacidad > 0.001;
    }
    if (bandRef.current) {
      // Está desde el principio: es el suelo de la vista de perfil. Se baja y
      // se oculta en tres cuartos, donde no se quiere.
      bandRef.current.position.y = lerp(-300, -520, quarter);
      // **Y se apaga con el telón ya puesto, no al salir a ruta.** El apagado
      // va con `coverIn`, que solo sube, y no con `cover`, que vuelve a bajar
      // al abrirse el telón: si fuera con `cover`, la franja reaparecería en
      // mitad del fundido y volvería a verse su borde, que es justo el fallo
      // que esto arregla.
      bandRef.current.visible = quarter < 0.99 && coverIn < 0.999;
    }

    const camera = cameraRef.current;
    if (camera) {
      // Dos tiempos: el suelo sube hasta posar el camión sobre él, y después
      // sigue subiendo hasta llenar la pantalla, que es cuando entra el texto.
      const settleGround = smoothstep(range(inRoute, 0.03, 0.17));
      // **El llenado se ha retrasado mucho**, y eso es lo que permite que el
      // camión ruede de verdad. Hay una tensión que no se puede esquivar: el
      // texto de esta sección es blanco y necesita el azul noche detrás, pero
      // es justo al subir a llenar de azul cuando el camión se va de cuadro.
      // Antes se llenaba en 0,18–0,33, así que el recorrido tenía que caber en
      // una quinta parte de la sección o se gastaba sin que se viera.
      //
      // Ahora el camión rueda hasta 0,42 y el azul sube después. A cambio,
      // `InRoute` empieza su texto más abajo (ver su `pt`): si el texto blanco
      // asomara antes, se quedaría sobre el crema.
      // **Nada se mueve en vertical mientras el camión esté en pantalla.**
      // Hubo un llenado en dos fases que subía el horizonte a media altura
      // mientras el camión rodaba, para ir dando fondo al texto. Se leía justo
      // al revés de lo que se buscaba: con el camión quieto en el centro y el
      // horizonte subiendo, lo que parece es que el camión está parado y que
      // la imagen se cae. El orden correcto es **primero se va el camión y
      // después sube el azul**, uno detrás de otro y sin solaparse.
      // **El llenado termina TARDE a propósito, y se solapa con la entrada del
      // titular.** Esto fue un error de razonamiento que costó una pasada:
      // durante mucho tiempo se exigió que el azul acabara de llenar **antes**
      // de que el texto asomara, por miedo a que el texto blanco cayera sobre
      // el crema. Y eso dejaba un hueco tonto —casi media pantalla de azul
      // hecho y nada que mirar— mientras el titular subía desde abajo.
      //
      // La exigencia sobraba: **el suelo azul sube desde abajo y el texto entra
      // también por abajo**, así que sus primeros píxeles caen justo donde ya
      // hay azul. Dejando que el llenado siga mientras el titular entra, no hay
      // ningún momento muerto: lo que se ve es el azul acabando de cerrarse
      // detrás del texto que llega.
      //
      // **Y aun así iba demasiado tarde: así se veía el fallo.** El titular
      // entra por abajo en la fracción 0,406 —eso lo fija el hueco de arriba
      // de la sección, no una constante— y el llenado no terminaba hasta la
      // 0,68. Medido a 1280×900: a mitad de camino quedaba una franja de 258
      // px del patio, con una nave gris, ocupando el cuarto superior de la
      // pantalla mientras el titular se leía debajo. El bloque cruzaba la
      // pantalla entera antes de que el azul acabase de cerrarse.
      //
      // Ahora el llenado va **0,40 → 0,50**, que es justo cuando el texto
      // asoma: la franja se cierra con el titular todavía entrando por abajo,
      // y para cuando se lee ya hay azul de borde a borde. El hueco que esto
      // podría reabrir no se abre, porque el camión también sale antes
      // (`leaving`): entre que se va y que llega el texto no hay ni un cuarto
      // de pantalla, y durante ese rato el azul está subiendo.
      const fillGround = smoothstep(range(inRoute, 0.4, 0.5));
      // El primer plano del camión (`closeUp`) se calcula más arriba, porque
      // la niebla también lo necesita. Entra cuando la grúa ya se va y se
      // suelta en cuanto el camión arranca: si se quedase, el recorrido no
      // cabría en pantalla. Es el único momento en que el camión está solo,
      // así que es el momento de verlo entero y con detalle.
      const sideWidth = lerp(
        worldWidth,
        isNarrow ? TRUCK_FRAME.narrow : TRUCK_FRAME.width,
        closeUp,
      );

      // Al cerrar el plano, en móvil el camión sube hacia el centro: la
      // pantalla es muy alta, el camión es una tira horizontal y pegado al
      // borde de abajo deja media pantalla de crema vacía. En escritorio no se
      // toca, porque el titular ocupa la mitad derecha y subirlo lo metería
      // justo por debajo del texto.
      // En escritorio baja un poco en vez de subir: el camión crece y, con la
      // línea de suelo donde estaba, el techo del semirremolque se metía
      // justo debajo del titular y del botón.
      const framedFraction = lerp(heroFraction, isNarrow ? 0.45 : 0.09, closeUp);
      const aimY = lerp(
        lerp(
          groundAt(framedFraction, sideWidth),
          groundAt(0.62, sideWidth),
          settleGround,
        ),
        groundAt(filledFraction, sideWidth),
        fillGround,
      );
      // **El camión no se queda pegado al borde derecho: se centra, lista, y
      // se va.** Son tres tiempos y cada uno se consigue moviendo la cámara
      // distinto respecto al camión, que es lo único que decide dónde cae en
      // pantalla.
      //
      //  1. `toCentre` — la cámara **adelanta** al camión por `centrePull`
      //     metros, justo los que lo separan del centro del encuadre. Al
      //     terminar, el camión está en mitad de la pantalla.
      //  2. Listando — la cámara avanza **exactamente lo mismo** que el camión,
      //     así que se queda clavado en el centro mientras el fondo le pasa por
      //     detrás. Sigue avanzando, pero no se mueve de sitio: es el rato en el
      //     que se escribe la lista.
      //  3. `leaving` — la cámara **se queda quieta** y el camión sigue. Es lo
      //     que lo saca por la derecha, y es lo último que pasa, no lo primero.
      //
      // Antes esto era un seguimiento con una fracción fija (0,52), y por eso
      // el camión derivaba hacia la derecha desde el primer metro y se iba de
      // cuadro enseguida.
      const parkedX = lerp(
        isNarrow ? 2.5 : 2,
        TRUCK_X + TRUCK.length / 2,
        closeUp,
      );
      const centrePull =
        TRUCK_X + TRUCK.length / 2 - (isNarrow ? 2.5 : 2) + CENTRE_NUDGE;

      const toCentre = smoothstep(range(inRoute, 0.03, 0.13));
      // La salida se ata al **momento en que el titular asoma por abajo**, que
      // es la fracción 0,406. Estuvo en 0,40 → 0,52, o sea acabando después de
      // que el texto ya estuviera en pantalla: los dos actos a la vez. Ahora
      // acaba en 0,40 y el relevo es limpio —se va el camión, sube el azul,
      // entra el texto—, que es el orden que esta sección tiene escrito.
      //
      // Ojo: recortar el relleno de arriba de la sección **no** sirve para
      // mover esto. Al acortarla se encoge también su recorrido, así que las
      // fracciones se mantienen y todo baja en la misma proporción. Lo que
      // mueve el relevo son estas fracciones.
      const leaving = smoothstep(range(inRoute, 0.3, 0.4));

      // **La cámara no sigue al camión del todo, le sigue al 90 %.** Siguiéndolo
      // al 100 % quedaba clavado en el centro y entonces lo único que se movía
      // era el fondo, que es exactamente la queja: parece que el camión está
      // parado. Con un 90 %, va derivando despacio hacia la derecha mientras se
      // lee, o sea sigue avanzando **y se le nota**, pero sin irse de cuadro.
      const drift = lerp(1, 0.9, smoothstep(range(inRoute, 0.15, 0.22)));

      // Cuánto llevaba recorrido la cámara cuando se para. Se calcula con la
      // misma curva que el camión en vez de ponerse a mano, para que siga
      // cuadrando si se cambia el tramo o `SETTLE_RUN`.
      const stopT = range(0.4, 0.03, 0.52);
      const camRun = lerp(
        groundRun * drift + centrePull * toCentre,
        stopT * stopT * SETTLE_RUN * 0.9 + centrePull,
        leaving,
      );

      const sideX = parkedX + camRun;

      // La cámara mira a un punto por delante del camión, siguiendo la
      // tangente del trazado: así vale igual en recta y en curva.
      //
      // El adelanto se cierra al llegar (`settle`), para que la cámara
      // alcance al camión justo cuando frena. Si se mantuviera, al pararse
      // se quedaría mirando veinte metros de asfalto vacío pasada la nave.
      const settle = 1 - smoothstep(range(route, 0.84, 0.92));
      const lead = roadWidth * aspect * ROAD_LEAD * settle;

      // **Y al final deja de seguir al camión y se posa sobre la nave.** Es lo
      // que hace que el viaje termine en un sitio con nombre en vez de en la
      // esquina de la pantalla. El camión frena en el muelle, así que los dos
      // caben de sobra en el encuadre: no se pierde de vista.
      const arriving = smoothstep(range(route, 0.7, 0.86));
      const leadX = lerp(truckX + roadTangent.x * lead, ARRIVAL_VIEW.x, arriving);
      const leadZ = lerp(truckZ + roadTangent.z * lead, ARRIVAL_VIEW.z, arriving);

      const z = lerp(0, leadZ + ROAD_SHIFT, topView);

      // Arranque en tres cuartos: la cámara mira desde la misma dirección que
      // el perfil, pero desde arriba. Así el avance de la grúa hacia nosotros
      // se lee como que baja por la pantalla (sin perspectiva no hay otra
      // forma de contarlo) y pasar a perfil es solo bajar la cámara, sin
      // volteos raros. Además va siguiendo a la máquina.
      const quarterX = lerp(PILE_VIEW.x, craneX, swing) + quarterShift;
      const quarterZ = lerp(PILE_VIEW.z, craneZ, followZ);

      const aimX = lerp(sideX, quarterX, quarter);
      const aimYTarget = lerp(aimY - 0.4, quarterY, quarter);
      const aimZ = lerp(0, quarterZ, quarter);

      const camX = lerp(sideX, quarterX, quarter);
      const camY = lerp(aimY, quarterY + QUARTER_CAM.height, quarter);
      const camZ = lerp(60, quarterZ + QUARTER_CAM.back, quarter);

      // Durante el giro la cámara se abre y vuelve a cerrarse: se lee como un
      // "levantar el vuelo" en vez de como un volteo plano.
      const swell = Math.sin(topView * Math.PI) * 16;

      // La cenital no mira a plomo: se echa hacia atrás unos 16°, que es lo
      // que hace que el camión deje de ser una silueta plana.
      camera.position.set(
        lerp(camX, leadX, topView) - ROAD_CAM.tilt * topView,
        lerp(camY, ROAD_CAM.height, topView),
        lerp(camZ, z, topView),
      );
      // En cenital el "arriba" de la pantalla pasa a ser -X, así que el camión
      // avanza hacia abajo mientras sigues bajando por la página.
      camera.up.set(-topView, 1 - topView, 0).normalize();
      const focusX = lerp(aimX, leadX, topView);
      const focusZ = lerp(aimZ, z, topView);

      const focusY = lerp(aimYTarget, 0, topView);
      camera.lookAt(focusX, focusY, focusZ);


      // La luz que proyecta sombra viaja con el punto que mira la cámara. Su
      // dirección no cambia (solo se traslada), así que la escena se ilumina
      // igual en todo momento; lo único que se mueve es el recuadro donde se
      // calcula la sombra, que así no se gasta en zonas vacías.
      const key = keyLightRef.current;
      if (key) {
        // Más rasante que antes (de unos 47° a unos 29° sobre el suelo). El
        // suelo del patio es un campo crema enorme y vacío: lo que lo estructura
        // son las sombras, y para que haya sombra que ver tiene que ser larga.
        key.position.set(focusX - 36, 27, focusZ + 34);
        key.target.position.set(focusX, 0, focusZ);
        key.target.updateMatrixWorld();
      }
      // Empuje lento durante todo el hero: un 4 % de acercamiento repartido
      // en toda la sección. Una cámara clavada se siente a software; con esta
      // deriva, que por sí sola no se ve, la escena deja de estar congelada.
      // Se suelta al pasar a cenital, que allí el encuadre lo manda la
      // carretera.
      const creep = 1 - 0.04 * smoothstep(range(hero, 0.05, 0.95)) * (1 - topView);

      camera.zoom =
        size.width /
        ((lerp(lerp(sideWidth, quarterWidth, quarter), roadWidth, topView) +
          swell) *
          creep);
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[0, 3.4, 60]}
        near={-400}
        far={600}
      >
        {/* Telón pegado a la cámara: cierra la intro fundiendo a azul noche,
            el mismo color al que vira el fondo de la página. */}
        <mesh position={[0, 0, -20]} renderOrder={999}>
          <planeGeometry args={[4000, 4000]} />
          <meshBasicMaterial
            ref={veilRef}
            color="#0f1a2e"
            transparent
            opacity={0}
            depthTest={false}
          />
        </mesh>
      </OrthographicCamera>

      {/* Luz suave y cálida, como la referencia: nada de contraste duro. */}
      {/* Entorno para los reflejos, montado con paneles de luz aquí mismo.
          No se descarga ningún HDRI: sería una petición a un tercero, que en
          esta web va contra la regla de no cargar nada de fuera sin permiso.
          `frames={1}` lo calcula una vez y se olvida. */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={1.6}
          position={[0, 6, 8]}
          scale={[14, 10, 1]}
          color="#ffffff"
        />
        <Lightformer
          intensity={0.7}
          position={[-9, 4, -6]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[10, 8, 1]}
          color="#dfe4ec"
        />
        <Lightformer
          form="ring"
          intensity={0.5}
          position={[6, 8, -4]}
          scale={6}
          color="#f3ede4"
        />
      </Environment>

      {/* Niebla de distancia: lo que está al fondo se va aclarando hacia el
          color del fondo, igual que en la realidad. Es lo que hace que la
          escena deje de leerse plana sin añadir un solo objeto.
          Su color lo va cambiando `useFrame` entre el crema y el azul noche,
          porque si no, en la sección oscura el fondo del patio se iría hacia
          crema y cantaría. */}
      <fog ref={fogRef} attach="fog" args={['#e9e7e3', FOG_QUARTER.near, FOG_QUARTER.far]} />

      {/* **Las tres intensidades están calculadas, no puestas a ojo**, y la
          cuenta conviene conocerla antes de tocarlas.

          **La luz que recibe una superficie tiene que sumar π ≈ 3,14 para que
          salga con su color exacto, no 1,0.** Esto costó tres rondas de
          ajustes a ciegas y conviene no volver a tropezar: three trabaja en
          modo físico y aplica la BRDF de Lambert, que lleva un factor `1/π`.
          O sea que la cuenta intuitiva —«luz 1 → color tal cual»— **es falsa**,
          y deja la escena 2,5 veces por debajo.
 
          No es teoría: con la suma en 1,25 el suelo `#c4c0ba` daba 129,127,124
          medido sobre la captura, y la cuenta con el factor π predice
          exactamente eso. Si alguna vez la escena se ve apagada, **mide un
          píxel del suelo antes de tocar nada**: si no coincide con su color de
          material, el problema es la suma y no el reparto.

          Lo que aporta cada luz sobre una superficie mirando hacia arriba:

            hemisférica  2,11  × 1       = 2,11
            principal    1,64  × 0,479   = 0,78   (viene de [-36, 27, 34],
                                                   así que su coseno es 27/56,4)
            relleno      0,55  × 0,44    = 0,24
                                          ─────
                                           3,13  ≈ π

          Antes sumaban **2,0**, o sea el doble, y por eso el crema se iba a
          blanco por mucho que se bajara el color del material.

          **La suma pasó de 1,02 a 1,13 porque la escena salía apagada, y eso
          obligó a bajar el color base del suelo.** Subir la luz sin más
          devuelve el problema del principio: el suelo estaba calibrado para
          multiplicarse por 1 y se iría otra vez hacia el blanco. Así que su
          color baja en la misma proporción (`TerminalYard.tsx`): el suelo
          renderiza igual y **todo lo demás gana un 10 % de luz**, que es lo que
          se pedía. Si vuelves a tocar estas intensidades, toca también ese
          color o el patio se blanquea.

          **El reparto manda más que la suma, y esto es lo que de verdad
          quitaba luz al patio.** La suma lleva en 1,25 desde hace rato, pero
          con la principal a 1,15 lo que quedaba a la sombra era solo el **56 %**
          de lo iluminado. Y como las vigas de la nave sombrean medio patio, lo
          que se veía era medio patio a media luz: por eso seguía pareciendo un
          día encapotado por mucho que se subiera el total.

          Ahora a la sombra queda el **75 %**. Las sombras siguen leyéndose
          —hacen falta, son lo que estructura un suelo crema enorme y vacío—
          pero ya no son un agujero.

          **El reparto entre ambiente y principal es lo que decide la sombra**,
          y hubo que repartirlo dos veces. Con la principal a 1,05 la cuenta
          daba igual de 1,0, pero a la sombra solo quedaban 0,50: medio paso de
          luz. Como ahora el suelo recibe sombras **físicas** y ya no un velo
          al 26 %, las vigas de la nave rayaban el patio como una persiana. Con
          este reparto, a la sombra queda 0,64 contra 1,02, que se lee como
          bandas de luz y no como barrotes. Si subes la principal, mira el
          patio entero y no solo el camión. */}
      <hemisphereLight args={['#eef1f6', '#d0c9bd', 2.11]} />
      <directionalLight
        ref={keyLightRef}
        position={[-36, 27, 34]}
        intensity={1.64}
        castShadow
        shadow-mapSize={isNarrow ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
      >
        {/* El encuadre de la sombra abarca todo el patio. Se mueve con lo que
            esté mirando la cámara, para no gastar resolución en vacío. */}
        <orthographicCamera
          attach="shadow-camera"
          args={[-55, 55, 55, -55, 1, 160]}
        />
      </directionalLight>
      <directionalLight position={[22, 12, 10]} intensity={0.55} />

      <ContactShadows
        position={[0, 0.03, 0]}
        scale={90}
        resolution={1024}
        blur={3}
        opacity={0.16}
        far={14}
      />

      {/* Terminal: solo existe mientras la cámara está en vista lateral. */}
      <group ref={terminalRef}>
        <TerminalYard fenceRef={farFenceRef} />

        {/* El carril va pintado justo por donde circula la grúa: primero
            baja hacia el espectador y después gira hacia el camión. */}
        <YardMarkings
          corner={{ x: APPROACH_FROM.x, z: APPROACH_TO.z }}
          fromZ={PILE.z - 4}
          toX={TRUCK_X + 14}
        />
        <Sheds ref={shedsRef} />
        <Pallets />

        {/* Los dos lotes que quedan en la plaza de la que sale el que se
            lleva la grúa. Sin ellos, ese lote aparecería solo en mitad de un
            rectángulo pintado y no se entendería de dónde sale. */}
        {[-2.4, 2.4].map((offset) => (
          <group
            key={offset}
            position={[PILE.x, PALLET_LOAD.height / 2, PILE.z + offset]}
          >
            <PalletLoad />
          </group>
        ))}

        <group ref={nearYardRef} visible={false}>
          <TerminalYardNear />
        </group>

        {/* Plazas pintadas, una debajo de cada torre y otra en el hueco del
            que sale la carga: ese rectángulo vacío es lo que cuenta que la
            grúa acaba de llevarse un contenedor de ahí. */}
        {[{ slot: 0, row: 0 }, ...PILE_ROWS].map((bay) => (
          <mesh
            key={`bay-${bay.slot}-${bay.row}`}
            position={[
              PILE.x - bay.slot * PILE_GAP,
              0.02,
              PILE.z - bay.row * PILE_ROW_DEPTH,
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[CONTAINER.width + 1.3, CONTAINER.length + 1.3]} />
            <meshBasicMaterial color="#dcd4c5" toneMapped={false} />
          </mesh>
        ))}
        {/* **Las sombras de contacto, antes de lo que se apoya en ellas.**
            La luz principal va rasante, así que tira la sombra de cada cosa a
            un lado y justo bajo el apoyo no queda nada: eso es lo que hacía
            que la pila se leyera como pegada encima del suelo. Ver
            `ContactShadow.tsx`. */}
        <ContactShadow puntos={YARD_CONTACTS} />

        {/* Pila del patio: dos torres de dos, tumbadas en la misma dirección
            en la que la grúa agarra. El quinto contenedor es el que se lleva,
            y arranca en el hueco libre del final de la fila. */}
        {PILE_STACKS.map((pile) => (
          <group
            key={`${pile.slot}-${pile.row}`}
            position={[
              PILE.x - pile.slot * PILE_GAP,
              0,
              PILE.z - pile.row * PILE_ROW_DEPTH,
            ]}
          >
            {pile.colors.map((color, level) => (
              <group
                key={color + level}
                position={[0, GROUND_Y + level * (CONTAINER.height + 0.06), 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <ContainerModel color={color} />
              </group>
            ))}
          </group>
        ))}

        {/* Primer término: dos torres cortadas por el borde del encuadre.
            No son decorado, son la pista de profundidad que faltaba: la
            escena tenía la grúa y la pila, y nada delante. Van giradas un
            par de grados porque un patio de verdad no está en rejilla, y
            eso es lo que separa una maqueta de un render de catálogo. */}
        {FOREGROUND_STACKS.map((stack) => (
          <group
            key={`front-${stack.x}`}
            position={[stack.x, 0, stack.z]}
            rotation={[0, Math.PI / 2 + stack.rotation, 0]}
          >
            {stack.colors.map((color, level) => (
              <group
                key={color + level}
                position={[0, GROUND_Y + level * (CONTAINER.height + 0.06), 0]}
              >
                <ContainerModel color={color} />
              </group>
            ))}
          </group>
        ))}


        <group ref={stackerRef} position={[0, 0, STACKER_Z]}>
          {/* La sombra de contacto cuelga del grupo de la máquina, así que la
              sigue sola mientras maniobra. */}
          <ContactShadow puntos={STACKER_CONTACTS} fuerza={0.3} />
          <ReachStackerModel boomRef={boomRef} />
          {/* Rotativo sobre la cabina. Parpadea siempre: es lo que mantiene
              viva la escena mientras alguien lee el titular sin hacer scroll. */}
          <mesh ref={beaconRef} position={[-1.4, 4.35, 0]}>
            <sphereGeometry args={[0.24, 10, 10]} />
            <meshBasicMaterial color="#ff9d2e" toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* El lote de palés que entra en el camión. No es carga genérica: es
          azulejo en palé, que es lo que mueve TJMI. */}
      <group ref={cargoRef}>
        <PalletLoad />
      </group>

      <group ref={truckRef} position={[TRUCK_X, 0, 0]} rotation-order="YXZ">
        {/* Dentro del grupo del camión, así que lo acompaña por el patio y
            también por la carretera: un camión sobre asfalto también apoya. */}
        <ContactShadow puntos={TRUCK_CONTACTS} fuerza={0.32} y={0.045} />
        <TruckModel curtainRef={curtainRef} roofRef={roofRef} />
      </group>

      {/* Rodadas sobre el asfalto: aparecen cuanto más rápido bajas. */}
      <group ref={trailRef} visible={false}>
        <mesh position={[-9, 0.09, 0.95]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 0.5]} />
          <meshBasicMaterial
            ref={trailNearRef}
            color="#f6f4f1"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[-9, 0.09, -0.95]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 0.5]} />
          <meshBasicMaterial
            ref={trailFarRef}
            color="#f6f4f1"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Carretera con su nave de salida y su nave de llegada. */}
      <group ref={roadRef} position={[ROAD_ORIGIN_X, 0, 0]} visible={false}>
        <Road />
        {/* Nave de salida: su cara de muelles coincide con el inicio del
            trazado, así que el camión arranca aparcado en un muelle. */}
        <group position={[0, 0, 0]}>
          <Facility accent="#34548a" />
        </group>
        {/* Nave de llegada: colocada justo delante de donde queda el morro al
            terminar el recorrido, y girada para recibirlo de frente. */}
        <group
          position={[ARRIVAL_AT.x, 0, ARRIVAL_AT.z]}
          rotation={[0, ARRIVAL_HEADING + Math.PI, 0]}
        >
          <Facility accent="#d03b40" />
        </group>
      </group>

      {/* Suelo oscuro de la terminal: está desde el primer fotograma y se
          come la pantalla según sube la línea de suelo. */}
      <group ref={bandRef} position={[0, -300, -14]}>
        <mesh>
          <boxGeometry args={[600, 600, 120]} />
          <meshBasicMaterial color="#0f1a2e" />
        </mesh>
      </group>
    </>
  );
}
