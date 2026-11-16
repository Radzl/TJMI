import { Euler, Matrix4, PlaneGeometry, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Un plano suelto: su tamaño y dónde va, ya con todos los giros puestos. */
export type Plano = { ancho: number; fondo: number; matriz: Matrix4 };

/**
 * Funde varios planos que comparten material en **una sola geometría**.
 *
 * La pintura del suelo del patio eran 19 rayas y las plazas de la pila otras
 * 8, cada una con su malla y su material: 27 llamadas de dibujo para algo que
 * no se mueve nunca. Fundidas, son dos.
 *
 * Quien llama describe cada plano igual que antes lo describía el JSX —sitio,
 * giro y tamaño— y la función hornea las transformaciones en los vértices.
 */
export function fundirPlanos(planos: Plano[]): BufferGeometry {
  const geometrias = planos.map(({ ancho, fondo, matriz }) => {
    const g = new PlaneGeometry(ancho, fondo);
    g.applyMatrix4(matriz);
    return g;
  });
  const fundida = mergeGeometries(geometrias, false);
  geometrias.forEach((g) => g.dispose());
  return fundida;
}

const _euler = new Euler();

/**
 * La matriz de un `<mesh position rotation>` de React Three Fiber: posición y
 * giro de Euler en orden XYZ, que es el que usa three por defecto.
 */
export function matrizDe(
  posicion: [number, number, number],
  giro: [number, number, number] = [0, 0, 0],
) {
  return new Matrix4()
    .makeRotationFromEuler(_euler.set(giro[0], giro[1], giro[2], 'XYZ'))
    .setPosition(posicion[0], posicion[1], posicion[2]);
}
