'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { EVENTO_CARGA, leerCarga, type EstadoCarga } from '@/lib/carga';
import { lockScroll, unlockScroll } from '@/lib/scrollLock';
import { ATRIBUTO_SIN_3D } from '@/lib/sin3d';

/**
 * Tope de seguridad, en milisegundos desde que se empezó a cargar la página.
 * Si el 3D se atasca, la pantalla se va igual. Una pantalla de carga que puede
 * quedarse para siempre es peor que no tenerla.
 */
const TOPE_MS = 6000;

/** Lo que tarda la cortina en empezar a subir desde que salen los textos. */
const RETRASO_CORTINA_MS = 450;

/**
 * Solo en el navegador: si la pantalla de carga ya ha salido en esta visita.
 * Al volver a la portada navegando dentro de la web no se repite: el 3D ya
 * está en caché y lo que vería el visitante sería una espera de adorno.
 */
let yaSalio = false;

/** La escala horizontal que tiene ahora una barra, leída del navegador. */
function escalaActual(el: HTMLElement) {
  const m = getComputedStyle(el).transform;
  if (!m || m === 'none') return 1;
  const a = Number(m.slice(m.indexOf('(') + 1).split(',')[0]);
  return Number.isFinite(a) ? Math.min(1, Math.max(0, a)) : 1;
}

/**
 * La pantalla de carga de la portada.
 *
 * ## De dónde sale
 *
 * El cliente la pidió parecida a la de una web de referencia, «tanto los
 * efectos como la duración». Se midió aquella fotograma a fotograma (40 ms de
 * resolución) y esto reproduce su ritmo con lo nuestro:
 *
 *   0 – 0,4 s ...... entra el antetítulo, subiendo 10 px
 *   0,1 – 0,7 s .... entra la marca, subiendo 16 px
 *   0,6 – 2,05 s ... la barra se llena, lenta al principio y al final
 *   + 0,4 s ........ los textos salen hacia arriba, escalonados
 *   + 0,85 s ....... la cortina entera sube y descubre la portada
 *
 * La barra son **las dos rayas de la puerta de la tractora**, roja fina encima
 * y azul más gruesa debajo, que es la firma de esta web en las cabeceras y en
 * el vídeo de Nosotros.
 *
 * ## Lo que tiene que esperar, y lo que no
 *
 * La barra corre por tiempo hasta el 90 % y **ahí espera a que el 3D esté
 * descargado**: es lo que pidió el cliente, que la portada aparezca con todo
 * cargado. En cuanto lo está —y no antes de que acabe la primera fase, para no
 * romper el ritmo—, se completa desde donde esté y sale. Si la escena no puede
 * montarse (sin WebGL, o se cae), se va igual: lo marca `data-sin-3d`.
 *
 * ## Por qué casi todo es CSS
 *
 * Va en el HTML del servidor y las animaciones de entrada son de CSS, así que
 * **se ve desde el primer pintado**, antes de que llegue una línea de
 * JavaScript. Y como solo mueven `transform` y `opacity`, el navegador las
 * hace fuera del hilo principal: **no tartamudean aunque el 3D esté
 * evaluándose a la vez**, que es justo lo que pasa en estos segundos.
 *
 * La anterior vivía dentro de `Experience`, que se monta cuando el navegador
 * queda libre, y por eso aparecía sobre 1,5 s **después** de pintarse la
 * portada: primero se veía la página sin 3D y después se tapaba.
 *
 * ## Las redes de seguridad
 *
 * - **Sin JavaScript** la quita el CSS a los 9 s (`carga-tope`).
 * - **Con movimiento reducido** no sale: esa visita no carga el 3D, así que no
 *   hay nada que esperar.
 * - **Solo en la portada**, y solo la primera vez en cada visita.
 * - Va **fuera de `<main>`** a propósito: dentro, su `z-index` competiría solo
 *   con sus hermanos y la barra de navegación le quedaría por encima. Es la
 *   misma lección que obligó a la anterior a salir con un portal.
 * - Mientras está, **el scroll se bloquea** (`lockScroll`): si alguien bajara
 *   por detrás, la cortina se levantaría a mitad de la intro.
 */
