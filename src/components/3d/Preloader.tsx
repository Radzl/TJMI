'use client';

import { useProgress } from '@react-three/drei';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** Tope de seguridad: si algún archivo se atasca, la web no se queda colgada. */
const MAX_WAIT = 4000;

/**
 * La pantalla de carga: **el viaje empieza antes que la web**.
 *
 * ## Por qué esto es «lo que va antes del 3D»
 *
 * La primera pantalla de la portada es el metro cuadrado más caro del sitio y
 * lo que la hace distinta es la intro 3D: meterle algo delante la empujaría
 * por debajo del pliegue. Pero resulta que **ya hay algo antes del 3D** —esta
 * pantalla— y durante un tiempo fue un logo, una rayita de 160 px y un
 * porcentaje. O sea, lo primero que ve todo el mundo, gastado en nada, y sin
 * costar ni un píxel de scroll.
 *
 * Ahora la barra **es el trayecto**: una línea de Almazora a Fuenlabrada con
 * un punto que avanza, y el contador en kilómetros en vez de en por ciento.
 * Cuando el punto llega a Madrid, se abre la escena.
 *
 * ## Y no es un adorno suelto: es la misma pieza que hay dentro
 *
 * Los dos extremos, el filete, el punto y la cifra son **los mismos que
 * `RouteProgress` y `RouteOdometer`** en la escena de la carretera, con los
 * mismos textos de `messages`. Quien espera dos segundos aquí reconoce la
 * pieza cuatro pantallas más abajo, cuando el camión la recorre de verdad.
 * Una pantalla de carga que no se parece a nada de lo que viene después es
 * tiempo tirado; esta es el anticipo.
 *
 * ## Dos cosas que no se tocan
 *
 * - **El tope de seguridad.** Si un GLB se atasca, a los cuatro segundos esto
 *   se va igual. Una pantalla de carga que puede quedarse para siempre es
 *   peor que no tenerla.
 * - **Va `aria-hidden`.** Es un estado de espera, no contenido: a un lector
 *   de pantalla no le aporta nada y lo que hay debajo ya está en el HTML.
 */
export default function Preloader() {
  const { progress, active } = useProgress();
  const t = useTranslations('route');
  const [expired, setExpired] = useState(false);
  const [gone, setGone] = useState(false);

  const done = expired || (!active && progress >= 100);
  const shown = Math.min(100, Math.round(progress));

  // Los kilómetros salen del mismo dato que el cuentakilómetros de la escena,
  // así que si algún día cambia la distancia, cambia en los dos sitios.
  const total = Number(t('odometer.value')) || 420;
  const km = Math.round((shown / 100) * total);

  useEffect(() => {
    const safety = setTimeout(() => setExpired(true), MAX_WAIT);
    return () => clearTimeout(safety);
  }, []);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(id);
  }, [done]);

  if (gone) return null;

  // **El portal arregla el logo duplicado, y no era el `z-index`.**
  //
  // Durante la espera el logo salía **dos veces**: el de la pantalla de carga
  // y el del navbar por encima. Estaba apuntado como pendiente y con la
  // sospecha correcta —«no es el valor, es que uno de los dos está en otro
  // contexto de apilado»—, solo que sin resolver.
  //
  // Lo era: este componente se renderiza desde `Experience`, que vive dentro
  // de `<main className="relative z-10">`. Un `z-index` solo compite con sus
  // hermanos, así que el `z-[100]` de aquí competía **dentro** de ese `main`,
  // y el `main` entero (z-10) queda por debajo del navbar (z-50). Subirle el
  // número a este `div` no habría hecho nada, y bajarle el del navbar habría
  // arrastrado el menú de móvil, el botón de WhatsApp y el banner de cookies.
  //
  // Sacándolo a `document.body` el `z-[100]` pasa a competir de verdad con el
  // 50 del navbar. Es el mismo patrón que usa `ServiceDialog`, y por el mismo
  // motivo: una capa que tapa la página no puede depender del apilado del
  // bloque que la contiene.
  return createPortal(
    <div
      aria-hidden="true"
      data-preloader=""
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bone px-6 transition-opacity duration-500 ${
        done ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <Image
        src="/logo.png"
        alt=""
        width={420}
        height={286}
        priority
        className="h-16 w-auto"
      />

      {/* El trayecto. Ancho fijo y no un porcentaje de la pantalla: con un
          ancho fluido, en un monitor grande la línea cruzaba medio escritorio
          y el punto tardaba una eternidad en moverse de forma visible. */}
      <div className="mt-12 w-full max-w-[22rem]">
        <div className="flex items-baseline justify-between gap-4 font-display text-[0.6rem] uppercase tracking-[0.2em] text-muted">
          <span>{t('origin')}</span>
          <span className="text-right">{t('destination')}</span>
        </div>

        <div className="relative mt-3 h-px bg-line">
          {/* El tramo hecho y el punto van los dos con `transition`, no con
              un bucle de animación: el progreso llega a saltos —un GLB entero
              de golpe— y sin suavizar, el punto daba brincos. */}
          <span
            className="absolute inset-y-0 left-0 block bg-brand-blue transition-[width] duration-500 ease-casa"
            style={{ width: `${shown}%` }}
          />
          <span
            className="absolute -top-[3px] block h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-brand-blue transition-[left] duration-500 ease-casa"
            style={{ left: `${shown}%` }}
          />
        </div>
      </div>

      <span className="mt-5 font-display text-sm uppercase tracking-[0.25em] text-brand-blue tabular-nums">
        {km} {t('odometer.unit')}
      </span>
    </div>,
    document.body,
  );
}
