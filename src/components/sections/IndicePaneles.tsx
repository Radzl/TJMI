'use client';

import Image from 'next/image';
import { useEffect, useRef, type CSSProperties } from 'react';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { fondoHueco } from '@/components/ui/CoverPlaceholder';
import { Link } from '@/i18n/navigation';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';

export type Panel = {
  id: string;
  href: string;
  nombre: string;
  texto: string;
  cta: string;
  /** La foto; sin ella (`null`) el panel pinta un hueco preparado. */
  foto: string | null;
  posicion?: string;
};

/** Nosotros: va aparte, en una banda con su vídeo debajo de los paneles. */
export type Destacado = {
  href: string;
  nombre: string;
  texto: string;
  cta: string;
  video: string;
};

type Props = {
  titulo: string;
  paneles: Panel[];
  destacado: Destacado;
  ctaPrevio: string;
  cta: string;
  telefono: string;
  telefonoHref: string;
};

/**
 * El índice de la portada: cinco paneles, uno por sección de la web, que se
 * abren de uno en uno.
 *
 * ## Cómo se mueve
 *
 * - **En escritorio la sección se queda fija** mientras bajas, y el scroll va
 *   abriendo los paneles por turnos, de izquierda a derecha. Al pasar el ratón
 *   por uno, se abre ese en vez del que tocaba; al quitarlo, vuelve el del
 *   scroll. Con el teclado igual: el panel que tiene el foco se abre.
 * - **En móvil se apilan**, todos abiertos, sin nada fijo: en una sola columna
 *   no hay ancho que repartir, y fijar la sección solo añadiría scroll.
 * - **Con movimiento reducido** no se fija nada: los paneles quedan en fila
 *   con el primero abierto y el ratón sigue funcionando.
 *
 * ## Por qué casi todo es CSS
 *
 * El JavaScript solo decide **cuál toca por scroll**, y lo escribe como
 * atributo (`data-activo`) sobre cada panel, sin estado de React: cambia
 * decenas de veces por gesto y no debe provocar ni un render. Lo demás —el
 * ancho, la foto que se acerca, el texto que entra, el ratón por encima— lo
 * hace el CSS de `.paneles` en `globals.css` a partir de una sola variable,
 * `--abierto`, que vale 1 en el panel abierto y 0 en los demás.
 *
 * ## Cómo entra, y por qué así
 *
 * Esta sección sube por encima del primer plano del camión, al final de la
 * intro 3D. Entraba como un bloque crema opaco: como el crema es el mismo que
 * el fondo, el corte caía en una línea invisible y el camión parecía borrarse
 * de golpe, con el titular plantado encima. El cliente lo vio «muy de golpe y
 * encima» (2026-11-18), y además incumplía la regla de la casa: los cambios de
 * fondo son fundidos, nunca un bloque opaco entrando.
 *
 * Ahora la entrada va atada al scroll y en dos capas:
 *
 * 1. **El borde está fundido.** El fondo de la sección pasa de transparente a
 *    crema a lo largo de `--fundido` (el 40 % de la pantalla al empezar), así
 *    que el camión se disuelve en el papel en vez de quedar cortado. Ese
 *    fundido **se cierra antes de que entre el contenido**, mientras el borde
 *    sube hasta media pantalla: cuando aparece el titular, el fondo detrás ya
 *    es crema entero y el 3D no asoma.
 * 2. **El contenido entra por orden**: el titular, después los paneles uno
 *    detrás de otro —se descubren de abajo arriba mientras suben— y al final
 *    la línea del presupuesto. Todo acaba cuando la sección llega arriba, que
 *    es cuando el scroll empieza a abrir paneles. En escritorio va en una
 *    sola línea de tiempo; en móvil, donde los paneles van apilados, cada
 *    pieza entra cuando llega a la pantalla.
 *
 * Sin JavaScript o con movimiento reducido no pasa nada de esto: `--fundido`
 * vale 0 en el CSS (fondo opaco, como antes) y el contenido está visible desde
 * el principio.
 *
 * ## Contenido
 *
 * Es deliberadamente poco: el nombre de la sección, una línea y a dónde lleva.
 * El cliente pidió que esto **presente las secciones de la web** y nada más, y
 * que lleve algún botón: el de presupuesto y el teléfono van al pie.
 *
 * **El panel de Nosotros lleva un clip en bucle** en lugar de foto, y los que
 * no tienen foto todavía pintan un hueco preparado en los tonos de la casa
 * (ver `INDEX_PHOTOS` e `INDEX_VIDEO` en `content/media.ts`).
 */
