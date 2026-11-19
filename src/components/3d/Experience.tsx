'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import { Suspense, useEffect, useState } from 'react';
import AvisoCarga from './AvisoCarga';
import Scene from './Scene';
import { useIntroVisible } from './useIntroVisible';
import { useReposo } from './useReposo';

/**
 * **Fotogramas por segundo cuando nadie toca nada** (2026-11-18).
 *
 * Quieta, la escena solo tiene dos cosas vivas: el rotativo de la carretilla,
 * que parpadea cada segundo y tres cuartos, y la respiración de la carga, que
 * es lenta y de centímetros. Las dos se leen igual a 15 fotogramas que a 144,
 * así que no tiene sentido pintar más. En cuanto hay scroll, ratón o dedo,
 * vuelve a la velocidad de la pantalla (`useReposo`).
 */
const RITMO_REPOSO = 15;

/** Exposición del tratamiento de color (ACES). Calibrada sobre capturas: ver
 *  la nota de la luz en `Scene.tsx`. */
const EXPOSICION = 1;

/** Pide un fotograma cada tanto mientras el lienzo está en `demand`. */
function Latido() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const id = window.setInterval(() => invalidate(), 1000 / RITMO_REPOSO);
    return () => window.clearInterval(id);
  }, [invalidate]);
  return null;
}

/*
 * (Aquí se cargaba `Postproceso`, la viñeta del escritorio, y se quitó el
 * 2026-11-18. Al pasar a tratamiento de color de cine salió por qué estorbaba:
 * el compositor de `@react-three/postprocessing` **apaga el tratamiento de
 * color de three mientras está activo**, así que en escritorio la escena salía
 * sin él y en el móvil con él, y se veían dos escenas distintas. La viñeta era
 * un oscurecimiento del 1,5 % en las esquinas pensado para la maqueta; sin
 * ella el escritorio se ahorra además una pasada a pantalla completa en cada
 * fotograma.)
 */

export default function Experience() {
  // **El lienzo deja de dibujar cuando la intro ya no se ve.** Está fijo
  // detrás de toda la portada y no se desmonta nunca, así que sin esto seguía
  // pintando ~450 llamadas por fotograma bajo Servicios, Cobertura y el pie:
  // dos tercios de la página gastando batería para algo tapado. Ver
  // `useIntroVisible`.
  const intro = useIntroVisible();
  // **Y baja el ritmo cuando nadie toca nada.** Ver `RITMO_REPOSO`.
  const reposo = useReposo();

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
        {/* **Tratamiento de color de cine: ACES** (2026-11-18). El cliente
            eligió «mañana soleada» y el salto hacia lo real; con la escena ya
            en perspectiva, con cielo y asfalto fotográfico, el color plano de
            maqueta era lo que más la delataba. Se probó AgX y lavaba esta
            escena hasta el gris (sobre todo el cielo pálido del móvil); ACES
            da blancos limpios y colores vivos. Las intensidades de `Scene.tsx`
            se calibraron para ella midiendo capturas. Lo que tiene que ser un
            color exacto de la web (el muro y el telón azul noche) va con
            `toneMapped={false}`.

            Estuvo sin mapeo de tonos mientras la escena era una maqueta de
            colores planos: entonces ACES saturaba a blanco el suelo crema. Con
            el suelo de asfalto y la luz recalibrada eso ya no pasa. */}
        <Canvas
          shadows="percentage"
          dpr={[1, topeDpr]}
          frameloop={!intro ? "never" : reposo ? "demand" : "always"}
          gl={{
            antialias: true,
            toneMapping: ACESFilmicToneMapping,
            toneMappingExposure: EXPOSICION,
          }}
        >
          {intro && reposo && <Latido />}
          {/* **Fuera mientras dura el reposo, y es obligatorio.** El medidor
              cuenta fotogramas por segundo: con los 15 del reposo creería que
              el equipo no puede, bajaría la resolución y, a la tercera vez que
              cambiara de opinión, la dejaría baja para siempre. */}
          {!reposo && (
            <PerformanceMonitor
              bounds={() => [45, 57]}
              flipflops={3}
              onDecline={() => setTopeDpr(1)}
              onIncline={() => setTopeDpr(1.5)}
              onFallback={() => setTopeDpr(1)}
            />
          )}
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
