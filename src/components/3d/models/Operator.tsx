'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

/**
 * El operario de la máquina que carga el camión.
 *
 * No es un adorno: una máquina moviéndose sola se lee como un juguete, y lo
 * que cuenta esta intro es gente trabajando. Además da escala, que es lo que
 * más le faltaba al puesto de conducción.
 *
 * Va con primitivas, como el resto de la maqueta, y con el chaleco en el mismo
 * naranja del rotativo: a este tamaño el chaleco **es** el personaje, lo único
 * que se distingue de verdad. Mira hacia +X, que es adonde trabaja la máquina,
 * y como cuelga de su grupo gira con ella sin hacer nada más.
 *
 * **Se llamaba `CraneOperator` y conducía la reach stacker.** Al cambiar la
 * máquina por una carretilla no hubo nada que tocar de la figura: es genérica
 * —alguien sentado, con chaleco y casco— y lo único específico era dónde se
 * sienta, que lo pone quien la usa. De ahí el nombre neutro.
 *
 * El origen va en el **suelo del puesto**, y `SEAT` es la altura del asiento
 * sobre él: quien coloque la figura tiene que poner el origen a
 * `altura del asiento − SEAT`.
 */

const VEST = '#ff9d2e';
const DARK = '#27313f';
const SKIN = '#c9936a';
const HELMET = '#f2f4f7';

/** Altura del asiento sobre el suelo de la cabina. */
const SEAT = 0.42;

export default function Operator() {
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Respiración mínima. Si se nota, está mal: lo que tiene que notarse es
    // que ahí dentro hay alguien, no que se mueve.
    if (bodyRef.current) bodyRef.current.rotation.z = Math.sin(t * 0.7) * 0.02;
    if (headRef.current) headRef.current.rotation.z = Math.sin(t * 0.5) * 0.06;
  });

  return (
    <group>
      {/* Respaldo del asiento: sin él el operario flota en el hueco. */}
      <mesh position={[-0.26, SEAT + 0.3, 0]} castShadow>
        <boxGeometry args={[0.1, 0.62, 0.48]} />
        <meshStandardMaterial color={DARK} roughness={0.9} />
      </mesh>

      <group ref={bodyRef}>
        {/* Piernas, hacia delante */}
        <mesh position={[0.14, SEAT - 0.06, 0]} castShadow>
          <boxGeometry args={[0.46, 0.17, 0.36]} />
          <meshStandardMaterial color={DARK} roughness={0.9} />
        </mesh>

        {/* Tronco con el chaleco */}
        <mesh position={[-0.05, SEAT + 0.3, 0]} castShadow>
          <boxGeometry args={[0.26, 0.52, 0.42]} />
          <meshStandardMaterial color={VEST} roughness={0.75} />
        </mesh>

        {/* Banda reflectante: dos filetes claros que parten el chaleco y lo
            hacen legible aunque solo ocupe unos píxeles. */}
        <mesh position={[-0.05, SEAT + 0.36, 0]}>
          <boxGeometry args={[0.27, 0.05, 0.43]} />
          <meshStandardMaterial color="#f7f3ea" roughness={0.6} />
        </mesh>

        {/* Brazos, caídos hacia los mandos */}
        {[0.24, -0.24].map((z) => (
          <mesh key={z} position={[0.12, SEAT + 0.3, z]} castShadow>
            <boxGeometry args={[0.3, 0.12, 0.11]} />
            <meshStandardMaterial color={VEST} roughness={0.75} />
          </mesh>
        ))}

        <group ref={headRef} position={[-0.03, SEAT + 0.66, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.85} />
          </mesh>
          {/* Casco: achatado por arriba, que es lo que lo distingue de una
              cabeza a secas cuando mide seis píxeles. */}
          <mesh position={[0, 0.04, 0]} scale={[1, 0.72, 1]} castShadow>
            <sphereGeometry args={[0.135, 12, 10]} />
            <meshStandardMaterial color={HELMET} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