export default function PantallaCarga() {
  const t = useTranslations('carga');
  const pathname = usePathname();
  const esPortada = /^\/(es|en)?\/?$/.test(pathname ?? '');
  const [viva, setViva] = useState(
    () => esPortada && !(typeof window !== 'undefined' && yaSalio),
  );
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!viva || !el) return;

    // Con movimiento reducido el CSS ya la esconde (`display: none`) y el 3D
    // no se carga: no hay nada que esperar ni nada que bloquear.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      yaSalio = true;
      return;
    }

    lockScroll();
    let bloqueado = true;
    const soltar = () => {
      if (!bloqueado) return;
      bloqueado = false;
      unlockScroll();
    };

    const barras = Array.from(el.querySelectorAll<HTMLElement>('[data-carga-barra]'));
    const sin3d = () => document.documentElement.hasAttribute(ATRIBUTO_SIN_3D);
    let listo = leerCarga().listo || sin3d();
    let primeraFase = false;
    let saliendo = false;
    const temporizadores: number[] = [];

    const salir = () => {
      if (saliendo) return;
      const tope = performance.now() >= TOPE_MS;
      if (!tope && !(listo && primeraFase)) return;
      saliendo = true;

      // La barra se completa **desde donde esté**, no desde cero: la primera
      // fase es una animación de CSS y aquí se lee su valor y se sigue.
      const finales = barras.map((barra) => {
        const desde = escalaActual(barra);
        barra.style.animation = 'none';
        barra.style.transform = `scaleX(${desde})`;
        return barra.animate(
          [{ transform: `scaleX(${desde})` }, { transform: 'scaleX(1)' }],
          {
            duration: 200 + 500 * (1 - desde),
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'forwards',
          },
        ).finished;
      });

      Promise.all(finales)
        .catch(() => undefined)
        .then(() => {
          el.setAttribute('data-sale', '');
          temporizadores.push(window.setTimeout(soltar, RETRASO_CORTINA_MS));
        });
    };

    const alAvisar = (evento: Event) => {
      const { listo: ya } = (evento as CustomEvent<EstadoCarga>).detail;
      if (ya) {
        listo = true;
        salir();
      }
    };
    window.addEventListener(EVENTO_CARGA, alAvisar);

    const vigia = new MutationObserver(() => {
      if (sin3d()) {
        listo = true;
        salir();
      }
    });
    vigia.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [ATRIBUTO_SIN_3D],
    });

    // La primera fase acaba cuando acaba la animación de CSS de la barra. Si
    // al hidratar ya ha terminado, se da por hecha.
    const primera = barras[0]?.getAnimations()[0];
    if (!primera || primera.playState === 'finished') {
      primeraFase = true;
    } else {
      primera.finished
        .catch(() => undefined)
        .then(() => {
          primeraFase = true;
          salir();
        });
    }

    temporizadores.push(
      window.setTimeout(salir, Math.max(0, TOPE_MS - performance.now()) + 20),
    );

    // Cuando la cortina termina de subir, se quita del todo.
    const alTerminar = (evento: AnimationEvent) => {
      if (evento.target !== el || evento.animationName !== 'carga-sube') return;
      yaSalio = true;
      soltar();
      setViva(false);
    };
    el.addEventListener('animationend', alTerminar);

    salir();

    return () => {
      window.removeEventListener(EVENTO_CARGA, alAvisar);
      el.removeEventListener('animationend', alTerminar);
      vigia.disconnect();
      temporizadores.forEach((id) => window.clearTimeout(id));
      soltar();
    };
  }, [viva]);

  if (!viva) return null;

  return (
    <div ref={raiz} className="carga" aria-hidden="true">
      <div className="flex flex-col items-center px-6 text-center">
        <span className="carga-ante font-display text-[0.7rem] uppercase tracking-[0.3em] text-muted sm:tracking-[0.4em]">
          {t('antetitulo')}
        </span>

        <span className="carga-marca mt-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <Image src="/logo.png" alt="" width={420} height={286} priority className="h-14 w-auto" />
          <span className="flex flex-col items-center leading-none sm:items-start">
            <span className="font-display text-xs uppercase tracking-[0.4em] text-muted">
              Transportes
            </span>
            <span className="mt-2 font-display text-[clamp(1.9rem,5vw,3rem)] uppercase tracking-tight text-ink">
              José María Ibáñez
            </span>
          </span>
        </span>

        {/* La barra: las dos rayas de la tractora. */}
        <span className="carga-pista mt-9 block w-60">
          <span className="block h-[2px] overflow-hidden bg-line">
            <span data-carga-barra className="carga-barra block h-full w-full bg-brand-red" />
          </span>
          <span className="mt-[3px] block h-[5px] overflow-hidden bg-line">
            <span data-carga-barra className="carga-barra block h-full w-full bg-brand-blue" />
          </span>
        </span>
      </div>
    </div>
  );
}
