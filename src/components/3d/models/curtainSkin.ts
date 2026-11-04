'use client';

import { CanvasTexture, SRGBColorSpace } from 'three';

/**
 * La piel de la lona: color, rótulo y relieve, todo generado aquí.
 *
 * Son **dos texturas que salen del mismo campo de pliegues**:
 *  - el color (azul, pliegues y rótulo),
 *  - y un **mapa de normales**.
 *
 * El mapa de normales es lo que da profundidad de verdad. Pintar sombras en la
 * textura solo simula el relieve desde una posición de luz concreta; con las
 * normales, cada pliegue **reacciona a la luz de la escena**: se ilumina por
 * la cara que mira a la luz y se apaga por la otra, y cambia cuando el camión
 * se mueve. Es la diferencia entre una tela dibujada y una tela.
 *
 * El rótulo también entra en el relieve: el vinilo está pegado encima y pisa
 * muy poco, pero lo justo para coger un filo de luz. Eso, más el canto oscuro,
 * es lo que lo despega de parecer escrito sobre la imagen.
 *
 * Que el rótulo viva **dentro de la textura** y no en un plano aparte es la
 * otra mitad del asunto: antes era un material sin iluminar sobre una lona que
 * sí recibe luz, así que iba siempre a brillo máximo mientras la tela se
 * sombreaba.
 *
 * Se dibuja en `<canvas>` en el navegador y no se carga ninguna imagen: el
 * texto sale con la tipografía de la web, se cambia desde aquí sin abrir un
 * editor y no hay ni una petición más. La fuente la sirve `next/font` desde
 * nuestro dominio, así que tampoco es un tercero.
 */

const TEXT = 'José María Ibáñez';

/** El lienzo cubre la lona entera, de la cola al morro. */
const WIDTH = 2048;
const HEIGHT = 380;
/**
 * El relieve va a la mitad de resolución: es información de baja frecuencia y
 * calcular las normales a tamaño completo cuesta cuatro veces más.
 */
const RELIEF = 2;

const BLUE = '#1764c2';
/** El rojo del vinilo real: oscuro y saturado, no un rojo de aviso. */
const RED = '#c2171b';
/** Y el canto del vinilo, que es lo que le da el grosor. */
const RED_EDGE = '#650d10';

/** Cuánto del largo de la lona ocupa el rótulo. Medido sobre la foto. */
const TEXT_FILL = 0.6;
/** Altura a la que cae el centro del rótulo. También de la foto. */
const TEXT_MIDDLE = 0.52;
/**
 * Y dónde cae a lo largo. En la foto está centrado; aquí va un pelo corrido
 * hacia la cola, y es a propósito: por ahí pasa la junta entre la mitad fija y
 * la corredera, y con el rótulo centrado del todo el pliegue partía "María"
 * por la mitad al abrirse. Corrido, el corte cae en el hueco entre palabras y
 * lo que queda a la vista es "Ibáñez", que se lee como un apellido y no como
 * un error. Cerrado, que es como se ve casi siempre, el metro de diferencia no
 * se aprecia.
 */
const TEXT_CENTRE = 0.405;
/**
 * Inclinación del rótulo. Es una cursiva mínima y hecha a mano, no la de la
 * tipografía: una oblicua corta es lo que llevan los rótulos de camión, y
 * además rompe la verticalidad de los pliegues, así que las letras dejan de
 * leerse como pegadas encima de las bandas.
 */
const SLANT = 0.1;
/** Hasta dónde sobresale el canto oscuro, en píxeles del lienzo. */
const EXTRUDE = 8;

/**
 * Los pliegues de la lona: dónde cae cada uno, cuánto ocupa y cuánto marca.
 * Van a mano y sin ritmo, que es como cae una lona de verdad, y siempre los
 * mismos para que la textura no cambie entre recargas. Unos pocos marcados y
 * el resto flojos: una tela tensada tiene dos o tres dobleces de verdad y
 * mucha ondulación suave.
 */
const FOLDS = [
  { at: 0.04, width: 0.028, depth: 0.55 },
  { at: 0.11, width: 0.05, depth: 0.3 },
  { at: 0.19, width: 0.022, depth: 0.85 },
  { at: 0.26, width: 0.055, depth: 0.25 },
  { at: 0.34, width: 0.03, depth: 0.6 },
  { at: 0.43, width: 0.06, depth: 0.22 },
  { at: 0.5, width: 0.024, depth: 0.9 },
  { at: 0.58, width: 0.05, depth: 0.28 },
  { at: 0.66, width: 0.032, depth: 0.5 },
  { at: 0.74, width: 0.058, depth: 0.24 },
  { at: 0.82, width: 0.026, depth: 0.8 },
  { at: 0.9, width: 0.048, depth: 0.32 },
  { at: 0.96, width: 0.03, depth: 0.45 },
];

