'use client';

import { Environment, Lightformer, OrthographicCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  Matrix4,
  Vector3,
  type Fog,
  type Mesh,
  type MeshStandardMaterial,
  type DirectionalLight,
  type Group,
  type MeshBasicMaterial,
  type OrthographicCamera as OrthoCamera,
} from 'three';
import ContainerStacks, {
  CONTAINER,
  type ContainerPlacement,
} from './models/ContainerModel';
import ForkliftModel from './models/ForkliftModel';
import Facility from './models/Facility';
import TerminalYard, { Sheds, TerminalYardNear } from './models/TerminalYard';
import YardMarkings from './models/YardMarkings';
import Pallets, { PalletLoad, PALLET_LOAD } from './models/Pallets';
import ContactShadow from './models/ContactShadow';
import { fundirPlanos, matrizDe } from './models/planos';
import Road, { ROAD_CURVE } from './models/Road';
import TruckModel, { TRUCK } from './models/TruckModel';
import { ROAD_CAM, ROAD_LEAD, roadFrameWidth, roadProgress } from '@/lib/route';
import { PARTITURA } from '@/lib/partitura';
import { useScrollStore, writeTravel } from '@/lib/store';
import { damp, easeLag, lerp, range, smoothstep } from '@/lib/utils';

// Las medidas de la escena viven en su propio archivo: ver la cabecera de
// `escena/medidas.ts` para el porqué del corte.
import {
  APPROACH_FROM,
  APPROACH_TO,
  ARRIVAL_AT,
  ARRIVAL_HEADING,
  ARRIVAL_VIEW,
  CARGO_Z,
  CARRY_Y,
  CENTRE_NUDGE,
  DROP,
  EXIT_RUN,
  FOG_CLOSE,
  FOG_DAY,
  FOG_NIGHT,
  FOG_QUARTER,
  FOG_ROAD,
  FOG_SIDE,
  FOREGROUND_STACKS,
  FORKLIFT_CONTACTS,
  FORKLIFT_Z,
  FORK_REACH,
  HOLD,
  LEAVE_WIDEN,
  LOADING_FRAME,
  LOADING_GROUND,
  OPENING,
  PILE,
  PILE_BASE_Y,
  PILE_GAP,
  PILE_ROWS,
  PILE_ROW_DEPTH,
  PILE_STACKS,
  PILE_VIEW,
  QUARTER_CAM,
  QUARTER_UP,
  ROAD_ORIGIN_X,
  ROAD_SHIFT,
  SETTLE_RUN,
  STAGE,
  TRUCK_BANK,
  TRUCK_CONTACTS,
  TRUCK_FRAME,
  TRUCK_X,
  YARD_CONTACTS,
} from './escena/medidas';

/**
 * Los diecisiete contenedores del patio, colocados una sola vez.
 *
 * Son los mismos sitios que antes montaban dos bucles de grupos anidados —la
 * pila en rejilla y las dos torres de primer término—, escritos como matrices
 * para que `ContainerStacks` los dibuje todos en cinco llamadas. El orden de
 * las operaciones es el de aquellos grupos: primero el sitio en el suelo,
 * después el giro de la torre y por último la altura de cada piso.
 */
const CONTAINER_PLACEMENTS: ContainerPlacement[] = (() => {
  const lista: ContainerPlacement[] = [];
  const piso = (level: number) =>
    new Matrix4().makeTranslation(0, PILE_BASE_Y + level * (CONTAINER.height + 0.06), 0);

  for (const pile of PILE_STACKS) {
    const suelo = new Matrix4().makeTranslation(
      PILE.x - pile.slot * PILE_GAP,
      0,
      PILE.z - pile.row * PILE_ROW_DEPTH,
    );
    pile.colors.forEach((color, level) => {
      lista.push({
        color,
        matrix: suelo
          .clone()
          .multiply(piso(level))
          .multiply(new Matrix4().makeRotationY(Math.PI / 2)),
      });
    });
  }

  for (const stack of FOREGROUND_STACKS) {
    const torre = new Matrix4()
      .makeTranslation(stack.x, 0, stack.z)
      .multiply(new Matrix4().makeRotationY(Math.PI / 2 + stack.rotation));
    stack.colors.forEach((color, level) => {
      lista.push({ color, matrix: torre.clone().multiply(piso(level)) });
    });
  }
  return lista;
})();

