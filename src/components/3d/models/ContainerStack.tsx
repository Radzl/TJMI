'use client';

import { CONTAINER_SIZE } from './CargoContainer';

const COLORS = ['#34548a', '#d03b40', '#27406b', '#8f98a6'];

type Props = {
  rows?: number;
};

// TODO: modelo — pila de contenedores de atrezo para dar profundidad a la terminal.
export default function ContainerStack({ rows = 3 }: Props) {
  const { length, height, width } = CONTAINER_SIZE;

  return (
    <group>
      {Array.from({ length: rows }, (_, row) => (
        <mesh key={row} position={[0, height / 2 + row * (height + 0.06), 0]}>
          <boxGeometry args={[length, height, width]} />
          <meshStandardMaterial
            color={COLORS[row % COLORS.length]}
            roughness={0.75}
          />
        </mesh>
      ))}
    </group>
  );
}