export type CurtainSkin = { colour: CanvasTexture; normal: CanvasTexture };

/** Cuánto marca el relieve en el material. En un solo sitio para poder tocarlo. */
export const CURTAIN_RELIEF: [number, number] = [1.2, 1.2];

function fontFamily() {
  if (typeof document === 'undefined') return 'sans-serif';
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue('--font-inter')
      .trim() || 'sans-serif'
  );
}

/**
 * Pinta los pliegues. Se usa dos veces, para el color y para el relieve, con
 * distinta intensidad: así los dos salen del mismo campo y no se contradicen.
 */
function paintFolds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shadow: number,
  light: number,
) {
  FOLDS.forEach((fold) => {
    const x = fold.at * w;
    const half = fold.width * w;
    const gradient = ctx.createLinearGradient(x - half, 0, x + half, 0);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.45, `rgba(0,0,0,${shadow * fold.depth})`);
    gradient.addColorStop(0.62, `rgba(255,255,255,${light * fold.depth})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - half, 0, half * 2, h);
  });
}

/** Deja el lienzo listo para escribir el rótulo, con su oblicua. */
function setupText(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const family = fontFamily();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // El rótulo real lleva bastante prosa entre letras y mucho aire entre
  // palabras. No todos los navegadores lo admiten: si no, sale igual, solo
  // que más apretado.
  try {
    ctx.letterSpacing = '0.03em';
    ctx.wordSpacing = '0.22em';
  } catch {
    // sin tracking, pero legible
  }

  // Se mide una vez a un cuerpo cualquiera y se escala: el ancho del texto es
  // proporcional al cuerpo, así que no hace falta ir probando tamaños.
  const probe = 160;
  ctx.font = `700 ${probe}px ${family}`;
  const measured = ctx.measureText(TEXT).width || 1;
  const size = Math.floor((probe * w * TEXT_FILL) / measured);
  ctx.font = `700 ${size}px ${family}`;

  const y = h * TEXT_MIDDLE;
  // La oblicua se aplica inclinando el lienzo alrededor de la línea del texto,
  // no con la cursiva de la tipografía: así se controla el ángulo exacto.
  ctx.translate(0, y);
  ctx.transform(1, 0, -SLANT, 1, 0, 0);
  ctx.translate(0, -y);

  return { x: w * TEXT_CENTRE, y };
}

function paintColour(canvas: HTMLCanvasElement, withText: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = 'none';
  ctx.fillStyle = BLUE;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Flojo: el relieve de verdad lo pone el mapa de normales. Aquí solo hace
  // falta que el azul no sea un color plano. Con más contraste el costado deja
  // de leerse como tela y pasa a parecer chapa ondulada.
  paintFolds(ctx, WIDTH, HEIGHT, 0.115, 0.06);

  // La lona cuelga del perfil de arriba y se tensa contra los tableros: queda
  // algo más clara arriba y más apagada abajo.
  const vertical = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  vertical.addColorStop(0, 'rgba(255,255,255,0.1)');
  vertical.addColorStop(0.35, 'rgba(255,255,255,0)');
  vertical.addColorStop(1, 'rgba(0,0,0,0.16)');
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (!withText) return;

  ctx.save();
  const { x, y } = setupText(ctx, WIDTH, HEIGHT);

  // Canto oscuro: varias copias desplazadas hacia abajo y a la derecha. Es un
  // relieve, no una sombra difusa, que es justo lo que se ve en el vinilo.
  ctx.fillStyle = RED_EDGE;
  for (let step = EXTRUDE; step >= 1; step -= 1) {
    ctx.fillText(TEXT, x + step, y + step);
  }

  ctx.fillStyle = RED;
  ctx.fillText(TEXT, x, y);
  ctx.restore();
}

/** Altura de la tela en gris: medio = plano, claro = sale, oscuro = entra. */
function paintHeight(canvas: HTMLCanvasElement, withText: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = 'none';
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);

  // Aquí sí van fuertes: de esto salen las normales, y es lo que hace que la
  // luz de la escena recorra los pliegues.
  paintFolds(ctx, w, h, 0.5, 0.42);

  // Panza: la lona se comba hacia fuera entre el perfil y los tableros.
  const belly = ctx.createLinearGradient(0, 0, 0, h);
  belly.addColorStop(0, 'rgba(0,0,0,0.3)');
  belly.addColorStop(0.5, 'rgba(255,255,255,0.22)');
  belly.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = belly;
  ctx.fillRect(0, 0, w, h);

  if (!withText) return;

  // El vinilo pisa encima de la lona: muy poco, pero lo justo para coger un
  // filo de luz. Difuminado, o las normales salen a cuchillo.
  ctx.save();
  const { x, y } = setupText(ctx, w, h);
  ctx.filter = 'blur(1.5px)';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText(TEXT, x, y);
  ctx.restore();
}

/** Convierte el gris de altura en un mapa de normales. */
function paintNormal(height: HTMLCanvasElement, target: HTMLCanvasElement) {
  const w = height.width;
  const h = height.height;
  const source = height.getContext('2d')?.getImageData(0, 0, w, h);
  const ctx = target.getContext('2d');
  if (!source || !ctx) return;

  const out = ctx.createImageData(w, h);
  const at = (x: number, y: number) => {
    const cx = Math.min(w - 1, Math.max(0, x));
    const cy = Math.min(h - 1, Math.max(0, y));
    return source.data[(cy * w + cx) * 4] / 255;
  };

  // Cuánto se exagera la pendiente. De más, la tela parece repujada.
  const strength = 2.6;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const length = Math.hypot(dx, dy, 1);
      const index = (y * w + x) * 4;
      out.data[index] = ((-dx / length) * 0.5 + 0.5) * 255;
      out.data[index + 1] = ((-dy / length) * 0.5 + 0.5) * 255;
      out.data[index + 2] = (1 / length) * 0.5 * 255 + 127.5;
      out.data[index + 3] = 255;
    }
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.putImageData(out, 0, 0);
}

function build(withText: boolean): CurtainSkin {
  const colourCanvas = document.createElement('canvas');
  colourCanvas.width = WIDTH;
  colourCanvas.height = HEIGHT;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = WIDTH / RELIEF;
  heightCanvas.height = HEIGHT / RELIEF;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = heightCanvas.width;
  normalCanvas.height = heightCanvas.height;

  const colour = new CanvasTexture(colourCanvas);
  colour.colorSpace = SRGBColorSpace;
  colour.anisotropy = 8;

  // El mapa de normales va en espacio lineal: no es un color, son vectores.
  const normal = new CanvasTexture(normalCanvas);
  normal.anisotropy = 4;

  const render = () => {
    paintColour(colourCanvas, withText);
    paintHeight(heightCanvas, withText);
    paintNormal(heightCanvas, normalCanvas);
    colour.needsUpdate = true;
    normal.needsUpdate = true;
  };

  render();
  // Segunda pasada cuando la tipografía está lista. Sin ella, al entrar en
  // frío el rótulo se queda con la fuente de reserva para siempre.
  if (withText) document.fonts?.ready.then(render).catch(() => {});

  return { colour, normal };
}

let lettered: CurtainSkin | null = null;
let plain: CurtainSkin | null = null;
const windows = new Map<string, CurtainSkin>();

function slice(skin: CurtainSkin, from: number, to: number): CurtainSkin {
  const cut = (map: CanvasTexture) => {
    const piece = map.clone() as CanvasTexture;
    piece.repeat.set(to - from, 1);
    piece.offset.set(from, 0);
    piece.needsUpdate = true;
    return piece;
  };
  return { colour: cut(skin.colour), normal: cut(skin.normal) };
}

/**
 * Un trozo de la lona, de `from` a `to` sobre su largo (0 = cola, 1 = morro).
 *
 * Las dos mitades comparten el mismo lienzo y cada una enseña su tramo: así el
 * rótulo queda **centrado en la lona entera**, aunque esté repartido entre la
 * parte fija y la corredera. Y cuando la corredera se recoge, su trozo de
 * textura se encoge con ella, que es exactamente lo que le pasa al rótulo de
 * verdad al plegarse.
 */
export function curtainSection(from: number, to: number): CurtainSkin {
  const key = `${from.toFixed(4)}-${to.toFixed(4)}`;
  const cached = windows.get(key);
  if (cached) return cached;

  if (!lettered) lettered = build(true);
  const piece = slice(lettered, from, to);
  windows.set(key, piece);
  return piece;
}

/** La lona sin rótulo, para el costado que no se ve. */
export function curtainPlain(): CurtainSkin {
  if (!plain) plain = build(false);
  return plain;
}
