/**
 * **La entrada del camión en el patio** (D3, 2026-11-18): viene desde el
 * fondo hacia la cámara, gira a la derecha y se cuadra delante de la nave,
 * exactamente donde la carretilla lo va a cargar.
 *
 * Gira **articulado, como uno de verdad**: la tractora sigue la curva y el
 * semirremolque va detrás doblándose por el enganche. Un camión que gira de
 * una pieza se lee como un juguete arrastrado, y eso es lo que el cliente
 * señaló de la intro.
 *
 * Todo se calcula **una vez, al cargar el módulo**, y la escena solo lee la
 * tabla: en cada fotograma no se integra nada. Así la maniobra depende solo
 * del scroll y no de los fotogramas por segundo, igual que el resto de la
 * coreografía.
 */
import { TRUCK } from '../models/TruckModel';
import { TRUCK_X } from './medidas';

/** Dónde está el enganche, desde la cola. Medido sobre el GLB: ver
 *  `TRUCK.enganche`, que es también el pivote de la tractora. */
const ENGANCHE = TRUCK.enganche;

/** El centro de los tres ejes del semirremolque, desde la cola (también
 *  medido: las ruedas van de `z` −8,84 a −5,90 del modelo). */
const EJES_REMOLQUE = 1.85;

/** Lo que va del enganche a los ejes de atrás: el brazo que arrastra. */
const BRAZO = ENGANCHE - EJES_REMOLQUE;

/**
 * La ruta del enganche, en metros de la escena.
 *
 *  - Baja por un **carril** paralelo a la cámara, entre la pila de
 *    contenedores (su borde está en x ≈ −17,6) y la nave (que empieza en
 *    x = −10). Son 3,6 m de holgura por un lado y 4 por el otro.
 *  - Gira con un **radio** de 12 m, que es lo que cierra un articulado real.
 *  - Y sigue recto hasta que el enganche queda donde toca para que la cola
 *    caiga en `TRUCK_X`.
 *
 * `recta` es lo que baja en línea recta antes de girar. Arranca ya cerca, con
 * la cabina de frente a la cámara: en el primer fotograma tiene que haber un
 * camión, no una mota al fondo.
 *
 * **Con 14 m de recta final el semirremolque no llega a enderezarse solo**:
 * simulado, acaba con 12° de ángulo (un articulado de verdad necesita tres
 * veces su brazo para cuadrarse). Por eso en el último tramo se le ayuda a
 * alinearse con la tractora (`AYUDA`): desde la cámara alta no se nota, y un
 * camión aparcado torcido delante de su propia nave sí se notaría.
 */
const RUTA = { carril: -14, radio: 12, recta: 16 };

const RECTA_FINAL = TRUCK_X + ENGANCHE - (RUTA.carril + RUTA.radio);
const ARCO = (Math.PI / 2) * RUTA.radio;
/** Metros que recorre el enganche de principio a fin. */
export const RECORRIDO = RUTA.recta + ARCO + RECTA_FINAL;

/** Los metros finales en los que se ayuda al semirremolque a cuadrarse. */
const AYUDA = 11;

/**
 * El enganche a `s` metros del principio. El rumbo va en radianes en el plano
 * del suelo, medido como `atan2(dz, dx)`: +X es 0 y +Z (hacia la cámara) es
 * π/2.
 */
function enganche(s: number): [x: number, z: number, rumbo: number] {
  const { carril, radio, recta } = RUTA;
  if (s < recta) return [carril, -(radio + recta) + s, Math.PI / 2];
  if (s < recta + ARCO) {
    // Arco con centro en (carril + radio, −radio): de mirar a +Z a mirar a +X.
    const a = Math.PI - (s - recta) / radio;
    return [
      carril + radio + radio * Math.cos(a),
      -radio + radio * Math.sin(a),
      Math.atan2(-Math.cos(a), Math.sin(a)),
    ];
  }
  return [carril + radio + (s - recta - ARCO), 0, 0];
}

/** Paso de la tabla. Medio metro de enganche son ~0,5 % del recorrido. */
const PASO = 0.25;
const MUESTRAS = Math.ceil(RECORRIDO / PASO) + 1;

/**
 * `[engancheX, engancheZ, rumboTractora, rumboRemolque]` por muestra.
 *
 * El semirremolque se integra como una **tractriz**: sus ejes siempre van
 * hacia el enganche, a la distancia del brazo. Se integra con un paso mucho
 * más fino que el de la tabla para que no derive.
 */
const TABLA = (() => {
  const tabla = new Float32Array(MUESTRAS * 4);
  let [ex, ez] = enganche(0);
  let ejeX = ex;
  let ejeZ = ez - BRAZO;
  const fino = 0.02;
  let s = 0;
  for (let i = 0; i < MUESTRAS; i += 1) {
    const objetivo = Math.min(i * PASO, RECORRIDO);
    while (s < objetivo) {
      s = Math.min(s + fino, objetivo);
      [ex, ez] = enganche(s);
      const dx = ex - ejeX;
      const dz = ez - ejeZ;
      const d = Math.hypot(dx, dz) || 1;
      ejeX = ex - (BRAZO * dx) / d;
      ejeZ = ez - (BRAZO * dz) / d;
    }
    const [x, z, rumbo] = enganche(objetivo);
    let remolque = Math.atan2(z - ejeZ, x - ejeX);
    const ayuda = Math.min(1, Math.max(0, (objetivo - (RECORRIDO - AYUDA)) / AYUDA));
    const peso = ayuda * ayuda * (3 - 2 * ayuda);
    remolque += (rumbo - remolque) * peso;
    tabla.set([x, z, rumbo, remolque], i * 4);
  }
  return tabla;
})();

/** Dónde está el camión y cómo va doblado. */
export type PoseCamion = {
  /** La cola (el origen del grupo del camión). */
  x: number;
  z: number;
  /** Giro del semirremolque para `rotation.y` (three gira al revés que
   *  `atan2`, de ahí el signo). */
  giro: number;
  /** Lo que la tractora va doblada respecto al semirremolque, también para
   *  `rotation.y`. */
  doblez: number;
};

/**
 * La pose del camión con la maniobra al `avance` (0 → 1). En 1 queda la cola
 * en `TRUCK_X`, recto y mirando a +X: la pose en la que siempre ha estado
 * aparcado, así que todo lo que viene después no nota nada.
 */
export function poseCamion(avance: number, pose: PoseCamion) {
  const s = Math.min(1, Math.max(0, avance)) * RECORRIDO;
  const f = Math.min(s / PASO, MUESTRAS - 1);
  const i = Math.min(Math.floor(f), MUESTRAS - 2);
  const t = f - i;
  const k = i * 4;
  const lerp = (o: number) => TABLA[k + o] + (TABLA[k + 4 + o] - TABLA[k + o]) * t;
  const ex = lerp(0);
  const ez = lerp(1);
  const tractora = lerp(2);
  const remolque = lerp(3);
  pose.x = ex - ENGANCHE * Math.cos(remolque);
  pose.z = ez - ENGANCHE * Math.sin(remolque);
  pose.giro = -remolque;
  pose.doblez = -(tractora - remolque);
  return pose;
}
