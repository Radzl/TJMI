import { create } from 'zustand';

export const SCENE_COUNT = 6;

type ScrollState = {
  /** Progreso global del scroll, 0 → 1. */
  progress: number;
  /** Progreso de cada escena del guion, 0 → 1 (índice 0 = escena 1). */
  scenes: number[];
  /** Metros recorridos por el camión. Lo usan las ruedas para girar. */
  travel: number;
};

export const useScrollStore = create<ScrollState>(() => ({
  progress: 0,
  scenes: new Array<number>(SCENE_COUNT).fill(0),
  travel: 0,
}));

// El scrub de GSAP escribe en cada frame. Mutamos el estado en sitio en vez de
// usar set() para no disparar renders de React ni generar basura por frame: los
// componentes 3D leen estos valores con getState() dentro de useFrame.
export function writeProgress(value: number) {
  useScrollStore.getState().progress = value;
}

export function writeTravel(value: number) {
  useScrollStore.getState().travel = value;
}

export function writeSceneProgress(index: number, value: number) {
  const { scenes } = useScrollStore.getState();
  if (index >= 0 && index < scenes.length) {
    scenes[index] = value;
  }
}
