'use client';

import { Canvas } from '@react-three/fiber';
import { NoToneMapping } from 'three';
import { Suspense } from 'react';
import Postproceso from './Postproceso';
import Preloader from './Preloader';
import Scene from './Scene';
import { useIntroVisible } from './useIntroVisible';

export default function Experience() {
  // **El lienzo deja de dibujar cuando la intro ya no se ve.** Está fijo
  // detrás de toda la portada y no se desmonta nunca, así que sin esto seguía
  // pintando ~450 llamadas por fotograma bajo Servicios, Cobertura y el pie:
  // dos tercios de la página gastando batería para algo tapado. Ver
  // `useIntroVisible`.
  const intro = useIntroVisible();

  return (
    <>
      <Preloader />
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {/* `percentage` es el filtrado PCF. Ojo al tocarlo: tanto `soft` como
            `shadows` a secas piden PCFSoftShadowMap, que Three ya ha
            retirado, y entonces avisa por consola de que cae en este mismo.
            Mejor pedirlo de frente. */}
        {/* **Sin mapeo de tonos, y es la decisión que desatasca todo lo demás.**

            Por defecto three aplica ACES Filmic, que es una curva pensada para
            render fotorrealista con rango dinámico alto: comprime las luces y
            las desatura. Esta escena es justo lo contrario —una maqueta limpia
            de colores planos—, y esa curva era la que saturaba a blanco
            cualquier crema. De ahí venía el parche de pintar el suelo con
            material **sin luz**: era la única forma de que conservara su color.

            Con `NoToneMapping` el color de un material es el color que sale en
            pantalla, siempre que la luz total sobre él sume ~1. Por eso las
            intensidades de `Scene.tsx` están calculadas y no puestas a ojo. */}
        <Canvas
          shadows="percentage"
          dpr={[1, 1.5]}
          frameloop={intro ? "always" : "never"}
          gl={{ antialias: true, toneMapping: NoToneMapping }}
        >
          <Suspense fallback={null}>
            <Scene />

            {/* Postprocesado: viñeta, y solo en escritorio. El porqué de las
                dos cosas —el valor y dónde se apaga— está medido y escrito en
                el propio componente. */}
            <Postproceso />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
