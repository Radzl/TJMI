'use client';

import { Instance, Instances } from '@react-three/drei';
import { useMemo } from 'react';
import { CanvasTexture } from 'three';

/**
 * Sombras de contacto: la mancha oscura justo donde algo toca el suelo.
 *
 * ## Por qué hace falta, y por qué la sombra que ya hay no basta
 *
 * La escena tiene sombras reales, proyectadas por la luz principal. Pero esa
 * luz va **rasante** —unos 29° sobre el suelo, para que las sombras sean
 * largas y estructuren el patio—, así que la sombra de cada objeto se tira
 * lejos, a un lado. **Justo debajo, en el punto de apoyo, no queda nada.** Y
 * eso es exactamente lo que hace que un objeto se lea como pegado encima del
 * suelo en vez de apoyado en él.
 *
 * El otro motivo es la resolución: el mapa de sombras cubre todo el patio con
 * 2048 píxeles, así que el contacto —que son centímetros— cae por debajo de lo
 * que puede resolver. Es un problema de escala, no de ajuste.
 *
 * ## Qué es y qué no es
 *
 * **No es un truco de dibujo animado.** No es un óvalo negro debajo del
 * personaje: es oclusión ambiental puesta a mano donde se sabe que la hay.
 * Por eso va **muy suave y muy ceñida**: el borde se desvanece antes de
 * sobresalir del objeto, así que lo que se ve no es una mancha sino que el
 * suelo se oscurece al acercarse al apoyo. Si se nota como forma propia, está
 * mal puesta.
 *
 * ## Decisiones de montaje
 *
 * - **Va instanciada.** Hay una por torre de contenedores, una por pila de
 *   palés y una bajo el camión: con una malla cada una serían otras veinte
 *   llamadas de dibujo, que es justo lo que se acaba de quitar de la escena.
 * - **La textura se genera aquí**, en un lienzo, como la piel de la lona. Nada
 *   de descargar una imagen: sería una petición de más para 8 kB de degradado.
 * - **`depthWrite` apagado**: son planos tumbados sobre otro plano y no deben
 *   escribir profundidad, o se pelean con lo que venga después.
 * - **Y llevan el `polygonOffset` más adelantado del suelo.** Ya hay dos capas
 *   antes —el pavimento a −1 y la pintura del carril a −3—, así que estas van a
 *   −5. Si añades otra capa al suelo, dale la suya y más adelantada todavía.
 * - **`frustumCulled={false}`**, como todo lo instanciado de esta escena: la
 *   esfera envolvente sale de la geometría base, que está en el origen, no de
 *   dónde acaban las instancias.
 */

/** Un punto de apoyo: dónde está y cuánto mide su huella, en metros. */
export type Contacto = {
  x: number;
  z: number;
  /** Ancho de la huella. Va un pelo mayor que el objeto, no mucho. */
  width: number;
  depth: number;
  /** Giro en el plano del suelo, para lo que no está en rejilla. */
  rotation?: number;
};

/**
 * El degradado de la huella.
 *
 * Las paradas no son lineales a propósito: la mitad central va casi opaca y el
 * desvanecido se concentra en el último tercio. Un degradado lineal se lee como
 * un foco difuso; este se lee como suelo que se oscurece al llegar al apoyo.
 */
function crearTextura() {
  const lado = 128;
  const canvas = document.createElement('canvas');
  canvas.width = lado;
  canvas.height = lado;

  const cx = canvas.getContext('2d');
  if (!cx) return null;

  const grad = cx.createRadialGradient(
    lado / 2,
    lado / 2,
    0,
    lado / 2,
    lado / 2,
    lado / 2,
  );
  // **El degradado va en blanco y negro, no en alfa, y esto costó una
  // pasada.** `alphaMap` de three **lee el canal verde**, no el alfa de la
  // imagen. Pintado en negro con alfa variable —que es lo intuitivo— el verde
  // salía 0 en todo el lienzo, así que la máscara valía cero y la sombra era
  // completamente invisible: se midió y solo 7 píxeles del suelo cambiaban
  // más de seis niveles en toda la escena. En luminancia sí funciona: blanco
  // es opaco y negro es transparente.
  grad.addColorStop(0, 'rgb(255,255,255)');
  grad.addColorStop(0.38, 'rgb(209,209,209)');
  grad.addColorStop(0.68, 'rgb(77,77,77)');
  grad.addColorStop(1, 'rgb(0,0,0)');

  cx.fillStyle = grad;
  cx.fillRect(0, 0, lado, lado);

  const textura = new CanvasTexture(canvas);
  textura.needsUpdate = true;
  return textura;
}

export default function ContactShadow({
  puntos,
  /**
   * Cuánto oscurece, de 0 a 1. Por defecto bajo: con el suelo crema de este
   * patio, por encima de 0,3 deja de leerse como oclusión y empieza a leerse
   * como una pegatina gris.
   */
  fuerza = 0.26,
  /** Altura sobre el suelo. Un centímetro, lo justo para no coplanar. */
  y = 0.035,
}: {
  puntos: Contacto[];
  fuerza?: number;
  y?: number;
}) {
  const textura = useMemo(() => crearTextura(), []);
  const n = puntos.length;

  if (!textura || n === 0) return null;

  return (
    <Instances limit={n} range={n} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#1d2430"
        alphaMap={textura}
        transparent
        opacity={fuerza}
        depthWrite={false}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-5}
        polygonOffsetUnits={-5}
      />
      {puntos.map((p, i) => (
        <Instance
          key={i}
          position={[p.x, y, p.z]}
          rotation={[-Math.PI / 2, 0, p.rotation ?? 0]}
          scale={[p.width, p.depth, 1]}
        />
      ))}
    </Instances>
  );
}
