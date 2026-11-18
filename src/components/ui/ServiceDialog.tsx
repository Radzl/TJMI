'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import { Link } from '@/i18n/navigation';
import { lockScroll, unlockScroll } from '@/lib/scrollLock';

export type ServiceDetail = {
  /** El nombre corto, el de la tarjeta y el del menú. */
  title: string;
  description: string;
  /**
   * El titular de su página propia. Es más largo que `title` a propósito:
   * «Grupaje (LTL)» sirve para una tarjeta entre otras cinco, pero como `h1`
   * de una página no dice ni qué se transporta ni adónde, que es justo lo que
   * busca quien llega desde Google.
   */
  heading?: string;
  /**
   * La parte de `heading` que va en grande en la cabecera de su página
   * («GRUPAJE DE PALÉS» / «entre Castellón y Madrid»). Ver `lead` en
   * `PageHeader`.
   */
  headingLead?: string;
  /** Título y descripción para buscadores, de su página propia. */
  seoTitle?: string;
  seoDescription?: string;
  /** Párrafos largos: el porqué del servicio, no la línea de la tarjeta. */
  long?: string[];
  includes?: string[];
  bestFor?: string[];
  /**
   * Tres datos de tres a cinco palabras para el listado de `/servicios`.
   *
   * **No son el `includes` recortado, y la diferencia importa.** `includes`
   * son cuatro frases enteras y viven en la ficha; copiarlas al listado
   * recrearía justo lo que este proyecto resolvió a propósito —dos páginas
   * con el mismo contenido compiten entre ellas y Google se queda con una—.
   * Estos son condensaciones: dan densidad sin repetir un bloque de texto.
   */
  highlights?: string[];
};

export type ServiceLabels = {
  includes: string;
  bestFor: string;
  /** Lo que pone en la tarjeta para avisar de que se abre. */
  open: string;
  close: string;
  quote: string;
  all: string;
  label: string;
  /** El enlace del modal a la página completa del servicio. */
  page: string;
  /** Cabecera de los otros servicios, en la página de detalle. */
  otherTitle: string;
  /** La miga de pan de la página de detalle, y su vuelta al listado. */
  backToAll: string;
  /** Lo que pone cada tarjeta del listado para entrar en su página. */
  see: string;
};

type Props = {
  /** El servicio abierto, o `null` si no hay ninguno. */
  service: ServiceDetail | null;
  /** Posición en la lista, para el número. */
  index: number;
  image?: string;
  /**
   * La página propia de este servicio. El modal cuenta lo mismo que ella, así
   * que el enlace no está para repetir: está para que quien quiera guardarlo,
   * compartirlo o volver después tenga una dirección a la que ir. Un modal no
   * se puede enlazar.
   */
  href?: string;
  labels: ServiceLabels;
  onClose: () => void;
};

/**
 * El detalle de un servicio, en modal.
 *
 * Va con **`<dialog>` nativo y `showModal()`**, no con un div y un overlay.
 * No es purismo: así vienen de serie el foco atrapado dentro, el Escape, el
 * resto de la página marcada como inerte para los lectores de pantalla y la
 * capa de fondo (`::backdrop`). Montarlo a mano es reescribir todo eso peor.
 *
 * **Hay un solo diálogo para los seis servicios** y lo que cambia es su
 * contenido. Con uno por tarjeta habría seis nodos de diálogo en el DOM y seis
 * sitios donde se puede quedar el foco; así solo hay uno.
 *
 * El scroll de la página se bloquea mientras está abierto (ver
 * `lib/scrollLock.ts`): un `<dialog>` modal impide tocar lo de detrás, pero
 * **no impide que la rueda siga moviendo la página**, y con la intro 3D detrás
 * eso canta.
 *
 * ## Va en un portal a `document.body`, y no es por costumbre
 *
 * Este diálogo lo pinta `ServicesTrack`, cuyo bloque **lo deja fijado
 * ScrollTrigger** durante el desfile horizontal. Con el `<dialog>` dentro de
 * ese bloque, abrirlo con `showModal()` mandaba la página al principio: desde
 * el píxel 11.200 se iba al 905 al abrir y al 0 al cerrar.
 *
 * Costó encontrarlo porque no lo hacía nuestro código: se comprobó que ningún
 * `window.scrollTo` ni ninguna escritura de `scrollTop` se disparaba, y que
 * pasaba igual llamando a `showModal()` a mano, sin React y sin el bloqueo de
 * scroll. Lo que falla es promover a la capa superior un elemento que cuelga
 * de un contenedor fijado por el scroll.
 *
 * Sacándolo al `body` el diálogo deja de depender de ese contenedor. **Si
 * algún día se mueve de sitio, que siga fuera del bloque fijado.**
 */
