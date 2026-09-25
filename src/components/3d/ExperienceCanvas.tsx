'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/lib/gsap';
import ScrollChoreography from './ScrollChoreography';

// Todo el 3D se carga solo en cliente: nada de WebGL en el render del servidor.
const Experience = dynamic(() => import('./Experience'), { ssr: false });

/**
 * Si el sistema pide reducir movimiento no se monta nada: ni el Canvas ni la
 * coreografía de scroll. Además de accesibilidad es ahorro de batería en
 * móviles viejos. Las secciones de la Home se apañan solas en ese caso,
 * con la variante `motion-reduce:` de Tailwind.
 */
export default function ExperienceCanvas() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  return (
    <>
      <Experience />
      <ScrollChoreography />
    </>
  );
}
