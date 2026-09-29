'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

type Props = {
  src: string;
  poster: string;
  title: string;
  intro: string;
  label: string;
  soundOn: string;
  soundOff: string;
};

/**
 * Portada de Nosotros: el vídeo corporativo ocupando la pantalla y sonando
 * desde el primer momento.
 *
 * Arranca mudo porque ningún navegador deja reproducir solo con sonido, y
 * como en el vídeo habla alguien a cámara se deja un botón para activarlo.
 * Al bajar, el vídeo se queda algo retrasado respecto al scroll y el
 * contenido sube por encima: de ahí la sensación de profundidad.
 */
export default function VideoHero({
  src,
  poster,
  title,
  intro,
  label,
  soundOn,
  soundOff,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React no siempre refleja `muted` en el elemento, y sin él el navegador
    // bloquea la reproducción automática.
    video.muted = true;

    if (prefersReducedMotion()) return;
    video.play().catch(() => {
      // Si aun así lo bloquea, queda el póster de fondo.
    });
  }, []);

  useEffect(() => {
    const media = mediaRef.current;
    const section = sectionRef.current;
    if (!media || !section || prefersReducedMotion()) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        // El vídeo se queda atrás: se mueve a menos de la mitad que la página.
        media.style.transform = `translate3d(0, ${self.progress * 18}%, 0)`;
      },
    });

    return () => {
      trigger.kill();
      media.style.transform = '';
    };
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    if (!next) video.play().catch(() => {});
  };

  // En móvil la portada no llega a pantalla completa: ahí el vídeo se ve muy
  // recortado y ocuparlo todo se come la página sin aportar nada.
  return (
    <section
      ref={sectionRef}
      className="relative flex h-[62svh] min-h-[20rem] items-end overflow-hidden bg-night sm:h-[74svh] lg:h-[88svh]"
    >
      <div ref={mediaRef} className="absolute inset-0 will-change-transform">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          aria-label={label}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Sin este velo el titular blanco no se sostiene sobre las partes
          claras del vídeo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-night via-night/65 to-night/25"
      />

      <div className="relative w-full pb-20">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
          <h1 className="max-w-4xl font-display text-4xl uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/75">
            {intro}
          </p>

          <button
            type="button"
            onClick={toggleSound}
            className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/30 px-6 py-3 font-display text-xs uppercase tracking-widest text-white transition-colors hover:border-white hover:bg-white hover:text-night"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
            {muted ? soundOn : soundOff}
          </button>
        </div>
      </div>
    </section>
  );
}
