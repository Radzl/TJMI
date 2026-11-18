'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/gsap';

type Props = {
  src: string;
  poster: string;
  /** Qué se ve en el vídeo, para quien no lo ve. */
  label: string;
  /**
   * El texto del botón que lo pone desde el principio y con sonido. Sin él no
   * hay botón: es lo que pasa mientras el archivo no tenga pista de audio (ver
   * `VIDEO_CON_AUDIO` en `content/media.ts`).
   */
  soundLabel?: string;
};

/**
 * El vídeo corporativo de la página Nosotros, montado en su marco.
 *
 * ## Qué cambió, y qué se gana
 *
 * Antes esto era `VideoHero`: el vídeo a sangre y a pantalla casi completa,
 * con el titular de la página encima. Ahora el titular va antes, en la misma
 * cabecera que el resto de páginas interiores, y el vídeo viene debajo
 * enmarcado. Lo pidió el cliente y resuelve de paso tres cosas que estaban
 * anotadas como el precio de aquella decisión:
 *
 *  - **Deja de recortarse.** A pantalla completa hacía falta `object-cover` y
 *    eso se comía los bordes del plano. Aquí se ve entero, con su proporción.
 *  - **Se ve mejor.** El archivo mide 848 px de ancho. A 1920 de ventana se
 *    estaba ampliando 2,26 veces; dentro del `Container` se queda en 1,26, y
 *    la diferencia se nota. (El arreglo de verdad sigue siendo pedirle al
 *    cliente el original en 1080p.)
 *  - **Nada de texto encima.** Ya no hay velo degradado tapando el tercio
 *    inferior por si cae letra ahí.
 *
 * ## El marco
 *
 * No es un rectángulo, y la forma no es un capricho: está sacada del camión.
 *
 *  - **Dos esquinas cortadas en diagonal**, la de arriba a la izquierda y la
 *    de abajo a la derecha. Van en esquinas opuestas a propósito: así la
 *    figura queda simétrica respecto al centro y se lee como una forma, no
 *    como un fallo de recorte en una esquina suelta.
 *  - **La muesca de arriba va en rojo**, rellenando exactamente el triángulo
 *    que se le quita al vídeo. Es el único sitio de la página donde el rojo
 *    aparece macizo, que es como la marca lo quiere: en acento y pequeño.
 *  - **Abajo, un zócalo azul noche con las dos rayas de la casa**, roja fina
 *    sobre azul gruesa, las mismas que lleva la puerta de la tractora de
 *    verdad (ver `public/media/camion-02.jpg`). El corte de abajo a la derecha
 *    atraviesa ese zócalo, y eso es lo que ata los dos cortes: se ve que la
 *    diagonal corta algo, así que se lee como decisión y no como un borde
 *    redondeado raro.
 *
 * El tamaño del corte va en una variable (`--cut`) con `clamp`, y no por
 * puntos de corte: un chaflán fijo de 72 px es un detalle en escritorio y se
 * come la esquina entera en un móvil de 390.
 *
 * ## El sonido
 *
 * **Arranca mudo por obligación**: ningún navegador deja reproducir solo con
 * sonido. Durante un tiempo se quedó así y sin forma de oírlo, y en el vídeo
 * habla alguien a cámara.
 *
 * **Ahora hay un «Ver con sonido» en el zócalo**, y no es un botón flotante
 * que quita y pone el volumen, que es lo que estaba descartado. Lo que hace es
 * convertir el fondo en un reproductor: vuelve al principio, suena, deja de
 * repetirse y enseña los controles del navegador (pausa, volumen, pantalla
 * completa). Quien lo pulsa quiere *ver el vídeo*, no un fondo con sonido, y
 * desde ahí manda él: el vídeo ya no se reanuda solo al volver a la pestaña ni
 * al volver a entrar en pantalla, porque eso le pisaría la pausa.
 *
 * **Hoy el botón no sale**, porque el archivo que se sirve no tiene pista de
 * sonido: ver `VIDEO_CON_AUDIO` en `content/media.ts`. Está probado con el
 * mismo archivo (quita el silencio, saca los controles, deja de repetirse y
 * pasa el foco al vídeo); lo único que falta es audio que oír.
 *
 * Mientras siga de fondo, se reanuda solo al volver a la pestaña, porque el
 * navegador lo suspende al perder visibilidad y **no lo recupera por su
 * cuenta**.
 */
