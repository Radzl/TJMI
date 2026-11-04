'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  DoubleSide,
  Matrix4,
  Object3D,
  Quaternion,
  Vector3,
  type Group,
  type InstancedMesh,
  type Mesh,
} from 'three';
import {
  ROAD_LEAD,
  roadCamDirection,
  roadFrameWidth,
  roadProgress,
} from '@/lib/route';
import { roadSignTexture } from './roadSign';
import { useScrollStore } from '@/lib/store';
import { clamp } from '@/lib/utils';

export const ROAD_WIDTH = 10;

/**
 * Trazado del camión. Empieza dentro del patio de salida, pegado a un muelle,
 * sale a la carretera, y termina dentro del patio de destino. Por eso los dos
 * primeros y los dos últimos puntos van casi rectos: son las entradas a los
 * patios, no curvas de carretera.
 */
export const ROAD_CURVE = new CatmullRomCurve3(
  [
    new Vector3(0, 0, 0), // muelle de salida
    new Vector3(18, 0, 0), // saliendo del patio
    new Vector3(60, 0, 0),
    new Vector3(84, 0, -16),
    new Vector3(88, 0, -44),
    new Vector3(110, 0, -64),
    new Vector3(144, 0, -62),
    new Vector3(166, 0, -84), // entrando al patio de destino
    new Vector3(186, 0, -98), // muelle de llegada
  ],
  false,
  'catmullrom',
  0.4,
);

/** Tramo con líneas de carril: dentro de los patios no se pintan. */
const MARKED = { from: 0.12, to: 0.88 };

/**
 * Cuánto gira el trazado en un punto, con su signo.
 *
 * Es el producto vectorial entre la tangente de un poco antes y la de un poco
 * después, o sea **el seno de lo que ha girado en ese trecho**. El signo dice
 * hacia qué lado. Se usa para decidir por dónde va el quitamiedos; es la
 * misma cuenta con la que el camión se inclina en las curvas, que vive en
 * `Scene.tsx`.
 */
function turnAt(t: number) {
  const antes = ROAD_CURVE.getTangentAt(Math.max(0, t - 0.01));
  const despues = ROAD_CURVE.getTangentAt(Math.min(1, t + 0.01));
  return antes.x * despues.z - antes.z * despues.x;
}

/**
 * Genera una cinta plana siguiendo la curva entre dos puntos del recorrido.
 *
 * Lo usan el asfalto, el arcén, cada raya de la discontinua, las dos líneas
 * de borde y las dos rodadas. `shift` desplaza la cinta hacia un lado del eje
 * **sin dejar de seguir la curva**: es lo que permite poner algo al borde de
 * la calzada y que acompañe el trazado solo si mañana se cambia.
 */
