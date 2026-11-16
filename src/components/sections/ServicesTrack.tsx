'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SERVICES } from '@/content/services';
import ServiceDialog, {
  type ServiceDetail,
  type ServiceLabels,
} from '@/components/ui/ServiceDialog';
import { gsap, useReducedMotion } from '@/lib/gsap';

type ServiceItem = ServiceDetail;

type Props = {
  items: ServiceItem[];
  images: string[];
  hint: string;
  labels: ServiceLabels;
};

/**
 * Las tarjetas de servicio desfilando en horizontal mientras la sección se
 * queda fija.
 *
 * El scroll vertical de la página se traduce en desplazamiento lateral de la
 * fila: se fija el bloque, se mide cuánto sobresale la fila por la derecha y
 * se pide a ScrollTrigger exactamente ese recorrido de scroll. Así la última
 * tarjeta queda a la vista justo cuando el bloque se suelta.
 *
 * Tres cosas además del desplazamiento, y las tres son por lo mismo: un
 * desfile sin referencias no se entiende, parece que la página se ha quedado
 * enganchada.
 *  - La **palabra gigante** se mueve menos que las tarjetas. Esa diferencia de
 *    velocidad es lo que da profundidad; quieta era un sello pegado al fondo.
 *  - La **barra de avance** dice cuánto queda. Sin ella el bloque fijo es un
 *    scroll que no responde.
 *  - El **contador** nombra en qué tarjeta vas.
 *
 * La barra y el contador se escriben **directamente sobre el DOM** desde
 * `onUpdate`, no con estado de React: cambian en cada fotograma del scroll y
 * no deben provocar ni un render. Es la misma regla que sigue el 3D.
 *
 * Con movimiento reducido no se fija nada: la fila pasa a ser una rejilla
 * normal con las clases `motion-reduce:` y las tarjetas se leen en vertical.
 */
