'use client';

import { useProgress } from '@react-three/drei';
import { useEffect } from 'react';
import { escribirCarga } from '@/lib/carga';

/**
 * Avisa a la pantalla de carga de cómo va la descarga del 3D. No pinta nada.
 *
 * Vive dentro de `Experience` porque `useProgress` es de drei, y drei solo
 * viaja en el trozo del 3D: leerlo desde la pantalla de carga lo metería en el
 * primer paquete. Ver `lib/carga.ts`.
 */
export default function AvisoCarga() {
  const { progress, active } = useProgress();

  useEffect(() => {
    escribirCarga({ listo: !active && progress >= 100, progreso: progress });
  }, [active, progress]);

  return null;
}