/**
 * Las plazas pintadas de la pila, una debajo de cada torre y otra en el hueco
 * del que sale la carga. Eran ocho mallas con ocho materiales iguales; ahora
 * es una geometría fundida (`fundirPlanos`) y una llamada.
 */
const BAYS = fundirPlanos(
  [{ slot: 0, row: 0 }, ...PILE_ROWS].map((bay) => ({
    ancho: CONTAINER.width + 1.3,
    fondo: CONTAINER.length + 1.3,
    matriz: matrizDe(
      [PILE.x - bay.slot * PILE_GAP, 0.02, PILE.z - bay.row * PILE_ROW_DEPTH],
      [-Math.PI / 2, 0, 0],
    ),
  })),
);

/**
 * **La maqueta responde al ratón, y solo en escritorio.**
 *
 * Con cámara ortográfica no hay perspectiva, así que lo único que da
 * profundidad de verdad es mirar desde otro ángulo: girando la cámara un pelo
 * alrededor de lo que mira, lo que está cerca y lo que está lejos se desplazan
 * distinto. Con 1,5° de giro como mucho, las naves del fondo se mueven unos
 * 30 px respecto al camión: se nota que es un sitio y no un recorte, y no
 * marea.
 *
 * - El puntero se escucha **en la ventana**, no en el lienzo: el lienzo lleva
 *   `pointer-events-none` para no tapar la página.
 * - **Nada en pantallas táctiles ni estrechas**: allí no hay puntero que
 *   seguir, y un toque no debe mover la escena.
 * - **Nada en la cenital** de la carretera: allí el encuadre lo manda el
 *   trazado, y girarla movería la carretera bajo el texto.
 * - Va amortiguado con `damp`, como todo lo que se mueve por fotograma: el
 *   retraso es lo que hace que se lea como una cámara con peso y no como un
 *   cursor pegado.
 * - Vive aquí y no en el estado de React: cambia en cada movimiento del ratón
 *   y no debe provocar ni un render.
 */
const puntero = { x: 0, y: 0, vx: 0, vy: 0 };
const ORBITA = { giro: 0.026, cabeceo: 0.012 };
const _brazo = new Vector3();
const _arriba = new Vector3(0, 1, 0);
const _lado = new Vector3();

// Scratch reutilizado cada frame: nada de crear objetos dentro de useFrame.
const roadPoint = new Vector3();
const roadTangent = new Vector3();
/** Punto de la curva donde cae el morro del camión. Ver `heading`. */
const roadNose = new Vector3();
/** Punto medio del arco que ocupa el camión. Sirve para centrarlo. */
const roadBulge = new Vector3();

