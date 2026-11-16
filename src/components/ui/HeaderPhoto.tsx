import Image from 'next/image';
import type { CSSProperties } from 'react';

type Props = {
  src: string;
  /**
   * Vacío por defecto: al lado va el titular de la página y la foto lo
   * ilustra, no cuenta otra cosa. Mismo criterio que las fotos de servicio.
   */
  alt?: string;
  /** Encuadre, como `object-position`. Por defecto, centrado. */
  position?: string;
  /** Proporción del recorte. Por defecto 4:3. */
  ratio?: string;
};

/**
 * La foto de la cabecera de las páginas interiores, con el mismo recorte que el
 * vídeo de Nosotros: dos esquinas cortadas en diagonal, arriba a la izquierda y
 * abajo a la derecha, y la muesca de arriba rellena de rojo.
 *
 * **Es la forma de la casa y por eso se repite.** El vídeo ya la estrenó
 * (`VideoFrame.tsx`, donde está explicado de dónde sale); llevándola también en
 * las cabeceras, cada página interior se reconoce como de esta web antes de
 * leer nada. Un rectángulo con esquinas redondeadas es el de cualquier
 * plantilla.
 *
 * El chaflán es más pequeño que el del vídeo porque la foto también lo es: el
 * mismo corte en media columna se comería la esquina.
 *
 * Va con `priority` porque está en la primera pantalla de cada página, y suele
 * ser lo más grande que se pinta en ella.
 */
export default function HeaderPhoto({ src, alt = '', position, ratio = '4 / 3' }: Props) {
  return (
    <figure
      className="relative"
      style={{ '--cut': 'clamp(1.25rem, 3.2vw, 2.75rem)' } as CSSProperties}
    >
      <div
        className="photo relative w-full bg-sand-deep"
        style={{
          aspectRatio: ratio,
          clipPath:
            'polygon(0 var(--cut), var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%)',
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 520px"
          className="object-cover"
          style={position ? { objectPosition: position } : undefined}
        />
      </div>

      {/* La muesca roja, encima de la foto: rellena justo el triángulo que el
          recorte le quita. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 bg-brand-red"
        style={{
          width: 'var(--cut)',
          height: 'var(--cut)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />
    </figure>
  );
}
