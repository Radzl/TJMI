'use client';

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import { Camera, Light, Mesh, type Object3D } from 'three';
import Operator from './Operator';

const MODEL = '/models/forklift.glb';

/**
 * La carretilla elevadora que carga los palés por el costado del camión.
 *
 * **Por qué sustituye a la reach stacker.** La máquina anterior estaba mal
 * elegida y era un fallo de geometría, no de gusto: una reach stacker agarra
 * contenedores **desde arriba** con un spreader, y un semirremolque de lonas
 * **tiene techo**. No hay forma de que meta un palé dentro. El guion cerró
 * «grúa portacontenedores, no carretilla» cuando la carga era un contenedor;
 * después la carga pasó a ser palés y la máquina no cambió. En
 * `public/media/camion-02.jpg` se ve quién hace ese trabajo de verdad: una
 * carretilla, por el costado y con las horquillas a la altura del piso.
 *
 * Modelo: «Forklift» de KolosStudios, en poly.pizza, licencia **CC-BY 3.0**.
 * El crédito es obligación de la licencia y está en el aviso legal.
 *
 * **Va sin repintar, y es decisión del cliente.** El amarillo que trae es el
 * de una carretilla de verdad, así que repintarla a los colores de la casa la
 * alejaría de lo que se ve en la foto. La marca ya la llevan el camión y las
 * naves.
 */

/**
 * Escala a metros, y los tres ejes cuadran a la vez con esta.
 *
 * Medido sobre el propio GLB (hay que transformar las ocho esquinas de la
 * caja: el nodo trae un cuaternión de la conversión Z-up → Y-up de FBX2glTF y
 * escala **no uniforme**, así que multiplicar por la escala y ya da medidas
 * que no son).
 *
 * | | modelo | × 1,35 | contrapesada real |
 * | --- | --- | --- | --- |
 * | largo | 2,31 | **3,12 m** | 3,0–3,3 m con horquillas |
 * | ancho | 0,85 | **1,15 m** | 1,15 m |
 * | alto | 1,42 | **1,92 m** | ~2,1 m de techo protector |
 *
 * Que el ancho caiga clavado y el largo dentro del rango con el mismo número
 * es lo que dice que 1,35 es el factor bueno: el 2,31 del archivo **incluye
 * las horquillas**, no es solo el cuerpo.
 */
const SCALE = 1.35;

/**
 * Dónde está el origen del modelo dentro del archivo, antes de recolocarlo.
 *
 * El largo del modelo corre por **Z** y la escena quiere las cosas mirando a
 * **+X**, como el camión. El giro de −90° en Y lleva −Z a +X.
 *
 * **Cuál de los dos extremos es el frente hay que MIRARLO, no deducirlo.** Lo
 * deduje del reparto de materiales —el material oscuro llega hasta z = 4,19,
 * así que ahí estaría el mástil— y estaba al revés: ese extremo es el
 * contrapeso. El mástil y las horquillas están en z = 1,88. Se vio poniendo
 * la carretilla un momento al lado del camión y mirándola.
 */
const BOX = {
  /** Centro a lo ancho. */
  centreX: 54.25,
  /** El suelo: por debajo de esto no hay geometría. */
  groundY: 0.02,
  /** La punta de las horquillas, que es el extremo delantero. */
  frontZ: 1.88,
};

/**
 * El origen queda en **la punta de las horquillas, a ras de suelo**.
 *
 * Es el punto que de verdad hace falta mover: lo que se coloca al colocar la
 * carretilla es dónde va a quedar el palé. Con el origen en el centro de la
 * máquina habría que ir sumando medio vehículo en cada cuenta de la
 * coreografía. Así, `position.x` es directamente dónde están las horquillas y
 * el cuerpo queda por detrás, en las x negativas.
 */
const ORIGIN: [number, number, number] = [-BOX.centreX, -BOX.groundY, -BOX.frontZ];

/**
 * Dónde se sienta el operario, en metros de la escena.
 *
 * Medido sobre el propio GLB, no puesto a ojo. Las piezas, ya transformadas:
 *
 * | pieza | largo (x) | alto (y) |
 * | --- | --- | --- |
 * | chasis, mástil, ruedas y techo | −3,12 .. −0,07 | 0,00 .. 1,92 |
 * | techo protector y respaldo | −2,28 .. −0,54 | 0,36 .. 1,89 |
 * | capó amarillo | −2,05 .. 0,00 | 0,29 .. **0,98** |
 *
 * En una contrapesada el asiento va **encima del capó**, que aquí acaba a
 * 0,98. Como el origen de la figura es el suelo del puesto y el asiento le
 * queda 0,42 por encima, el origen va a 0,98 − 0,42 = **0,56**.
 *
 * A lo largo, −1,8 deja el respaldo justo en el borde trasero del capó
 * (−2,06 contra −2,05) y la cabeza a 1,71, por debajo del techo protector.
 * O sea: sentado donde hay sitio, y sin atravesar nada.
 */
const OPERATOR = { x: -1.8, y: 0.56, z: 0 };

/** Lo que mide ya colocada, por si la coreografía necesita las cuentas. */
export const FORKLIFT = {
  /** De la punta de las horquillas a la cola, en metros. */
  length: 2.31 * SCALE,
  width: 0.85 * SCALE,
  height: 1.42 * SCALE,
};

export default function ForkliftModel() {
  const { scene } = useGLTF(MODEL);

  const model = useMemo(() => {
    const root = scene.clone(true);
    const remove: Object3D[] = [];

    root.traverse((child) => {
      if (child instanceof Camera || child instanceof Light) {
        remove.push(child);
        return;
      }
      if (!(child instanceof Mesh)) return;

      // Sin tocar el material: el modelo viene con color plano y sin texturas,
      // que es justo el acabado de maqueta del resto de la escena.
      child.castShadow = true;
      child.receiveShadow = true;
    });

    remove.forEach((node) => node.removeFromParent());
    return root;
  }, [scene]);

  return (
    <>
      <group rotation={[0, -Math.PI / 2, 0]} scale={SCALE}>
        <primitive object={model} position={ORIGIN} />
      </group>
      {/* El operario va FUERA del grupo del modelo, no dentro: ahí hay un
          `scale` de 1,35 y la figura saldría un 35 % más alta, o sea un
          conductor de 1,55 m sentado. Aquí las coordenadas ya son metros de
          la escena. Es lo mismo que hacía la grúa, por lo mismo. */}
      <group position={[OPERATOR.x, OPERATOR.y, OPERATOR.z]}>
        <Operator />
      </group>
    </>
  );
}

useGLTF.preload(MODEL);
