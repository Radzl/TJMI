'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { NoToneMapping } from 'three';
import { lazy, Suspense, useState } from 'react';
import { ANCHO_MOVIL } from '@/lib/pantalla';
import AvisoCarga from './AvisoCarga';
import Scene from './Scene';
import { useIntroVisible } from './useIntroVisible';

/**
 * **El postprocesado no se descarga en el móvil, y antes sí.**
 *
 * La viñeta lleva tiempo apagada por debajo de 768 px, porque medido cuesta
 * **la mitad de los fotogramas** en un teléfono: 30 fps contra 88 en el
 * patio. Lo que no se había mirado es que el **módulo** viajaba igual:
 * `postprocessing` y `@react-three/postprocessing` entraban en el trozo de
 * 1,1 MB del 3D y se descargaban y se evaluaban en un teléfono para no pintar
 * nada.
 *
 * Con `lazy` el trozo se parte y el teléfono no lo pide.
 */
const Postproceso = lazy(() => import('./Postproceso'));

export default function Experience() {
  // **El lienzo deja de dibujar cuando la intro ya no se ve.** Está fijo
  // detrás de toda la portada y no se desmonta nunca, así que sin esto seguía
  // pintando ~450 llamadas por fotograma bajo Servicios, Cobertura y el pie:
  // dos tercios de la página gastando batería para algo tapado. Ver
  // `useIntroVisible`.
  const intro = useIntroVisible();

  // **Se decide una vez, al montar, y no se vuelve a mirar.** Está escrito en
  // `Postproceso`: montar y desmontar el efecto al girar el teléfono recrea
  // el render target en mitad de la animación y **eso sí se ve**. Así que
  // esto decide si el módulo **llega a cargarse**, que es una decisión de una
  // sola vez, y el propio componente sigue decidiendo si **se ejecuta**, que
  // esa sí reacciona al tamaño. Son dos cosas distintas y las dos hacen falta.
  const [conPostproceso] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= ANCHO_MOVIL,
  );

  // **Resolución adaptativa.** El lienzo pinta hasta a 1,5 píxeles reales
  // por píxel de CSS, que en un teléfono de gama media es lo que más pesa:
  // el coste crece con el cuadrado. `PerformanceMonitor` mide los fotogramas
  // y, si se sostienen por debajo de 45, baja el tope a 1; si después pasan
  // de 57, lo devuelve. Con `flipflops` deja de cambiar si se pone a dudar,
  // porque cada cambio recrea el búfer de dibujo y eso se nota.
  //
  // Es la red de seguridad, no la optimización: lo que de verdad bajó el
  // coste fue dibujar menos (ver «Rendimiento del 3D» en `CLAUDE.md`).
  const [topeDpr, setTopeDpr] = useState(1.5);

  return (
    <>
      {/* La pantalla de carga vive en el layout, para salir en el primer
          pintado; desde aquí solo se le avisa de cómo va la descarga. */}
      <AvisoCarga />
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
          dpr={[1, topeDpr]}
          frameloop={intro ? "always" : "never"}
          gl={{ antialias: true, toneMapping: NoToneMapping }}
        >
          <PerformanceMonitor
            bounds={() => [45, 57]}
            flipflops={3}
            onDecline={() => setTopeDpr(1)}
            onIncline={() => setTopeDpr(1.5)}
            onFallback={() => setTopeDpr(1)}
          />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>

          {/* Postprocesado: viñeta, y solo en escritorio. El porqué de las dos
              cosas —el valor y dónde se apaga— está medido y escrito en el
              propio componente.

              **Va en su propio `Suspense` y fuera del de la escena**, y no es
              cosmético: compartiendo boundary, la espera de este módulo
              volvería a suspender el de arriba y la escena **ya montada**
              desaparecería un instante mientras llega la viñeta. */}
          {conPostproceso && (
            <Suspense fallback={null}>
              <Postproceso />
            </Suspense>
          )}
        </Canvas>
      </div>
    </>
  );
}
