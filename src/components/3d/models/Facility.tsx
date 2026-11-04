'use client';

type Props = {
  accent?: string;
};

/**
 * La nave de los extremos de la carretera, vista desde arriba.
 *
 * El origen del componente es la **cara de los muelles**, y los muelles miran
 * hacia +X: la nave queda detrás (−X) y el patio de maniobra delante (+X).
 * Así basta con colocar este origen en el extremo del trazado para que la
 * carretera entre literalmente en el patio y el camión aparque en un muelle.
 *
 * ## El fallo que tenía, y era de valor, no de forma
 *
 * La nave iba en `#edeae5` sobre un patio en `#e3e0da`: o sea **más clara que
 * su propia explanada**. Desde la cenital eso no se lee como un edificio, se
 * lee como una mancha pálida con dos cajas de colores encima, que es
 * exactamente lo que se veía en la llegada —el momento de pago de toda la
 * escena—. No era que faltara detalle: era que el edificio y el suelo medían
 * casi lo mismo.
 *
 * ## Lo que la hace reconocible desde arriba
 *
 * Son tres cosas, y ninguna es la forma de la planta:
 *
 * 1. **Los lucernarios.** Una nave industrial vista desde el aire se reconoce
 *    por las bandas claras del tejado antes que por nada más. Van en una sola
 *    malla instanciada.
 * 2. **Dos cuerpos pegados a distinta altura**, uno bajo de hormigón liso y
 *    otro más alto de chapa, con un escalón entre ellos. Es lo que son las
 *    naves de verdad de la casa (ver `public/media/camion-02.jpg`), y es la
 *    misma lectura que ya usan las del fondo del patio en `TerminalYard`: lo
 *    que las identifica no es la silueta, es que son **dos construcciones**.
 * 3. **Semirremolques aparcados en los muelles**, no cajas sueltas por el
 *    patio. Un remolque de culo a un muelle dice «terminal de transporte» sin
 *    una palabra; dos contenedores en mitad de la explanada no dicen nada.
 *
 * Los grises son **cálidos**, como los de `TerminalYard`: todo lo gris frío de
 * esta escena se ha leído siempre como «día lluvioso».
 *
 * ## Nada de esto proyecta sombra, y es coherente
 *
 * En la vista cenital no la proyecta nada (ver la nota del quitamiedos en
 * `CLAUDE.md`). Marcarlo aquí añadiría dibujados a la pasada de sombras para
 * no enseñar nada.
 */

/** Los dos cuerpos: el alto de chapa y el bajo de hormigón, pegados. */
const BODIES = [
  {
    id: 'chapa',
    depth: 14,
    z: 4,
    height: 8.2,
    roof: '#c3bfb6',
    ridge: '#9a968b',
    skylights: 5,
  },
  {
    id: 'hormigon',
    depth: 8,
    z: -7,
    height: 5.2,
    roof: '#a8a596',
    ridge: '#8d8a7c',
    skylights: 3,
  },
] as const;

const WIDTH = 15;
/**
 * Centro de la nave en X. Su cara de muelles cae en −1.
 *
 * Se exporta porque la cámara cenital lo necesita: al llegar deja de seguir
 * al camión y se posa sobre los edificios, y ese punto se **deriva** de aquí
 * en vez de escribirse a mano en `Scene.tsx`. Si la nave se mueve, la cámara
 * la sigue sola.
 */
export const FACILITY_CENTRE_X = -8.5;
const CENTRE_X = FACILITY_CENTRE_X;

/** Dónde hay muelle, en Z. */
const DOCKS = [-7.5, -2.5, 2.5, 7.5];
/**
 * En cuáles hay un remolque aparcado.
 *
 * **Tienen que ser los dos de fuera.** El trazado sale del origen de este
 * componente hacia +X y la calzada mide 10 m, así que ocupa de `z = −5` a
 * `z = 5`: un remolque en el muelle de 2,5 quedaba literalmente aparcado
 * sobre el asfalto por el que entra el camión. En ±7,5 los dos quedan fuera
 * incluso del arcén, que llega a 6,6.
 */
const PARKED = [7.5, -7.5];

