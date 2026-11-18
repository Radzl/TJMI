'use client';

import { Component, type ReactNode } from 'react';
import { limpiarSin3D, marcarSin3D } from '@/lib/sin3d';

type Props = { children: ReactNode };
type State = { caido: boolean };

/**
 * La red de seguridad del 3D, para lo que revienta **dentro del render**.
 *
 * ## Qué atrapa y qué no
 *
 * Atrapa lo que falla construyendo la escena: un GLB que no se puede leer,
 * una textura que no llega, un efecto de postprocesado incompatible con la
 * versión de three —esto último ya pasó en este proyecto y dejó el Canvas en
 * negro—. Sin boundary, cualquiera de esas cosas no deja «la web sin 3D»:
 * deja **la página entera rota**, porque React desmonta el árbol hasta la
 * raíz y Next pinta su pantalla de error.
 *
 * **No atrapa que no haya WebGL**, y eso costó una pasada descubrirlo: three
 * lanza ese error fuera de la fase de render, así que se escapa del boundary
 * y llega a la consola sin que React se entere. De eso se encarga la
 * comprobación previa de `ExperienceCanvas` (ver `lib/sin3d.ts`).
 *
 * Que la portada de una empresa de transporte desaparezca porque una pila 3D
 * no arranca en un portátil de 2016 es un precio que no hay que pagar: el
 * texto, los servicios, el teléfono y el formulario no dependen del Canvas.
 *
 * ## Qué hace al caerse
 *
 * Dos cosas, y la segunda es la importante:
 *
 * 1. **Deja de pintar el 3D**, sin más.
 * 2. **Marca el documento con `data-sin-3d`**, y eso pone la página en el
 *    mismo estado en el que ya sabe funcionar cuando el sistema pide reducir
 *    movimiento: el hero suelta el `sticky` y deja de medir
 *    pantallas de más, y la sección azul se pinta su propio fondo en vez de
 *    heredarlo del suelo de la escena.
 *
 * Ese estado no está duplicado: la variante `sin3d` de `globals.css` responde
 * a **todos** los disparadores —movimiento reducido, sin WebGL y este— así
 * que hay una sola definición de «esta página va sin 3D». Si añades una
 * sección que dependa del Canvas para su alto o su fondo, dale su `sin3d:`.
 *
 * ## No se reintenta
 *
 * A propósito. Si el contexto de WebGL se ha perdido, volver a montarlo suele
 * acabar en el mismo sitio y, mientras tanto, la página pega saltos de alto
 * delante de quien está leyendo. Mejor caer una vez y quedarse quieto.
 */
export default class Canvas3DBoundary extends Component<Props, State> {
  state: State = { caido: false };

  static getDerivedStateFromError(): State {
    return { caido: true };
  }

  componentDidCatch(error: unknown) {
    marcarSin3D('la escena se ha caído montándose', error);
  }

  componentWillUnmount() {
    if (this.state.caido) limpiarSin3D();
  }

  render() {
    if (this.state.caido) return null;
    return this.props.children;
  }
}
