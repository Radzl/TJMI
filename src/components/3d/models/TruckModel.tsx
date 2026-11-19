'use client';

import { useGLTF, useTexture } from '@react-three/drei';
import { TrailerLoad } from './Pallets';
import { fundirPorMaterial } from './fundirPorMaterial';
import {
  CURTAIN_RELIEF,
  curtainPlain,
  curtainSection,
} from './curtainSkin';
import { useMemo, type ReactNode, type RefObject } from 'react';
import {
  Box3,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Object3D,
} from 'three';

const MODEL = '/models/truck.glb';

/**
 * Tractora + semirremolque de lonas, cargado con palés.
 *
 * El GLB venía de una escena de render completa: además del camión traía un
 * suelo de asfalto de 21 × 21 m, vallas y señales. Todo eso se quita aquí por
 * nombre de material y de nodo (en el archivo también, pero si alguien vuelve
 * a generarlo sin recortar, esto sigue salvando la escena).
 *
 * El modelo está a escala real (unos 17 m de largo) pero orientado a lo largo
 * de Z y con el origen en su centro. Nuestra escena trabaja con el camión
 * mirando a +X y el origen en la cola, pegado al suelo, así que se mide la
 * caja de verdad y se recoloca. Medirlo es obligatorio: el archivo va
 * comprimido con cuantización, así que las posiciones en crudo no están en
 * metros.
 */

/** Lo que sobra de la escena de render original. */
const DROP_MATERIALS = new Set(['Asphalt-RenderBox']);
const DROP_NAMES = ['Barrier', 'Sign', 'RenderBox'];

/**
 * Lo que se tira del interior del semirremolque, por nombre de nodo.
 *
 * Todo esto solo se ve mientras la lona está abierta, y todo estorbaba:
 *
 * - `Object010`…`Object016`: los **pliegues de la lona del lado contrario**,
 *   que el modelo traía recogida en fuelles. Desde la cámara de perfil se ven
 *   a través del hueco y se leen como jaulas metidas dentro del camión. Como
 *   nosotros dibujamos nuestra propia lona en ese lado, sobran enteros.
 * - `Level_poles`, `C-Ext002`, `C-Ext003` y la tornillería que las acompaña:
 *   el **piso intermedio**. Este GLB es un "mezzanine deck trailer" y TJMI no
 *   usa doble altura; además partía la caja en dos a media altura y no dejaba
 *   apilar la carga.
 * - `Text001`…`Text004`: paneles de rotulación del fabricante.
 * - `AM98_010_TIR_scania_logo` y `AM98_010_TIR_logos`: **el logo del
 *   fabricante en la calandra** y los emblemas cromados del frontal. Son
 *   letras con volumen, no textura, así que repintarlas no las borra: en
 *   blanco seguían leyéndose sobre la rejilla oscura. Mientras el camión solo
 *   se veía de lado daba igual; desde que entra de frente hacia la cámara
 *   (D3) se leía «SCANIA» en el primer fotograma de la web.
 * - `ChamferBox1189` y los `Create_Wood`: la **carga que traía el modelo**.
 *   Dentro de la caja queda a oscuras y no se lee; en su sitio va la nuestra,
 *   que es palé de azulejo y combina con el lote que entra (`TrailerLoad`).
 */
const DROP_NODES =
  /^(Object01[0-6]_|Level_poles|C-Ext00[23]_|Circle00[1345]_|Box00[78]_|Box01[23]_|Cylinder00[1234]_|Text00[1-4]_|ChamferBox1189|Create_Wood_0(25|33|34)|AM98_010_TIR_(scania_logo|logos)00)/;

/**
 * De Z del modelo a X de la escena. El modelo mide 17,3 m de largo y su
 * origen está en el centro, así que al girarlo y empujarlo media longitud
 * cada punto se desplaza esto. Sale de medir, no de estimar.
 */
const Z_TO_X = 9.2;

/**
 * Blanco de la cabina. No es blanco puro a propósito: el fondo de la página es
 * crema y una cabina blanca del todo se recortaría mal sobre él.
 */
const CAB_WHITE = '#eceef1';
const BRAND_RED = '#d03b40';

/**
 * Repintado a la marca. El resto de materiales se deja como viene.
 *
 * A los repintados se les quita además la textura: es ahí donde vive la
 * rotulación del fabricante (la cabina venía roja y con su logo impreso) y
 * CLAUDE.md pide que no quede ninguna marca ajena.
 */
