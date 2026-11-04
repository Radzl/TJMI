'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';

type Step = {
  place: string;
  title: string;
  description: string;
};

type Props = {
  title: string;
  steps: Step[];
};

/**
 * Los cuatro pasos del servicio, que se van encendiendo uno a uno al bajar.
 *
 * Van **en el mismo tramo de scroll en el que el camión rueda hacia la
 * derecha**, y en el mismo sentido: el primero a la izquierda, el último a la
 * derecha. Esa es toda la idea. Mientras el camión cruza la pantalla, la
 * página va contando qué pasa con tu mercancía en cada tramo del viaje.
 *
 * ## Lo que estaba mal era el contenido, no el tamaño de la letra
 *
 * Los pasos decían «Recogemos / Agrupamos / Transportamos / Entregamos» con
 * una línea cada uno, y el subtítulo que tienen 150 px encima ya decía
 * «Recogemos, agrupamos y entregamos tu mercancía en 24 horas». O sea que la
 * lista **no añadía ni un dato**: repetía una frase que el visitante acababa
 * de leer, cuatro veces y en columnas.
 *
 * Ahora cada paso lleva **un sitio o una cifra** —Castellón, Almazora, 420 km,
 * Madrid— y dice algo que solo puede decir esta empresa: las más de 150
 * fábricas de la provincia, los 4.000 m² de Almazora, que el camión sale todos
 * los días laborables y que entre una nave y la otra no interviene nadie más.
 * Y el subtítulo de arriba se cambió a la vez, porque si no repetía los cuatro
 * verbos que ahora encabezan la lista.
 *
 * **Aquí el antetítulo sí se gana el sitio**, al revés que los que se quitaron
 * de las cabeceras de sección: allí repetían el encabezado y aquí dice dónde
 * pasa cada cosa, que es justo lo que el título del paso no dice. Es lo que
 * convierte cuatro verbos en cuatro paradas.
 *
 * ## La vía
 *
 * Cada paso dibuja su tramo de vía con un nodo a la izquierda, y el tramo se
 * llena de izquierda a derecha cuando le toca. No es adorno: cuatro bloques de
 * texto sobre azul noche no se leen como un recorrido, y esto es un recorrido.
 * El tramo **cruza el hueco entre columnas** (`--rail-gap`) para que los
 * cuatro se lean como una línea y no como cuatro subrayados sueltos; lo que
 * sobra por la derecha lo recorta el `overflow` de la lista.
 *
 * No es una entrada orquestada más: es una transición de CSS, como el filete
 * de las tarjetas del índice. Esta página gasta su único momento orquestado en
 * la intro 3D.
 *
 * ## Dos reglas que no se pueden saltar
 *
 * **El marcado sale completo y visible.** Lo apaga el JavaScript al montar, no
 * al revés. Si se escribiera oculto y se enseñara por animación, quien navegue
 * con movimiento reducido —o con el JS caído— se quedaría sin los cuatro pasos,
 * que son contenido, no adorno. Es la misma regla del resto del proyecto.
 *
 * **No hay estado de React.** El disparador escribe `data-shown` directamente
 * sobre cada `<li>` y la transición la hace el CSS. Esto se actualiza en cada
 * fotograma del scroll y no debe provocar ni un render, igual que la barra de
 * avance del desfile de servicios.
 */
export default function RouteSteps({ title, steps }: Props) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || prefersReducedMotion()) return;

    const items = Array.from(list.querySelectorAll<HTMLLIElement>('li'));
    items.forEach((item) => item.setAttribute('data-shown', 'false'));

    const trigger = ScrollTrigger.create({
      trigger: list,
      // Empieza cuando la lista asoma por abajo y termina cuando ya está
      // entera arriba: así el encendido ocupa el rato que la lista tarda en
      // cruzar la pantalla, que es el mismo en el que el camión rueda.
      start: 'top bottom',
      end: 'bottom 45%',
      // Pegado al scroll y no a una duración fija: si alguien baja despacio,
      // los pasos se encienden despacio. Es lo que los ata al camión.
      scrub: 1,
      onUpdate: (self) => {
        // Un poco de adelanto para que el primero no espere a que la lista
        // esté dentro del todo: a progreso 0 ya se enciende uno.
        const lit = Math.round(self.progress * items.length + 0.35);
        items.forEach((item, index) => {
          item.setAttribute('data-shown', index < lit ? 'true' : 'false');
        });
      },
    });

    return () => {
      trigger.kill();
      items.forEach((item) => item.removeAttribute('data-shown'));
      gsap.set(items, { clearProps: 'all' });
    };
  }, []);

  return (
    <div className="mt-24">
      <h3 className="font-display text-sm uppercase tracking-[0.18em] text-white/50 sm:tracking-[0.26em]">
        {title}
      </h3>

      <ol
        ref={listRef}
        className="route-steps mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
      >
        {steps.map((step, index) => (
          <li key={step.title} className="pt-7">
            {/* El nodo de la parada. Va aquí y no en el CSS porque el tramo de
                vía ya gasta los dos pseudoelementos del `li`. */}
            <span className="route-dot" aria-hidden="true" />

            <p className="flex items-baseline gap-3">
              <span className="font-display text-xs tabular-nums tracking-widest text-brand-red-soft">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-display text-xs uppercase tracking-[0.22em] text-white/45">
                {step.place}
              </span>
            </p>

            <h4 className="mt-3 font-display text-2xl uppercase tracking-tight">
              {step.title}
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
