'use client';

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import { Mesh } from 'three';
import Operator from './Operator';

const MODEL = '/models/carretilla.glb';

/**
 * La carretilla elevadora que carga los palés por el costado del camión.
 *
 * **Por qué una carretilla y no una grúa.** Una reach stacker agarra
 * contenedores **desde arriba** con un spreader, y un semirremolque de lonas
 * **tiene techo**: no hay forma de que meta un palé dentro. En
 * `public/media/camion-02.jpg` se ve quién hace ese trabajo de verdad: una
 * carretilla, por el costado y con las horquillas a la altura del piso.
 *
 * **Modelo: «Warehouse Forklift Gameready», de Kamran Mughal, en Sketchfab,
 * licencia CC BY 4.0** (2026-11-19). Sustituye a la «Forklift» de
 * KolosStudios, que era de bloques de color plano y se leía como un juguete al
 * lado del camión. El crédito es obligación de la licencia y está en el aviso
 * legal.
 *
 * **El archivo no es el de Sketchfab tal cual: se preparó para la escena**
 * con un guion de Python (ver «Los modelos de Sketchfab» en `CLAUDE.md`):
 *
 * - **Ya va en metros, mirando a +X y con el origen en la punta de las
 *   horquillas, a ras de suelo.** Es el punto que de verdad se coloca: al
 *   situar la carretilla se sitúa dónde va a quedar el palé. Por eso aquí no
 *   hay ni giro ni escala ni desplazamiento.
 * - **Las horquillas y el carro van subidos 1,14 m**, hasta el piso del
 *   camión (1,20 m), y la parte interior del mástil 31 cm, para que el carro
 *   no asome por encima. Con la carretilla de antes no se podía: mástil,
 *   ruedas y techo iban en la misma pieza, y el lote viajaba a 1,20 m con las
 *   horquillas en el suelo. En este modelo el carro y las horquillas son
 *   piezas sueltas dentro de la malla, así que se separaron y se subieron al
 *   preparar el archivo. Sigue siendo **una sola malla y una sola llamada de
 *   dibujo**: no se animan, la carretilla lleva el lote en alto desde que
 *   sale de la nave hasta que se va.
 * - **Sin las letras de la textura** («SQUIRE», un logotipo en forma de S y
 *   el modelo «SJT-9»): una marca en una máquina de la escena se lee como la
 *   de otra empresa, igual que el logotipo de la calandra del camión.
 * - Texturas a 512 y 256 px en JPEG, y sin la de especular: a lo que mide en
 *   pantalla (unos 120 px de largo en escritorio) no se distingue.
 *
 * **Va sin repintar, y es decisión del cliente.** El amarillo es el de una
 * carretilla de verdad. La marca ya la llevan el camión y la nave.
 */

/**
 * Lo que mide, en metros, medido sobre el archivo ya preparado.
 *
 * Es una contrapesada de unas tres toneladas y media: 1,31 m de ancho, techo
 * protector a 2,26 m y 3,86 m de la punta de las horquillas a la cola (de
 * ellos, 1,18 m de horquilla). Se deja a su tamaño: cuadra con una real.
 */
export const FORKLIFT = {
  /** De la punta de las horquillas a la cola. */
  length: 3.864,
  width: 1.31,
  /** Hasta lo alto del mástil, con la parte interior extendida. */
  height: 2.89,
  /**
   * Lo que va apoyado en el suelo, de la cola al frente de las ruedas
   * delanteras. Las horquillas van en alto y no tocan nada, así que la
   * sombra de contacto va solo debajo de esto.
   */
  cuerpo: { desde: -3.864, hasta: -1.33 },
  /**
   * Dónde va el rotativo: sobre la parte de atrás del techo protector, que
   * acaba a 2,26 m y llega hasta x = −3,28.
   */
  rotativo: [-3.05, 2.4, 0] as [number, number, number],
};

/**
 * Dónde se sienta el operario, en metros de la escena, medido sobre una vista
 * lateral del modelo con cuadrícula de 10 cm.
 *
 * El cojín del asiento acaba a **1,20 m** de alto y el respaldo empieza en
 * x = −2,98. La figura tiene el origen en el suelo del puesto y el asiento
 * 0,42 por encima, así que el origen va a 1,20 − 0,42 = **0,78**. A lo largo,
 * su propio respaldo (que va 0,21 por detrás del origen) cae sobre el del
 * modelo: −2,98 + 0,21 = **−2,77**. La cabeza queda a unos 2,03 m, por debajo
 * del techo protector, y las manos a la altura del volante.
 */
const OPERATOR = { x: -2.77, y: 0.78, z: 0 };

export default function ForkliftModel() {
  const { scene } = useGLTF(MODEL, false);

  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });
    return root;
  }, [scene]);

  return (
    <>
      <primitive object={model} />
      <group position={[OPERATOR.x, OPERATOR.y, OPERATOR.z]}>
        <Operator />
      </group>
    </>
  );
}

// **Sin Draco, y el segundo argumento no es cosmético.** drei trae
// `useDraco = true` por defecto, así que construye un `DRACOLoader` y le
// apunta el descompresor a `https://www.gstatic.com/draco/...`: una
// petición a Google esperando el día que alguien comprima un modelo con
// Draco, y eso va contra la regla de este proyecto de no cargar nada de
// terceros. Ningún GLB de la escena usa esa extensión; a `false` el cargador
// ni se construye.
useGLTF.preload(MODEL, false);
