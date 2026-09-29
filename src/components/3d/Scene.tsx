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
import Facility from './models/Facility';
import TerminalYard, { TerminalYardNear } from './models/TerminalYard';
import Road, { ROAD_CURVE } from './models/Road';
import TruckRig, { TRUCK } from './models/TruckRig';
import { roadProgress } from '@/lib/route';
import { useScrollStore, writeTravel } from '@/lib/store';
import { lerp, range, smoothstep } from '@/lib/utils';

// Distribución de la maqueta, en metros. El camión mira hacia +X.
const TRUCK_X = 0;
const STACKER_Z = -4.5;

/** Hueco entre el contenedor y el spreader que lo agarra. */
const GRIP = CONTAINER.height / 2 + 0.25;

// Dónde acaba el contenedor sobre el chasis.
const DROP = {
  x: TRUCK_X + TRUCK.containerX,
  y: TRUCK.deckTop + CONTAINER.height / 2,
};
// Y de dónde sale: en alto, con la pluma en su pose más levantada.
const PICK = { x: -3, y: SPREADER_TOP - GRIP };

/** Pose de la pluma con la carga arriba del todo, que es como la transporta. */
const REST_POSE = boomPose(SPREADER_TOP);
/** Altura del centro de un contenedor apoyado en el suelo. */
const GROUND_Y = CONTAINER.height / 2;
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

// Se probó a poner aquí la nave de `Facility` como fondo del patio y no vale:
// está modelada para verse desde arriba y, sin perspectiva que la achique, se
// come el plano entero y su franja de marca cruza el titular. El patio se
// llena con contenedores, que sí están a escala.

// Avance del camión antes de salir a ruta. Es largo a propósito: con pocos
// metros no se leía como que avanzaba. La carretera arranca justo donde lo
// deja la sección oscura, para que el salto a cenital no se note.
const SETTLE_RUN = 26;
/** Cuánto acompaña la cámara al camión en ese arranque. Por debajo de 1 el
 *  camión gana terreno en pantalla: es lo que hace que se vea avanzar. */
const SETTLE_FOLLOW = 0.6;
const ROAD_ORIGIN_X = TRUCK_X + SETTLE_RUN;
/** Desplazamiento lateral en cenital: deja la columna izquierda al texto. */
const ROAD_SHIFT = 9;
/** Cuánto se echa atrás la cámara cenital: unos 16° sobre la vertical. */
const TOP_TILT = 20;
/** Rumbo del camión al entrar en el patio de destino. */
const ARRIVAL_HEADING = Math.atan2(14, 20);

/**
 * Cuánto se hunde el conjunto al recibir el contenedor. Los ocho centímetros
 * reales de una suspensión no se ven a esta distancia de cámara, así que va
 * exagerado: es animación, no simulación.
 */
