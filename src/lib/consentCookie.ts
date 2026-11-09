/**
 * La cookie del consentimiento, sin nada de React.
 *
 * ## Por qué está separado de `consent.ts`
 *
 * Porque el **layout es un componente de servidor** y `consent.ts` importa
 * `useSyncExternalStore`. Next lo rechaza de plano —«You're importing a module
 * that depends on `useSyncExternalStore` into a React Server Component»— y la
 * compilación no pasa. Así que lo que necesita la cabecera vive aquí, en un
 * archivo que no sabe que React existe, y `consent.ts` lo vuelve a exportar
 * para que el resto del proyecto no note la diferencia.
 *
 * Son cuatro cosas y las cuatro tienen que salir del **mismo sitio**: el
 * nombre de la cookie, su versión, el atributo que marca «ya decidió» y el
 * script que lo pone. Escritas a mano en dos archivos, subir
 * `CONSENT_VERSION` —que es obligatorio al añadir una categoría— dejaría el
 * script mirando la versión vieja: un consentimiento caducado seguiría
 * escondiendo el banner y **nadie volvería a preguntar**, que es justo lo que
 * la AEPD exige que no pase.
 */

/** Nombre de la cookie propia donde se guarda la decisión. */
export const CONSENT_COOKIE = 'tjmi_consent';

/**
 * Versión del consentimiento.
 *
 * **Al añadir una categoría o un servicio nuevo hay que subirla.** Eso
 * invalida los consentimientos antiguos y vuelve a preguntar, que es lo que
 * exige la AEPD.
 */
export const CONSENT_VERSION = 1;

/**
 * El atributo que dice «esta visita ya decidió», puesto antes del primer
 * pintado.
 *
 * ## Por qué hace falta, con el número delante
 *
 * El banner se pintaba **cuando hidrataba la página entera**, porque su
 * condición llevaba `useHydrated()` y eso vale `false` en el servidor. Y el
 * banner es, medido, **el elemento del LCP de la portada**: es el bloque de
 * texto más grande que se pinta. Resultado en una compilación de producción
 * con el móvil frenado: **LCP de 5,8 s, de los cuales 5,4 eran «render
 * delay»** —el párrafo esperando a que React llegara—, mientras el primer
 * pintado ya había ocurrido a los 0,9 s.
 *
 * O sea que la peor métrica de la portada no la causaba el 3D: la causaba un
 * banner esperando a JavaScript para aparecer.
 *
 * ## Y no se arregla a secas sacándolo en el HTML
 *
 * Ese `useHydrated()` estaba ahí por un motivo bueno: en el servidor no se
 * puede leer la cookie, así que un banner servido en el HTML **le parpadearía
 * a quien ya decidió**, en cada página. Eso es peor que tardar.
 *
 * Lo que lo resuelve es tomar la decisión **antes del primer pintado** con un
 * script que bloquea en la cabecera: lee esta cookie —que es propia, así que
 * no hay ninguna petición a nadie— y pone este atributo. El CSS esconde el
 * banner cuando está puesto. Leer `document.cookie` cuesta microsegundos.
 *
 * **Y no vale el mismo truco para el 3D**, que es la comparación que importa:
 * allí la pregunta es si hay WebGL, y abrir el primer contexto **cuesta 1.277
 * ms medidos**. Un script que bloquea solo se gana el sitio si lo que
 * pregunta es gratis.
 */
export const CONSENT_ATTRIBUTE = 'data-cookies';

/**
 * El script que va en la cabecera, como cadena.
 *
 * Se arma con las constantes de arriba a propósito (ver la cabecera de este
 * archivo). Va envuelto en `try` porque `document.cookie` puede lanzar en
 * contextos restringidos y un fallo aquí no puede llevarse por delante el
 * resto de la página: si revienta, el banner simplemente se pinta, que es el
 * lado seguro del fallo.
 */
export const CONSENT_INLINE_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]*)/);if(m&&JSON.parse(decodeURIComponent(m[1])).version===${CONSENT_VERSION})document.documentElement.setAttribute('${CONSENT_ATTRIBUTE}','hecho')}catch(e){}`;