const BRAND: Record<string, string> = {
  // Jirón de lona del lado lejano, arriba del todo.
  Cloth: '#34548a',
  // Chapa de la cabina. Las tractoras de TJMI son **blancas**, con las rayas
  // rojas y azules en la puerta (ver `public/media/camion-01.jpg`). Viene roja
  // y con la rotulación del fabricante impresa en la textura, así que no basta
  // con cambiar el color: hay que tirar el mapa.
  Prime_Mover_Left: CAB_WHITE,
  // Algún detalle suelto en rojo plano.
  material: CAB_WHITE,
  AM98_010_white: '#f3f4f6',
  AM98_010_blue_metal: '#27406b',
  metal_shiny_col: '#34548a',
};

/** La chapa de la cabina es la del material grande de la tractora. */
const CAB_MATERIAL = 'Prime_Mover_Left';

/**
 * Los cristales de la cabina y de los faros.
 *
 * **El GLB los traía como chapa.** Material opaco, rugosidad media y nada que
 * reflejar: desde fuera la tractora parecía una maqueta de madera pintada,
 * porque lo único que distingue un cristal de una chapa blanca a diez metros
 * **es el reflejo**, no la transparencia. A este tamaño no se ve lo que hay
 * dentro de la cabina ni falta que hace; lo que se ve es que el parabrisas
 * devuelve el cielo y la chapa no.
 *
 * La escena ya monta un `Environment` con `Lightformer`, así que había algo
 * que reflejar sin pedirle nada a nadie: solo faltaba decirle al material que
 * lo mirara.
 */
const GLASS_MATERIALS = new Set([
  'AM98_010_glass',
  'AM98_010_headlight_glass',
  'AM98_010_glass_white_texture',
]);

/**
 * Las rayas de la puerta: roja fina arriba y azul más gruesa debajo, como en
 * `public/media/camion-02.jpg`.
 *
 * **Van justo debajo de la ventanilla, y en la puerta.** Las medidas salen del
 * propio modelo: el cristal lateral ocupa de `x` 16,1 a 17,3 y de `y` 1,98 a
 * 2,84 (en coordenadas de la escena). Antes estaban a 2,04–2,30 y centradas en
 * 15,5, o sea cruzando el cristal y sobre el panel del sueño, detrás de la
 * puerta. Si tocas la cabina, vuelve a medir el cristal: es la referencia.
 *
 * `y` es la altura sobre el suelo y `h` el grueso.
 */
const CAB_STRIPES = [
  { y: 1.9, h: 0.07, color: BRAND_RED },
  { y: 1.8, h: 0.09, color: '#34548a' },
];
/** Largo de las rayas y dónde caen a lo largo de la cabina, en Z del modelo. */
const CAB_STRIPE = { length: 0.8, z: 16.72 - Z_TO_X };

/**
 * La lona del lado que se ve es una sola malla del GLB, y **se oculta**: en su
 * lugar va una lona nuestra, en dos piezas, que se puede abrir. Mover la del
 * GLB no es viable, porque va cuantizada y sus ejes locales no coinciden con
 * los del modelo. Lo único que se le saca es la caja: así la lona nueva cae
 * exactamente donde estaba la original, sin medidas a ojo.
 */
const CURTAIN_MATERIAL = 'Cloth2';

/** Dónde se parte la lona, en Z del modelo (negativo = hacia la cola). */
const CURTAIN_SPLIT = -2.6;

/**
 * El costado no es una lona de arriba abajo: son tres franjas, como en el
 * camión de verdad.
 *  - Abajo, los **tableros de aluminio**, que no se mueven cuando la lona se
 *    abre. Son los que se ven en el hueco al cargar.
 *  - En medio, la **lona**, que es la que se recoge y la que lleva el rótulo.
 *  - Arriba, el **perfil del techo**, también fijo.
 * Sin esas dos franjas claras el semirremolque era un rectángulo azul plano.
 */
const BOARDS_HEIGHT = 0.62;
const RAIL_HEIGHT = 0.16;
const ALUMINIUM = '#d7dbe0';

/**
 * Medidas que el resto de la escena necesita del camión, **en coordenadas de
 * la escena** (mirando a +X, origen en la cola, apoyado en el suelo). Van como
 * constantes porque `Scene.tsx` las lee al cargar el módulo, mucho antes de
 * que el GLB haya llegado.
 */
