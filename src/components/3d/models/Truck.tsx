'use client';

import { useTexture } from '@react-three/drei';
import Wheels from './Wheels';

// Tráiler articulado: 16,5 m totales. El origen local está en la cola del
// remolque y el conjunto "mira" hacia +X.
export const TRUCK = {
  deckTop: 1.15,
  trailerLength: 13.6,
  totalLength: 16.5,
};

// TODO: modelo — placeholder. En F3 entra el GLB de tractora + semirremolque.
export default function Truck() {
  const logo = useTexture('/logo.png');

  return (
    <group>
      {/* chasis del semirremolque */}
      <mesh position={[6.8, 1.0, 0]} castShadow>
        <boxGeometry args={[TRUCK.trailerLength, 0.3, 2.5]} />
        <meshStandardMaterial color="#1c2530" roughness={0.8} />
      </mesh>
      <Wheels positions={[1.6, 2.9]} />

      {/* tractora */}
      <mesh position={[14.1, 0.95, 0]} castShadow>
        <boxGeometry args={[4.6, 0.32, 2.4]} />
        <meshStandardMaterial color="#1c2530" roughness={0.8} />
      </mesh>
      <mesh position={[14.95, 2.4, 0]} castShadow>
        <boxGeometry args={[2.7, 2.6, 2.5]} />
        <meshStandardMaterial color="#f2f4f7" roughness={0.45} />
      </mesh>
      {/* parabrisas */}
      <mesh position={[16.32, 2.85, 0]}>
        <boxGeometry args={[0.08, 1.35, 2.1]} />
        <meshStandardMaterial color="#0f1a2e" roughness={0.25} />
      </mesh>
      {/* franja azul de la cabina */}
      <mesh position={[14.95, 1.35, 1.26]}>
        <planeGeometry args={[2.7, 0.4]} />
        <meshBasicMaterial color="#34548a" />
      </mesh>
      {/* logo en la puerta */}
      <mesh position={[14.6, 2.3, 1.27]}>
        <planeGeometry args={[1.25, 0.85]} />
        <meshBasicMaterial map={logo} transparent />
      </mesh>
      <Wheels positions={[12.6, 15.7]} />
    </group>
  );
}
