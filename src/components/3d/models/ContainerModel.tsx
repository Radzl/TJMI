'use client';

import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import {
  Color,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
} from 'three';

const MODEL = '/models/contenedor.glb';

/**
 * **Modelo: «20ft Container», de Europhil, en Sketchfab, licencia CC BY 4.0**
 * (2026-11-19), con el crédito en el aviso legal. Sustituye a uno de chapa
 * lisa con cuatro herrajes: este trae la chapa corrugada de verdad, los
 * paneles del techo y los cierres de las puertas, y sin naviera rotulada.
 *
 * El archivo va preparado para la escena (ver «Los modelos de Sketchfab» en
 * `CLAUDE.md`): **centrado en el origen, con el largo en X y a las mismas
 * medidas que tenía el anterior**, así que las pilas, los huecos entre ellas y
 * las sombras de contacto no se movieron. El modelo mide 6,16 × 2,44 × 2,44 y
 * se ajustó a 6,06 × 2,45 × 2,57: un 5 % más ancho, que no se ve. Y sus ocho
 * piezas van **fundidas en tres, una por material** (`chapa`, `herrajes` y
 * `cierres`), que son las tres llamadas de dibujo de todo el patio.
 */
export const CONTAINER = {
  length: 6.06,
  // Las medidas a las que estaba afinado el patio con el modelo anterior.
  height: 2.455,
  width: 2.57,
};

/** Un contenedor del patio: dónde va (ya girado) y de qué color es la chapa. */
export type ContainerPlacement = { matrix: Matrix4; color: string };

/** Herrajes y marcos: un punto más oscuros que la chapa, en la misma gama. */
const FRAME_COLOR = '#2a4470';

/**
 * Todos los contenedores del patio, **en tres llamadas de dibujo**, una por
 * pieza del modelo, más la de la chapa en el mapa de sombras.
 *
 * Al principio cada contenedor se montaba clonando el GLB entero: con
 * diecisiete en el patio eran **unas 100 llamadas** para un decorado que no
 * se mueve.
 *
 * Ahora cada pieza es un único `InstancedMesh` con los diecisiete sitios
 * dentro, y el color de la chapa va **por instancia** (`setColorAt`). El
 * resultado en pantalla es el mismo; lo que cambia es que la tarjeta gráfica
 * recibe una orden por pieza y no una por pieza y contenedor.
 *
 * Tres detalles que no son opcionales:
 *
 * - **Solo la chapa proyecta sombra.** Los herrajes van pegados a ella: su
 *   sombra es la misma que la de la caja, así que se pagaba cuatro veces por
 *   el mismo contorno. Esto ya era así antes de instanciar.
 * - **`frustumCulled = false`**, como todo lo instanciado de esta escena: la
 *   esfera envolvente sale de la geometría base, que está en el origen, y con
 *   el recorte activado el patio entero desaparecería en cuanto la cámara deja
 *   de ver el origen. Ya pasó con los palés.
 * - **La instancia es «el contenedor tal cual»**: el archivo ya viene a medida
 *   y centrado, así que quien lo coloca solo piensa en dónde va.
 */
export default function ContainerStacks({ items }: { items: ContainerPlacement[] }) {
  const { scene } = useGLTF(MODEL, false);

  const meshes = useMemo(() => {
    scene.updateMatrixWorld(true);
    const raiz = new Matrix4().copy(scene.matrixWorld).invert();

    const piezas: InstancedMesh[] = [];
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      const esChapa = (child.material as MeshStandardMaterial)?.name === 'chapa';

      const geometria = (child.geometry as BufferGeometry).clone();
      geometria.applyMatrix4(new Matrix4().multiplyMatrices(raiz, child.matrixWorld));

      const material = new MeshStandardMaterial({
        // La chapa va en blanco y toma el color de cada instancia; three
        // multiplica el color del material por el de la instancia.
        color: esChapa ? '#ffffff' : FRAME_COLOR,
        roughness: 0.62,
        metalness: 0.08,
      });

      const malla = new InstancedMesh(geometria, material, items.length);
      malla.castShadow = esChapa;
      malla.receiveShadow = true;
      malla.frustumCulled = false;

      // Los sitios se escriben aquí, al crear la malla, y no en un efecto:
      // el patio no se mueve, así que no hay nada que actualizar después.
      const color = new Color();
      items.forEach((item, i) => {
        malla.setMatrixAt(i, item.matrix);
        if (esChapa) malla.setColorAt(i, color.set(item.color));
      });
      piezas.push(malla);
    });
    return piezas;
  }, [scene, items]);

  // Al desmontar se libera lo que se creó a mano: three no lo hace solo.
  useLayoutEffect(
    () => () => {
      for (const malla of meshes) {
        malla.geometry.dispose();
        (malla.material as MeshStandardMaterial).dispose();
        malla.dispose();
      }
    },
    [meshes],
  );

  return (
    <>
      {meshes.map((malla) => (
        <primitive key={malla.uuid} object={malla} />
      ))}
    </>
  );
}

// Sin Draco, por lo mismo que los demás modelos: ver `ForkliftModel.tsx`.
useGLTF.preload(MODEL, false);
