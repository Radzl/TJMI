'use client';

import { DoubleSide } from 'three';

type Props = {
  /** Esquina del carril: la grúa baja en Z hasta aquí y luego tira en X. */
  corner: { x: number; z: number };
  /** Dónde arranca el carril por detrás, en la pila. */
  fromZ: number;
  /** Hasta dónde llega por delante, pasado el camión. */
  toX: number;
};

/**
 * Marcas viales del patio.
 *
 * No es decoración: el carril va pintado exactamente por donde circula la
 * grúa, así que **se ve la ruta antes de que la recorra**. El movimiento deja
 * de ser "una máquina que se desplaza" y pasa a ser "una máquina que sigue su
 * calle", que es lo que pasa en un patio de verdad.
 *
 * Si se cambia la coreografía de la grúa en `Scene.tsx`, hay que cambiar aquí
 * la esquina: por eso las medidas llegan por props y no están escritas a mano.
 *
 * Todo va por debajo del plano que recoge las sombras, para que la sombra de
 * la grúa caiga también sobre la pintura y no flote por encima.
 */

const PAINT_Y = 0.016;
/** Medio ancho del carril. La grúa mide unos 4 m. */
const LANE = 3.2;
const LINE = 0.22;
/** Pintura desgastada sobre hormigón: un tono cálido, sin gritar. */
const PAINT = '#ded5bf';

function Stripe({
  x,
  z,
  width,
  depth,
  angle = 0,
}: {
  x: number;
  z: number;
  width: number;
  depth: number;
  angle?: number;
}) {
  return (
    <mesh
      position={[x, PAINT_Y, z]}
      rotation={[-Math.PI / 2, 0, angle]}
      renderOrder={1}
    >
      <planeGeometry args={[width, depth]} />
      {/* El pavimento lleva su propio `polygonOffset` para no pelearse con la
          franja oscura, y eso lo hacía ganar sobre la pintura aunque la
          pintura esté por encima. Aquí va un punto más adelantado todavía. */}
      <meshBasicMaterial
        color={PAINT}
        toneMapped={false}
        side={DoubleSide}
        polygonOffset
        polygonOffsetFactor={-3}
        polygonOffsetUnits={-3}
      />
    </mesh>
  );
}

/** Galón de dirección: dos rayas en ángulo, como una flecha abierta. */
function Chevron({
  x,
  z,
  along,
}: {
  x: number;
  z: number;
  /** 'z' mientras baja hacia el espectador, 'x' cuando ya va hacia el camión. */
  along: 'z' | 'x';
}) {
  const turn = along === 'z' ? 0 : Math.PI / 2;

  return (
    <group position={[x, 0, z]} rotation={[0, turn, 0]}>
      <Stripe x={-0.85} z={0} width={0.2} depth={2.4} angle={0.62} />
      <Stripe x={0.85} z={0} width={0.2} depth={2.4} angle={-0.62} />
    </group>
  );
}

export default function YardMarkings({ corner, fromZ, toX }: Props) {
  // Tramo que baja en Z, hasta pasada la esquina para que el giro cierre.
  const downLength = corner.z + LANE - fromZ;
  const downCenter = (fromZ + corner.z + LANE) / 2;

  // Tramo que va en X hacia el camión, desde antes de la esquina.
  const acrossLength = toX - (corner.x - LANE);
  const acrossCenter = (corner.x - LANE + toX) / 2;

  return (
    <group>
      {/* Bordes del carril, bajando hacia el espectador */}
      {[-LANE, LANE].map((offset) => (
        <Stripe
          key={`down-${offset}`}
          x={corner.x + offset}
          z={downCenter}
          width={LINE}
          depth={downLength}
        />
      ))}

      {/* Bordes del carril, ya girado hacia el camión.

          **Sin `angle`, y esto es importante.** Lo llevaba a `Math.PI / 2` y
          dibujaba las dos líneas **en la dirección contraria**: en vez de ir
          hacia el camión salían hacia el fondo, y en la vista en tres cuartos
          se veían como dos barras claras verticales de treinta y tantos metros
          plantadas en la franja baja derecha, sin venir de nada.

          El motivo es el orden de los ángulos de Euler. La raya ya viene
          tumbada con `rotation={[-Math.PI / 2, 0, angle]}`, y en el orden XYZ
          de three.js **el giro en Z se aplica primero, en los ejes locales de
          la raya**: gira el plano sobre sí mismo antes de tumbarlo, así que el
          largo acaba apuntando a Z. Sin ese giro, `width` va en X y `depth` en
          Z, que es justo lo que hace falta aquí. Las que bajan hacia el
          espectador no lo llevan y por eso siempre estuvieron bien. */}
      {[-LANE, LANE].map((offset) => (
        <Stripe
          key={`across-${offset}`}
          x={acrossCenter}
          z={corner.z + offset}
          width={acrossLength}
          depth={LINE}
        />
      ))}

      {/* Galones: primero mirando al espectador, después hacia el camión. */}
      {[-20, -13].map((z) => (
        <Chevron key={`cz-${z}`} x={corner.x} z={z} along="z" />
      ))}
      {[-14, -6, 2].map((x) => (
        <Chevron key={`cx-${x}`} x={x} z={corner.z} along="x" />
      ))}

      {/* Zona de carga rayada, donde espera el camión. */}
      {[0, 1, 2, 3, 4].map((index) => (
        <Stripe
          key={`hatch-${index}`}
          x={6.5 + index * 2.1}
          z={corner.z + 7.5}
          width={0.24}
          depth={5.4}
          angle={0.7}
        />
      ))}
    </group>
  );
}
