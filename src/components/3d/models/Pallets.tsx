'use client';

import { Instance, Instances } from '@react-three/drei';
import { useMemo } from 'react';

/**
 * Palés de azulejos esperando en el patio.
 *
 * Es el elemento más de TJMI de toda la escena: no es un contenedor genérico,
 * es la carga real de la casa. Además son piezas pequeñas, así que dan escala
 * a los contenedores y a la grúa, que sin nada al lado podrían ser de
 * cualquier tamaño.
 *
 * Van a la izquierda del carril de la grúa y con `x` por debajo de -19, que
 * es la línea a partir de la cual algo asomaría por la izquierda en la vista
 * de perfil.
 *
 * ## Van instanciados, y era el pozo más grande de la escena
 *
 * Cada palé se montaba con **cuatro mallas sueltas**, cada una con su propia
 * geometría y su propio material: la madera, la carga, el fleje y un marcador
 * invisible. Entre el lote de la grúa (12), lo que ya lleva el camión (10) y
 * las pilas del patio (14) hay **36 palés**, o sea 144 mallas, 144 geometrías
 * y 144 materiales para pintar siempre las mismas tres cajas. Con la pasada de
 * sombras encima, unas **216 llamadas de dibujo por fotograma**.
 *
 * Ahora cada grupo de palés son **tres llamadas**: madera, azulejo y fleje.
 *
 * El marcador invisible se ha ido con ellas. Estaba para nada: nadie mide este
 * grupo con `Box3` —`PALLET_LOAD` sale de constantes, no de medir— así que era
 * una geometría por palé que no pintaba ni servía.
 */

/** Medidas de un palé europeo cargado de azulejo, en metros. */
export const PALLET = { width: 1.2, depth: 0.85, base: 0.14, load: 0.72 };

/** Lo que mide un palé con su carga, de suelo a suelo del siguiente. */
const UNIT = PALLET.base + PALLET.load;

/** Rejilla del lote que mueve la grúa, en palés. */
const LOAD_GRID = { across: 3, deep: 2, high: 2 };

/**
 * Medidas del lote completo. Las lee `Scene.tsx` al cargar el módulo para
 * cuadrar la coreografía, así que son constantes y no se miden en caliente.
 */
export const PALLET_LOAD = {
  width: LOAD_GRID.across * PALLET.width,
  depth: LOAD_GRID.deep * PALLET.depth,
  height: LOAD_GRID.high * UNIT,
};

const WOOD = "#b08d63";
const TILES = "#d5cec1";
const STRAP = "#34548a";

/**
 * Cada pila: dónde está y cuántos palés lleva.
 *
 * Se exporta porque `Scene.tsx` necesita las mismas coordenadas para poner una
 * sombra de contacto debajo de cada una. Si se duplicaran, bastaría mover una
 * pila para que su sombra se quedara donde estaba.
 */
export const PALLET_STACKS = [
  { x: -31.5, z: -9, height: 2 },
  { x: -31.5, z: -11.2, height: 3 },
  { x: -33.4, z: -10, height: 2 },
  { x: -31.2, z: -16.5, height: 3 },
  { x: -33.1, z: -17.6, height: 2 },
  { x: -30.8, z: -21.5, height: 2 },
];

/** La esquina inferior de un palé, en coordenadas del grupo que lo contiene. */
type Origen = [number, number, number];

/**
 * Pinta una lista de palés con tres llamadas de dibujo.
 *
 * Cada pieza va en su propio `<Instances>` porque cada una tiene su material
 * —madera, azulejo y fleje azul—, y un `InstancedMesh` solo admite uno. Tres
 * es el mínimo posible sin renunciar a los tres colores, y el fleje es justo
 * lo que hace que se lea como carga preparada y no como una caja suelta.
 *
 * **El fleje no proyecta sombra.** Es una chapa de cinco centímetros pegada a
 * la carga: su sombra es la de la carga, así que pagarla sería pagar dos veces
 * el mismo contorno.
 *
 * ## `frustumCulled={false}` es obligatorio, y sin él desaparecen
 *
 * Un `InstancedMesh` calcula su esfera envolvente a partir de **la geometría
 * base**, que está en el origen del grupo, no a partir de dónde acaban las
 * instancias. Las pilas del patio están a `x ≈ -31`: con el recorte activado,
 * en cuanto la cámara deja de ver el origen, three da por fuera de plano el
 * grupo entero y **los catorce palés se esfuman de golpe**.
 *
 * No es teoría: pasó al instanciarlos. El arnés de regresión lo cazó en la
 * toma de la grúa en maniobra —los palés del primer término estaban en la
 * referencia y ya no en la captura— y por eso existe esta nota. Si añades otro
 * `<Instances>` cuyas piezas queden lejos de su origen, dale lo mismo.
 */