export default function IndicePaneles({
  titulo,
  paneles,
  destacado,
  ctaPrevio,
  cta,
  telefono,
  telefonoHref,
}: Props) {
  const raiz = useRef<HTMLElement>(null);
  const zona = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = raiz.current;
    const zonaFija = zona.current;
    if (!el || !zonaFija) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-panel]'));
    if (!items.length) return;

    let actual = 0;
    const abrir = (indice: number) => {
      if (indice === actual) return;
      actual = indice;
      items.forEach((item, i) => item.setAttribute('data-activo', String(i === indice)));
    };

    // `matchMedia` de GSAP: se monta solo en escritorio y sin movimiento
    // reducido, y se deshace solo al cambiar de tamaño o de preferencia.
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      // Mide solo la zona fija de los paneles: la banda del vídeo y el pie
      // van debajo, en el flujo normal, y no abren nada.
      const disparador = ScrollTrigger.create({
        trigger: zonaFija,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) =>
          abrir(Math.min(items.length - 1, Math.floor(self.progress * items.length))),
      });
      return () => {
        disparador.kill();
        abrir(0);
      };
    });

    // La entrada (ver la cabecera). Solo con movimiento: sin él, el CSS deja
    // el fondo opaco y el contenido visible, que es el estado final.
    const titulo = el.querySelector<HTMLElement>('[data-indice-titulo]');
    const pie = el.querySelector<HTMLElement>('[data-indice-pie]');
    const banda = el.querySelector<HTMLElement>('[data-indice-banda]');
    // La banda del vídeo y el pie entran cada uno al llegar a la pantalla,
    // en los dos tamaños: van debajo de la zona fija, fuera de su recorrido.
    const sueltas = [banda, pie].filter((pieza): pieza is HTMLElement => pieza !== null);
    const fundidoInicial = () => `${Math.round(window.innerHeight * 0.4)}px`;
    // Los paneles se descubren de abajo arriba. El recorte va unos píxeles por
    // fuera de la caja (`-8px`) para no comerse el contorno del foco, que
    // sobresale del panel; y todo en píxeles, porque GSAP no interpola bien
    // entre unidades distintas.
    const cerrado = 'inset(640px -8px -8px -8px round 22px)';
    const abierto = 'inset(-8px -8px -8px -8px round 22px)';

    const entrada = gsap.matchMedia();
    entrada.add(
      {
        escritorio: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        movil: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
      },
      (contexto) => {
        const { escritorio } = contexto.conditions as { escritorio: boolean };

        // **El estado de partida se pone aquí, de una vez y para todos.** Con
        // `fromTo` en cascada dentro de una línea de tiempo atada al scroll,
        // GSAP solo colocaba en su sitio de partida al primer panel: los otros
        // cuatro seguían visibles hasta que les llegaba el turno, así que se
        // descubrían en un orden que no era. Medido leyendo el estilo de cada
        // panel a media entrada.
        if (titulo) gsap.set(titulo, { autoAlpha: 0, y: 36 });
        if (pie) gsap.set(pie, { autoAlpha: 0, y: 16 });
        if (banda) gsap.set(banda, { y: 40, clipPath: cerrado });
        gsap.set(items, { y: escritorio ? 48 : 40, clipPath: cerrado });

        // La banda se descubre como los paneles y el pie se funde, cada uno
        // con su disparador.
        sueltas.forEach((pieza) => {
          const esBanda = pieza === banda;
          gsap.to(pieza, {
            ...(esBanda ? { y: 0, clipPath: abierto } : { autoAlpha: 1, y: 0 }),
            ease: 'power3.out',
            scrollTrigger: { trigger: pieza, start: 'top 90%', end: 'top 60%', scrub: 1 },
          });
        });

        // El fundido y el titular van atados a la sección entera, de que asoma
        // por abajo a que su borde llega arriba (que es cuando empieza a
        // abrir paneles). La línea de tiempo dura 1, así que cada número es
        // una fracción de ese recorrido.
        //
        // **El orden es lo que importa**: primero se cierra el fundido —el
        // borde de la sección sube hasta media pantalla disolviendo el
        // camión— y **solo entonces** entra el titular. Entraba a la vez y
        // quedaba escrito encima del rótulo del camión, a medio disolver.
        const borde = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'top top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        // El fundido va con `fromTo` y no con `set` + `to`: la variable CSS
        // no guardaba su valor de partida y el borde salía opaco desde el
        // primer píxel (medido: `--fundido` a 0 con la sección a media
        // entrada). El valor de partida es una función para que se recalcule
        // al cambiar el alto de la ventana.
        borde.fromTo(
          el,
          { '--fundido': fundidoInicial },
          { '--fundido': '0px', ease: 'none', duration: 0.65, immediateRender: true },
          0,
        );
        // El titular queda unos 70 px por debajo del borde: en 0,6 el fundido
        // ya mide menos que eso, así que entra sobre crema entero.
        if (titulo) borde.to(titulo, { autoAlpha: 1, y: 0, duration: 0.24 }, 0.6);

        if (escritorio) {
          // En fila: los cuatro paneles en cascada, de izquierda a derecha.
          // Acaba en 1, cuando la sección llega arriba.
          borde.to(
            items,
            { y: 0, clipPath: abierto, ease: 'power3.out', duration: 0.24, stagger: 0.04 },
            0.66,
          );
          return;
        }

        // Apilados. **El primer panel va en la misma línea de tiempo que el
        // titular, justo detrás**: con su propio disparador llegaba a la
        // pantalla antes de que el titular hubiera entrado, y se veía un panel
        // suelto sobre el crema sin saber de qué iba. Los demás entran cada
        // uno cuando llega a la pantalla.
        const [primero, ...resto] = items;
        if (primero) {
          borde.to(primero, { y: 0, clipPath: abierto, ease: 'power3.out', duration: 0.26 }, 0.74);
        }
        resto.forEach((pieza) => {
          gsap.to(pieza, {
            y: 0,
            clipPath: abierto,
            ease: 'power3.out',
            // Empiezan con el borde ya en la parte baja de la pantalla y no
            // nada más asomar: asomando, el segundo panel entraba antes que el
            // primero, que va atado al titular.
            scrollTrigger: {
              trigger: pieza,
              start: 'top 78%',
              end: 'top 52%',
              scrub: 1,
            },
          });
        });
      },
    );

    // El clip de Nosotros: no se pide hasta que la sección se acerca a la
    // pantalla, y se pausa cuando sale. Con movimiento reducido se queda en su
    // primer fotograma, sin reproducirse.
    const videos = Array.from(el.querySelectorAll<HTMLVideoElement>('video[data-src]'));
    const quieto = prefersReducedMotion();
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          videos.forEach((video) => {
            if (e.isIntersecting) {
              if (!video.src) {
                video.src = video.dataset.src ?? '';
                video.preload = quieto ? 'metadata' : 'auto';
              }
              // React no siempre refleja `muted`, y sin él no hay reproducción
              // automática.
              video.muted = true;
              if (!quieto) video.play().catch(() => {});
            } else if (window.innerHeight > 0) {
              video.pause();
            }
          });
        });
      },
      { rootMargin: '50% 0px' },
    );
    if (videos.length) observador.observe(el);

    return () => {
      mm.revert();
      entrada.revert();
      observador.disconnect();
    };
  }, []);

  return (
    <section ref={raiz} data-bg="night" className="tema-noche indice-fondo relative z-10">
      {/* La zona fija: en escritorio el titular y los cuatro paneles se quedan
          en pantalla mientras el scroll los abre por turnos. Mide 200svh
          (eran 240 con cinco paneles) para que cada uno dure lo mismo. */}
      <div ref={zona} className="lg:min-h-[200svh] lg:motion-reduce:min-h-0">
      <div className="pt-20 lg:sticky lg:top-20 lg:flex lg:h-[calc(100svh-5rem)] lg:items-center lg:py-8 lg:motion-reduce:static lg:motion-reduce:h-auto lg:motion-reduce:pt-24 lg:motion-reduce:pb-0">
        <Container className="w-full">
          <h2 data-indice-titulo className="font-display text-display-md uppercase text-ink">
            {titulo}
          </h2>

          <ul className="paneles mt-10 lg:mt-12">
            {paneles.map((panel, i) => (
              <li key={panel.id} data-panel={i} data-activo={String(i === 0)}>
                <Link href={panel.href} className="panel">
                  {/* El revelado común (`.photo`) va en un envoltorio propio:
                      esa clase fija su posición y anularía la del panel. */}
                  <span className="panel-foto" aria-hidden="true">
                    {panel.foto ? (
                      <span className="photo block h-full w-full">
                        <Image
                          src={panel.foto}
                          alt=""
                          fill
                          sizes="(max-width: 1024px) 100vw, 560px"
                          className="object-cover"
                          style={panel.posicion ? { objectPosition: panel.posicion } : undefined}
                        />
                      </span>
                    ) : (
                      // Hueco preparado: los tonos de la casa hasta que llegue
                      // la foto.
                      <span className="block h-full w-full" style={fondoHueco(panel.id)} />
                    )}
                  </span>
                  <span className="panel-sombra" aria-hidden="true" />

                  {/* El lomo: el nombre en vertical, que es lo que se ve del
                      panel cuando está cerrado. Va oculto para los lectores de
                      pantalla porque el mismo nombre ya está en el cuerpo. */}
                  <span className="panel-lomo" aria-hidden="true">
                    {panel.nombre}
                  </span>

                  <span className="panel-cuerpo">
                    <span className="font-display text-display-sm uppercase">{panel.nombre}</span>
                    <span className="max-w-sm text-base leading-relaxed text-white/80">
                      {panel.texto}
                    </span>
                    <span className="panel-cta mt-3 font-display text-sm uppercase tracking-widest">
                      {panel.cta}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
      </div>

      <Container className="pb-20 pt-3 lg:pt-0">
        {/* **Nosotros va aparte, en una banda panorámica con su vídeo**, y lo
            pidió el cliente (2026-11-18): es un vídeo, no una foto, y metido
            como un panel más se abría y se cerraba como los otros y casi no
            se veía. Aquí se reproduce entero, a todo el ancho, con el nombre,
            una línea y el enlace encima sobre un degradado.

            El clip va sin `src` en el HTML: lo pone el observador cuando la
            sección se acerca, para que no viaje con la carga de la portada. */}
        <Link
          href={destacado.href}
          data-indice-banda
          className="group relative block overflow-hidden rounded-2xl bg-night sm:aspect-[21/9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
        >
          {/* El vídeo. En móvil es la parte de arriba de la tarjeta y el texto
              va debajo, sobre azul noche: superpuesto en una banda de 200 px
              de alto, el texto ocupaba casi todo y se leía mal sobre el cielo
              claro del clip. De `sm` para arriba va a todo el fondo.

              `.photo` va en un envoltorio interior: esa clase fija
              `position: relative` y anulaba el `absolute`, así que el vídeo se
              quedaba sin alto y la banda salía en azul liso aunque se
              estuviera reproduciendo. Es la misma trampa que en los paneles. */}
          <span className="relative block aspect-[16/10] sm:absolute sm:inset-0 sm:aspect-auto" aria-hidden="true">
            <span className="photo block h-full w-full">
              <video
                data-src={destacado.video}
                muted
                loop
                playsInline
                preload="none"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-casa group-hover:scale-[1.03]"
              />
            </span>
            {/* El degradado, solo donde el texto va encima: desde la
                izquierda, que es donde está el texto. */}
            <span className="absolute inset-0 hidden bg-gradient-to-r from-night/85 via-night/35 to-transparent sm:block" />
          </span>
          <span className="relative flex flex-col gap-2 p-6 text-white sm:absolute sm:inset-y-0 sm:left-0 sm:max-w-md sm:justify-end sm:p-10">
            <span className="font-display text-display-sm uppercase">{destacado.nombre}</span>
            <span className="text-base leading-relaxed text-white/85">{destacado.texto}</span>
            <span className="panel-cta mt-3 font-display text-sm uppercase tracking-widest" style={{ '--abierto': 1 } as CSSProperties}>
              {destacado.cta}
            </span>
          </span>
        </Link>

        {/* El botón y el teléfono, al pie. El teléfono va al lado y no
            debajo: quien no quiere rellenar nada quiere llamar. */}
        <div data-indice-pie className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-10">
          <span className="text-base text-muted">{ctaPrevio}</span>
          <Button href="/contacto" variant="accent">
            {cta}
          </Button>
          <a
            href={`tel:${telefonoHref}`}
            className="font-display text-lg tracking-tight text-azul-texto transition-colors hover:text-brand-red-ink"
          >
            {telefono}
          </a>
        </div>
      </Container>
    </section>
  );
}
