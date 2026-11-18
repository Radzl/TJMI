import Image from 'next/image';
import type { CSSProperties } from 'react';

/**
 * El fondo de un hueco de foto vacío: un azul de la casa con una luz suave
 * arriba a la izquierda. Lo comparten todos los huecos preparados de la web
 * —este, las cabeceras (`HeaderPhoto`) y los paneles del índice—, para que
 * un sitio a la espera de foto se vea igual en todas partes.
 *
 * Suma de caracteres: no es un hash bueno y no hace falta que lo sea, solo que
 * sea estable y reparta. Se mueve dentro del azul de la casa, sin salirse a
 * tonos que no son de la marca.
 */
export function fondoHueco(seed: string): CSSProperties {
  const sum = Array.from(seed).reduce((total, c) => total + c.charCodeAt(0), 0);
  const tone = 206 + (sum % 5) * 7;
  const light = 22 + (sum % 3) * 6;
  return {
    backgroundColor: `hsl(${tone} 38% ${light}%)`,
    backgroundImage: `radial-gradient(120% 85% at 25% 15%, hsl(${tone} 42% ${light + 14}%) 0%, transparent 65%)`,
  };
}

type Props = {
  /** La portada de verdad, si ya existe. */
  cover?: string;
  /** Para que cada artículo tenga siempre el mismo tono. */
  seed: string;
  /** Qué proporción ocupa el hueco. */
  className?: string;
  sizes?: string;
};

/**
 * El hueco de la portada de un artículo: la foto si la hay, y si no un bloque
 * de color que ocupa exactamente su sitio.
 *
 * Está para **ver cómo va a quedar la página el día que lleguen las fotos**,
 * que es lo que no se podía juzgar con el hueco simplemente ausente: sin nada
 * ahí, el listado se recomponía a otra cosa y no se parecía al resultado final.
 *
 * Tres decisiones:
 *
 * - **No lleva texto ni icono.** Un «foto pendiente» o un icono de imagen rota
 *   se leen como un error el día que esto se publique. Un rectángulo de color
 *   en los tonos de la casa se lee como una decisión, aunque sea provisional.
 * - **El tono sale del propio `slug`**, no al azar: así cada artículo tiene
 *   siempre el mismo y el listado no cambia de colores en cada recarga ni entre
 *   el servidor y el navegador.
 * - **Desaparece solo.** En cuanto un artículo tenga `cover` en
 *   `content/blog.ts`, ese pinta su foto y no hay nada que quitar de aquí.
 */
export default function CoverPlaceholder({
  cover,
  seed,
  className = '',
  sizes = '(max-width: 768px) 100vw, 33vw',
}: Props) {
  if (cover) {
    return (
      <div className={`photo relative overflow-hidden ${className}`}>
        <Image src={cover} alt="" fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
      style={fondoHueco(seed)}
    >
      {/* Filete rojo arriba: es el mismo gesto que llevan las piezas
          destacadas de la web, y basta para que el bloque pertenezca a esta
          página en vez de parecer un hueco sin rellenar. */}
      <span className="absolute inset-x-0 top-0 h-px bg-brand-red" />
    </div>
  );
}
