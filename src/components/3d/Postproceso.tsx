'use client';

import { EffectComposer, Vignette } from '@react-three/postprocessing';
import { useThree } from '@react-three/fiber';

/** Por debajo de este ancho se considera móvil y el postprocesado se apaga. */
const ANCHO_MOVIL = 768;

/**
 * El postprocesado de la escena: desenfoque de maqueta y viñeta.
 *
 * ## La viñeta
 *
 * Oscurece un pelo las esquinas, así que la mirada se va al centro y la
 * imagen deja de parecer un recorte pegado sobre la página.
 *
 * **Estuvo dos cosas mal escritas y las dos se arreglaron midiendo.** La
 * primera: `darkness: 0.42` no era «muy baja», era demasiado —el rojo del
 * borde superior caía de 241 en el centro a 192 en las esquinas—. La segunda:
 * «es casi gratis» era falso, cuesta **la mitad de los fotogramas** en un
 * teléfono. Las dos notas se habían escrito cuando **el efecto no se estaba
 * ejecutando**: en las referencias del arnés el borde superior salía plano en
 * 245 de lado a lado, sin rastro de caída.
 *
 * ## El desenfoque de maqueta: probado y descartado, con el motivo
 *
 * **No es que `DepthOfField` no se monte: es que no sirve con esta cámara.**
 * Conviene separar las dos cosas, porque la nota que había antes decía que el
 * desenfoque «no se puede montar con estas versiones» y eso era verdad de
 * `TiltShift2`, que reventaba el render y dejaba el Canvas en negro.
 * `DepthOfField` **arranca sin un solo error** con three 0.186 y
 * postprocessing 6.39.5. Lo que pasa es otra cosa.
 *
 * Lo que pasa es que **esta cámara es ortográfica y su `near` es −400**, con
 * `far` a 600. El efecto calcula el círculo de confusión a partir de la
 * profundidad normalizada, y con ese rango la cuenta no da: sale un desenfoque
 * **constante en toda la imagen**. Probado con `focusDistance` a 0,015 y a
 * 0,4; probado también fijando el enfoque por `target`, o sea por el punto del
 * mundo al que apunta la cámara, y con el rango enfocado de 0,015 a 0,25. Las
 * cuatro capturas salen igual: la escena entera borrosa, incluido el sujeto.
 *
 * Así que el desenfoque de maqueta **sigue sin estar**, y lo que lo sustituye
 * es lo que ya había: la niebla que se cierra en el primer plano (`FOG_CLOSE`)
 * y las dos torres de primerísimo término que solapan (`FOREGROUND_STACKS`).
 * Si no se puede desenfocar el primer término, se solapa.
 *
 * **Si alguien lo reintenta**, el camino no es tocar los parámetros del
 * efecto —eso ya está agotado—: es mirar el `near` negativo de la cámara. Y
 * hay que medir el coste, porque sería una segunda pasada a pantalla completa
 * sobre una que ya cuesta la mitad de los fotogramas en un teléfono.
 *
 * ## Las dos cosas van solo en escritorio
 *
 * Está medido que **una pasada a pantalla completa cuesta la mitad de los
 * fotogramas** en un móvil frenado a 1/4 de CPU. En escritorio no se nota.
 * Va con `enabled` y no desmontando el componente: montarlo y desmontarlo al
 * girar el teléfono recrearía el render target en mitad de la animación.
 *
 * **No se añade oclusión ambiental y es una decisión.** Con cámara ortográfica
 * y materiales planos aporta poco, y cuesta otra pasada entera.
 */
export default function Postproceso() {
  const ancho = useThree((estado) => estado.size.width);

  return (
    <EffectComposer enableNormalPass={false} enabled={ancho >= ANCHO_MOVIL}>
      <Vignette eskil={false} offset={0.32} darkness={0.14} />
    </EffectComposer>
  );
}