function PalletPile({ palets }: { palets: Origen[] }) {
  const n = palets.length;
  if (n === 0) return null;

  return (
    <>
      {/* Palé de madera */}
      <Instances
        limit={n}
        range={n}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[PALLET.width, PALLET.base, PALLET.depth]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
        {palets.map(([x, y, z], i) => (
          <Instance key={i} position={[x, y + PALLET.base / 2, z]} />
        ))}
      </Instances>

      {/* Carga de azulejo, un pelo más estrecha que el palé */}
      <Instances
        limit={n}
        range={n}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry
          args={[PALLET.width - 0.08, PALLET.load, PALLET.depth - 0.06]}
        />
        <meshStandardMaterial color={TILES} roughness={0.75} />
        {palets.map(([x, y, z], i) => (
          <Instance
            key={i}
            position={[x, y + PALLET.base + PALLET.load / 2, z]}
          />
        ))}
      </Instances>

      {/* Fleje azul: el guiño de marca. */}
      <Instances limit={n} range={n} frustumCulled={false}>
        <boxGeometry args={[PALLET.width - 0.04, 0.05, PALLET.depth - 0.02]} />
        <meshStandardMaterial color={STRAP} roughness={0.5} />
        {palets.map(([x, y, z], i) => (
          <Instance
            key={i}
            position={[x, y + PALLET.base + PALLET.load * 0.62, z]}
          />
        ))}
      </Instances>
    </>
  );
}

/**
 * El lote que mueve la grúa: palés flejados formando un bloque con presencia.
 * Un palé suelto al lado de un camión de 17 m sería una mota; en bloque se lee
 * y además da la escala de la máquina.
 *
 * El origen va en el centro del bloque, porque la coreografía lo mueve
 * colgado del spreader y le interesa el centro, no una esquina.
 */
export function PalletLoad() {
  const palets = useMemo<Origen[]>(() => {
    const out: Origen[] = [];
    for (let col = 0; col < LOAD_GRID.across; col++) {
      for (let row = 0; row < LOAD_GRID.deep; row++) {
        for (let level = 0; level < LOAD_GRID.high; level++) {
          out.push([
            (col - (LOAD_GRID.across - 1) / 2) * PALLET.width,
            -PALLET_LOAD.height / 2 + level * UNIT,
            (row - (LOAD_GRID.deep - 1) / 2) * PALLET.depth,
          ]);
        }
      }
    }
    return out;
  }, []);

  return <PalletPile palets={palets} />;
}

/**
 * Lo que el semirremolque ya lleva cargado, en fila hacia la cabeza tractora.
 *
 * El GLB traía su propia carga, pero dentro de la caja queda a oscuras y no se
 * lee: se quitó entera (ver `TruckModel.tsx`). Esta es la de la casa, el mismo
 * palé de azulejo que mueve la grúa, así que al abrirse la lona lo que se ve
 * dentro y lo que entra son la misma mercancía.
 *
 * Son pocas torres a propósito: la lona solo descubre la mitad trasera, así
 * que lo que va más allá no se ve nunca y sería peso muerto en pantalla.
 *
 * El origen va en el centro de la primera torre y la fila crece hacia +X.
 */
const TRAILER_STACKS = [2, 3, 3, 2];

export function TrailerLoad() {
  const palets = useMemo<Origen[]>(
    () =>
      TRAILER_STACKS.flatMap((high, slot) =>
        Array.from({ length: high }, (_, level): Origen => [
          slot * (PALLET.width + 0.06),
          level * UNIT,
          0,
        ]),
      ),
    [],
  );

  return <PalletPile palets={palets} />;
}

export default function Pallets() {
  const palets = useMemo<Origen[]>(
    () =>
      PALLET_STACKS.flatMap((stack) =>
        Array.from({ length: stack.height }, (_, level): Origen => [
          stack.x,
          level * UNIT,
          stack.z,
        ]),
      ),
    [],
  );

  return <PalletPile palets={palets} />;
}