export default function Facility({ accent = '#34548a' }: Props) {
  return (
    <group>
      {/* Patio de maniobra. Recibe luz como todo lo demás: el material sin
          iluminar era un resto de cuando el mapeo de tonos saturaba a blanco
          cualquier crema, y eso ya está arreglado.

          **Va por debajo del arcén de la carretera y eso no es un capricho.**
          Estuvo a `y = 0.02`, que es exactamente la altura del arcén, y donde
          los dos se solapan —que es justo la boca del patio— salía un rayado
          roto de libro: dos planos coplanares peleándose por el mismo píxel.
          El orden de alturas del suelo de esta escena es patio (0,012),
          arcén (0,02), asfalto (0,04) y marcas (0,06). Si añades otra capa,
          métela en esa escalera. */}
      <mesh position={[12, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#ded8cd" roughness={0.95} />
      </mesh>

      {BODIES.map((body) => (
        <group key={body.id}>
          <mesh position={[CENTRE_X, body.height / 2, body.z]}>
            <boxGeometry args={[WIDTH, body.height, body.depth]} />
            <meshStandardMaterial color={body.roof} roughness={0.78} />
          </mesh>

          {/* Cumbrera: desde arriba es el filo que hace que se lea como
              tejado y no como un bloque. */}
          {/* Se mete DENTRO del techo en vez de apoyarse encima: con la
              cara inferior justo en la cubierta son dos caras coplanares y
              vuelve el rayado. */}
          <mesh position={[CENTRE_X, body.height + 0.04, body.z]}>
            <boxGeometry args={[WIDTH + 0.2, 0.34, 1.2]} />
            <meshStandardMaterial color={body.ridge} roughness={0.85} />
          </mesh>

          {/* **Los lucernarios.** Bandas claras a lo ancho del tejado, que es
              lo primero por lo que se reconoce una nave desde el aire. Van
              apenas por encima de la cubierta para no pelearse con ella. */}
          {Array.from({ length: body.skylights }, (_, index) => {
            const paso = body.depth / (body.skylights + 1);
            return (
              <mesh
                key={index}
                position={[
                  CENTRE_X,
                  body.height + 0.02,
                  body.z - body.depth / 2 + paso * (index + 1),
                ]}
              >
                {/* Estrechos a propósito: a 1,05 m de ancho y en blanco
                    casi puro, cinco bandas convertían la cubierta en una
                    cebra. Un lucernario de verdad es una cinta fina sobre
                    mucha más chapa. */}
                <boxGeometry args={[WIDTH * 0.66, 0.2, 0.62]} />
                <meshStandardMaterial color="#ded9cc" roughness={0.45} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Franja de marca sobre la cara de los muelles. Es el único sitio
          donde aparece el color de la casa, y va en tira fina. */}
      <mesh position={[-1.1, 8.25, 4]}>
        <boxGeometry args={[0.9, 0.18, 14]} />
        <meshStandardMaterial color={accent} roughness={0.6} />
      </mesh>

      {DOCKS.map((z) => (
        <group key={z}>
          {/* El hueco oscuro del muelle. */}
          <mesh position={[-0.7, 1.6, z]}>
            <boxGeometry args={[0.7, 3.2, 3.4]} />
            <meshStandardMaterial color="#1c2530" roughness={0.9} />
          </mesh>
          {/* Marca pintada en el suelo delante de cada muelle. */}
          <mesh position={[4, 0.04, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7, 0.2]} />
            <meshBasicMaterial color="#c9c4bb" />
          </mesh>
        </group>
      ))}

      {/* **Los remolques, de culo al muelle.** Aquí estaban dos contenedores
          sueltos en mitad del patio, que es donde no está nadie nunca. Un
          semirremolque aparcado en su muelle dice qué sitio es esto. */}
      {PARKED.map((z, index) => (
        <group key={z} position={[0, 0, z]}>
          {/* Caja: arranca pegada al muelle y sale hacia el patio. */}
          <mesh position={[5.1, 2.1, 0]}>
            <boxGeometry args={[9.4, 3.2, 2.5]} />
            <meshStandardMaterial
              color={index === 0 ? '#e8e4dc' : '#d8d3ca'}
              roughness={0.72}
            />
          </mesh>
          {/* El costado, del color de la casa en uno y neutro en el otro: dos
              remolques idénticos se leen como un patrón, no como un patio. */}
          <mesh position={[5.1, 2.1, -1.28]}>
            <boxGeometry args={[9.0, 2.1, 0.06]} />
            <meshStandardMaterial
              color={index === 0 ? accent : '#b4afa5'}
              roughness={0.6}
            />
          </mesh>
          {/* Tren de rodaje, que es lo que lo separa de una caja apoyada. */}
          <mesh position={[8.4, 0.45, 0]}>
            <boxGeometry args={[2.6, 0.9, 2.3]} />
            <meshStandardMaterial color="#3a4150" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