const LANDING_DIP = 0.5;

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
  const keyLightRef = useRef<DirectionalLight>(null);
  const veilRef = useRef<MeshBasicMaterial>(null);
  const trailRef = useRef<Group>(null);
  const trailNearRef = useRef<MeshBasicMaterial>(null);
  const trailFarRef = useRef<MeshBasicMaterial>(null);
  const speedRef = useRef(0);
  const lastRoadT = useRef(0);

  const roadLength = useMemo(() => ROAD_CURVE.getLength(), []);

  const size = useThree((state) => state.size);
  const isNarrow = size.width < 768;
  const worldWidth = isNarrow ? 30 : 34;
  const roadWidth = isNarrow ? 52 : 45;

  // Encuadre lateral: decidimos a qué altura de la pantalla cae la línea de
  // suelo (y = 0). En el hero va abajo, dejando ver la franja oscura del suelo
  // de la terminal; luego sube hasta que el oscuro llena la pantalla.
  const aspect = size.height / size.width;
  const groundAt = (fraction: number) => worldWidth * aspect * (0.5 - fraction);
  // En móvil la línea de suelo sube algo respecto al borde inferior, para que
  // no quede un hueco enorme entre el texto del hero y el camión.
  const heroFocusY = groundAt(isNarrow ? 0.2 : 0.16);
  const darkFocusY = groundAt(0.62);
  // El suelo no se queda a media pantalla: sigue subiendo hasta salirse por
  // arriba. Si no, el texto de la sección lo adelanta (sube a la velocidad del
  // scroll, el suelo a menos de la mitad) y acaba en blanco sobre crema.
  const filledFocusY = groundAt(1.25);

  // Mismo cálculo para la vista en tres cuartos. Ahí la cámara está a 41°
  // sobre el suelo, así que un metro de altura sube QUARTER_UP en pantalla:
  // para dejar la maniobra en la franja baja (libre del titular) hay que
  // mirar a un punto en alto sobre ella.
  // En escritorio el titular ocupa la mitad derecha, así que la maniobra se
  // va a la columna izquierda y abajo, igual que el camión en la vista de
  // perfil. En móvil el texto va arriba y la maniobra puede ir centrada.
  const quarterWidth = worldWidth * (isNarrow ? 0.8 : 1);
  const quarterDrop = isNarrow ? 0.24 : 0.15;
  const quarterShift = isNarrow ? 0 : 10.5;
  const quarterY =
    (((quarterWidth * aspect) / 2) * (1 - 2 * quarterDrop)) / QUARTER_UP;

  useFrame((state) => {
    const [hero, , inRoute, , route] = useScrollStore.getState().scenes;

    // Vida en reposo: antes de que nadie toque el scroll, la carga se balancea
    // un poco colgada de la pluma. Se apaga en cuanto empiezas a bajar.
    const idle = 1 - smoothstep(range(hero, 0, 0.1));
    const sway = Math.sin(state.clock.elapsedTime * 0.9) * 0.14 * idle;

    // Arranque del camión en llano, sobre la sección oscura. La curva es
    // cuadrática y no `smoothstep` a propósito: arranca parado y va ganando
    // velocidad, en vez de frenar al final. Así entrega el relevo a la
    // carretera todavía acelerando y no se nota el cambio.
    const groundT = range(inRoute, 0.18, 1);
    const groundRun = groundT * groundT * SETTLE_RUN;
    // El morro se levanta al tirar y se vuelve a posar: son cuarenta
    // toneladas saliendo de parado.
    const pull = Math.sin(Math.min(1, groundT * 2.2) * Math.PI);

    // --- Escena 5: la cámara gira a cenital y aparece la carretera -------
    // El suelo oscuro aguanta hasta que el texto claro de la escena 3 ha
    // salido de pantalla; si no, ese texto se queda en blanco sobre crema.
    const clearGround = smoothstep(range(route, 0.18, 0.3));
    const topView = smoothstep(range(route, 0.22, 0.48));
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
    const closing = smoothstep(range(route, 0.9, 0.98));

    // Cuánto queda de vista en tres cuartos. Se usa también para el suelo:
    // desde una cámara elevada la franja oscura deja de ser una franja y se
    // convierte en un plano que se come la pantalla, así que aún no está.
    const quarter = 1 - smoothstep(range(hero, 0.3, 0.5));

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

    // --- Escena 1: la grúa baja el contenedor hasta el chasis ------------
    // A partir de aquí manda la carga y la grúa se coloca donde haga falta.
    // Son dos tiempos, no uno: primero se sitúa sobre el chasis y solo
    // entonces baja en vertical. Una grúa real no entra en diagonal.
    const place = smoothstep(range(hero, 0.5, 0.62));
    const lower = smoothstep(range(hero, 0.63, 0.74));
    const cargoX1 = lerp(PICK.x, DROP.x, place);
    const cargoY1 = lerp(PICK.y, DROP.y, lower);

    // Golpe de la carga al posarse: el conjunto se hunde en la suspensión y
    // se mece hasta pararse. Va exagerado a propósito, porque a esta
    // distancia de cámara los ocho centímetros reales no se verían.
    const impact = range(hero, 0.74, 0.88);
    const dip =
      Math.sin(impact * Math.PI * 3) * Math.exp(-impact * 5) * LANDING_DIP;

    // --- Escena 2: suelta la carga, levanta pluma y sale de plano --------
    // Entre que se posa y que la pluma se separa hay un compás de silencio:
    // sin esa pausa no se lee "ya está", se lee "salió corriendo".
    const released = smoothstep(range(hero, 0.8, 0.88));
    const exit = smoothstep(range(hero, 0.88, 1));

    // Relevo entre los dos actos. Coinciden en el punto de unión, así que la
    // mezcla es corta y no se nota el cambio de quién manda a quién.
    const act = smoothstep(range(hero, 0.46, 0.5));

    // Altura de la carga: el balanceo solo cuando ya cuelga, no apoyada; el
    // hundimiento, solo cuando ya está encima del camión.
    const cargoY = lerp(cargoY0, cargoY1, act) + sway * lift - dip;

    // La pluma apunta siempre a la carga, en los dos actos.
    const carryPose = boomPose(cargoY + GRIP);
    const pose = boomPose(cargoY + GRIP + released * 3.4);

    const cargoX = lerp(
      craneX0 + Math.cos(craneAngle) * carryPose.reach,
      cargoX1,
      act,
    );
    // En profundidad la carga acaba centrada con el camión mientras la grúa se
    // queda por detrás: es la misma licencia que ya usaba la escena de carga.
    const cargoZ = lerp(
      craneZ0 - Math.sin(craneAngle) * carryPose.reach,
      0,
      swing,
    );

    const craneX = lerp(craneX0, cargoX1 - carryPose.reach, act) - exit * 32;
    const craneZ = lerp(craneZ0, APPROACH_TO.z, act);

    if (boomRef.current) boomRef.current.rotation.z = pose.rotation;
    if (stackerRef.current) {
      stackerRef.current.position.set(craneX, 0, craneZ);
      stackerRef.current.rotation.y = craneAngle;
    }

    // --- Camión y carga: primero en llano, después por la carretera ------
    ROAD_CURVE.getPointAt(roadT, roadPoint);
    ROAD_CURVE.getTangentAt(roadT, roadTangent);

    const onRoad = topView;
    const truckX = lerp(
      TRUCK_X + groundRun,
      ROAD_ORIGIN_X + roadPoint.x,
      onRoad,
    );
    const truckZ = lerp(0, roadPoint.z, onRoad);
    const heading = Math.atan2(-roadTangent.z, roadTangent.x);

    if (truckRef.current) {
      // El camión se hunde con el golpe: es lo que cuenta que lo que le
      // acaban de dejar encima pesa veinte toneladas.
      truckRef.current.position.set(truckX, -dip, truckZ);
      truckRef.current.rotation.y = heading * onRoad;
      // Solo en llano: en cenital el morro levantado no se vería y además
      // pelearía con el giro del rumbo.
      truckRef.current.rotation.z = pull * 0.013 * (1 - onRoad);
    }
    // Metros hechos: de aquí sacan las ruedas su giro.
    writeTravel(groundRun + roadT * roadLength);

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
      terminalRef.current.visible = topView < 0.02;
    }
    // El tramo de fondo que pasa por detrás del camión solo se enciende con la
    // cámara ya casi de perfil. En tres cuartos cruzaría por detrás del
    // titular, y para entonces todavía queda fuera de plano por la derecha,
    // así que encenderlo no se ve.
    if (nearYardRef.current) {
      nearYardRef.current.visible = quarter < 0.45;
    }
    if (veilRef.current) {
      veilRef.current.opacity = closing;
      veilRef.current.visible = closing > 0.001;
    }
    if (bandRef.current) {
      // Está desde el principio: es el suelo. Solo se retira al salir a ruta.
      // Hay que ocultarlo además de bajarlo: en cenital se seguiría viendo por
      // muy abajo que esté.
      const hidden = Math.max(clearGround, quarter);
      bandRef.current.position.y = lerp(-300, -520, hidden);
      bandRef.current.visible = hidden < 0.99;
    }

    const camera = cameraRef.current;
    if (camera) {
      // Dos tiempos: el suelo sube hasta posar el camión sobre él, y después
      // sigue subiendo hasta llenar la pantalla, que es cuando entra el texto.
      const settleGround = smoothstep(range(inRoute, 0.02, 0.22));
      const fillGround = smoothstep(range(inRoute, 0.22, 0.48));
      const aimY = lerp(
        lerp(heroFocusY, darkFocusY, settleGround),
        filledFocusY,
        fillGround,
      );
      const sideX = (isNarrow ? 0 : 2) + groundRun * SETTLE_FOLLOW;

      const z = lerp(0, truckZ + ROAD_SHIFT, topView);

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
        lerp(camX, truckX, topView) - TOP_TILT * topView,
        lerp(camY, 70, topView),
        lerp(camZ, z, topView),
      );
      // En cenital el "arriba" de la pantalla pasa a ser -X, así que el camión
      // avanza hacia abajo mientras sigues bajando por la página.
      camera.up.set(-topView, 1 - topView, 0).normalize();
      const focusX = lerp(aimX, truckX, topView);
      const focusZ = lerp(aimZ, z, topView);

      camera.lookAt(focusX, lerp(aimYTarget, 0, topView), focusZ);

      // La luz que proyecta sombra viaja con el punto que mira la cámara. Su
      // dirección no cambia (solo se traslada), así que la escena se ilumina
      // igual en todo momento; lo único que se mueve es el recuadro donde se
      // calcula la sombra, que así no se gasta en zonas vacías.
      const key = keyLightRef.current;
      if (key) {
        key.position.set(focusX - 26, 42, focusZ + 30);
        key.target.position.set(focusX, 0, focusZ);
        key.target.updateMatrixWorld();
      }
      camera.zoom =
        size.width /
        (lerp(lerp(worldWidth, quarterWidth, quarter), roadWidth, topView) +
          swell);
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

      {/* Exposición contenida: la de antes saturaba a blanco cualquier crema
          y por eso el suelo del patio no se distinguía del fondo. */}
      <hemisphereLight args={['#eef1f6', '#d0c9bd', 0.85]} />
      <directionalLight
        ref={keyLightRef}
        position={[-26, 42, 30]}
        intensity={2.1}
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
      <directionalLight position={[22, 12, 10]} intensity={0.35} />

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
        <TerminalYard />
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
        {/* Pila del patio: dos torres de dos, tumbadas en la misma dirección
            en la que la grúa agarra. El quinto contenedor es el que se lleva,
            y arranca en el hueco libre del final de la fila. */}
        {PILE_ROWS.map((pile) => (
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


        <group ref={stackerRef} position={[0, 0, STACKER_Z]}>
          <ReachStackerModel boomRef={boomRef} />
        </group>
      </group>

      <group ref={cargoRef}>
        <ContainerModel withLivery />
      </group>

      <group ref={truckRef} position={[TRUCK_X, 0, 0]}>
        <TruckRig />
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
          position={[201.6, 0, -108.9]}
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
