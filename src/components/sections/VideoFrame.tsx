'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/gsap';

type Props = {
  src: string;
  poster: string;
  /** Qué se ve en el vídeo, para quien no lo ve. */
  label: string;
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
 * ## Lo que no cambió
 *
 * **Va mudo y sin botón de sonido.** Ningún navegador deja reproducir solo con
 * sonido, así que arranca mudo por obligación; que se quede así es decisión.
 * En el vídeo habla alguien a cámara y no hay forma de oírlo: si algún día ese
 * audio importa, lo que toca es llevarlo a un reproductor con controles, no
 * devolver un botón flotante.
 *
 * Y sigue reanudándose solo al volver a la pestaña, porque el navegador lo
 * suspende al perder visibilidad y **no lo recupera por su cuenta**.
 */
export default function VideoFrame({ src, poster, label }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
      if (document.hidden) return;
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
          preload="metadata"
          // Sin recorte: el ancho manda y el alto sale de la proporción del
          // archivo, que es 848 × 480.
          className="block h-auto w-full"
        />

        {/* Zócalo con la librea de la casa. La raya roja va fina y encima, la
            azul más gruesa debajo, como en la puerta de la tractora. */}
        <div className="flex h-12 items-center sm:h-16" aria-hidden="true">
          <div className="ml-6 w-28 sm:ml-10 sm:w-44">
            <span className="block h-[2px] bg-brand-red" />
            <span className="mt-1.5 block h-[7px] bg-brand-blue" />
          </div>
        </div>
      </div>
    </figure>
  );
}
