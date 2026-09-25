'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  DoubleSide,
  Vector3,
  type Mesh,
} from 'three';
import { roadProgress } from '@/lib/route';
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
 * Genera una cinta plana siguiendo la curva entre dos puntos del recorrido.
 * Se usa tanto para el asfalto como para cada raya de la línea discontinua.
 */
function ribbon(
  from: number,
  to: number,
  width: number,
  segments: number,
  vertices: number[],
  indices: number[],
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

    vertices.push(point.x + (nx / length) * half, 0, point.z + (nz / length) * half);
    vertices.push(point.x - (nx / length) * half, 0, point.z - (nz / length) * half);
  }

  for (let i = 0; i < segments; i++) {
    const a = offset + i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
}

function build(ranges: Array<[number, number]>, width: number, segments: number) {
  const vertices: number[] = [];
  const indices: number[] = [];
  ranges.forEach(([from, to]) => ribbon(from, to, width, segments, vertices, indices));

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const DASHES = 34;
const ASPHALT_SEGMENTS = 240;
/** Índices por tramo: dos triángulos. */
const PER_SEGMENT = 6;
/** Cada raya se genera con dos tramos. */
const PER_DASH = PER_SEGMENT * 2;

export default function Road() {
  const asphaltRef = useRef<Mesh>(null);
  const markingRef = useRef<Mesh>(null);

  const asphalt = useMemo(
    () => build([[0, 1]], ROAD_WIDTH, ASPHALT_SEGMENTS),
    [],
  );

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
  useFrame(() => {
    const route = useScrollStore.getState().scenes[4];
    const reveal = clamp(roadProgress(route) + 0.07);

    asphaltRef.current?.geometry.setDrawRange(
      0,
      Math.ceil(ASPHALT_SEGMENTS * reveal) * PER_SEGMENT,
    );
    // Las rayas solo existen en el tramo de carretera, así que su avance se
    // mide sobre ese tramo y no sobre la curva entera.
    const marked = clamp(
      (reveal - MARKED.from) / (MARKED.to - MARKED.from),
    );
    markingRef.current?.geometry.setDrawRange(
      0,
      Math.ceil(DASHES * marked) * PER_DASH,
    );
  });

  return (
    <group>
      {/* La cinta se genera plana en el suelo: con DoubleSide nos da igual
          hacia dónde queden las caras al curvarse el trazado. */}
      <mesh ref={asphaltRef} geometry={asphalt} position={[0, 0.04, 0]}>
        <meshBasicMaterial color="#11151c" side={DoubleSide} />
      </mesh>
      <mesh ref={markingRef} geometry={marking} position={[0, 0.06, 0]}>
        <meshBasicMaterial color="#f6f4f1" side={DoubleSide} />
      </mesh>
    </group>
  );
}
