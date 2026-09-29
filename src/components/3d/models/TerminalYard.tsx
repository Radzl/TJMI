'use client';

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
const FENCE = { z: -43, from: -62, to: 42, step: 7, height: 2.2 };

const RAIL_HEIGHTS = [1.05, 1.95];

function postsBetween(from: number, to: number) {
  const first = Math.ceil((from - FENCE.from) / FENCE.step);
  const count = Math.floor((to - FENCE.from) / FENCE.step) - first + 1;

  return Array.from(
    { length: Math.max(0, count) },
    (_, index) => FENCE.from + (first + index) * FENCE.step,
  );
}

function Fence({ from, to }: { from: number; to: number }) {
  return (
    <group position={[0, 0, FENCE.z]}>
      {postsBetween(from, to).map((x) => (
        <mesh key={x} position={[x, FENCE.height / 2, 0]}>
          <boxGeometry args={[0.14, FENCE.height, 0.14]} />
          <meshStandardMaterial color="#aeb4bd" roughness={0.7} />
        </mesh>
      ))}

      {RAIL_HEIGHTS.map((y) => (
        <mesh key={y} position={[(from + to) / 2, y, 0]}>
          <boxGeometry args={[to - from, 0.09, 0.09]} />
          <meshStandardMaterial color="#c2c7ce" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Suelo del patio y fondo lejano: el que se ve desde el primer fotograma. */
export default function TerminalYard() {
  return (
    <group>
      {/* El suelo son dos planos, y no es capricho.
          El pavimento ocupa todo el encuadre, así que su tono ES el fondo de
          la escena: tiene que quedarse pegado al crema de la página o cambia
          el color de medio hero. Con un material iluminado no se puede, por
          mucho que se aclare, porque la luz siempre lo baja un punto. Así que
          el pavimento va sin luz, con el color exacto, y encima se pone un
          plano invisible que solo pinta las sombras que recibe. */}
      <mesh
        position={[FLOOR.x, FLOOR_Y, FLOOR.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[FLOOR.width, FLOOR.depth]} />
        <meshBasicMaterial
          color="#ece7df"
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      <mesh
        position={[FLOOR.x, FLOOR_Y + 0.012, FLOOR.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[FLOOR.width, FLOOR.depth]} />
        <shadowMaterial opacity={0.26} />
      </mesh>

      <Fence from={FENCE.from} to={SPLIT_X} />
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