export const TRUCK = {
  /** Largo total del conjunto tractora + semirremolque. */
  length: 17.3,
  /** Altura del piso de carga. */
  deckTop: 1.2,
  /** Dónde empieza y dónde acaba la caja de carga. */
  bodyBack: 0.1,
  bodyFront: 13.6,
  /** Hasta dónde llega el hueco con la lona abierta: del culo a aquí. */
  openTo: CURTAIN_SPLIT + Z_TO_X,
  /** Altura del techo. */
  roof: 4.3,
  /**
   * Dónde está el enganche (la quinta rueda), desde la cola. Es el pivote de
   * la tractora cuando el camión maniobra (`escena/maniobra.ts`).
   *
   * **Sale de medir el GLB**: el frontal de la caja está en `z` 4,54 del
   * modelo y los dos ejes motrices de la tractora en 1,54–2,60 y 2,91–3,97;
   * la quinta rueda va un pelo por delante del centro de ese tándem, en
   * `z` ≈ 3,2. Pasado a la escena son 12,4 m.
   */
  enganche: 12.4,
};

/**
 * Dónde se parte el modelo entre tractora y semirremolque, en Z del modelo.
 *
 * **Se parte por piezas, no por un plano**, porque las dos se solapan a lo
 * largo: la caja del semirremolque llega hasta `z` 4,54 y el chasis de la
 * tractora empieza en 1,27, por debajo de ella. Lo que decide es dónde
 * **empieza** cada pieza: todo lo que arranca por delante de esto es de la
 * tractora (chasis, ejes motrices, cabina, los pilotos de su trasera) y todo
 * lo que arranca por detrás es del semirremolque, aunque llegue más lejos (la
 * caja, la lona, los largueros). Medido nodo a nodo leyendo el GLB.
 *
 * La única excepción es el jirón de lona del lado lejano (`Cloth`), que
 * arranca en 3,42 y es del semirremolque.
 */
const CORTE_TRACTORA = 1.2;
const DEL_REMOLQUE = new Set(['Cloth']);

/** El escudo del techo: lo único que se ve del camión en vista cenital. */
const ROOF_LIVERY = { z: CURTAIN_SPLIT - 1, width: 3.6, height: 2.3 };

/**
 * Dónde arranca la carga que ya va dentro, en coordenadas del modelo.
 *
 * `z` es el eje largo: la primera torre queda en `x ≈ 5,2` de la escena, o sea
 * a algo más de un metro por delante de donde se para el lote que entra (que
 * ocupa de 0,4 a 4,0). Ese hueco es lo que hace que se lean como dos cosas
 * distintas y no como un bloque continuo.
 *
 * `y` es el piso de la caja. `x` deja la fila centrada a lo ancho: de perfil
 * no se distingue la profundidad, así que una sola fila basta y son decenas de
 * mallas menos.
 */
const TRAILER_LOAD = { x: -0.05, y: 1.2, z: 5.9 - Z_TO_X };

type Props = {
  /**
   * Grupo de la lona corredera. La escena le escribe `scale.z` en cada
   * fotograma: 1 = cerrada, casi 0 = recogida contra el montante central.
   */
  curtainRef?: RefObject<Group | null>;
  /**
   * Logo del techo. Lo enciende la escena solo en vista cenital: la cámara
   * de perfil no mira del todo horizontal, así que desde ahí el logo se ve
   * aplastado por encima del techo y parece un fantasma.
   */
  roofRef?: RefObject<Group | null>;
  /**
   * Grupo de la tractora. Gira sobre el enganche (`TRUCK.enganche`) y la escena le
   * escribe `rotation.y`: lo que va doblada respecto al semirremolque
   * mientras maniobra. Recta, 0.
   */
  tractorRef?: RefObject<Group | null>;
  /** Lo que tiene que girar con la tractora, en coordenadas del camión
   *  (cola en el origen, mirando a +X): su sombra de contacto. */
  conLaTractora?: ReactNode;
};

