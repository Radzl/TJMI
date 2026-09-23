'use client';

import type { RefObject } from 'react';
import type { Group } from 'three';
import Wheels from './Wheels';

// Reach stacker: ~7,6 m de chasis, cabina a 3,3 m, pluma telescópica de 12 m.
export const BOOM_PIVOT: [number, number, number] = [-2.4, 2.9, 0];
export const BOOM_LENGTH = 12;

type Props = {
  boomRef: RefObject<Group | null>;
};

// TODO: modelo — placeholder. En F3 entra el GLB (JakeBradley, CC-BY 4.0).
export default function ReachStacker({ boomRef }: Props) {
  return (
    <group>
      {/* chasis */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[7.6, 1.5, 2.8]} />
        <meshStandardMaterial color="#34548a" roughness={0.6} />
      </mesh>

      {/* contrapeso trasero */}
      <mesh position={[-3.5, 1.5, 0]} castShadow>
        <boxGeometry args={[1.6, 1.9, 2.9]} />
        <meshStandardMaterial color="#27406b" roughness={0.6} />
      </mesh>

      {/* cabina */}
      <mesh position={[1.9, 3.3, 0]} castShadow>
        <boxGeometry args={[2.1, 1.9, 2.2]} />
        <meshStandardMaterial color="#f2f4f7" roughness={0.5} />
      </mesh>
      <mesh position={[3.0, 3.4, 0]}>
        <boxGeometry args={[0.08, 1.3, 1.9]} />
        <meshStandardMaterial color="#0f1a2e" roughness={0.3} />
      </mesh>

      <Wheels positions={[-2.6, 2.4]} radius={0.95} width={2.6} />

      {/* pluma telescópica: el pivote está en la parte alta trasera */}
      <group ref={boomRef} position={BOOM_PIVOT}>
        <mesh position={[BOOM_LENGTH / 2, 0, 0]} castShadow>
          <boxGeometry args={[BOOM_LENGTH, 0.62, 0.7]} />
          <meshStandardMaterial color="#d03b40" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