export default function Scene() {
  const cameraRef = useRef<OrthoCamera>(null);

  // El puntero, normalizado de −1 a 1 desde el centro de la ventana. Solo con
  // ratón: en un táctil `pointerType` es `touch` y no se escucha.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      puntero.x = (e.clientX / window.innerWidth) * 2 - 1;
      puntero.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    // Al salir de la ventana vuelve al centro, en vez de quedarse girada.
    const salir = () => {
      puntero.x = 0;
      puntero.y = 0;
    };
    window.addEventListener('pointermove', mover, { passive: true });
    document.documentElement.addEventListener('pointerleave', salir);
    return () => {
      window.removeEventListener('pointermove', mover);
      document.documentElement.removeEventListener('pointerleave', salir);
    };
  }, []);
  const forkliftRef = useRef<Group>(null);
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
    const coverOut = smoothstep(range(route, ...PARTITURA.carretera.telonAbre));
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
    // el fundido: el camión llega en 0,84 y esto no arranca hasta 0,88, o sea
    // unos 170 px de llegada a la vista. Con el reparto más antiguo eran 76 px
    // y la nave de destino se veía ya oscurecida.
    //
    // **Y el fundido dura lo más parecido posible al de entrada, que es el
    // mismo telón.** Estaba en 0,90 → 0,99: nueve centésimas, **389 px**,
    // contra los 605 px que tarda en abrirse al entrar. O sea que la escena
    // entraba con un fundido y se iba con un parpadeo, y es justo lo que se
    // veía como «se acaba de golpe».
    //
    // La ironía es que la entrada **estuvo en esas mismas nueve centésimas** y
    // se cambió por esto mismo: «un fundido de medio segundo de scroll no es
    // un fundido, es un parpadeo lento». La salida se quedó con el valor que
    // la entrada ya había descartado.
    //
    // Ahora son 0,88 → 1, o sea **518 px**: un 33 % más largo. Igualarlo del
    // todo (605) pedía arrancar en 0,86 y eso se come la llegada, que está
    // afinada aparte. Si hiciera falta más, lo que toca es adelantar el final
    // del recorrido (`ROAD_RUN.to`), no robarle a la pausa.
    const closing = smoothstep(range(route, ...PARTITURA.carretera.telonCierra));

    // **Y la escena se va moviéndose, no solo apagándose.** Arranca en 0,86,
    // justo cuando la cámara acaba de posarse sobre la nave (`arriving`), y
    // por tanto **antes** de que el telón empiece a cerrarse en 0,88: igual
    // que a la entrada, donde la cámara empieza a girar en 0,19 y el telón no
    // se abre hasta 0,26. El movimiento abre y cierra la escena; el telón solo
    // tapa la costura.
    // Nombre largo a propósito: dentro del bloque de cámara ya hay un
    // `leaving`, el del camión saliendo de plano en `InRoute`, y una variable
    // declarada más adentro **tapa** a la de fuera sin dar ningún error. El
    // encuadre se abría durante la salida del camión en vez de al final de la
    // carretera, que es justo el tipo de fallo que compila y se ve tres
    // pantallas más abajo.
    const roadLeaving = smoothstep(range(route, 0.86, 1));

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
      smoothstep(range(hero, ...PARTITURA.hero.primerPlano)) *
      (1 - smoothstep(range(inRoute, 0.02, 0.14)));

    // --- Escena 0: cruza el patio con el lote y encara la cola -----------
    // Aquí manda la carretilla: el lote va en sus horquillas y la seguimos.
    //
    // **Ya no hay tiempo de «levantar»**: la grúa abría cogiendo la carga del
    // suelo porque tenía pluma, y esta máquina no eleva. Entra en plano con el
    // lote ya a la altura del piso.
    //
    // Pero el arranque **sigue en 0,14 y no en 0,02**, que fue mi primer
    // intento. Adelantarlo parecía gratis —el hueco que dejaba `lift` estaba
    // libre— y lo que hace es sacar la máquina de cuadro: durante ese tramo
    // la cámara todavía está encuadrando la pila del fondo, y si la carretilla
    // se va antes, se va sola. Los dos primeros compases son de ralentí, con
    // el lote ya en las horquillas, y eso también cuenta algo: la máquina
    // esperando a que arranque la escena.
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

    // --- Escena 1: se abre la lona y el lote entra por el costado --------
    // A partir de aquí manda la carga y la grúa se coloca donde haga falta.
    // Son dos tiempos, no uno: primero el lote baja a la altura del piso,
    // detrás de la cola, y solo entonces entra deslizando hacia delante.
    // Entrar en diagonal parecería de juguete, y entrar por arriba es
    // imposible: este semirremolque tiene techo.
    const place = smoothstep(range(hero, 0.5, 0.62));
    const insert = smoothstep(range(hero, 0.63, 0.78));
    const cargoX1 = lerp(lerp(HOLD.x, STAGE.x, place), DROP.x, insert);

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
    // Entre que se posa y que la máquina se separa hay un compás de silencio:
    // sin esa pausa no se lee "ya está", se lee "salió corriendo".
    //
    // **Se retira antes y más lejos que la grúa, y es por el primer plano.**
    // Heredó 0,78 → 1 con 12,5 m, y a 0,90 la carretilla seguía en cuadro: el
    // primer plano arranca en 0,84 y existe para que el camión esté **solo**
    // en pantalla, que es el único rato en que se le miran los detalles. Una
    // máquina dando marcha atrás por el borde se come justo eso.
    //
    // Ahora son 18 m entre 0,74 y 0,95, así que para cuando el plano se
    // cierra ya no está. Y el ritmo sigue siendo de máquina, no de corte: una
    // carretilla anda a 12 km/h, bastante más que una reach stacker, así que
    // retirarse más rápido además es lo propio.
    const exit = smoothstep(range(hero, 0.74, 0.95));

    // Relevo entre los dos actos. Coinciden en el punto de unión, así que la
    // mezcla es corta y no se nota el cambio de quién manda a quién.
    const act = smoothstep(range(hero, 0.46, 0.5));

    // **La altura del lote es constante.** No hay nada que interpolar: la
    // carretilla no eleva, así que el lote va a la altura del piso del camión
    // desde que entra en plano. Lo único que se mueve en vertical es la
    // respiración de la escena, y muy poco: lo que se nota en una carretilla
    // parada es el ralentí, no un balanceo.
    const cargoY = CARRY_Y + sway * 0.35;

    const cargoX = lerp(
      craneX0 + Math.cos(craneAngle) * FORK_REACH,
      cargoX1,
      act,
    );
    // En profundidad el lote acaba pegado a la lona. La carretilla trabaja en
    // esa misma línea, así que aquí ya no hay licencia que pedir: antes la
    // grúa se quedaba detrás del camión y alcanzaba con la pluma; ahora la
    // máquina está donde tiene que estar para que las horquillas lleguen.
    // Y va con `act`, no con `swing`: la máquina y su lote tienen que moverse
    // **juntos**. Con `swing` el lote se deslizaba de lado hacia la lona
    // mientras la carretilla seguía cinco metros por detrás, o sea el lote
    // saliéndose de las horquillas de costado.
    const cargoZ = lerp(
      craneZ0 - Math.sin(craneAngle) * FORK_REACH,
      CARGO_Z,
      act,
    );

    // **Las horquillas sí entran en la caja, y por eso esto cambia.**
    //
    // La pluma tenía prohibido pasar de la cola: el techo está a 4,30 m y el
    // spreader agarraba el lote a 3,17, así que al soltar lo atravesaba. Unas
    // horquillas van a 1,20 m, por debajo del piso de carga, y miden 1,25:
    // entran el metro y pico que hace falta para dejar el lote dentro y
    // salen. Que es exactamente lo que hace la de verdad.
    //
    // Por eso la máquina **sigue al lote hasta el final** en vez de clavarse
    // en la cola: lo empuja dentro y luego retrocede.
    const forkliftX = lerp(craneX0, cargoX1 - FORK_REACH, act) - exit * EXIT_RUN;
    const forkliftZ = lerp(craneZ0, FORKLIFT_Z, act);

    // **El balanceo del lote se quita, y no es un recorte: es que ya no toca.**
    //
    // Era un muelle empujado por la propia velocidad de la carga: al acelerar
    // se quedaba atrás, al frenar se adelantaba. Eso es lo que hace una carga
    // **colgada de un cable**, y era de lo mejor que tenía la escena de la
    // grúa. Sobre unas horquillas no pasa: el lote va calzado contra el
    // respaldo y es solidario con la máquina. Dejarlo balanceándose sería el
    // mismo tipo de error que la pluma atravesando el techo, solo que al
    // revés — física de más en vez de de menos.
    //
    // Lo que sí se queda es el cabeceo del conjunto, que lo pone `sway`.
    if (forkliftRef.current) {
      forkliftRef.current.position.set(forkliftX, 0, forkliftZ);
      forkliftRef.current.rotation.y = craneAngle;
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
        sway * 0.02 + pull * 0.013 * (1 - onRoad);
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
      // **En el móvil el encuadre lateral va por su cuenta** y no sigue a
      // `closeUp`. Son tres tiempos con una sola curva cada uno, para que el
      // ancho no haga ningún vaivén:
      //
      //  1. Mientras se carga, solo la acción (`LOADING_FRAME`).
      //  2. Cuando la carretilla ya se ha ido, travelling de la cola al camión
      //     entero (`loadToTruck`). Empieza en 0,80 y no en 0,84 como el primer
      //     plano de escritorio: en un teléfono hay que recorrer más camino, y
      //     con el tramo de escritorio el camión llegaba entero justo al final
      //     del hero, o sea que el rato de verlo solo no llegaba a existir.
      //  3. Al arrancar (`departure`), el ancho de siempre.
      //
      // En escritorio no cambia nada: el camión entero ya cabe grande.
      const departure = smoothstep(range(inRoute, 0.02, 0.14));
      const loadToTruck = smoothstep(range(hero, 0.8, 0.93));
      const sideWidth = isNarrow
        ? lerp(
            lerp(LOADING_FRAME.narrow, TRUCK_FRAME.narrow, loadToTruck),
            worldWidth,
            departure,
          )
        : lerp(worldWidth, TRUCK_FRAME.width, closeUp);

      // Al cerrar el plano, en móvil el camión sube hacia el centro: la
      // pantalla es muy alta, el camión es una tira horizontal y pegado al
      // borde de abajo deja media pantalla de crema vacía. En escritorio no se
      // toca, porque el titular ocupa la mitad derecha y subirlo lo metería
      // justo por debajo del texto.
      // En escritorio baja un poco en vez de subir: el camión crece y, con la
      // línea de suelo donde estaba, el techo del semirremolque se metía
      // justo debajo del titular y del botón.
      // En el móvil, mientras se carga, la línea de suelo va más baja
      // (`LOADING_GROUND`): el plano está cerrado y las naves del fondo
      // crecen con él. Con el camión entero sube al centro, y al arrancar
      // vuelve a la de siempre.
      const framedFraction = isNarrow
        ? lerp(lerp(LOADING_GROUND, 0.45, loadToTruck), heroFraction, departure)
        : lerp(heroFraction, 0.09, closeUp);
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
      const parkedX = isNarrow
        ? lerp(
            lerp(LOADING_FRAME.x, TRUCK_X + TRUCK.length / 2, loadToTruck),
            2.5,
            departure,
          )
        : lerp(2, TRUCK_X + TRUCK.length / 2, closeUp);
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
      //
      // **Y arranca cerrada sobre la carretilla** (`OPENING`): en el primer
      // fotograma el encuadre es una fracción del normal y mira a la máquina,
      // no a la pila, y se abre en los dos primeros compases. El ancho, la
      // altura a la que se mira y el desplazamiento a la columna izquierda se
      // escalan juntos, así que la maniobra sigue cayendo en la franja baja y
      // lejos del titular mientras se abre.
      const openT = smoothstep(range(hero, 0.02, OPENING.until));
      const opening = lerp(isNarrow ? OPENING.narrow : OPENING.desktop, 1, openT);
      const qWidth = quarterWidth * opening;
      const qY = quarterY * opening;
      const quarterX =
        lerp(lerp(forkliftX, PILE_VIEW.x, openT), forkliftX, swing) +
        quarterShift * opening;
      const quarterZ = lerp(lerp(forkliftZ, PILE_VIEW.z, openT), forkliftZ, followZ);

      const aimX = lerp(sideX, quarterX, quarter);
      const aimYTarget = lerp(aimY - 0.4, qY, quarter);
      const aimZ = lerp(0, quarterZ, quarter);

      const camX = lerp(sideX, quarterX, quarter);
      const camY = lerp(aimY, qY + QUARTER_CAM.height, quarter);
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

      // Giro de la cámara con el ratón (ver `puntero`, arriba del todo).
      puntero.vx = damp(puntero.vx, isNarrow ? 0 : puntero.x, 3, dt);
      puntero.vy = damp(puntero.vy, isNarrow ? 0 : puntero.y, 3, dt);
      const orbita = 1 - topView;
      if (orbita > 0.001 && Math.abs(puntero.vx) + Math.abs(puntero.vy) > 1e-4) {
        _brazo.set(
          camera.position.x - focusX,
          camera.position.y - focusY,
          camera.position.z - focusZ,
        );
        _lado.crossVectors(_arriba, _brazo).normalize();
        _brazo.applyAxisAngle(_arriba, -puntero.vx * ORBITA.giro * orbita);
        _brazo.applyAxisAngle(_lado, puntero.vy * ORBITA.cabeceo * orbita);
        camera.position.set(focusX + _brazo.x, focusY + _brazo.y, focusZ + _brazo.z);
      }

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
        ((lerp(
          lerp(sideWidth, qWidth, quarter),
          roadWidth * (1 + LEAVE_WIDEN * roadLeaving),
          topView,
        ) +
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

      {/* **Aquí hubo un `<ContactShadows>` de drei, y no hay que devolverlo.**

          Venía del primer día, de cuando la escena no tenía sombras de
          verdad. Ese componente no pinta una mancha: **renderiza la escena
          entera otra vez en cada fotograma**, desde abajo y con un material
          de profundidad, y como para eso llama a `gl.render`, de paso obliga
          a recalcular el mapa de sombras por segunda vez.

          Medido sobre producción, apagándolo en caliente: **673 → 285
          llamadas de dibujo** en el peor fotograma del hero, o sea el 58–61 %
          de todo lo que se pintaba en el patio, la carga y el arranque (y un
          28–32 % en la carretera). Y la imagen, con él y sin él, cambia un
          **0,00–0,08 %**: lo mismo que dos capturas idénticas seguidas. Iba
          al 16 % de opacidad debajo de unas sombras proyectadas que ya hacen
          ese trabajo, y de las de contacto propias (`ContactShadow.tsx`), que
          cuestan una llamada.

          Es el tercer efecto de este proyecto que estaba montado sin que
          nadie pudiera verlo, después de la viñeta y de la primera versión de
          las sombras de contacto. Este además se cobraba. */}

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
        {/* Las ocho plazas van en una sola malla: ver `BAYS`, arriba. */}
        <mesh geometry={BAYS}>
          <meshBasicMaterial color="#dcd4c5" toneMapped={false} />
        </mesh>
        {/* **Las sombras de contacto, antes de lo que se apoya en ellas.**
            La luz principal va rasante, así que tira la sombra de cada cosa a
            un lado y justo bajo el apoyo no queda nada: eso es lo que hacía
            que la pila se leyera como pegada encima del suelo. Ver
            `ContactShadow.tsx`. */}
        <ContactShadow puntos={YARD_CONTACTS} />

        {/* Pila del patio y las dos torres de primer término, en un solo
            componente instanciado. Los sitios están en `CONTAINER_PLACEMENTS`,
            arriba del todo.

            La pila va en rejilla, tumbada en la misma dirección en la que la
            carretilla trabaja. Las de primer término van cortadas por el
            borde del encuadre y giradas un par de grados: no son decorado, son
            la pista de profundidad que faltaba, y un patio de verdad no está
            en rejilla. */}
        <ContainerStacks items={CONTAINER_PLACEMENTS} />


        <group ref={forkliftRef} position={[0, 0, FORKLIFT_Z]}>
          {/* La sombra de contacto cuelga del grupo de la máquina, así que la
              sigue sola mientras maniobra. */}
          <ContactShadow puntos={FORKLIFT_CONTACTS} fuerza={0.3} />
          <ForkliftModel />
          {/* Rotativo sobre el techo protector. Parpadea siempre: es lo que
              mantiene viva la escena mientras alguien lee el titular sin hacer
              scroll.

              **Baja de 4,35 m a 2,05.** Estaba a la altura de la cabina de la
              grúa, que mide el doble; dejado ahí quedaría flotando un palmo
              por encima de la carretilla. Va justo sobre el techo (1,92 m) y
              retrasado hacia el cuerpo, porque el origen del modelo está en la
              punta de las horquillas. */}
          <mesh ref={beaconRef} position={[-1.9, 2.05, 0]}>
            <sphereGeometry args={[0.16, 10, 10]} />
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
