'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import { useScrollStore } from '@/lib/store';

type Props = {
  positions: number[];
  radius?: number;
  width?: number;
};

export default function Wheels({ positions, radius = 0.52, width = 2.3 }: Props) {
  const spinRefs = useRef<Array<Group | null>>([]);

  // Ruedan sin patinar: el giro sale de los metros que lleva hechos el camión.
  useFrame(() => {
    const angle = -useScrollStore.getState().travel / radius;
    for (const wheel of spinRefs.current) {
      if (wheel) wheel.rotation.z = angle;
    }
  });

  return (
    <>
      {positions.map((x, index) => (
        <group
          key={x}
          ref={(node) => {
            spinRefs.current[index] = node;
          }}
          position={[x, radius, 0]}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[radius, radius, width, 16]} />
            <meshStandardMaterial color="#1c2530" roughness={0.9} />
          </mesh>
          {/* Radio de contraste: sin él, una rueda lisa girando no se nota. */}
          <mesh position={[0, 0, width / 2 + 0.01]}>
            <planeGeometry args={[radius * 1.1, radius * 0.16]} />
            <meshBasicMaterial color="#8d949f" />
          </mesh>
        </group>
      ))}
    </>
  );
}
