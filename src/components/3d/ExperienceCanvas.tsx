'use client';

import dynamic from 'next/dynamic';
import ScrollChoreography from './ScrollChoreography';

// Todo el 3D se carga solo en cliente: nada de WebGL en el render del servidor.
const Experience = dynamic(() => import('./Experience'), { ssr: false });

export default function ExperienceCanvas() {
  return (
    <>
      <Experience />
      <ScrollChoreography />
    </>
  );
}
