import {
  BufferAttribute,
  BufferGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  type Material,
  type Object3D,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Funde en una sola malla todas las piezas de un modelo que comparten material.
 *
 * **Por qué.** Cada malla es una orden a la tarjeta gráfica, y dos si proyecta
 * sombra. El GLB del camión trae 117 primitivas y, tras limpiarlo, quedaban 97
 * mallas y 67 proyectoras: **167 llamadas por fotograma** solo para el camión,
 * cuando sus materiales distintos son treinta y pocos. Fundidas por material,
 * cada material es una llamada (y otra en el mapa de sombras si alguna de sus
 * piezas proyectaba), y la imagen es la misma.
 *
 * Se puede porque **nada del camión se mueve por piezas**: lo que gira o se
 * abre —ruedas, lona, rótulos— lo dibujamos nosotros fuera del GLB. Si algún
 * día hay que animar una pieza del modelo, esa pieza tiene que quedar fuera
 * de esto (con `excluir`).
 *
 * Tres trampas que esta función resuelve y que no se ven venir:
 *
 * - **El GLB va cuantizado** (`KHR_mesh_quantization`): posiciones y normales
 *   en enteros de 16 bits normalizados. Hornear la transformación sobre esos
 *   atributos tal cual los **recorta** a [−1, 1] y el camión sale aplastado.
 *   Por eso cada atributo se pasa antes a `Float32`.
 * - **Las piezas en espejo** (determinante negativo, como los retrovisores de
 *   un lado) invierten el sentido de sus triángulos al hornearlas: three lo
 *   corregía al dibujar porque veía la escala negativa en el nodo, y fundida
 *   esa información desaparece. Se le da la vuelta a cada triángulo a mano.
 * - **`mergeGeometries` exige que todas lleven los mismos atributos.** Las
 *   que no traen UV o normales se completan antes de fundir.
 */
export function fundirPorMaterial(
  raiz: Object3D,
  excluir: (malla: Mesh) => boolean = () => false,
) {
  raiz.updateMatrixWorld(true);
  const aRaiz = new Matrix4().copy(raiz.matrixWorld).invert();

  const grupos = new Map<
    Material,
    { geometrias: BufferGeometry[]; sombra: boolean; recibe: boolean }
  >();
  const fundidas: Mesh[] = [];

  raiz.traverse((objeto) => {
    if (!(objeto instanceof Mesh) || objeto instanceof InstancedMesh) return;
    if (!objeto.visible || Array.isArray(objeto.material) || excluir(objeto)) return;

    const relativa = new Matrix4().multiplyMatrices(aRaiz, objeto.matrixWorld);
    const geometria = enFloat32(objeto.geometry);
    geometria.applyMatrix4(relativa);
    if (relativa.determinant() < 0) darLaVuelta(geometria);

    const grupo = grupos.get(objeto.material) ?? {
      geometrias: [],
      sombra: false,
      recibe: false,
    };
    grupo.geometrias.push(geometria);
    grupo.sombra ||= objeto.castShadow;
    grupo.recibe ||= objeto.receiveShadow;
    grupos.set(objeto.material, grupo);
    fundidas.push(objeto);
  });

  for (const malla of fundidas) malla.removeFromParent();

  let creadas = 0;
  for (const [material, grupo] of grupos) {
    const geometria = fundir(grupo.geometrias);
    if (!geometria) continue;
    const malla = new Mesh(geometria, material);
    malla.castShadow = grupo.sombra;
    malla.receiveShadow = grupo.recibe;
    malla.name = `fundido:${material.name}`;
    raiz.add(malla);
    creadas += 1;
  }

  return { antes: fundidas.length, despues: creadas };
}

/** Copia la geometría con los atributos que importan en `Float32` e indexada. */
function enFloat32(origen: BufferGeometry) {
  const copia = new BufferGeometry();
  for (const nombre of ['position', 'normal', 'uv'] as const) {
    const atributo = origen.getAttribute(nombre);
    if (!atributo) continue;
    const datos = new Float32Array(atributo.count * atributo.itemSize);
    for (let i = 0; i < atributo.count; i += 1) {
      for (let k = 0; k < atributo.itemSize; k += 1) {
        // `getComponent` deshace la normalización y el entrelazado.
        datos[i * atributo.itemSize + k] = atributo.getComponent(i, k);
      }
    }
    copia.setAttribute(nombre, new BufferAttribute(datos, atributo.itemSize));
  }

  const n = copia.getAttribute('position').count;
  const indices = origen.index
    ? Uint32Array.from(origen.index.array as ArrayLike<number>)
    : Uint32Array.from({ length: n }, (_, i) => i);
  copia.setIndex(new BufferAttribute(indices, 1));
  return copia;
}

/** Invierte el sentido de cada triángulo (A, B, C → A, C, B). */
function darLaVuelta(geometria: BufferGeometry) {
  const indice = geometria.index;
  if (!indice) return;
  const a = indice.array as Uint32Array;
  for (let i = 0; i + 2 < a.length; i += 3) {
    const b = a[i + 1];
    a[i + 1] = a[i + 2];
    a[i + 2] = b;
  }
  indice.needsUpdate = true;
}

/** Iguala atributos y funde. Devuelve `null` si no hay nada que fundir. */
function fundir(geometrias: BufferGeometry[]) {
  if (!geometrias.length) return null;
  const conUv = geometrias.some((g) => g.getAttribute('uv'));

  for (const g of geometrias) {
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    if (conUv && !g.getAttribute('uv')) {
      const n = g.getAttribute('position').count;
      g.setAttribute('uv', new BufferAttribute(new Float32Array(n * 2), 2));
    }
    if (!conUv) g.deleteAttribute('uv');
  }

  const resultado =
    geometrias.length === 1 ? geometrias[0] : mergeGeometries(geometrias, false);
  if (!resultado) return null;
  resultado.computeBoundingBox();
  resultado.computeBoundingSphere();
  return resultado;
}
