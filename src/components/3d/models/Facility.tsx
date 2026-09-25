'use client';

type Props = {
  accent?: string;
};

/**
 * Nave logística vista desde arriba.
 *
 * El origen del componente es la **cara de los muelles**, y los muelles miran
 * hacia +X: la nave queda detrás (−X) y el patio de maniobra delante (+X).
 * Así basta con colocar este origen en el extremo del trazado para que la
 * carretera entre literalmente en el patio y el camión aparque en un muelle.
 */
export default function Facility({ accent = '#34548a' }: Props) {
  return (
    <group>
      {/* patio de maniobra */}
      <mesh position={[12, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 28]} />
        <meshBasicMaterial color="#e3e0da" />
      </mesh>

      {/* nave */}
      <mesh position={[-8.5, 3, 0]}>
        <boxGeometry args={[15, 6, 22]} />
        <meshStandardMaterial color="#edeae5" roughness={0.75} />
      </mesh>
      {/* cumbrera: desde arriba es lo que hace que se lea como tejado */}
      <mesh position={[-8.5, 6.1, 0]}>
        <boxGeometry args={[15.2, 0.2, 1.4]} />
        <meshStandardMaterial color="#d6d2cb" roughness={0.8} />
      </mesh>
      {/* franja de marca sobre la cara de los muelles */}
      <mesh position={[-1.1, 6.05, 0]}>
        <boxGeometry args={[0.9, 0.18, 22]} />
        <meshStandardMaterial color={accent} roughness={0.6} />
      </mesh>

      {/* muelles de carga */}
      {[-7.5, -2.5, 2.5, 7.5].map((z) => (
        <group key={z}>
          <mesh position={[-0.7, 1.6, z]}>
            <boxGeometry args={[0.7, 3.2, 3.4]} />
            <meshStandardMaterial color="#1c2530" roughness={0.9} />
          </mesh>
          {/* marca pintada en el suelo delante de cada muelle */}
          <mesh position={[4, 0.04, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7, 0.2]} />
            <meshBasicMaterial color="#c9c4bb" />
          </mesh>
        </group>
      ))}

      {/* contenedores en el patio, apartados de la zona de maniobra */}
      {[
        { x: 20, z: 11, color: '#34548a' },
        { x: 20, z: -11, color: '#c4623c' },
      ].map((box) => (
        <mesh key={box.z} position={[box.x, 1.3, box.z]}>
          <boxGeometry args={[6.1, 2.6, 2.5]} />
          <meshStandardMaterial color={box.color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
