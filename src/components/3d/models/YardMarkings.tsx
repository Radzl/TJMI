'use client';

import { useEffect, useMemo } from 'react';
import { DoubleSide, Matrix4 } from 'three';
import { fundirPlanos, matrizDe, type Plano } from './planos';

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
 *
 * **Son diecinueve rayas y se dibujan en una llamada.** Iban cada una con su
 * malla y su material, idénticos los diecinueve, para algo que no se mueve.
 * Ahora se describen como datos (`raya`) y se funden en una sola geometría
 * (`fundirPlanos`). La imagen es la misma.
 */

const PAINT_Y = 0.016;
/** Medio ancho del carril. La grúa mide unos 4 m. */
const LANE = 3.2;
const LINE = 0.22;
/** Pintura desgastada sobre hormigón: un tono cálido, sin gritar. */
const PAINT = '#ded5bf';

/**
 * Una raya, tumbada sobre el suelo.
 *
 * **Ojo con el orden de los ángulos de Euler**, que ya costó un fallo. La raya
 * va tumbada con el giro `[-π/2, 0, angle]`, y en el orden XYZ de three **el
 * giro en Z se aplica primero, en los ejes locales de la raya**: la gira sobre
 * sí misma antes de tumbarla. Sin giro, `width` va en X y `depth` en Z. Los
 * dos bordes del carril que van hacia el camión llevaban `angle = π/2` y
 * salían en la dirección contraria: en tres cuartos se veían como dos barras
 * claras verticales de treinta y tantos metros plantadas en la franja baja
 * derecha, sin venir de nada.
 */
function raya(
  x: number,
  z: number,
  width: number,
  depth: number,
  angle = 0,
  grupo?: Matrix4,
): Plano {
  const local = matrizDe([x, PAINT_Y, z], [-Math.PI / 2, 0, angle]);
  return {
    ancho: width,
    fondo: depth,
    matriz: grupo ? grupo.clone().multiply(local) : local,
  };
}

/** Un galón: dos rayas en V, girado según hacia dónde apunta el carril. */
function galon(x: number, z: number, along: 'z' | 'x'): Plano[] {
  const grupo = matrizDe([x, 0, z], [0, along === 'z' ? 0 : Math.PI / 2, 0]);
  return [
    raya(-0.85, 0, 0.2, 2.4, 0.62, grupo),
    raya(0.85, 0, 0.2, 2.4, -0.62, grupo),
  ];
}

export default function YardMarkings({ corner, fromZ, toX }: Props) {
  const geometria = useMemo(() => {
    const downLength = corner.z + LANE - fromZ;
    const downCenter = (fromZ + corner.z + LANE) / 2;
    const acrossLength = toX - (corner.x - LANE);
    const acrossCenter = (corner.x - LANE + toX) / 2;

    return fundirPlanos([
      // Bordes del carril, bajando hacia el espectador.
      ...[-LANE, LANE].map((o) => raya(corner.x + o, downCenter, LINE, downLength)),
      // Bordes del carril, ya girado hacia el camión. Sin giro: ver `raya`.
      ...[-LANE, LANE].map((o) => raya(acrossCenter, corner.z + o, acrossLength, LINE)),
      // Galones: primero mirando al espectador, después hacia el camión.
      ...[-20, -13].flatMap((z) => galon(corner.x, z, 'z')),
      ...[-14, -6, 2].flatMap((x) => galon(x, corner.z, 'x')),
      // Zona de carga rayada, donde espera el camión.
      ...[0, 1, 2, 3, 4].map((i) => raya(6.5 + i * 2.1, corner.z + 7.5, 0.24, 5.4, 0.7)),
    ]);
  }, [corner.x, corner.z, fromZ, toX]);

  useEffect(() => () => geometria.dispose(), [geometria]);

  return (
    <mesh geometry={geometria} renderOrder={1}>
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
