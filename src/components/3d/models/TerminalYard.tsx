'use client';

import { Instance, Instances, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { RefObject } from 'react';
import { type Group, RepeatWrapping, SRGBColorSpace } from 'three';

/**
 * El patio de la terminal: suelo y vallado.
 *
 * Aquí no hay farolas a propósito: estorbaban en el arranque, con la máquina
 * cargando. (Vivieron en la carretera en 3D, que ya no existe.)
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

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} receiveShadow>
        <boxGeometry args={[width, height, 6]} />
        <meshStandardMaterial color={skin.wall} roughness={0.95} />
      </mesh>

      {/* Remate de arriba: el filo oscuro es lo que hace que se lea como nave
          y no como una pared suelta. */}
      <mesh position={[0, height + 0.12, 0.2]}>
        <boxGeometry args={[width + 0.8, 0.26, 6.4]} />
        <meshStandardMaterial color={skin.trim} roughness={0.8} />
      </mesh>

      {/* Nervios de la chapa. Van juntos y finos, como en la foto: a dos
          metros de paso y a esta distancia se leen como textura, no como
          barrotes.

          **Instanciados, uno por nave.** Eran una malla cada uno —43 cajas
          entre las tres naves, contando paredes y remates— y los nervios son
          casi todas. Un `Instances` por nave y no uno para las tres: cuando
          cada nave se fundía por su cuenta hacía falta, y se quedó así.
          `frustumCulled={false}` como todo lo instanciado de esta escena. */}
      {ribs > 0 && (
        <Instances limit={ribs} frustumCulled={false}>
          <boxGeometry args={[0.12, height, 0.06]} />
          <meshStandardMaterial color={skin.trim} roughness={0.9} />
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
          <meshStandardMaterial color={skin.trim} roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}
/**
 * Las naves del fondo.
 *
 * **Se ven desde el primer fotograma** (2026-11-18). Durante mucho tiempo
 * solo existieron en la vista de perfil, fundiéndose al bajar la cámara,
 * porque desde la cámara en tres cuartos lo del fondo sube mucho en pantalla y
 * se plantaba encima del titular. Desde que la cámara alta encuadra el patio
 * delante de la nave de Almazora quedan arriba, por encima del texto, y le
 * dan al patio un fondo que lo hace parecer un sitio.
 */
export function Sheds({ ref }: { ref?: RefObject<Group | null> }) {
  return (
    <group ref={ref}>
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
      <SueloAsfalto />

      <group ref={fenceRef}>
        <Fence from={FENCE.from} to={SPLIT_X} />
      </group>
      {/* Aquí iban las vigas de «luz de nave» (`Canopy`), que rayaban el
          patio con bandas de sombra. Al aire libre y con sol no hay techo que
          las dé: se quitaron al adoptar la cámara nueva (2026-11-18). */}
    </group>
  );
}

/**
 * **El suelo: asfalto fotográfico** (desde el 2026-11-18). El patio de Almazora es
 * asfalto gris claro con rayas blancas (`public/media/camion-02.jpg`), no un
 * plano crema. La textura es `clean_asphalt` de Poly Haven (CC0, Dimitrios
 * Savva), aclarada al gris del patio de la foto, desaturada y recomprimida
 * (`public/texturas/`). Se probó antes `asphalt_06`, que tiene manchas, y las
 * manchas repetidas cada pocos metros dibujaban un mosaico que se veía.
 *
 * Mide mucho más que el de antes, y es a propósito: con perspectiva se ve el
 * suelo hasta el horizonte, y si se acabara se vería el borde. Así llega hasta
 * donde la niebla ya lo ha fundido con el cielo.
 *
 * Cada repetición cubre 3 m (la textura está medida sobre 2,1 × 2,1 m: a la
 * distancia de esta cámara, a escala real el grano se perdía).
 *
 * **Y lleva variación a gran escala**, porque un asfalto de un solo gris se lee
 * como un plano de color con grano encima. Un ruido sobre la posición en el
 * mundo, a 10–30 m, lo aclara y oscurece por zonas, como el de verdad: hay
 * parches nuevos, rodadas y zonas más castigadas. Se mete en el sombreador del
 * propio material (`onBeforeCompile`), así que no cuesta ni una textura más.
 */
const SUELO_D1 = { lado: 1400, tesela: 3 };

const parchearSuelo = (shader: { vertexShader: string; fragmentShader: string }) => {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>
      varying vec2 vSuelo;`)
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vSuelo = (modelMatrix * vec4(position, 1.0)).xz;`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      `#include <common>
      varying vec2 vSuelo;
      float hashSuelo(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
      float ruidoSuelo(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hashSuelo(i), hashSuelo(i + vec2(1.0, 0.0)), u.x),
                   mix(hashSuelo(i + vec2(0.0, 1.0)), hashSuelo(i + vec2(1.0, 1.0)), u.x), u.y);
      }`,
    )
    .replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      float zonas = ruidoSuelo(vSuelo * 0.035) * 0.6 + ruidoSuelo(vSuelo * 0.12) * 0.4;
      diffuseColor.rgb *= 0.84 + 0.26 * zonas;`,
    );
};

function SueloAsfalto() {
  const maxAniso = useThree((state) => state.gl.capabilities.getMaxAnisotropy());
  const [color, normal] = useTexture(
    ['/texturas/asfalto-color.jpg', '/texturas/asfalto-normal.jpg'],
    (texturas) => {
      const lista = Array.isArray(texturas) ? texturas : [texturas];
      for (const t of lista) {
        t.wrapS = RepeatWrapping;
        t.wrapT = RepeatWrapping;
        t.repeat.set(SUELO_D1.lado / SUELO_D1.tesela, SUELO_D1.lado / SUELO_D1.tesela);
        t.anisotropy = Math.min(8, maxAniso);
      }
      // Solo la de color va en sRGB; la de relieve son datos, no color.
      lista[0].colorSpace = SRGBColorSpace;
    },
  );

  return (
    <mesh position={[FLOOR.x, FLOOR_Y, FLOOR.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[SUELO_D1.lado, SUELO_D1.lado]} />
      <meshStandardMaterial
        map={color}
        normalMap={normal}
        normalScale={[0.6, 0.6]}
        roughness={0.92}
        onBeforeCompile={parchearSuelo}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
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
