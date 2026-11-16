'use client';

import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import {
  Color,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type BufferGeometry,
} from 'three';

const MODEL = '/models/container.glb';

// El GLB es un contenedor de 20 pies. Lo escalamos a medidas reales y lo
// centramos en el origen para poder posicionarlo con comodidad.
const RAW = { length: 3.16, height: 1.28, width: 1.34 };
const SCALE = 6.06 / RAW.length;

export const CONTAINER = {
  length: RAW.length * SCALE,
  height: RAW.height * SCALE,
  width: RAW.width * SCALE,
};

// Centro del modelo en su propio espacio, para compensarlo.
const RAW_CENTER: [number, number, number] = [-0.01, 0.06, 0.69];

/** Un contenedor del patio: dónde va (ya girado) y de qué color es la chapa. */
export type ContainerPlacement = { matrix: Matrix4; color: string };

/** Herrajes y marcos: un punto más oscuros que la chapa, en la misma gama. */
const FRAME_COLOR = '#2a4470';

/**
 * Todos los contenedores del patio, **en cinco llamadas de dibujo en vez de
 * ochenta y cinco**.
 *
 * El GLB trae cinco piezas —la chapa corrugada y cuatro de herrajes— y cada
 * contenedor se montaba clonándolo entero. Con diecisiete en el patio eran 85
 * mallas, más 17 dibujos de la chapa en el mapa de sombras: **unas 100
 * llamadas** para un decorado que no se mueve.
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
 * - **La geometría se hornea con el giro y la escala del modelo**, así que una
 *   instancia es «el contenedor tal cual» y quien lo coloca solo piensa en
 *   dónde va, igual que con el componente de antes.
 */
export default function ContainerStacks({ items }: { items: ContainerPlacement[] }) {
  const { scene } = useGLTF(MODEL, false);

  const meshes = useMemo(() => {
    scene.updateMatrixWorld(true);
    const raiz = new Matrix4().copy(scene.matrixWorld).invert();

    // El mismo montaje que hacía el componente anterior: girado un cuarto de
    // vuelta, escalado a medidas reales y con el centro del modelo llevado al
    // origen.
    const montaje = new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationY(Math.PI / 2),
      new Matrix4().compose(
        new Vector3(
          -RAW_CENTER[0] * SCALE,
          -RAW_CENTER[1] * SCALE,
          -RAW_CENTER[2] * SCALE,
        ),
        new Quaternion(),
        new Vector3(SCALE, SCALE, SCALE),
      ),
    );

    const piezas: InstancedMesh[] = [];
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      const nombre = (child.material as MeshStandardMaterial)?.name ?? '';
      const esChapa = nombre === 'mat15';

      const geometria = (child.geometry as BufferGeometry).clone();
      geometria.applyMatrix4(
        new Matrix4().multiplyMatrices(
          montaje,
          new Matrix4().multiplyMatrices(raiz, child.matrixWorld),
        ),
      );

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

// **Sin Draco, y el segundo argumento no es cosmético.** drei trae
// `useDraco = true` por defecto, así que construye un `DRACOLoader` y le
// apunta el descompresor a `https://www.gstatic.com/draco/...`: una
// petición a Google esperando el día que alguien comprima un modelo con
// Draco, y eso va contra la regla de este proyecto de no cargar nada de
// terceros. Hoy no se dispara —ninguno de los tres GLB usa esa extensión;
// el camión usa `EXT_meshopt_compression`, que lleva su propio wasm— pero
// el cargador entra igual en el paquete. A `false` desaparecen las dos.
useGLTF.preload(MODEL, false);