function ribbon(
  from: number,
  to: number,
  width: number,
  segments: number,
  vertices: number[],
  indices: number[],
  shift = 0,
) {
  const half = width / 2;
  const offset = vertices.length / 3;

  for (let i = 0; i <= segments; i++) {
    const t = from + ((to - from) * i) / segments;
    const point = ROAD_CURVE.getPointAt(t);
    const tangent = ROAD_CURVE.getTangentAt(t);
    // Normal dentro del plano del suelo.
    const nx = -tangent.z;
    const nz = tangent.x;
    const length = Math.hypot(nx, nz) || 1;
    const ux = nx / length;
    const uz = nz / length;

    vertices.push(point.x + ux * (shift + half), 0, point.z + uz * (shift + half));
    vertices.push(point.x + ux * (shift - half), 0, point.z + uz * (shift - half));
  }

  for (let i = 0; i < segments; i++) {
    const a = offset + i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
}

function build(
  ranges: Array<[number, number]>,
  width: number,
  segments: number,
  shift = 0,
) {
  const vertices: number[] = [];
  const indices: number[] = [];
  ranges.forEach(([from, to]) =>
    ribbon(from, to, width, segments, vertices, indices, shift),
  );

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Farolas del arcén. Van aquí y no en el patio porque su sitio es la
 * carretera: en el arranque, con la grúa cargando, estorbaban.
 *
 * Se colocan sobre el propio trazado, así que si se cambia la curva siguen
 * la carretera solas. Aparecen según se va dibujando el asfalto, no antes.
 */
const LAMP = { height: 8, offset: ROAD_WIDTH / 2 + 1.6, count: 11 };
const LAMP_TS = Array.from(
  { length: LAMP.count },
  (_, index) => MARKED.from + ((MARKED.to - MARKED.from) * index) / (LAMP.count - 1),
);

const DASHES = 34;
const ASPHALT_SEGMENTS = 240;
/** Índices por tramo: dos triángulos. */
const PER_SEGMENT = 6;
/** Cada raya se genera con dos tramos. */
const PER_DASH = PER_SEGMENT * 2;

/**
 * El arcén: una cinta más ancha y clara por debajo del asfalto.
 *
 * **Sin esto la calzada terminaba contra el crema de la página con un corte
 * seco**, y eso es lo que más delataba que era una cinta pegada encima y no
 * una carretera. Un borde de grava le da canto y, de paso, mete un valor
 * intermedio entre el negro del asfalto y el papel: sin él, el salto de
 * (35,38,44) a (247,243,236) es el contraste más duro de toda la escena.
 */
const SHOULDER = 1.6;

/**
 * Lo que va pintado o marcado **encima** del asfalto, cada cosa a su lado del
 * eje.
 *
 * Las cuatro van en el mismo plano (`y = 0.06`, el de la discontinua) y no en
 * capas separadas, y se puede porque **no se solapan de lado**: la
 * discontinua ocupa ±0,19 del eje, las rodadas de 0,73 a 1,88 y las líneas de
 * borde de 4,36 a 4,54. Apilarlas en alturas distintas solo habría gastado
 * margen de profundidad para nada.
 */
const STRIPES = [
  // **Líneas de borde.** La calzada solo tenía la discontinua del centro, así
  // que desde arriba no se veía dónde acaba el carril: el asfalto se iba
  // difuminando contra el arcén. Van a 55 cm del borde, como las de verdad.
  { id: 'borde-izq', shift: -(ROAD_WIDTH / 2 - 0.55), width: 0.18, lit: false },
  { id: 'borde-der', shift: ROAD_WIDTH / 2 - 0.55, width: 0.18, lit: false },
  // **Rodadas.** El guion las pedía desde el principio. Van justo donde pisan
  // las ruedas del camión —que circula centrado sobre el eje, así que su vía
  // cae en ±1,25— y **apenas más oscuras que el asfalto**: si se leen como
  // dos rayas, están mal puestas. No son suciedad, es la banda pulida que
  // deja el paso.
  { id: 'rodada-izq', shift: -1.3, width: 1.15, lit: true },
  { id: 'rodada-der', shift: 1.3, width: 1.15, lit: true },
] as const;

const STRIPE_SEGMENTS = 180;

/**
 * El cartel de dirección.
 *
 * ## El problema, que es de geometría y conviene saberlo antes de tocarlo
 *
 * **Un cartel de verdad, plantado vertical, no se puede leer desde esta
 * cámara.** La cenital mira a 16° de la vertical, así que un panel vertical se
 * ve casi de canto: la proyección deja su altura en un **26 %**. Echando la
 * cuenta con el encuadre de escritorio —16 píxeles por metro—, un panel de
 * 7 × 3,2 m saldría de 112 × 8 px. Se vería que hay algo azul en el arcén y no
 * se leería ni una letra.
 *
 * ## Lo que se hace, que es una licencia y está medida
 *
 * El panel **se orienta hacia la cámara** en vez de hacia el tráfico: se queda
 * casi tumbado, levantado esos mismos 16°, y entonces se ve entero y se lee.
 * Los pies siguen verticales, así que lo que se ve desde arriba es un cartel
 * sobre sus postes.
 *
 * Es la misma clase de licencia que ya usa esta escena en otros sitios —la
 * grúa que se coloca detrás del camión, el lote de palés pegado a la lona— y
 * vale por lo mismo: **esta carretera solo se ve desde una cámara**, y desde
 * esa cámara la imagen es correcta. Si algún día se mira desde otro sitio, el
 * cartel se verá tumbado; ahí es donde habría que volver.
 *
 * La orientación se deriva de `roadCamDirection()` y no se escribe a mano,
 * así que si se mueve la cenital el cartel la sigue solo.
 */
/**
 * El quitamiedos.
 *
 * ## Dónde va, y por qué no está escrito a mano
 *
 * Una barrera de verdad no recorre la carretera entera: se pone donde hay
 * peligro, y en una carretera de trazado libre como esta eso es **el lado de
 * fuera de cada curva**. Los tramos **se calculan del propio trazado**: se
 * recorre la curva midiendo cuánto gira en cada punto, se quedan los trechos
 * donde aprieta de verdad y cada uno se saca por el lado que toca. Si mañana
 * se cambia el trazado, la barrera se recoloca sola — que es la misma regla
 * que siguen las farolas y el carril pintado del patio.
 *
 * ## Desde arriba un quitamiedos es una línea, y está bien que lo sea
 *
 * La valla es una chapa de unos 30 cm de alto a 78 del suelo. Desde la
 * cenital, que mira a 16° de la vertical, esa altura se queda en 8 cm: nada.
 * Lo que sí se ve en planta es **el canto de arriba**, que son 34 cm, y **su
 * sombra**, que cae separada porque la valla está levantada. Esas dos cosas
 * juntas son exactamente lo que se ve en una foto aérea de una carretera, así
 * que no hay nada que fingir aquí: la barrera se modela como es y se ve como
 * se tiene que ver.
 */
const GUARDRAIL = {
  /** Altura del canto superior. */
  height: 0.78,
  /** Ancho visto en planta. */
  width: 0.34,
  /** Separación del eje: pasado el arcén, con un palmo de margen. */
  offset: ROAD_WIDTH / 2 + SHOULDER + 0.45,
  /** A partir de cuánto giro se considera curva. Seno sobre un 2 % del trazado. */
  minTurn: 0.05,
  /** Los tramos cortos no se ponen: una barrera de diez metros es un trasto. */
  minLength: 0.06,
  /** La barrera entra antes y sale después de la curva, como las de verdad. */
  margin: 0.02,
  segments: 40,
};

/**
 * Los hitos de kilómetro.
 *
 * ## Qué aportan de verdad, que no es lo que parece
 *
 * **No se van a poder leer, y conviene decirlo antes que nada.** Un hito mide
 * un metro de alto; desde la cenital, que mira a 16° de la vertical, eso se
 * queda en 26 cm, y su placa sale de cinco píxeles. Ni orientándola hacia la
 * cámara —el truco del cartel— se leería: a ese tamaño no hay número que
 * quepa.
 *
 * Lo que aportan es otra cosa, y es la que le faltaba a esta escena: **ritmo**.
 * Una cinta de asfalto con un camión encima no dice cuánto se avanza; una
 * fila de marcas pasando a intervalos regulares, sí. Es el mismo trabajo que
 * hacen las naves del fondo en el patio —sin algo fijo contra lo que medir,
 * el avance no se lee— y aquí no lo hacía nadie: las farolas son once en todo
 * el trayecto y quedan demasiado sueltas para marcar un compás.
 *
 * ## Por qué treinta y dos
 *
 * El tramo con marcas viales (`MARKED`) son 319 de los 420 km del relato, así
 * que **uno cada diez kilómetros** salen 32. No es un número elegido por
 * estética: es el que hace que la cuenta sea defendible si algún día alguien
 * la mira. En escritorio caen a unos 90 px unos de otros y se ven ocho a la
 * vez; en móvil, a 50 px y se ven dieciséis.
 *
 * Van **instanciados** —una llamada de dibujo el cuerpo y otra el remate— y
 * con `frustumCulled={false}`, como todo lo instanciado de esta escena: la
 * esfera envolvente sale de la geometría base, que está en el origen, no de
 * dónde acaban las instancias.
 */
const MILESTONE = {
  count: 32,
  /** Al borde del arcén, por el lado contrario a las farolas. */
  offset: -(ROAD_WIDTH / 2 + SHOULDER * 0.95),
  body: { width: 0.36, height: 1.02, depth: 0.14 },
  /** El remate azul de autovía. Desde arriba es lo único que se ve de cara. */
  cap: { height: 0.16 },
};

const SIGN = {
  /** Dónde cae en el trazado. Un tramo recto entre dos curvas. */
  t: 0.56,
  /** A qué distancia del eje, pasado el arcén. */
  offset: -(ROAD_WIDTH / 2 + SHOULDER + 1.5),
  /** Altura del borde inferior del panel. */
  height: 5.1,
  post: { width: 0.22, gap: 2.4 },
};

export default function Road() {
  const asphaltRef = useRef<Mesh>(null);
  const shoulderRef = useRef<Mesh>(null);
  const stripesRef = useRef<Group>(null);
  const signRef = useRef<Group>(null);
  const guardsRef = useRef<Group>(null);
  const bodyRef = useRef<InstancedMesh>(null);
  const capRef = useRef<InstancedMesh>(null);
  const markingRef = useRef<Mesh>(null);
  const lampsRef = useRef<Group>(null);

  // Posición y giro de cada farola, sacados del propio trazado.
  const lamps = useMemo(
    () =>
      LAMP_TS.map((t) => {
        const point = ROAD_CURVE.getPointAt(t);
        const tangent = ROAD_CURVE.getTangentAt(t);
        const length = Math.hypot(tangent.x, tangent.z) || 1;
        // Normal dentro del plano del suelo: manda la farola al arcén.
        const nx = -tangent.z / length;
        const nz = tangent.x / length;

        return {
          t,
          position: [
            point.x + nx * LAMP.offset,
            0,
            point.z + nz * LAMP.offset,
          ] as [number, number, number],
          // El brazo se gira hacia la calzada.
          rotation: Math.atan2(-nz, -nx),
        };
      }),
    [],
  );

  const asphalt = useMemo(
    () => build([[0, 1]], ROAD_WIDTH, ASPHALT_SEGMENTS),
    [],
  );

  // El arcén se genera con el mismo recorrido y los mismos tramos que el
  // asfalto, así que se descubre con él sin cuentas aparte.
  const shoulder = useMemo(
    () => build([[0, 1]], ROAD_WIDTH + SHOULDER * 2, ASPHALT_SEGMENTS),
    [],
  );

  const stripes = useMemo(
    () =>
      STRIPES.map((stripe) => ({
        ...stripe,
        geometry: build(
          [[MARKED.from, MARKED.to]],
          stripe.width,
          STRIPE_SEGMENTS,
          stripe.shift,
        ),
      })),
    [],
  );

  // **Los tramos de quitamiedos salen del trazado**, no de una lista a mano:
  // se recorre la curva midiendo el giro, se juntan los trechos seguidos que
  // giran para el mismo lado y se tiran los que se quedan cortos.
  const guards = useMemo(() => {
    const PASO = 0.004;
    const tramos: Array<{ from: number; to: number; side: number }> = [];
    let actual: { from: number; to: number; side: number } | null = null;

    for (let t = MARKED.from; t <= MARKED.to; t += PASO) {
      const giro = turnAt(t);
      const side = giro > 0 ? 1 : -1;

      if (Math.abs(giro) < GUARDRAIL.minTurn) {
        actual = null;
        continue;
      }
      if (!actual || actual.side !== side) {
        actual = { from: t, to: t, side };
        tramos.push(actual);
      } else {
        actual.to = t;
      }
    }

    return tramos
      .filter((tramo) => tramo.to - tramo.from >= GUARDRAIL.minLength)
      .map((tramo) => ({
        ...tramo,
        from: Math.max(MARKED.from, tramo.from - GUARDRAIL.margin),
        to: Math.min(MARKED.to, tramo.to + GUARDRAIL.margin),
      }))
      .map((tramo) => ({
        ...tramo,
        geometry: build(
          [[tramo.from, tramo.to]],
          GUARDRAIL.width,
          GUARDRAIL.segments,
          // El lado de fuera de la curva es el contrario al que gira.
          -tramo.side * GUARDRAIL.offset,
        ),
      }));
  }, []);

  // Los hitos: su sitio sale del trazado, como todo lo demás del arcén.
  const milestones = useMemo(() => {
    const puntos: Array<{ t: number; matrix: Matrix4 }> = [];
    const dummy = new Object3D();

    for (let i = 0; i < MILESTONE.count; i += 1) {
      const t =
        MARKED.from +
        ((MARKED.to - MARKED.from) * (i + 0.5)) / MILESTONE.count;
      const point = ROAD_CURVE.getPointAt(t);
      const tangent = ROAD_CURVE.getTangentAt(t);
      const largo = Math.hypot(tangent.x, tangent.z) || 1;

      dummy.position.set(
        point.x + (-tangent.z / largo) * MILESTONE.offset,
        0,
        point.z + (tangent.x / largo) * MILESTONE.offset,
      );
      // De cara a la carretera, como los de verdad.
      dummy.rotation.set(0, Math.atan2(-tangent.z, tangent.x), 0);
      dummy.updateMatrix();

      puntos.push({ t, matrix: dummy.matrix.clone() });
    }

    return puntos;
  }, []);

  // Las matrices se suben una vez al montar. Lo que cambia por fotograma es
  // solo `count`, que no toca el búfer.
  useEffect(() => {
    for (const malla of [bodyRef.current, capRef.current]) {
      if (!malla) continue;
      milestones.forEach((hito, i) => malla.setMatrixAt(i, hito.matrix));
      malla.instanceMatrix.needsUpdate = true;
    }
  }, [milestones]);

  // El cartel: dónde se planta y cómo queda girado para que la cenital lo lea.
  const sign = useMemo(() => {
    const cartel = roadSignTexture('Madrid', 'A-3');
    if (!cartel) return null;

    const point = ROAD_CURVE.getPointAt(SIGN.t);
    const tangent = ROAD_CURVE.getTangentAt(SIGN.t);
    const largo = Math.hypot(tangent.x, tangent.z) || 1;
    const nx = -tangent.z / largo;
    const nz = tangent.x / largo;

    // La base del panel. `z` es su normal y apunta a la cámara; `x` corre
    // hacia -Z, que es la derecha de la pantalla en cenital, así que el texto
    // sale leyéndose del derecho.
    const [dx, dy, dz] = roadCamDirection();
    const ejeZ = new Vector3(dx, dy, dz);
    const ejeX = new Vector3(0, 0, -1);
    const ejeY = new Vector3().crossVectors(ejeZ, ejeX);
    const quaternion = new Quaternion().setFromRotationMatrix(
      new Matrix4().makeBasis(ejeX, ejeY, ejeZ),
    );

    return {
      ...cartel,
      quaternion,
      // Los pies se separan a lo largo de la carretera, no a lo ancho: así
      // quedan uno detrás de otro bajo el panel y no asoman por los lados.
      position: [
        point.x + nx * SIGN.offset,
        0,
        point.z + nz * SIGN.offset,
      ] as [number, number, number],
      along: [tangent.x / largo, 0, tangent.z / largo] as [
        number,
        number,
        number,
      ],
    };
  }, []);

  const marking = useMemo(() => {
    const ranges: Array<[number, number]> = [];
    const span = MARKED.to - MARKED.from;
    for (let i = 0; i < DASHES; i++) {
      const start = MARKED.from + (span * i) / DASHES;
      ranges.push([start + 0.003, start + 0.014]);
    }
    return build(ranges, 0.38, 2);
  }, []);

  // El trazado se va dibujando por delante del camión en vez de estar puesto
  // desde el principio. Como los índices van ordenados a lo largo de la curva,
  // basta con limitar cuántos se pintan.
  /**
   * Cuánta curva hay que llevar dibujada por delante del camión.
   *
   * **No puede ser un número fijo**, y es el error que costó encontrar: la
   * cámara cenital mira adelantada (`ROAD_LEAD`), así que debajo del camión
   * —que es justo donde se mira— tiene que haber asfalto. Pero el encuadre no
   * mide lo mismo en un monitor que en un móvil: en vertical caben casi tres
   * veces más metros de carretera. Con un adelanto único, el que le hacía
   * falta al móvil llenaba de negro la pantalla en escritorio y tapaba el
   * texto.
   *
   * Así que se calcula: desde el camión hasta el borde de abajo del encuadre
   * hay `ROAD_LEAD + 0.5` alturas de pantalla, y eso, pasado a metros y
   * dividido por el largo de la curva, es la fracción que hay que adelantar.
   * Más un poco de margen, que el trazado curva y lo de los lados también
   * entra.
   */
  const size = useThree((state) => state.size);
  const aheadFraction = useMemo(() => {
    const frameDepth =
      roadFrameWidth(size.width) * (size.height / size.width);
    return (frameDepth * (ROAD_LEAD + 0.5) + 8) / ROAD_CURVE.getLength();
  }, [size.width, size.height]);

  useFrame(() => {
    const route = useScrollStore.getState().scenes[4];
    const reveal = clamp(roadProgress(route) + aheadFraction);

    const hastaAsfalto = Math.ceil(ASPHALT_SEGMENTS * reveal) * PER_SEGMENT;
    asphaltRef.current?.geometry.setDrawRange(0, hastaAsfalto);
    // El arcén se dibuja exactamente con el asfalto: si fuera por detrás se
    // vería asomar la grava delante de la calzada, y si fuera por delante se
    // vería la calzada sobre el crema.
    shoulderRef.current?.geometry.setDrawRange(0, hastaAsfalto);

    // Las rayas solo existen en el tramo de carretera, así que su avance se
    // mide sobre ese tramo y no sobre la curva entera.
    const marked = clamp(
      (reveal - MARKED.from) / (MARKED.to - MARKED.from),
    );
    markingRef.current?.geometry.setDrawRange(
      0,
      Math.ceil(DASHES * marked) * PER_DASH,
    );

    // Las cuatro tiras van cada una en su malla, y no en una sola geometría,
    // justo por esto: `setDrawRange` recorre el índice en orden, así que con
    // las cuatro juntas se habría dibujado una entera antes de empezar la
    // siguiente en vez de avanzar las cuatro a la vez.
    const hastaTira = Math.ceil(STRIPE_SEGMENTS * marked) * PER_SEGMENT;
    stripesRef.current?.children.forEach((hijo) => {
      (hijo as Mesh).geometry.setDrawRange(0, hastaTira);
    });

    // Cada farola se enciende cuando el asfalto ya ha llegado hasta ella.
    lampsRef.current?.children.forEach((lamp, index) => {
      lamp.visible = LAMP_TS[index] <= reveal;
    });

    // El cartel, igual: aparece cuando el asfalto ya ha pasado por él.
    if (signRef.current) signRef.current.visible = SIGN.t <= reveal;

    // **Los hitos se descubren moviendo `count`, no escondiéndolos uno a
    // uno.** Van ordenados a lo largo de la curva, así que basta con decirle
    // a la malla instanciada cuántos dibujar: es lo mismo que hace el asfalto
    // con su índice, y sale gratis.
    const hitos = milestones.filter((hito) => hito.t <= reveal).length;
    if (bodyRef.current) bodyRef.current.count = hitos;
    if (capRef.current) capRef.current.count = hitos;

    // Cada tramo de quitamiedos se descubre sobre **su propio trecho**, no
    // sobre la curva entera: empiezan y acaban en sitios distintos.
    guardsRef.current?.children.forEach((barrera, index) => {
      const tramo = guards[index];
      const hecho = clamp((reveal - tramo.from) / (tramo.to - tramo.from));
      barrera.visible = hecho > 0;
      (barrera as Mesh).geometry.setDrawRange(
        0,
        Math.ceil(GUARDRAIL.segments * hecho) * PER_SEGMENT,
      );
    });
  });

  return (
    <group>
      {/* **El arcén, por debajo de todo.** Es lo que le da canto a la
          calzada: antes el asfalto terminaba contra el crema de la página con
          un corte seco. El color es cálido a propósito —todo lo gris frío de
          esta escena se ha leído siempre como «día lluvioso»— y recibe luz,
          como el asfalto, para que gire con él. */}
      <mesh ref={shoulderRef} geometry={shoulder} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#c4bbab" roughness={0.95} side={DoubleSide} />
      </mesh>

      {/* La cinta se genera plana en el suelo: con DoubleSide nos da igual
          hacia dónde queden las caras al curvarse el trazado. */}
      <mesh ref={asphaltRef} geometry={asphalt} position={[0, 0.04, 0]}>
        {/* **El asfalto recibe luz.** Era `meshBasicMaterial`, o sea un
            negro plano, y en la vista cenital ocupa media pantalla: se leía
            como una cinta recortada y no como una carretera. Con un material
            iluminado y rugoso coge el gradiente de la luz principal, así que
            tiene cara iluminada y cara en sombra según gira el trazado, que es
            lo que lo convierte en una superficie.

            El color sube de `#11151c` a `#23262c` porque ahora la luz lo
            multiplica: con el valor de antes, iluminado, seguía siendo casi
            negro y no se veía el relieve. */}
        <meshStandardMaterial
          color="#23262c"
          roughness={0.82}
          side={DoubleSide}
        />
      </mesh>
      <mesh ref={markingRef} geometry={marking} position={[0, 0.06, 0]}>
        <meshBasicMaterial color="#f6f4f1" side={DoubleSide} />
      </mesh>

      {/* Las líneas de borde y las dos rodadas. Van en el mismo plano que la
          discontinua porque no se solapan de lado entre ellas. */}
      <group ref={stripesRef} position={[0, 0.06, 0]}>
        {stripes.map((stripe) =>
          stripe.lit ? (
            // **Las rodadas reciben luz, como el asfalto.** Si fueran un
            // material plano, en la mitad del trazado que queda en sombra se
            // verían más claras que la calzada en vez de más oscuras, que es
            // justo lo contrario de lo que tienen que hacer.
            <mesh key={stripe.id} geometry={stripe.geometry}>
              <meshStandardMaterial
                color="#181b20"
                roughness={0.78}
                side={DoubleSide}
              />
            </mesh>
          ) : (
            <mesh key={stripe.id} geometry={stripe.geometry}>
              <meshBasicMaterial color="#f6f4f1" side={DoubleSide} />
            </mesh>
          ),
        )}
      </group>

      {/* Los hitos de kilómetro. Ver la nota de `MILESTONE`: no están para
          leerse —a este tamaño no hay número que quepa— sino para dar
          **compás**, que es lo que le faltaba al trayecto. */}
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, MILESTONE.count]}
        frustumCulled={false}
        position={[0, MILESTONE.body.height / 2, 0]}
      >
        <boxGeometry
          args={[
            MILESTONE.body.depth,
            MILESTONE.body.height,
            MILESTONE.body.width,
          ]}
        />
        <meshStandardMaterial color="#e8e4dc" roughness={0.75} />
      </instancedMesh>

      <instancedMesh
        ref={capRef}
        args={[undefined, undefined, MILESTONE.count]}
        frustumCulled={false}
        position={[0, MILESTONE.body.height + MILESTONE.cap.height / 2, 0]}
      >
        <boxGeometry
          args={[
            MILESTONE.body.depth * 1.08,
            MILESTONE.cap.height,
            MILESTONE.body.width * 1.04,
          ]}
        />
        {/* El mismo azul que el cartel: los dos son señalización de la misma
            vía y en una carretera de verdad llevan el mismo color. */}
        <meshStandardMaterial color="#255a9c" roughness={0.6} />
      </instancedMesh>

      {/* Los quitamiedos. Lo que se ve desde arriba es **el canto de la
          chapa**, 34 cm en planta, y eso basta: medido sobre una captura, la
          barrera sale a 144 contra un arcén de 200 y un fondo de 241, o sea
          casi cien niveles de contraste. Es una línea clara siguiendo la
          curva, que es justo lo que se ve en una foto aérea.

          **No proyectan sombra, y se intentó.** La hipótesis era buena y
          resultó falsa: parecía que toda la maquinaria estaba montada —la
          luz proyecta, el camión está marcado como proyector— y que solo
          faltaba que el asfalto y el arcén **recibieran**. Se les puso
          `receiveShadow`, se les puso `castShadow` al quitamiedos y a las
          farolas, y **no cambió ni un píxel**. Tres medidas, por si alguien
          lo reintenta y para que no repita el camino:

           1. El arnés visual da **0,00 %** en las dos tomas de media ruta,
              que es donde hay farolas, barrera y camión a la vez.
           2. Recorriendo una columna de píxeles por el arcén junto al
              camión, el arcén sale **plano en 200** de arriba abajo: no hay
              ninguna franja más oscura.
           3. Ensanchar el encuadre del mapa de sombras de ±55 a ±140 m
              tampoco movió nada — **ni siquiera en el patio**, que sí tiene
              sombras. Eso último es la pista buena: lo que hay que mirar no
              es la carretera, es el aparejo de luz.

          Así que las banderas se quitaron: una propiedad que no se ejecuta
          solo añade coste. Lo que asienta al camión sobre el asfalto en esta
          vista siguen siendo las sombras de contacto, que van pintadas. */}
      <group ref={guardsRef} position={[0, GUARDRAIL.height, 0]}>
        {guards.map((tramo) => (
          <mesh
            key={`${tramo.from}-${tramo.side}`}
            geometry={tramo.geometry}
            visible={false}
          >
            <meshStandardMaterial
              color="#a7adb5"
              roughness={0.42}
              metalness={0.5}
              side={DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* El cartel de dirección. Ver la nota de `SIGN`: el panel mira a la
          cámara y no al tráfico, que es la única forma de que se lea desde
          una cenital. */}
      {sign && (
        <group ref={signRef} position={sign.position} visible={false}>
          {[-1, 1].map((lado) => (
            <mesh
              key={lado}
              position={[
                (sign.along[0] * SIGN.post.gap * lado) / 2,
                SIGN.height / 2,
                (sign.along[2] * SIGN.post.gap * lado) / 2,
              ]}
            >
              <boxGeometry
                args={[SIGN.post.width, SIGN.height, SIGN.post.width]}
              />
              <meshStandardMaterial color="#9aa0a8" roughness={0.6} />
            </mesh>
          ))}

          <mesh
            position={[0, SIGN.height, 0]}
            quaternion={sign.quaternion}
          >
            <planeGeometry args={[sign.width, sign.height]} />
            {/* Sin luz, como las marcas viales: una señal es retrorreflexiva
                y lo que tiene que hacer aquí es leerse, no coger el gradiente
                de la luz principal. */}
            <meshBasicMaterial map={sign.textura} side={DoubleSide} />
          </mesh>
        </group>
      )}

      <group ref={lampsRef}>
        {lamps.map((lamp) => (
          <group
            key={lamp.t}
            position={lamp.position}
            rotation={[0, lamp.rotation, 0]}
            visible={false}
          >
            <mesh position={[0, LAMP.height / 2, 0]}>
              <cylinderGeometry args={[0.16, 0.22, LAMP.height, 8]} />
              <meshStandardMaterial color="#9aa0a8" roughness={0.6} />
            </mesh>
            {/* Brazo y luminaria, volcados sobre la calzada. */}
            <mesh position={[1.1, LAMP.height - 0.2, 0]}>
              <boxGeometry args={[2.4, 0.22, 0.24]} />
              <meshStandardMaterial color="#9aa0a8" roughness={0.6} />
            </mesh>
            <mesh position={[2.2, LAMP.height - 0.38, 0]}>
              <boxGeometry args={[1.5, 0.3, 0.6]} />
              <meshStandardMaterial color="#39414f" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
