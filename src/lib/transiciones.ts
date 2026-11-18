/**
 * **Las transiciones entre páginas que el navegador cancela no son errores.**
 *
 * Chrome cancela una transición de vista en dos casos, y los dos llegan como
 * un rechazo de su promesa `ready`:
 *
 *  - **`InvalidStateError`**: mientras dura se oculta la pestaña o cambia el
 *    tamaño de la ventana. En un móvil basta con que la barra de direcciones
 *    se esconda al hacer scroll durante una navegación.
 *  - **`TimeoutError`**: la página tarda más de 4 s en cambiar. Pasa si el
 *    hilo principal está ocupado justo entonces; en la portada hay una
 *    transición a los 0,84 s, mientras el 3D se está montando, y en un móvil
 *    lento eso puede pasar de 4 s.
 *
 * Las dos son inofensivas: React remata la actualización en su rama de error,
 * así que la página nueva se pinta igual, solo que sin el fundido.
 *
 * **React ya sabe que la primera es inofensiva y la calla**, pero solo si el
 * mensaje coincide **letra por letra** con uno de los que tiene apuntados
 * (`customizeViewTransitionError` en `react-dom`). Chrome cambió el texto:
 * ahora es «Transition was aborted because of invalid state. Document hidden»
 * o «… Viewport size changed», con la causa pegada al final. Ya no coincide,
 * React lo da por error de verdad y lo manda a `onRecoverableError`: en
 * desarrollo sale en el aviso de Next, y en producción en la consola de
 * cualquier visitante. La segunda React la anuncia siempre, como «a
 * Navigation stalled», y Next enseña el mensaje original de Chrome.
 *
 * **El arreglo no esconde la transición, solo el falso aviso**: envuelve
 * `document.startViewTransition` y, si `ready` se rechaza por cualquiera de
 * esos dos motivos, lo vuelve a rechazar como `InvalidStateError` con el texto
 * exacto que React reconoce. React sigue por el mismo camino de siempre y solo
 * deja de anunciarlo como fallo. Cualquier otro error —el `AbortError` de dos
 * transiciones pisándose, por ejemplo— pasa tal cual.
 *
 * Comprobado con `tests/perf/medidas/errores.mjs`: con `--sin-arreglo` sale
 * el error en cada vuelta; con el arreglo, en ninguna.
 *
 * Va en la cabecera y no en un módulo de React porque tiene que estar puesto
 * **antes** de la primera transición, la de los 0,84 s de la portada. Cuesta
 * lo que cuesta definir una función.
 *
 * Cuando React reconozca los mensajes nuevos, esto sobra; se puede comprobar
 * buscando «Transition was aborted» en
 * `node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js`.
 */
export const TRANSICIONES_INLINE_SCRIPT = `(function(){var d=document;var o=d.startViewTransition;if(typeof o!=='function'||o.__tjmi)return;var m='Transition was aborted because of invalid state';var w=function(){var t=o.apply(d,arguments);try{var r=t.ready.catch(function(e){if(e&&(e.name==='InvalidStateError'||e.name==='TimeoutError')){throw new DOMException(m,'InvalidStateError');}throw e;});Object.defineProperty(t,'ready',{value:r,configurable:true});}catch(_){}return t;};w.__tjmi=true;d.startViewTransition=w;})();`;
