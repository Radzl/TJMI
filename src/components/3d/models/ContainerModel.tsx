'use client';

import { useGLTF, useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import { Mesh, MeshStandardMaterial } from 'three';

const MODEL = '/models/container.glb';

// El GLB es un contenedor de 20 pies. Lo escalamos a medidas reales y lo
// centramos en el origen del grupo para poder posicionarlo con comodidad.
const RAW = { length: 3.16, height: 1.28, width: 1.34 };
const SCALE = 6.06 / RAW.length;

export const CONTAINER = {
  length: RAW.length * SCALE,
  height: RAW.height * SCALE,
  width: RAW.width * SCALE,
};

// Centro del modelo en su propio espacio, para compensarlo.
const RAW_CENTER: [number, number, number] = [-0.01, 0.06, 0.69];

type Props = {
  color?: string;
  withLivery?: boolean;
};

export default function ContainerModel({
  color = '#34548a',
  withLivery = false,
}: Props) {
  const { scene } = useGLTF(MODEL);
  const logo = useTexture('/logo.png');

  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((child) => {
      if (child instanceof Mesh) {
        const name = (child.material as MeshStandardMaterial)?.name ?? '';
        // mat15 es la chapa corrugada; el resto son herrajes y marcos, que
        // van un punto más oscuros pero dentro de la misma gama.
        //
        // **Y solo la chapa proyecta sombra.** El GLB trae cinco piezas y las
        // cinco proyectaban, o sea cinco dibujos en el mapa de sombras por
        // contenedor cuando hay diecisiete en el patio. Los herrajes van
        // pegados a la chapa: su sombra es la misma que la de la caja, así que
        // se pagaba cuatro veces por el mismo contorno.
        child.castShadow = name === 'mat15';
        child.receiveShadow = true;
        child.material = new MeshStandardMaterial({
          color: name === 'mat15' ? color : '#2a4470',
          roughness: 0.62,
          metalness: 0.08,
        });
      }
    });
    return root;
  }, [scene, color]);

  const half = CONTAINER.width / 2;

  return (
    <group>
      <group rotation={[0, Math.PI / 2, 0]}>
        <primitive
          object={model}
          scale={SCALE}
          position={[
            -RAW_CENTER[0] * SCALE,
            -RAW_CENTER[1] * SCALE,
            -RAW_CENTER[2] * SCALE,
          ]}
        />
      </group>

      {/* Logo en el techo: es lo que se ve cuando la cámara pasa a cenital. */}
      {withLivery && (
        <group
          position={[0, CONTAINER.height / 2 + 0.02, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          <mesh>
            <planeGeometry args={[2.06, 3.4]} />
            <meshBasicMaterial color="#d03b40" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.9, 3.22]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[1.5, 1.02]} />
            <meshBasicMaterial map={logo} transparent />
          </mesh>
        </group>
      )}

      {withLivery &&
        [1, -1].map((side) => (
          <group key={side} position={[0, 0.1, side * (half + 0.02)]}>
            {/* panel blanco con marco rojo, como las puertas de vuestras lonas */}
            <mesh>
              <planeGeometry args={[2.9, 2.06]} />
              <meshBasicMaterial color="#d03b40" />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[2.74, 1.9]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[1.62, 1.1]} />
              <meshBasicMaterial map={logo} transparent />
            </mesh>
          </group>
        ))}
    </group>
  );
}

useGLTF.preload(MODEL);
