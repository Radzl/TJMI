'use client';

import { Play } from 'lucide-react';
import { useRef, useState } from 'react';

type Props = {
  src: string;
  poster: string;
  label: string;
  playLabel: string;
};

/**
 * Reproductor para el vídeo corporativo.
 *
 * Va con póster y botón de play, no en bucle automático: en el vídeo habla
 * alguien a cámara, así que reproducirlo mudo y en bucle no tendría sentido.
 * Además así no se descargan casi 6 MB a quien no va a verlo.
 */
export default function BrandVideo({ src, poster, label, playLabel }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    const video = ref.current;
    if (!video) return;

    video.src = src;
    setStarted(true);
    video.play().catch(() => {
      // Si el navegador lo bloquea, quedan los controles para darle a play.
    });
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={ref}
        poster={poster}
        aria-label={label}
        controls={started}
        playsInline
        preload="none"
        className="h-full w-full object-cover"
      />

      {!started && (
        <button
          type="button"
          onClick={start}
          aria-label={playLabel}
          className="group absolute inset-0 grid place-items-center bg-night/25 transition-colors hover:bg-night/15"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-brand-blue shadow-lg transition-transform group-hover:scale-105">
            <Play className="ml-1 h-8 w-8" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
