'use client';

import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo, type RefObject } from 'react';
import {
  Camera,
  Group,
  Light,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
} from 'three';
import { clamp } from '@/lib/utils';

const MODEL = '/models/reach-stacker.glb';

// El GLB trae el color en el material, sin texturas: lo repintamos con la
// paleta de TJMI. Material.007 y .008 son un contenedor que viene dentro del
// modelo y que sobra, porque ponemos el nuestro.
const COLORS: Record<string, string> = {
  Material: '#34548a', // carrocería
  'Material.002': '#1c2530', // pluma
  'Material.003': '#d8b400', // spreader
  'Material.004': '#39414f', // estructura
  'Material.005': '#c9ccd2',
  'Material.006': '#15181d', // ruedas
};
const BOOM_MATERIALS = new Set(['Material.002', 'Material.003']);
const DROP_MATERIALS = new Set(['Material.007', 'Material.008']);

// Medidas tomadas del propio GLB (ver scripts de inspección). Todo lo que
// sigue está en el espacio del modelo, antes de escalar.
// Escala calibrada con las ruedas del propio modelo (1,5 m de diámetro) y el
// ancho de vía. Se ha bajado un punto respecto a la medida real para que no
// le coma protagonismo al camión, que es el que lleva la marca.
const SCALE = 0.12;
const GROUND_OFFSET = 9.57; // distancia del origen del modelo al suelo
const LIFT = GROUND_OFFSET * SCALE;
const PIVOT: [number, number, number] = [17, 5, 0];
const RADIUS = 54.26; // del pivote al centro del spreader
const BASE_ANGLE = Math.atan2(23.83, -48.75); // pose de fábrica: pluma alta

/** Altura del spreader, en metros, con la pluma en su pose más alta. */
export const SPREADER_TOP = 23.83 * SCALE + PIVOT[1] * SCALE + LIFT;

/**
 * Resuelve la pluma a partir de la altura a la que debe quedar el spreader:
 * devuelve cuánto hay que girarla y a qué distancia queda la punta.
 */
export function boomPose(spreaderY: number) {
  const modelY = (spreaderY - LIFT) / SCALE;
  const sin = clamp((modelY - PIVOT[1]) / RADIUS, -1, 1);
  const angle = Math.PI - Math.asin(sin);
  const modelX = PIVOT[0] + RADIUS * Math.cos(angle);

  return {
    rotation: angle - BASE_ANGLE,
    /** Distancia horizontal del spreader respecto al origen de la máquina. */
    reach: -modelX * SCALE,
  };
}

type Props = {
  boomRef: RefObject<Group | null>;
};

export default function ReachStackerModel({ boomRef }: Props) {
  const { scene } = useGLTF(MODEL);

  const { model, boom } = useMemo(() => {
    const root = scene.clone(true);
    const remove: Object3D[] = [];
    const boomParts: Object3D[] = [];

    root.traverse((child) => {
      if (child instanceof Camera || child instanceof Light) {
        remove.push(child);
        return;
      }
      if (!(child instanceof Mesh)) return;

      const name = (child.material as MeshStandardMaterial)?.name ?? '';
      if (DROP_MATERIALS.has(name)) {
        remove.push(child);
        return;
      }
      if (BOOM_MATERIALS.has(name)) boomParts.push(child);

      child.material = new MeshStandardMaterial({
        color: COLORS[name] ?? '#8a8f98',
        roughness: 0.55,
        metalness: 0.05,
      });
    });

    remove.forEach((node) => node.removeFromParent());

    // La pluma pasa a colgar de un grupo colocado en su pivote real, para
    // poder girarla sin que se despegue de la máquina.
    const pivot = new Group();
    pivot.position.set(...PIVOT);
    root.add(pivot);
    root.updateMatrixWorld(true);
    boomParts.forEach((part) => pivot.attach(part));

    return { model: root, boom: pivot };
  }, [scene]);

  useLayoutEffect(() => {
    boomRef.current = boom;
    return () => {
      boomRef.current = null;
    };
  }, [boom, boomRef]);

  return (
    <primitive
      object={model}
      rotation={[0, Math.PI, 0]}
      scale={SCALE}
      position={[0, LIFT, 0]}
    />
  );
}

useGLTF.preload(MODEL);
