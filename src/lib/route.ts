import { range, smoothstep } from './utils';

/**
 * Tramo de la escena 5 en el que el camión recorre la carretera.
 *
 * Ocupa casi la mitad de la sección a propósito: el recorrido son 420 km y
 * con un tramo corto se despachaba en dos golpes de rueda. Si se toca esto,
 * hay que mover también el fundido final (`closing` en `Scene.tsx`) y la
 * salida del texto en `RoadIntro`, que van detrás de la llegada.
 */
// **Empezaba en 0,42 y eso dejaba la pantalla azul y vacía un buen rato.**
// El suelo oscuro acaba de retirarse en 0,28, así que entre una cosa y otra
// había catorce centésimas de sección —más de media pantalla— sin nada que
// mirar. Ahora el asfalto empieza a dibujarse en cuanto hay sitio para él.
//
// De paso el recorrido se alarga (0,58 de la sección en vez de 0,46), así que
// el camión va **más despacio**, que es la dirección en la que ya se había
// movido esto antes subiendo el alto de `RoadIntro`.
export const ROAD_RUN = { from: 0.34, to: 0.84 };

/**
 * El tramo de scroll de la escena de la carretera, **en un solo sitio**.
 *
 * Lo usan cuatro cosas: el disparador de la escena 3D, el cuentakilómetros, la
 * barra de avance y la entrada y salida del texto. Los cuatro miden fracciones
 * del mismo recorrido, así que **si uno mide otro tramo deja de cuadrar sin
 * dar ningún error**. Ya pasó: al cambiar el final de la escena a
 * `bottom bottom`, el cuentakilómetros se quedó con el antiguo y marcaba 393
 * km cuando el camión ya había aparcado.
 *
 * El final es `bottom bottom` y no `bottom top` por lo mismo que en el hero:
 * el bloque fijo de la sección se suelta cuando su borde inferior llega al de
 * la pantalla, y con el final por defecto el último 19 % de la coreografía
 * —la llegada a la nave y el cierre— ocurría con el bloque ya subiendo.
 */
export const ROAD_TRIGGER = { start: 'top bottom', end: 'bottom bottom' };

/**
 * Ancho de mundo del encuadre de la carretera, en metros.
 *
 * Vive aquí y no en `Scene.tsx` porque lo necesitan dos: la cámara, para
 * encuadrar, y el trazado, para saber **cuánta carretera tiene que llevar
 * dibujada por delante**. Teniéndolo en un solo sitio no se pueden
 * desincronizar, que es justo lo que pasaba: con un adelanto fijo, el que le
 * hacía falta al móvil llenaba de asfalto la pantalla en escritorio.
 *
 * En móvil es **más cerrado** y no más abierto. Con una pantalla tan alta, un
 * encuadre ancho abarca más de cien metros de carretera a lo largo: el
 * trazado sale como una culebra fina y no da tiempo a dibujarlo.
 *
 * ## Estuvieron demasiado cerca, y sobre todo en escritorio
 *
 * Fueron 38 en móvil y **45 en escritorio**, y a 45 el asfalto no se leía
 * como una carretera: se leía como una mancha gris que cruzaba la pantalla.
 * El camión mide 17,3 m y el fondo del encuadre en un monitor de 1280×900 era
 * de 31,6 m, o sea que **el camión se comía el 55 % de la profundidad**. A esa
 * distancia no cabe ni una curva entera, así que lo que la escena tiene que
 * contar —un camión recorriendo un trazado— no se podía ver.
 *
 * Ahora son **80 en escritorio** (fondo de 45 m, el camión en el 38 %) y **43
 * en móvil**. En escritorio entra la ese completa y, de regalo, el bloque de
 * texto de la izquierda deja de caer sobre el asfalto en casi todo el
 * recorrido. En móvil se sube menos a propósito: con esa pantalla tan alta
 * cada metro de ancho son 2,2 de fondo, así que 43 ya son 93 m de carretera a
 * lo largo.
 *
 * **Lo que cuelga de este número y se recoloca solo:** el adelanto de la
 * cámara (`ROAD_LEAD` va en fracción de la altura del encuadre) y cuánto
 * asfalto se lleva dibujado por delante (`aheadFraction` en `Road.tsx`, que lo
 * calcula de aquí). Por eso ensanchar el encuadre no deja la carretera
 * cortada a media pantalla.
 */
export function roadFrameWidth(viewportWidth: number) {
  return viewportWidth < 768 ? 43 : 80;
}

/**
 * Cuánto mira la cámara cenital por delante del camión, en fracción de la
 * altura del encuadre. El camión queda así en la franja alta y lo que se ve
 * debajo es la carretera que le queda, no la que ya ha hecho.
 */
export const ROAD_LEAD = 0.2;

/**
 * Dónde se planta la cámara en la vista cenital: a 70 m de altura y echada
 * 20 m hacia atrás, que son unos **16° respecto a la vertical**. Esa
 * inclinación es la que hace que el camión tenga volumen en vez de ser una
 * silueta plana.
 *
 * **Vive aquí y no en `Scene.tsx` por la misma razón que `roadFrameWidth`:**
 * no lo necesita solo la cámara. El cartel de dirección de `Road.tsx` tiene
 * que orientar su panel hacia ella, y si los dos números se desincronizan el
 * cartel deja de leerse sin que nada falle.
 */
export const ROAD_CAM = { height: 70, tilt: 20 };

/**
 * Desde un punto del suelo, hacia dónde queda la cámara cenital. Normalizado.
 */
export function roadCamDirection(): [number, number, number] {
  const largo = Math.hypot(ROAD_CAM.tilt, ROAD_CAM.height);
  return [-ROAD_CAM.tilt / largo, ROAD_CAM.height / largo, 0];
}

/**
 * Avance por la carretera, de 0 a 1. Lo comparten el camión, el trazado que se
 * dibuja y el cuentakilómetros para que los tres vayan clavados.
 */
export function roadProgress(route: number) {
  return smoothstep(range(route, ROAD_RUN.from, ROAD_RUN.to));
}