export default function ServicesTrack({
  items,
  images,
  hint,
  labels,
}: Props) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  // Qué servicio tiene el detalle abierto. Esto sí es estado de React y no un
  // ref: cambia por un clic, no por fotograma, y tiene que repintar.
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Estable, porque el diálogo lo usa dentro de un efecto: con una función
  // nueva en cada render, el efecto se volvería a montar sin parar.
  const closeDialog = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track || reducedMotion) return;

    // Cuánto sobresale la fila por la derecha. Se recalcula en cada refresco
    // porque depende del ancho de la ventana.
    const overflow = () => Math.max(0, track.scrollWidth - pin.clientWidth);
    const total = items.length;

    // **El bloque se fija también en móvil.** Hubo una temporada en que por
    // debajo de 640 px esto pasaba a ser un carrusel de scroll nativo, por
    // aquello de no secuestrar el gesto vertical. Se descartó: el desfile es
    // el momento de esta sección, y en el teléfono es justo donde más falta
    // hace que algo ocurra al bajar; un carrusel al lado se queda en una fila
    // de tarjetas que hay que descubrir.
    //
    // Lo que sí hay que cuidar al fijar en una pantalla pequeña son las dos
    // referencias de abajo —la barra de avance y el contador—, porque es ahí
    // donde de verdad se necesitan: sin ellas, un bloque clavado en un móvil
    // se lee como que la página se ha quedado colgada. Por eso ya no se
    // ocultan.
    //
    // Se sigue montando con `gsap.matchMedia` aunque ya no haya corte: así
    // sigue rehaciéndose solo al girar la pantalla o cambiar de tamaño, que
    // es cuando cambia cuánto sobresale la fila.
    const media = gsap.matchMedia();

    media.add('(min-width: 1px)', () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${overflow()}`,
          pin: true,
          // Un punto de inercia: pegado al scroll 1:1 se siente brusco.
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const bar = barRef.current;
            if (bar) bar.style.transform = `scaleX(${self.progress})`;

            const count = countRef.current;
            if (count) {
              const index = Math.min(
                total,
                Math.floor(self.progress * total) + 1,
              );
              count.textContent = String(index).padStart(2, '0');
            }
          },
        },
      });

      timeline.to(track, { x: () => -overflow(), ease: 'none' }, 0);

      // `matchMedia` ya mata la timeline y su disparador; esto solo borra los
      // `transform` que dejó escritos, para que la fila no se quede desplazada
      // si el montaje se rehace al girar la pantalla.
      return () => {
        gsap.set(track, { clearProps: 'transform' });
      };
    });

    return () => media.revert();
  }, [items.length, reducedMotion]);

  return (
    <div
      ref={pinRef}
      className="relative flex h-[100svh] items-center overflow-hidden motion-reduce:h-auto motion-reduce:overflow-visible motion-reduce:py-16"
    >
      {/* Este fondo ha tenido dos inquilinos y los dos se han ido: una
          retícula de filetes verticales y una palabra gigante en contorno a
          todo lo ancho.

          La palabra era la que daba el relieve —se movía menos que las
          tarjetas— y aun así sobra. Esta página gasta toda su audacia en un
          sitio, la intro 3D, y una palabra de 22vw detrás de las tarjetas es
          una segunda apuesta por lo mismo que además compite con el titular de
          la sección. Lo que queda diciendo cuánto falta son la barra de avance
          y el contador, que es su trabajo y lo hacen mejor. */}

      {/* La fila **no puede ser desplazable por su cuenta**: quien la mueve es
          la timeline. Si además llevara `overflow-x-auto`, el dedo la movería
          por un lado y el scroll por otro, y las dos cosas se pelearían por la
          misma posición. */}
      <ul
        ref={trackRef}
        className="relative flex gap-6 px-6 motion-reduce:flex-wrap motion-reduce:justify-center lg:px-10"
      >
        {items.map((item, index) => (
          <li
            key={item.title}
            className="group relative w-[78vw] shrink-0 overflow-hidden rounded-2xl border border-line bg-white sm:w-[46vw] lg:w-[27vw] lg:max-w-[400px]"
          >
            {/* Filete rojo que se dibuja de izquierda a derecha al pasar por
                encima: el único premio que tiene la tarjeta, y basta. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-10 h-px origin-left scale-x-0 bg-brand-red transition-transform duration-500 group-hover:scale-x-100"
            />

            {/* La tarjeta entera es el botón, no un enlace pequeño al final:
                en una tarjeta con foto, lo que la gente toca es la tarjeta.
                Y es un `<button>` de verdad, así que llega por tabulador y se
                abre con Intro sin tener que inventar nada. */}
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="block w-full cursor-pointer text-left"
            >
              <div className="photo h-52">
                <Image
                  src={images[index]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 27vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* **Aquí no va velo sobre la foto, y no hay que volver a
                    ponerlo.** Hubo uno degradando el bajo de la imagen hacia
                    el cuerpo de la tarjeta. Tenía sentido cuando la tarjeta
                    era azul noche: allí *oscurecía* y se leía como viñeta.
                    Sobre blanco hace lo contrario —**lava la foto**— y estas
                    fotos ya andan justas de resolución como para encima
                    desteñirles el tercio de abajo. Entre la imagen y el texto
                    hay un corte limpio, que es lo normal en una tarjeta. */}
              </div>

              <div className="relative p-8">
                {/* **Aquí no va número, y antes iba dos veces**: un fantasma
                    grande en la esquina y uno rojo pequeño sobre el titular, los
                    dos con la misma cifra. Lo de verlo repetido era un descuido;
                    lo de que no vaya ninguno es una decisión.

                    Numerar afirma que hay un orden, y estos seis servicios no
                    son pasos de nada: se contrata grupaje **o** camión completo,
                    no uno después del otro. Es la misma regla que vació las
                    cabeceras de sección, y la misma por la que los pasos de
                    `RouteSteps` sí llevan número: aquello sí es una secuencia
                    —no se entrega antes de recoger— y esto no.

                    Quien quiera saber por dónde va tiene el contador y la barra
                    de avance del pie, que para eso están. */}
                <h3 className="font-display text-display-sm uppercase text-ink">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>

                {/* **Tres datos por tarjeta**, los mismos `highlights` que la
                    fila de `/servicios`. La tarjeta era foto, nombre y una
                    línea: se veía bien y no contaba nada, y es la pieza que
                    más se mira de la portada, porque el desfile la deja
                    delante un buen rato. Cada dato es una cifra, una medida o
                    un límite —«13,6 m y 33 palés», «Carga lateral, sin
                    muelle»—, que es lo que separa un servicio de otro.

                    Separados por filete y en versales pequeñas, como en
                    `/servicios`: así se leen como ficha técnica y no compiten
                    con el titular. */}
                {item.highlights && item.highlights.length > 0 && (
                  <ul className="mt-6 divide-y divide-line border-y border-line">
                    {item.highlights.map((dato) => (
                      <li
                        key={dato}
                        className="py-2.5 font-display text-[0.7rem] uppercase tracking-[0.14em] text-ink"
                      >
                        {dato}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Sin esta línea la tarjeta no dice que se pueda abrir, y una
                    tarjeta que no lo dice no se pulsa. */}
                <span className="mt-6 inline-flex items-center gap-2 font-display text-xs uppercase tracking-widest text-ink transition-colors group-hover:text-brand-red-ink">
                  {labels.open}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <ServiceDialog
        service={openIndex === null ? null : items[openIndex]}
        index={openIndex ?? 0}
        image={openIndex === null ? undefined : images[openIndex]}
        href={
          openIndex === null
            ? undefined
            : `/servicios/${SERVICES[openIndex].slug}`
        }
        labels={labels}
        onClose={closeDialog}
      />

      {/* Avance del desfile. Va dentro del bloque fijo, así que acompaña todo
          el rato, y **también en móvil**: es justo donde más falta hace, que
          es la pantalla en la que un bloque clavado sin referencias se lee
          como que la página se ha colgado. Solo desaparece con movimiento
          reducido, que es cuando no hay desfile.
          El hueco de la derecha es para el botón flotante de WhatsApp, que
          vive en esa esquina y se comía el final de la barra. */}
      <div className="pointer-events-none absolute inset-x-6 bottom-10 flex items-center gap-5 pr-16 motion-reduce:hidden lg:inset-x-10 lg:pr-20">
        <p className="shrink-0 font-display text-xs uppercase tracking-[0.18em] sm:tracking-[0.3em] text-muted">
          <span ref={countRef} className="tabular-nums text-ink">
            01
          </span>
          <span className="text-line"> / </span>
          <span className="tabular-nums">
            {String(items.length).padStart(2, '0')}
          </span>
        </p>

        <p className="hidden shrink-0 font-display text-xs uppercase tracking-[0.18em] sm:tracking-[0.3em] text-muted sm:block">
          {hint}
        </p>

        <span className="relative h-0.5 flex-1 rounded-full bg-line">
          {/* El estado inicial va en `style` y no con `scale-x-0`: Tailwind v4
              escribe esa clase en la propiedad `scale`, y un `transform` en
              línea no la pisa, así que la barra se quedaba a cero para
              siempre. */}
          <span
            ref={barRef}
            style={{ transform: 'scaleX(0)' }}
            className="absolute inset-0 origin-left rounded-full bg-brand-red"
          />
        </span>
      </div>
    </div>
  );
}
