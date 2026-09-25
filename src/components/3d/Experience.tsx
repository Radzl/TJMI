'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Preloader from './Preloader';
import Scene from './Scene';

export default function Experience() {
  return (
    <>
      <Preloader />
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <Canvas dpr={[1, 1.5]} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
