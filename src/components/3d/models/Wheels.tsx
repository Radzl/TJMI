'use client';

type Props = {
  positions: number[];
  radius?: number;
  width?: number;
};

export default function Wheels({ positions, radius = 0.52, width = 2.3 }: Props) {
  return (
    <>
      {positions.map((x) => (
        <mesh
          key={x}
          position={[x, radius, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[radius, radius, width, 16]} />
          <meshStandardMaterial color="#1c2530" roughness={0.9} />
        </mesh>
      ))}
    </>
  );
}
