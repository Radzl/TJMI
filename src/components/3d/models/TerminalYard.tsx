'use client';

import { Instance, Instances } from '@react-three/drei';
import type { RefObject } from 'react';
import type { Group } from 'three';

/**
 * El patio de la terminal: suelo y vallado.
 *
 * Aquí no hay farolas a propósito. Estorbaban en el arranque, con la grúa
 * cargando, y su sitio natural es la carretera: allí están, en `Road.tsx`.
 *
 * No es decoración gratuita. Sin nada fijo al fondo, el camión avanzando ocho
 * metros no se lee como que avanza, porque no hay contra qué medirlo. Estos
 * elementos son las referencias que hacen visible el movimiento.
 *
 * Viene en dos piezas por un motivo de encuadre. En la vista en tres cuartos
 * del arranque, la mitad derecha de la pantalla la ocupa el titular en
 * escritorio, así que todo lo que esté a la derecha de `SPLIT_X` cruzaría por
 * detrás del texto. Esa parte (`TerminalYardNear`) es justo la que hace falta
 * después, cuando la cámara ya está de perfil y el camión pasa por delante,
 * así que se enciende entonces.
 */

/** El suelo va un pelo por encima de la franja oscura, que tiene su cara
 *  superior en y = 0, para que no peleen por el mismo plano. */
const FLOOR_Y = 0.01;
const FLOOR = { width: 240, depth: 170, x: -15, z: -25 };

/** Dónde se corta el fondo entre la pieza lejana y la cercana. */
const SPLIT_X = -19;

// Cuanto más al fondo esté algo, más arriba sale en la vista en tres cuartos.
// Estas dos profundidades están elegidas para que quepa sin tocar el titular
// en escritorio, que es donde menos alto hay.
// El paso es corto a propósito. Con la cámara acompañando al camión, lo que
// se ve moverse no es el camión: son los postes pasando por detrás. Con pocos
// postes el arranque no se leía como avance.
const FENCE = { z: -43, from: -62, to: 78, step: 5, height: 2.2 };

/**
 * Naves al fondo del patio. Son la referencia grande: el vallado marca el
 * ritmo del avance, pero sin un volumen detrás la escena se queda en un
 * camión flotando sobre crema. Son las naves que se ven en las fotos de la
 * casa (`public/media/camion-02.jpg`).
 *
 * Van lejos para que la niebla de distancia se las lleve hacia el color del
 * fondo: lo que se busca es profundidad, no detalle. Y bajas, porque cuanto
 * más altas más se acercan al titular.
 *
 * **Pero no pueden salir casi del color de la bruma.** Lo estuvieron: eran tan
 * claras que, a 109 m de la cámara de perfil, la niebla las borraba del todo y
 * el fondo se quedaba en una banda lisa. Un edificio lejano en un día de bruma
 * no es del color del aire, es una silueta un punto más oscura. Por eso van en
 * gris medio: lo que se lleva la distancia es el detalle, no el volumen.
 */
/**
 * **Cada nave a su profundidad y a su altura, y con aire entre ellas.**
 *
 * Estaban las tres a la misma distancia, casi a la misma altura y pegadas:
 * sumadas daban un rectángulo gris de borde superior recto que cruzaba la
 * pantalla de lado a lado. Se leía como un muro, no como un fondo.
 *
 * Separarlas en `z` hace dos cosas a la vez, y la segunda es la que importa:
 * escalona la silueta **y** las mete en tramos distintos de la niebla, así
 * que cada una sale de un gris. Esa diferencia de valor entre volúmenes es
 * lo que se lee como profundidad; el escalón solo, sin ella, seguiría siendo
 * una cartulina recortada.
 *
 * Los huecos entre ellas no son descuido: por ahí se ve el fondo, y un hueco
 * de cielo entre dos naves es lo que las separa en dos edificios.
 */
