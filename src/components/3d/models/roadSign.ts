'use client';

import { CanvasTexture, SRGBColorSpace } from 'three';

/**
 * El cartel de dirección de la carretera, pintado en un lienzo.
 *
 * Se genera aquí, como la piel de la lona, y por el mismo motivo: es un
 * puñado de kilobytes de degradado y texto, y traerlo de fuera sería una
 * petición a un tercero para algo que sabemos dibujar.
 *
 * ## Las medidas salen de un cartel de verdad
 *
 * Un cartel de dirección de autovía española mide del orden de **7 × 3,2 m**,
 * fondo azul, filete blanco por dentro del borde y el destino en mayúsculas.
 * No es un detalle de maqueta: a 16 píxeles por metro, que es lo que da el
 * encuadre cenital en escritorio, eso son 112 × 51 px en pantalla y la palabra
 * sale con unos 20 px de altura de mayúscula. Un cartel «a escala de juguete»
 * habría salido ilegible, que es justo lo contrario de lo que se busca.
 *
 * ## El azul no es el de la marca, y es a propósito
 *
 * El corporativo (`#34548a`) es más apagado y más violáceo que el de una
 * señal; puesto aquí, el cartel dejaba de leerse como señal de tráfico y
 * pasaba a leerse como un panel de la empresa plantado en el arcén. Este está
 * entre el azul de señal y el de la casa: se reconoce como lo que es sin
 * salirse de la paleta.
 */
const PANEL = { width: 7, height: 3.2 };
const ESCALA = 146; // píxeles por metro en el lienzo

/** Dibuja un rectángulo de esquinas redondeadas. */
function caja(
  cx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  cx.beginPath();
  cx.moveTo(x + r, y);
  cx.arcTo(x + w, y, x + w, y + h, r);
  cx.arcTo(x + w, y + h, x, y + h, r);
  cx.arcTo(x, y + h, x, y, r);
  cx.arcTo(x, y, x + w, y, r);
  cx.closePath();
}

export function roadSignTexture(destino: string, via: string) {
  const w = Math.round(PANEL.width * ESCALA);
  const h = Math.round(PANEL.height * ESCALA);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const cx = canvas.getContext('2d');
  if (!cx) return null;

  // Fondo. Lleva un degradado vertical muy leve: un azul liso se lee como un
  // rectángulo de color, y lo que se busca es una chapa.
  const fondo = cx.createLinearGradient(0, 0, 0, h);
  fondo.addColorStop(0, '#255a9c');
  fondo.addColorStop(1, '#1b4680');
  cx.fillStyle = fondo;
  caja(cx, 0, 0, w, h, h * 0.055);
  cx.fill();

  // Filete blanco por dentro del borde, como los de verdad.
  cx.strokeStyle = '#f6f4f1';
  cx.lineWidth = h * 0.035;
  caja(cx, h * 0.085, h * 0.085, w - h * 0.17, h - h * 0.17, h * 0.04);
  cx.stroke();

  // El destino. Se condensa a mano con un escalado horizontal en vez de
  // pedir una tipografía estrecha: dentro de un lienzo no hay garantía de que
  // la fuente de la página esté cargada, y una sustitución silenciosa aquí
  // dejaría el cartel con otra letra sin avisar de nada.
  cx.save();
  cx.translate(w / 2, h * 0.46);
  cx.scale(0.88, 1);
  cx.fillStyle = '#f6f4f1';
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.font = `700 ${Math.round(h * 0.34)}px Arial, Helvetica, sans-serif`;
  cx.letterSpacing = `${Math.round(h * 0.012)}px`;
  cx.fillText(destino.toUpperCase(), 0, 0);
  cx.restore();

  // El identificador de la vía, abajo a la izquierda y pequeño.
  cx.save();
  cx.fillStyle = '#f6f4f1';
  cx.textAlign = 'left';
  cx.textBaseline = 'alphabetic';
  cx.font = `700 ${Math.round(h * 0.15)}px Arial, Helvetica, sans-serif`;
  cx.fillText(via, h * 0.2, h * 0.86);
  cx.restore();

  const textura = new CanvasTexture(canvas);
  textura.colorSpace = SRGBColorSpace;
  textura.anisotropy = 8;
  textura.needsUpdate = true;

  return { textura, width: PANEL.width, height: PANEL.height };
}
