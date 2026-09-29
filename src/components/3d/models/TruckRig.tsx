'use client';

import { useTexture } from '@react-three/drei';
import { useLayoutEffect, useRef } from 'react';
import { Mesh, type Group } from 'three';
import Wheels from './Wheels';

// Tractora + chasis portacontenedores, con las proporciones de la Volvo FH de
// TJMI. El origen está en la cola del chasis y el conjunto mira hacia +X.
export const TRUCK = {
  deckTop: 1.15,
  containerX: 3,
  length: 14.6,
};

const WHITE = '#f3f4f6';
const DARK = '#1c2530';
const GLASS = '#101720';

export default function TruckRig() {
  const root = useRef<Group>(null);
  const logo = useTexture('/logo.png');

  // El camión son treinta mallas sueltas: marcarlas de una pasada sale más
  // limpio que repetir castShadow y receiveShadow treinta veces.
  useLayoutEffect(() => {
    root.current?.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, []);

  return (
    <group ref={root}>
      {/* ---- chasis portacontenedores ---- */}
      <mesh position={[4.7, 1, 0]}>
        <boxGeometry args={[9.4, 0.3, 2.5]} />
        <meshStandardMaterial color={DARK} roughness={0.8} />
      </mesh>
      {/* largueros laterales, que dan sensación de estructura */}
      <mesh position={[4.7, 0.78, 1.18]}>
        <boxGeometry args={[9.4, 0.16, 0.14]} />
        <meshStandardMaterial color={DARK} roughness={0.85} />
      </mesh>
      <mesh position={[4.7, 0.78, -1.18]}>
        <boxGeometry args={[9.4, 0.16, 0.14]} />
        <meshStandardMaterial color={DARK} roughness={0.85} />
      </mesh>
      {/* paragolpes trasero */}
      <mesh position={[0.1, 0.62, 0]}>
        <boxGeometry args={[0.2, 0.5, 2.4]} />
        <meshStandardMaterial color={DARK} roughness={0.85} />
      </mesh>
      <Wheels positions={[1.2, 2.5, 3.8]} />

      {/* ---- tractora ---- */}
      <mesh position={[11.3, 0.92, 0]}>
        <boxGeometry args={[6.4, 0.28, 2.3]} />
        <meshStandardMaterial color={DARK} roughness={0.8} />
      </mesh>

      {/* cabina */}
      <mesh position={[12.9, 2.48, 0]}>
        <boxGeometry args={[3.2, 2.76, 2.5]} />
        <meshStandardMaterial color={WHITE} roughness={0.42} metalness={0.05} />
      </mesh>
      {/* techo aerodinámico y visera */}
      <mesh position={[12.95, 3.99, 0]}>
        <boxGeometry args={[3, 0.28, 2.46]} />
        <meshStandardMaterial color={WHITE} roughness={0.42} />
      </mesh>
      {/* chapa azul de la visera, donde va rotulado "IBAÑEZ" */}
      {/* TODO: rotulación real cuando tengamos el logotipo en vector */}
      <mesh position={[14.46, 3.98, 0]}>
        <planeGeometry args={[1.7, 0.26]} />
        <meshBasicMaterial color="#34548a" />
      </mesh>

      {/* parabrisas y ventanilla */}
      <mesh position={[14.52, 3.05, 0]}>
        <planeGeometry args={[1.5, 1.05]} />
        <meshBasicMaterial color={GLASS} />
      </mesh>
      <mesh position={[13.4, 2.95, 1.26]}>
        <planeGeometry args={[1.1, 0.85]} />
        <meshBasicMaterial color={GLASS} />
      </mesh>

      {/* frontal: calandra y paragolpes */}
      <mesh position={[14.52, 1.72, 0]}>
        <planeGeometry args={[1.9, 1.05]} />
        <meshBasicMaterial color={GLASS} />
      </mesh>
      <mesh position={[14.58, 1.02, 0]}>
        <boxGeometry args={[0.22, 0.62, 2.44]} />
        <meshStandardMaterial color={WHITE} roughness={0.45} />
      </mesh>

      {/* franjas rojo y azul de la puerta, como en vuestras cabinas */}
      <mesh position={[12.75, 2.02, 1.27]}>
        <planeGeometry args={[1.5, 0.1]} />
        <meshBasicMaterial color="#d03b40" />
      </mesh>
      <mesh position={[12.75, 1.88, 1.27]}>
        <planeGeometry args={[1.5, 0.1]} />
        <meshBasicMaterial color="#34548a" />
      </mesh>
      {/* logo en la puerta */}
      <mesh position={[12.3, 2.5, 1.27]}>
        <planeGeometry args={[0.82, 0.56]} />
        <meshBasicMaterial map={logo} transparent />
      </mesh>

      <Wheels positions={[10.4, 11.6, 13.85]} />
    </group>
  );
}