/**
 * **Son las naves de verdad de la empresa**, sacadas de la foto de la casa
 * (`public/media/camion-02.jpg`), que es el mismo sitio que sale en el vídeo
 * corporativo. Y lo que las hace reconocibles no es la forma: es que son
 * **dos construcciones distintas pegadas**.
 *
 *  - Un cuerpo **bajo, de hormigón liso**, en un gris verdoso cálido. Sin
 *    nervios: son paneles prefabricados, y la pared es plana.
 *  - Y otro **más alto, de chapa**, en un gris frío casi blanco, con los
 *    nervios verticales bien marcados.
 *
 * El escalón entre los dos es lo que se reconoce desde lejos, así que van
 * alternando: bajo-liso, alto-nervado. Antes eran cuatro cajas iguales de un
 * solo gris, que es exactamente lo que no es ese sitio.
 */
type ShedKind = "concrete" | "metal";

const SHEDS: Array<{
  x: number;
  z: number;
  width: number;
  height: number;
  kind: ShedKind;
}> = [
  { x: -54, z: -46, width: 38, height: 5.2, kind: "concrete" },
  { x: -10, z: -52, width: 46, height: 8.6, kind: "metal" },
  { x: 40, z: -45, width: 30, height: 5.6, kind: "concrete" },
  { x: 78, z: -59, width: 30, height: 7.8, kind: "metal" },
];

/**
 * Los dos acabados.
 *
 * El de chapa es claro de verdad —en la foto el sol le da de lleno y sale
 * casi blanco—, pero no puede acercarse al color de la bruma o la distancia
 * lo borra. El de hormigón es el que aguanta el peso visual.
 *
 * **Los dos son cálidos, y eso no es un matiz de gusto.** Estuvieron en gris
 * azulado (`#b7bdc3` el de chapa) y el resultado medido era (204,208,211):
 * más azul que rojo, justo al revés que el crema de la página (245,243,239).
 * En la vista de perfil estas naves ocupan **media pantalla detrás del
 * camión**, así que esa dominante fría se leía como cielo encapotado y era
 * buena parte de lo que se señalaba como «parece un día lluvioso». Ahora el
 * rojo va por delante del azul en los dos, como en el papel.
 */
const SHED_SKIN = {
  concrete: { wall: "#9b9b8e", trim: "#848273", ribs: 0 },
  metal: { wall: "#cfccc5", trim: "#a6a299", ribs: 2.2 },
} as const;

const RAIL_HEIGHTS = [1.05, 1.95];

/**
 * Vigas de la cubierta. Son las que rayan el patio con bandas de luz y
 * sombra, que es lo que cuenta que la terminal está techada.
 *
 * El truco está en que **no se ven**: `colorWrite` apagado hace que no pinten
 * nada en pantalla, pero siguen entrando en el mapa de sombras, así que su
 * sombra sí cae sobre el suelo, los contenedores y el camión. No vale poner
 * `visible={false}`: eso las saca también del mapa de sombras y desaparece el
 * efecto entero.
 */
const CANOPY = {
  y: 13,
  from: -52,
  to: 14,
  // **Las vigas van más separadas desde que las sombras son físicas.**
  // Estaban cada 6 m, afinadas para cuando el suelo llevaba un velo de sombra
  // al 26 %. Con sombra de verdad, a ese paso el patio salía rayado como una
  // persiana en vez de con bandas de luz de nave.
  step: 11,
  width: 104,
  centerX: -10,
  // Más finas desde que la sombra es física: una viga de 2,6 m a 13 m de
  // altura con la luz rasante proyecta una banda mucho más ancha que ella.
  depth: 1.6,
};

const canopyZs = Array.from(
  { length: Math.floor((CANOPY.to - CANOPY.from) / CANOPY.step) + 1 },
  (_, index) => CANOPY.from + index * CANOPY.step,
);