export default function TruckModel({
  curtainRef,
  roofRef,
  tractorRef,
  conLaTractora,
}: Props) {
  const { scene } = useGLTF(MODEL, false);
  const logo = useTexture('/logo.png');

  const model = useMemo(() => {
    const root = scene.clone(true);
    const remove: Object3D[] = [];
    const curtain = new Box3();
    const cab = new Box3();
    // Un clon por material, no uno por pieza. Antes cada cristal y cada pieza
    // repintada se llevaba su propio clon, y eso impedía fundir las piezas
    // que comparten material (ver `fundirPorMaterial` más abajo).
    const clones = new Map<string, MeshStandardMaterial>();
    const clonUnaVez = (
      clave: string,
      original: MeshStandardMaterial,
      ajustar: (m: MeshStandardMaterial) => void,
    ) => {
      let clon = clones.get(clave);
      if (!clon) {
        clon = original.clone();
        ajustar(clon);
        clones.set(clave, clon);
      }
      return clon;
    };

    root.traverse((child) => {
      const name = child.name || '';
      if (DROP_NAMES.some((drop) => name.includes(drop)) || DROP_NODES.test(name)) {
        remove.push(child);
        return;
      }
      if (!(child instanceof Mesh)) return;

      const material = child.material as MeshStandardMaterial;
      const materialName = material?.name ?? '';

      if (DROP_MATERIALS.has(materialName)) {
        remove.push(child);
        return;
      }

      // La lona original se mide y se aparta: la dibuja la nuestra.
      if (materialName === CURTAIN_MATERIAL) {
        curtain.expandByObject(child);
        child.visible = false;
        return;
      }

      // **Solo proyectan sombra las piezas grandes, y esto es medida, no
      // gusto.** El GLB trae 117 mallas y marcarlas todas duplicaba el coste
      // del camión entero: cada proyector se dibuja dos veces, una en pantalla
      // y otra en el mapa de sombras. La mitad de esas mallas son tornillos,
      // manillas, retrovisores y pilotos, y su sombra la proyectan desde 60
      // metros de distancia sobre un mapa de 2048: no llega ni a un píxel.
      //
      // El corte va por el lado mayor de la caja de la pieza. 0,45 m deja
      // fuera la tornillería y los detalles y deja dentro ruedas, chasis,
      // cabina, lona y largueros, que son las que dibujan la silueta.
      // Comprobado mirando: la sombra del conjunto no cambia.
      child.geometry.computeBoundingBox();
      const caja = child.geometry.boundingBox;
      const tam = caja ? caja.getSize(new Vector3()) : null;
      const escala = child.getWorldScale(new Vector3());
      const lado = tam
        ? Math.max(tam.x * escala.x, tam.y * escala.y, tam.z * escala.z)
        : 0;

      child.castShadow = lado >= 0.45;
      child.receiveShadow = true;

      // **El cristal, de cristal.** Rugosidad muy baja para que el reflejo
      // tenga filo, algo de metalicidad para que lo coja con fuerza, y el
      // entorno multiplicado: sin subir `envMapIntensity`, el `Environment` de
      // la escena apenas se nota sobre un material casi dielectrico.
      //
      // **No lleva transparencia**, y es decision: dentro de la cabina no hay
      // nada modelado, asi que un parabrisas translucido ensenaria el respaldo
      // del asiento flotando en el vacio. Opaco y reflectante se lee como
      // cristal; translucido y vacio se lee como un agujero.
      if (GLASS_MATERIALS.has(materialName)) {
        child.material = clonUnaVez(`vidrio:${materialName}`, material, (vidrio) => {
          vidrio.roughness = 0.08;
          vidrio.metalness = 0.55;
          vidrio.envMapIntensity = 2.4;
          vidrio.color.set('#aebccd');
        });
        child.castShadow = false;
        return;
      }

      // La chapa de la cabina: de ella sale el plano donde van las rayas.
      if (materialName === CAB_MATERIAL) cab.expandByObject(child);

      const brandColor = BRAND[materialName];
      if (brandColor) {
        // Se clona el material: si no, se repintaría también cualquier otra
        // malla que comparta la misma instancia.
        child.material = clonUnaVez(`marca:${materialName}`, material, (painted) => {
          painted.color.set(brandColor);
          painted.map = null;
        });
      }
    });

    remove.forEach((node) => node.removeFromParent());

    // **La tractora sale aparte**, para que pueda girar sobre el enganche
    // cuando el camión maniobra (D3). Ver `CORTE_TRACTORA`. `attach` conserva
    // la posición de cada pieza, así que no hay que rehacer ninguna cuenta.
    root.updateMatrixWorld(true);
    const tractora = new Group();
    const deLaTractora: Mesh[] = [];
    const pieza = new Box3();
    root.traverse((child) => {
      if (!(child instanceof Mesh) || !child.visible) return;
      const nombre = (child.material as MeshStandardMaterial)?.name ?? '';
      if (DEL_REMOLQUE.has(nombre)) return;
      if (pieza.setFromObject(child).min.z >= CORTE_TRACTORA) deLaTractora.push(child);
    });
    deLaTractora.forEach((malla) => tractora.attach(malla));

    // **Fundido por material**, cada pieza por su lado. Ver
    // `fundirPorMaterial`: de ~97 mallas a una por material, que es lo que de
    // verdad cuesta dibujar el camión. Partido en dos, los materiales que
    // salen en las dos piezas (ruedas, chasis, pilotos) cuestan una llamada
    // más cada uno: es el precio de que el camión se doble. La lona original
    // va invisible (la dibuja la nuestra) y se queda fuera sola, porque solo
    // se funde lo que se ve.
    fundirPorMaterial(root);
    fundirPorMaterial(tractora);

    // Ahora que está limpio se mide de verdad —las dos piezas juntas— y se
    // recoloca: mirando a +X, apoyado en el suelo y con el origen en la cola.
    const box = new Box3()
      .setFromObject(root)
      .union(new Box3().setFromObject(tractora));
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    const offset = new Vector3(-center.x, -box.min.y, -center.z);
    root.position.copy(offset);
    tractora.position.copy(offset);

    return { root, tractora, size, offset, curtain, cab };
  }, [scene]);

  // Plano del costado y longitud de cada pieza, sacados de la malla original.
  const skinX = model.curtain.min.x;
  const skinZ = (model.curtain.min.z + model.curtain.max.z) / 2;
  const skinLength = model.curtain.max.z - model.curtain.min.z;
  const fixedLength = model.curtain.max.z - CURTAIN_SPLIT;
  const slideLength = CURTAIN_SPLIT - model.curtain.min.z;

  // Las tres franjas del costado. La lona solo ocupa la de en medio: lo de
  // abajo son tableros y lo de arriba el perfil del techo, y ninguno de los
  // dos se mueve al abrir.
  const boardsY = model.curtain.min.y + BOARDS_HEIGHT / 2;
  const railY = model.curtain.max.y - RAIL_HEIGHT / 2;
  const skinH =
    model.curtain.max.y - model.curtain.min.y - BOARDS_HEIGHT - RAIL_HEIGHT;
  const skinY = model.curtain.min.y + BOARDS_HEIGHT + skinH / 2;
  // Chapa de la cabina: las rayas y el escudo van justo por fuera.
  const cabX = model.cab.min.x - 0.02;

  // Las dos mitades de la lona se reparten un mismo lienzo, así que el rótulo
  // queda centrado en la lona entera aunque esté partido entre ellas. El 0 de
  // la textura es la cola.
  const split = (CURTAIN_SPLIT - model.curtain.min.z) / skinLength;
  const fixedSkin = curtainSection(split, 1);
  const slideSkin = curtainSection(0, split);
  const plainSkin = curtainPlain();

  // El modelo viene a lo largo de Z; la escena trabaja con el camión mirando
  // a +X. Primero se gira (el eje largo pasa a X) y **después** se desplaza
  // media longitud, para que el origen caiga en la cola y no en el centro.
  // El orden importa: al revés, el desplazamiento se aplicaría girado.
  return (
    <>
    <group position={[model.size.z / 2, 0, 0]}>
      <group rotation={[0, Math.PI / 2, 0]}>
        <primitive object={model.root} />

        {/* Lona y rotulación. Van dentro del giro y con el mismo
            desplazamiento que el modelo, así que se colocan en coordenadas
            del propio camión y no hay que rehacer la cuenta. */}
        <group position={model.offset}>
          {/* Mitad fija, la de delante. El rótulo no va pegado encima: viene
              en la propia textura, así se ilumina y se ensombrece con la lona
              en vez de parecer escrito sobre la imagen. */}
          <mesh
            position={[skinX, skinY, CURTAIN_SPLIT + fixedLength / 2]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.06, skinH, fixedLength]} />
            <meshStandardMaterial
              map={fixedSkin.colour}
              normalMap={fixedSkin.normal}
              normalScale={CURTAIN_RELIEF}
              roughness={0.5}
              side={DoubleSide}
            />
          </mesh>

          {/* Mitad corredera, la de la cola. El grupo tiene el pivote en el
              montante central, así que encogerlo en Z la recoge contra él en
              vez de hacerla desaparecer: eso es el fuelle. */}
          <group ref={curtainRef} position={[0, 0, CURTAIN_SPLIT]}>
            <mesh
              position={[skinX, skinY, -slideLength / 2]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.07, skinH, slideLength]} />
              <meshStandardMaterial
                map={slideSkin.colour}
                normalMap={slideSkin.normal}
                normalScale={CURTAIN_RELIEF}
                roughness={0.5}
                side={DoubleSide}
              />
            </mesh>
          </group>

          {/* Costado lejano, de una pieza: el GLB no lo trae (se modeló para
              un render de un solo lado) y sin esto el semirremolque se ve
              abierto por el otro costado en cuanto la cámara sube a cenital.
              Este no se abre nunca. */}
          <mesh position={[-skinX, skinY, skinZ]} castShadow receiveShadow>
            <boxGeometry args={[0.06, skinH, skinLength]} />
            <meshStandardMaterial
              map={plainSkin.colour}
              normalMap={plainSkin.normal}
              normalScale={CURTAIN_RELIEF}
              roughness={0.5}
              side={DoubleSide}
            />
          </mesh>

          {/* Tableros de aluminio y perfil del techo, en los dos costados.
              Van fijos: al abrir la lona siguen ahí, que es justo lo que se ve
              en el camión real cuando está cargando. */}
          {[skinX, -skinX].map((side) => (
            <group key={side}>
              <mesh position={[side, boardsY, skinZ]} castShadow receiveShadow>
                <boxGeometry args={[0.09, BOARDS_HEIGHT, skinLength]} />
                <meshStandardMaterial
                  color={ALUMINIUM}
                  roughness={0.45}
                  metalness={0.25}
                />
              </mesh>
              <mesh position={[side, railY, skinZ]} castShadow receiveShadow>
                <boxGeometry args={[0.1, RAIL_HEIGHT, skinLength]} />
                <meshStandardMaterial
                  color={ALUMINIUM}
                  roughness={0.4}
                  metalness={0.25}
                />
              </mesh>
            </group>
          ))}

          {/* Carga que el semirremolque ya lleva, hacia la cabeza tractora.
              Deja libre toda la mitad de la cola, que es donde entra el lote
              nuevo: así se distinguen los dos y se entiende la maniobra. */}
          <group
            position={[TRAILER_LOAD.x, TRAILER_LOAD.y, TRAILER_LOAD.z]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <TrailerLoad />
          </group>

          {/* Logo en el techo: es lo que se ve en la vista cenital. */}
          <group ref={roofRef} visible={false}>
            <mesh
              position={[0, model.curtain.max.y + 0.06, ROOF_LIVERY.z]}
              rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
            >
              <planeGeometry args={[ROOF_LIVERY.width, ROOF_LIVERY.height]} />
              <meshBasicMaterial map={logo} transparent toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
    </group>

    {/* **La tractora**, colgada del enganche. El grupo exterior es el pivote:
        girarlo dobla el camión por la quinta rueda, que es lo que hace uno de
        verdad al maniobrar. El interior la devuelve a su sitio, así que dentro
        todo va en las mismas coordenadas que el resto del camión. */}
    <group ref={tractorRef} position={[TRUCK.enganche, 0, 0]}>
      <group position={[-TRUCK.enganche, 0, 0]}>
        {conLaTractora}
        <group position={[model.size.z / 2, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <primitive object={model.tractora} />
            <group position={model.offset}>
              {/* Rotulación de la cabina: solo las rayas de la puerta. El
                  escudo que había aquí se quitó: en la tractora de verdad va
                  pequeño y abajo, y a este tamaño se comía la puerta entera.
                  Van como piezas sueltas por fuera de la chapa, no en la
                  textura, así que se colocan sin tocar el UV del modelo. */}
              {CAB_STRIPES.map((stripe) => (
                <mesh
                  key={stripe.y}
                  position={[cabX, stripe.y, CAB_STRIPE.z]}
                  rotation={[0, -Math.PI / 2, 0]}
                >
                  <planeGeometry args={[CAB_STRIPE.length, stripe.h]} />
                  <meshBasicMaterial color={stripe.color} toneMapped={false} />
                </mesh>
              ))}
            </group>
          </group>
        </group>
      </group>
    </group>
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