export default function ServiceDialog({
  service,
  index,
  image,
  href,
  labels,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (!service) {
      if (dialog.open) dialog.close();
      return;
    }

    if (!dialog.open) dialog.showModal();
    lockScroll();

    // El evento `close` lo dispara tanto el Escape como nuestro botón, así que
    // con escucharlo aquí vale para los dos caminos.
    dialog.addEventListener('close', onClose);

    return () => {
      dialog.removeEventListener('close', onClose);
      unlockScroll();
    };
  }, [service, onClose]);

  // El portal necesita el `document`, que no existe al renderizar en el
  // servidor: hasta que monta, aquí no se pinta nada.
  //
  // Va con `useSyncExternalStore` y no con un `useState` dentro de un efecto,
  // que es la forma antigua: así React sabe desde el principio que el valor del
  // servidor es `false` y el del cliente `true`, sin provocar un render de más
  // ni avisos de hidratación. Es el mismo patrón que usa el consentimiento.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={ref}
      aria-label={labels.label}
      // Clic en el fondo: el `<dialog>` ocupa solo su caja, así que un clic
      // cuyo destino es el propio diálogo (y no algo de dentro) es un clic en
      // el hueco que deja alrededor, o sea en el fondo.
      onClick={(event) => {
        if (event.target === ref.current) ref.current?.close();
      }}
      // **Aquí no puede ir `relative`.** El navegador le da `position: fixed`
      // a un `<dialog>` abierto en modal, y ponerle `relative` lo devuelve al
      // flujo normal del documento, o sea al principio de la página. Entonces,
      // al abrirlo, el foco se va al diálogo y el navegador **scrollea hasta
      // donde esté**: desde el píxel 11.200 la portada se iba al 1.000.
      //
      // Costó encontrarlo porque no lo hace ningún código nuestro —se comprobó
      // que no se llamaba a `window.scrollTo` ni a `Element.scrollTo` ni se
      // escribía `scrollTop`— y porque el síntoma parece de scroll y la causa
      // es de posicionamiento. El ancla del aspa va en el `<div>` de dentro.
      className="m-auto w-[min(46rem,92vw)] rounded-2xl border-0 bg-transparent p-0 text-ink backdrop:bg-night/75 backdrop:backdrop-blur-sm"
    >
      {service && (
        <div className="relative">
          {/* **Botón de cerrar, siempre visible.** Antes solo había un enlace
              de texto al final del todo, o sea que para cerrar había que leerse
              el servicio entero o acordarse del Escape. Va fuera del contenedor
              que hace scroll y en posición absoluta, así que no se va nunca
              hacia arriba por mucho que se baje.

              Lleva su propia sombra porque cae sobre la foto en unos servicios
              y sobre el blanco en otros, y tiene que verse en los dos. */}
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label={labels.close}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-night/60 text-white backdrop-blur transition-colors hover:bg-night focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* `data-lenis-prevent` es **obligatorio y no es decorativo**: sin él
              este panel no hace scroll y parece que el modal está roto.

              El motivo no es el `overflow`, que está bien puesto: es que Lenis
              engancha la rueda en toda la página y le hace `preventDefault`
              para mover el scroll suave él mismo. **Pararlo no basta** —que es
              lo que hace `lockScroll`—, porque el escuchador sigue ahí y sigue
              cancelando el evento, así que la rueda deja de llegar a este
              contenedor. Este atributo es la forma que tiene Lenis de que le
              digas «aquí no te metas». Vale igual para la rueda y para el dedo. */}
          <div
            data-lenis-prevent
            className="max-h-[86svh] overflow-y-auto overscroll-contain rounded-2xl bg-white"
          >
          {image && (
            <div className="photo h-44 sm:h-56">
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 768px) 92vw, 46rem"
                className="object-cover"
              />
            </div>
          )}

          <div className="p-8 sm:p-10">
            <p className="flex items-center gap-4 font-display text-xs uppercase tracking-[0.18em] text-brand-red-ink sm:tracking-[0.3em]">
              <span className="tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span
                className="h-px w-10 shrink-0 bg-brand-red"
                aria-hidden="true"
              />
            </p>

            <h2 className="mt-5 font-display text-display-sm uppercase text-ink sm:text-3xl">
              {service.title}
            </h2>

            <p className="mt-5 text-base leading-relaxed text-muted">
              {service.description}
            </p>

            {service.long?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-5 text-base leading-relaxed text-muted"
              >
                {paragraph}
              </p>
            ))}

            <div className="mt-10 grid gap-10 border-t border-line pt-8 sm:grid-cols-2">
              {service.includes && service.includes.length > 0 && (
                <section>
                  <h3 className="font-display text-xs uppercase tracking-[0.18em] text-ink sm:tracking-[0.3em]">
                    {labels.includes}
                  </h3>
                  <ul className="mt-5 flex flex-col gap-3">
                    {service.includes.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red"
                          aria-hidden="true"
                        />
                        <span className="text-sm leading-relaxed text-muted">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {service.bestFor && service.bestFor.length > 0 && (
                <section>
                  <h3 className="font-display text-xs uppercase tracking-[0.18em] text-ink sm:tracking-[0.3em]">
                    {labels.bestFor}
                  </h3>
                  <ul className="mt-5 flex flex-col gap-3">
                    {service.bestFor.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue"
                          aria-hidden="true"
                        />
                        <span className="text-sm leading-relaxed text-muted">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-8">
              <Button href="/contacto">{labels.quote}</Button>
              {href && (
                <Link
                  href={href}
                  className="font-display text-sm uppercase tracking-widest text-azul-texto transition-colors hover:text-brand-red-ink"
                >
                  {labels.page}
                </Link>
              )}
              <button
                type="button"
                onClick={() => ref.current?.close()}
                className="font-display text-sm uppercase tracking-widest text-muted transition-colors hover:text-azul-texto"
              >
                {labels.close}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </dialog>,
    document.body,
  );
}