function Canopy() {
  return (
    <group>
      {canopyZs.map((z) => (
        <mesh key={z} position={[CANOPY.centerX, CANOPY.y, z]} castShadow>
          <boxGeometry args={[CANOPY.width, 0.6, CANOPY.depth]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Shed({
  x,
  z,
  width,
  height,
  kind,
}: {
  x: number;
  z: number;
  width: number;
  height: number;
  kind: ShedKind;
}) {
  const skin = SHED_SKIN[kind];
  // El hormigón no lleva nervios: es pared lisa. Es la mitad de lo que
  // distingue un cuerpo del otro.
  const ribs = skin.ribs ? Math.floor(width / skin.ribs) : 0;

  // Todos los materiales van transparentes: la escena les escribe la opacidad
  // para fundirlas al bajar la cámara (ver `Sheds`).
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} receiveShadow>
        <boxGeometry args={[width, height, 6]} />
        <meshStandardMaterial color={skin.wall} roughness={0.95} transparent />
      </mesh>

      {/* Remate de arriba: el filo oscuro es lo que hace que se lea como nave
          y no como una pared suelta. */}
      <mesh position={[0, height + 0.12, 0.2]}>
        <boxGeometry args={[width + 0.8, 0.26, 6.4]} />
        <meshStandardMaterial color={skin.trim} roughness={0.8} transparent />
      </mesh>

      {/* Nervios de la chapa. Van juntos y finos, como en la foto: a dos
          metros de paso y a esta distancia se leen como textura, no como
          barrotes.

          **Instanciados, uno por nave.** Eran una malla cada uno —43 cajas
          entre las tres naves, contando paredes y remates— y los nervios son
          casi todas. Un `Instances` por nave y no uno para las tres, porque
          cada nave se funde por su cuenta (la escena le escribe la opacidad
          a sus materiales, y este es uno más). `frustumCulled={false}` como
          todo lo instanciado de esta escena. */}
      {ribs > 0 && (
        <Instances limit={ribs} frustumCulled={false}>
          <boxGeometry args={[0.12, height, 0.06]} />
          <meshStandardMaterial color={skin.trim} roughness={0.9} transparent />
          {Array.from({ length: ribs }, (_, index) => (
            <Instance
              key={index}
              position={[
                -width / 2 + (index + 0.5) * (width / ribs),
                height / 2,
                3.04,
              ]}
            />
          ))}
        </Instances>
      )}

      {/* La escalera enjaulada de la pared de chapa. Es un detalle tonto y es
          lo que más reconoce la nave: en la foto es la única vertical que
          rompe la chapa de arriba abajo. */}
      {kind === "metal" && (
        <mesh position={[-width * 0.18, height / 2, 3.08]}>
          <boxGeometry args={[0.5, height, 0.12]} />
          <meshStandardMaterial color={skin.trim} roughness={0.9} transparent />
        </mesh>
      )}
    </group>
  );
}
/**
 * Las naves del fondo.
 *
 * **Solo existen en la vista de perfil.** Desde la cámara en tres cuartos, lo
 * que está al fondo sube muchísimo en pantalla (es la misma razón por la que
 * la pila no pasa de dos filas), y una nave a 49 m se planta encima del
 * titular. Así que la escena las funde según la cámara baja a perfil. Se funde
 * y no se enciende de golpe porque a mitad de bajada el corte se vería.
 */
export function Sheds({ ref }: { ref?: RefObject<Group | null> }) {
  return (
    <group ref={ref} visible={false}>
      {SHEDS.map((shed) => (
        <Shed key={shed.x} {...shed} />
      ))}
    </group>
  );
}

function postsBetween(from: number, to: number) {
  const first = Math.ceil((from - FENCE.from) / FENCE.step);
  const count = Math.floor((to - FENCE.from) / FENCE.step) - first + 1;

  return Array.from(
    { length: Math.max(0, count) },
    (_, index) => FENCE.from + (first + index) * FENCE.step,
  );
}

/**
 * El vallado del patio.
 *
 * **Los postes van instanciados y eso no es microoptimización.** Cada uno era
 * un `<mesh>` con su propia geometría y su propio material: entre los dos
 * tramos salían más de cincuenta cajas idénticas, cincuenta geometrías en
 * memoria, cincuenta materiales y cincuenta llamadas de dibujo por fotograma
 * para pintar siempre el mismo palo. Con `<Instances>` son **una geometría, un
 * material y una llamada**, y la GPU coloca los cincuenta.
 *
 * `limit` es el techo del buffer que se reserva; va holgado a propósito para
 * que quepan los dos tramos aunque se alargue el patio.
 *
 * **`frustumCulled={false}` es obligatorio.** La esfera envolvente de un
 * `InstancedMesh` sale de la geometría base, que está en el origen, no de
 * dónde acaban las instancias; y esta valla va de `x` −62 a 78. Con el recorte
 * puesto desaparecería entera en cuanto la cámara dejara de ver el centro.
 */
function Fence({ from, to }: { from: number; to: number }) {
  const posts = postsBetween(from, to);

  return (
    <group position={[0, 0, FENCE.z]}>
      <Instances limit={80} range={posts.length} frustumCulled={false}>
        <boxGeometry args={[0.14, FENCE.height, 0.14]} />
        <meshStandardMaterial color='#aeb4bd' roughness={0.7} />
        {posts.map((x) => (
          <Instance key={x} position={[x, FENCE.height / 2, 0]} />
        ))}
      </Instances>

      {RAIL_HEIGHTS.map((y) => (
        <mesh key={y} position={[(from + to) / 2, y, 0]}>
          <boxGeometry args={[to - from, 0.09, 0.09]} />
          <meshStandardMaterial color='#c2c7ce' roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Suelo del patio y fondo lejano: el que se ve desde el primer fotograma.
 *
 * El vallado sale por `fenceRef` porque la escena le escribe un desplazamiento
 * lateral: con cámara ortográfica no hay parallax por perspectiva —todo se
 * mueve clavado a la cámara—, así que el fondo tiene que moverse un poco
 * **con** ella para que en pantalla avance menos que el primer término. Ver
 * `Scene.tsx`.
 */
export default function TerminalYard({
  fenceRef,
}: {
  fenceRef?: RefObject<Group | null>;
}) {
  return (
    <group>
      {/* El suelo son dos planos, y no es capricho.
          El pavimento ocupa todo el encuadre, así que su tono ES el fondo de
          la escena: tiene que quedarse pegado al crema de la página o cambia
          el color de medio hero. Con un material iluminado no se puede, por
          mucho que se aclare, porque la luz siempre lo baja un punto. Así que
          el pavimento va sin luz, con el color exacto, y encima se pone un
          plano invisible que solo pinta las sombras que recibe. */}
      {/* **Un solo plano, y antes eran dos.**

          El pavimento iba con material **sin luz** y un color exacto, y encima
          llevaba un segundo plano invisible que solo pintaba las sombras. Era
          un parche, y el parche existía por el mapeo de tonos: con ACES
          Filmic cualquier crema iluminado se iba a blanco, así que la única
          forma de que el suelo conservara su color era sacarlo de la luz.

          Quitado el mapeo de tonos y recalculadas las intensidades (ver
          `Scene.tsx`), un material normal ya se queda en su color. Así que el
          suelo recibe luz de verdad: las sombras caen sobre él como sobre
          cualquier otra cosa y la escena deja de tener dos reglas. */}
      <mesh
        position={[FLOOR.x, FLOOR_Y, FLOOR.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[FLOOR.width, FLOOR.depth]} />
        <meshStandardMaterial
          // Su color de verdad, sin compensaciones. Estuvo bajándose tres
          // veces (#f1ece4 → #d9d4cd → #c4c0ba) para contrarrestar una luz que
          // en realidad estaba 2,5 veces por debajo de lo que toca. Arreglada
          // la suma (ver `Scene.tsx`), el material ya sale con su color.
          color='#f1ece4'
          roughness={1}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      <group ref={fenceRef}>
        <Fence from={FENCE.from} to={SPLIT_X} />
      </group>
      <Canopy />
    </group>
  );
}

/** Fondo que pasa por detrás del camión, solo para la vista de perfil. */
export function TerminalYardNear() {
  return (
    <group>
      <Fence from={SPLIT_X} to={FENCE.to} />
    </group>
  );
}
