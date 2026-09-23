'use client';

import { useTexture } from '@react-three/drei';

// Contenedor de 40 pies: 12,19 × 2,59 × 2,44 m
export const CONTAINER_SIZE = { length: 12.19, height: 2.59, width: 2.44 };

type Props = {
  withLogo?: boolean;
  color?: string;
};

// TODO: modelo — placeholder. En F3 entra el GLB de contenedor (CC0, BlendSwap).
export default function CargoContainer({
  withLogo = false,
  color = '#34548a',
}: Props) {
  const logo = useTexture('/logo.png');
  const { length, height, width } = CONTAINER_SIZE;

  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[length, height, width]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* franja roja de marca */}
      <mesh position={[0, -height / 2 + 0.22, width / 2 + 0.01]}>
        <planeGeometry args={[length, 0.26]} />
        <meshBasicMaterial color="#d03b40" />
      </mesh>

      {withLogo && (
        <mesh position={[-length / 4, 0.25, width / 2 + 0.02]}>
          <planeGeometry args={[3.6, 2.45]} />
          <meshBasicMaterial map={logo} transparent />
        </mesh>
      )}
    </group>
  );
}