export default function VideoFrame({ src, poster, label, soundLabel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Leído desde los escuchadores, que se montan una vez: por eso va en una ref
  // además de en el estado, que es lo que pinta los controles.
  const conSonidoRef = useRef(false);
  const [conSonido, setConSonido] = useState(false);

  const verConSonido = () => {
    const video = videoRef.current;
    if (!video) return;
    conSonidoRef.current = true;
    setConSonido(true);
    video.loop = false;
    video.currentTime = 0;
    video.muted = false;
    video.play().catch(() => {
      // Si el navegador no deja, quedan los controles para darle a mano.
    });
  };

  // Al pulsar, el botón se va y aparecen los controles: el foco no puede
  // quedarse en un elemento que ya no existe, así que pasa al vídeo, que con
  // controles sí se puede manejar con el teclado.
  useEffect(() => {
    if (conSonido) videoRef.current?.focus();
  }, [conSonido]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React no siempre refleja `muted` en el elemento, y sin él el navegador
    // bloquea la reproducción automática.
    video.muted = true;

    if (prefersReducedMotion()) return;
    video.play().catch(() => {
      // Si aun así lo bloquea, queda el póster.
    });
  }, []);

  // Se pausa fuera de pantalla y se reanuda al volver a la pestaña. Lo de
  // pausar lleva una comprobación que parece de más y no lo es: con la ventana
  // minimizada o tapada el navegador informa de área cero, así que «nada
  // intersecta», y sin ella el vídeo se quedaba parado para siempre.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion()) return;

    const resume = () => {
      // Con sonido manda quien lo está viendo: reanudarlo aquí le pisaría la
      // pausa que haya puesto él.
      if (document.hidden || conSonidoRef.current) return;
      video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            resume();
            return;
          }
          if (entry.intersectionRatio === 0 && window.innerHeight > 0) {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.15] },
    );

    observer.observe(video);
    document.addEventListener('visibilitychange', resume);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', resume);
    };
  }, []);

  return (
    <figure
      className="relative"
      style={
        {
          // El chaflán, en una sola variable: la usan el recorte del marco y
          // el triángulo rojo, y si se desincronizan se ve el escalón.
          '--cut': 'clamp(1.75rem, 5vw, 4.5rem)',
        } as React.CSSProperties
      }
    >
      {/* La muesca roja. Rellena justo el triángulo que el recorte le quita al
          marco, así que el hueco no enseña el papel de la página: enseña rojo. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 bg-brand-red"
        style={{
          width: 'var(--cut)',
          height: 'var(--cut)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />

      <div
        className="relative bg-night"
        style={{
          clipPath:
            'polygon(0 var(--cut), var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%)',
        }}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          aria-label={label}
          autoPlay
          loop
          muted
          playsInline
          controls={conSonido}
          preload="metadata"
          // Sin recorte: el ancho manda y el alto sale de la proporción del
          // archivo, que es 848 × 480.
          className="block h-auto w-full"
        />

        {/* Zócalo con la librea de la casa. La raya roja va fina y encima, la
            azul más gruesa debajo, como en la puerta de la tractora. */}
        <div className="flex h-12 items-center justify-between gap-4 sm:h-16">
          <div className="ml-6 w-28 shrink-0 sm:ml-10 sm:w-44" aria-hidden="true">
            <span className="block h-[2px] bg-brand-red" />
            <span className="mt-1.5 block h-[7px] bg-brand-blue" />
          </div>

          {/* El botón va en el zócalo y no encima del vídeo: así no tapa el
              plano y queda dentro de la librea. El margen derecho deja libre
              el chaflán, que corta justo esa esquina. Cuando ya suena se va,
              porque desde ahí mandan los controles del propio vídeo. */}
          {soundLabel && !conSonido && (
            <button
              type="button"
              onClick={verConSonido}
              className="group flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-medium uppercase tracking-[0.14em] text-white/85 transition-colors duration-[160ms] ease-casa hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ marginRight: 'calc(var(--cut) + 0.5rem)' }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none" />
                <path d="M15.5 9a4 4 0 0 1 0 6" />
                <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />
              </svg>
              {soundLabel}
            </button>
          )}
        </div>
      </div>
    </figure>
  );
}
