'use client';

import { ContactShadows, OrthographicCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group, OrthographicCamera as OrthoCamera } from 'three';
import CargoContainer, { CONTAINER_SIZE } from './models/CargoContainer';
import ContainerStack from './models/ContainerStack';
import ReachStacker, { BOOM_LENGTH, BOOM_PIVOT } from './models/ReachStacker';
import Truck, { TRUCK } from './models/Truck';
import { useScrollStore } from '@/lib/store';
import { clamp, lerp, range, smoothstep } from '@/lib/utils';

// Distribución de la maqueta, en metros. El camión "mira" hacia +X.
const TRUCK_X = 0;
const STACKER_X = -1;
const STACKER_Z = -4.5;
const STACK_X = -14;

// Dónde acaba el contenedor sobre el remolque.
const DROP = {
  x: TRUCK_X + 6.6,
  y: TRUCK.deckTop + CONTAINER_SIZE.height / 2,
};
// Punto de partida: la grúa ya lo tiene cogido en alto (idle de la escena 1).
const PICK = { x: STACKER_X - 5, y: 7.6 };

const SPREADER_LIFT = CONTAINER_SIZE.height / 2 + 0.35;

export default function Scene() {
  const cameraRef = useRef<OrthoCamera>(null);
  const boomRef = useRef<Group>(null);
  const spreaderRef = useRef<Group>(null);
  const cargoRef = useRef<Group>(null);
  const stackerRef = useRef<Group>(null);
  const truckRef = useRef<Group>(null);
  const bandRef = useRef<Group>(null);
  const roadRef = useRef<Group>(null);

  const size = useThree((state) => state.size);
  const isNarrow = size.width < 768;
  const worldWidth = isNarrow ? 24 : 38;
  const focusX = isNarrow ? 4 : 2;

  // Encuadre vertical: decidimos a qué altura de la pantalla cae la línea de
  // suelo (y = 0) y de ahí sacamos el objetivo de la cámara. En el hero va muy
  // abajo para no pisar el texto; cuando sube la banda azul noche, el suelo
  // sube con ella y la banda ocupa la parte baja de la pantalla.
  const visibleHeight = worldWidth * (size.height / size.width);
  const groundAt = (fraction: number) => visibleHeight * (0.5 - fraction);
  const heroFocusY = groundAt(isNarrow ? 0.08 : 0.16);
  const bandFocusY = groundAt(0.62);
  const liftedFocusY = groundAt(1.15);

  useFrame(() => {
    // Cada escena del guion va atada a su sección HTML (ver ScrollChoreography).
    const [hero, , inRoute, services, route] = useScrollStore.getState().scenes;

    // --- Escena 1: la grúa deposita el contenedor sobre el remolque ------
    const travel = smoothstep(range(hero, 0.05, 0.45));
    const cargoX = lerp(PICK.x, DROP.x, travel);
    const cargoY = lerp(PICK.y, DROP.y, smoothstep(range(hero, 0.12, 0.5)));

    cargoRef.current?.position.set(cargoX, cargoY, 0);

    // --- Escena 2: suelta la carga y la grúa sale de plano ---------------
    const released = range(hero, 0.5, 0.62);
    const spreaderY = cargoY + SPREADER_LIFT + released * 3.4;
    if (spreaderRef.current) {
      spreaderRef.current.position.set(cargoX, spreaderY, 0);
      spreaderRef.current.visible = released < 1;
    }

    const exit = smoothstep(range(hero, 0.6, 0.95));
    const stackerX = STACKER_X - exit * 36;
    if (stackerRef.current) {
      stackerRef.current.position.x = stackerX;
    }

    // La pluma siempre apunta al spreader (cinemática inversa simplificada).
    if (boomRef.current) {
      const dx = cargoX - (stackerX + BOOM_PIVOT[0]);
      const dy = spreaderY - BOOM_PIVOT[1];
      boomRef.current.rotation.z = Math.atan2(dy, dx);
      boomRef.current.scale.x = clamp(Math.hypot(dx, dy) / BOOM_LENGTH, 0.3, 1);
    }

    // --- Escena 3: sube la banda azul noche y el camión arranca ----------
    const bandUp = smoothstep(range(inRoute, 0.02, 0.28));
    // Una vez arriba, el suelo sigue subiendo con el texto: el camión sube con
    // él y la banda acaba ocupando toda la pantalla.
    const bandLift = smoothstep(range(inRoute, 0.3, 0.8));
    const bandDown = smoothstep(range(services, 0.02, 0.3));
    const bandShown = bandUp * (1 - bandDown);

    if (bandRef.current) {
      // Oculta, la banda queda muy por debajo del encuadre más alto posible.
      bandRef.current.position.y = lerp(-500, -300, bandShown);
    }

    // --- Escenas 3 a 5: el camión recorre la historia --------------------
    // TODO: F5 — aquí seguirá el trazado real Castellón → Madrid.
    const drive = smoothstep(range(inRoute, 0.3, 1)) * 7;
    const shift = smoothstep(services) * 12;
    const run = smoothstep(range(route, 0.1, 0.9));
    if (truckRef.current) {
      truckRef.current.position.x = TRUCK_X + drive + shift + run * 26;
      truckRef.current.position.z = -run * 13;
    }

    // --- Escena 5: la cámara gira a vista cenital ------------------------
    const top = smoothstep(range(route, 0.05, 0.45));
    if (roadRef.current) {
      roadRef.current.visible = top > 0.01;
    }

    const camera = cameraRef.current;
    if (camera) {
      const truckX = truckRef.current?.position.x ?? 0;
      const followX = lerp(focusX, truckX + 6, smoothstep(services));
      const aimX = lerp(followX, truckX + 4, top);
      const aimY = lerp(heroFocusY, lerp(bandFocusY, liftedFocusY, bandLift), bandShown);

      camera.position.set(aimX, lerp(aimY, 48, top), lerp(42, -6, top));
      camera.lookAt(aimX, lerp(aimY - 0.4, 0, top), lerp(0, -7, top));
      camera.zoom = size.width / lerp(worldWidth, worldWidth * 1.4, top);
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[0, 3.4, 42]}
        near={-200}
        far={400}
      />

      <ambientLight intensity={1.2} />
      <directionalLight position={[12, 24, 18]} intensity={2.1} />

      <ContactShadows
        position={[0, 0.01, 0]}
        scale={90}
        resolution={512}
        blur={2.4}
        opacity={0.32}
        far={14}
      />

      <group position={[STACK_X, 0, STACKER_Z - 3]}>
        <ContainerStack rows={2} />
      </group>

      <group ref={stackerRef} position={[STACKER_X, 0, STACKER_Z]}>
        <ReachStacker boomRef={boomRef} />
      </group>

      {/* spreader: la pinza que sujeta el contenedor */}
      <group ref={spreaderRef}>
        <mesh>
          <boxGeometry args={[CONTAINER_SIZE.length * 0.95, 0.5, 1.4]} />
          <meshStandardMaterial color="#d03b40" roughness={0.6} />
        </mesh>
      </group>

      <group ref={cargoRef}>
        <CargoContainer withLogo />
      </group>

      <group ref={truckRef} position={[TRUCK_X, 0, 0]}>
        <Truck />
      </group>

      {/* banda azul noche que sube desde abajo en la escena 3 */}
      <group ref={bandRef} position={[0, -500, -12]}>
        <mesh>
          <boxGeometry args={[600, 600, 40]} />
          <meshBasicMaterial color="#0f1a2e" />
        </mesh>
      </group>

      {/* TODO: F5 — carretera con el trazado real Castellón → Madrid */}
      <group ref={roadRef} visible={false} position={[18, 0.02, -7]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[140, 9]} />
          <meshBasicMaterial color="#11151c" />
        </mesh>
      </group>
    </>
  );
}
