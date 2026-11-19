'use client';

import { type RefObject, useEffect, useMemo } from 'react';
import { CanvasTexture, type Group, SRGBColorSpace } from 'three';

/**
 * **La nave de Almazora, la sede de verdad** (D2, 2026-11-18).
 *
 * El cliente quería que detrás del camión se viera **su** nave y no una nave
 * cualquiera. Está sacada del primer plano del vídeo corporativo (la fachada
 * con el rótulo, segundo 0,3 de `video-corporativo.mp4`):
 *
 * - bloque blanco de dos plantas, con tejado de teja de poca pendiente;
 * - abajo, **dos portones** grandes, abiertos, con el interior en penumbra;
 * - arriba, **cinco ventanas** de cristal bronce;
 * - **«José María Ibáñez» en rojo** en lo alto, y **«TRANSPORTES»** pequeño y
 *   en azul a la izquierda, con el punto del logo delante;
 * - **zócalo gris** a todo lo largo y una moldura entre las dos plantas;
 * - abajo la planta es de bloque pintado (se ven las juntas) y arriba es
 *   enfoscado liso.
 *
 * **Todo el detalle va pintado en una textura generada aquí** y no modelado,
 * por lo mismo que el rótulo de la lona (`curtainSkin.ts`): a la distancia a la
 * que se ve —30 a 60 m— unas ventanas de verdad, con su marco y su hueco,
 * costarían decenas de piezas y saldrían igual. Lo que sí es volumen es lo que
 * se lee como volumen: el bloque, el alero del tejado y el zócalo.
 *
 * **Las medidas están estimadas sobre el fotograma**, tomando los portones
 * como referencia (un portón de nave para camiones mide unos 5 m de alto). No
 * son de plano: si el cliente da las medidas reales, cambian aquí.
 *
 * La fachada mira a +Z, que es hacia donde está la cámara de perfil.
 */
export const NAVE = {
  ancho: 24,
  alto: 9.8,
  fondo: 30,
  /**
   * Dónde va: **justo detrás del camión aparcado**, que se cuadra delante de
   * ella al entrar (D3). Estuvo en x = −14, a la izquierda del camión; ahora
   * el perfil de carga encuadra camión y nave a la izquierda del titular
   * (`ENCUADRE_CARGA`), y con la nave centrada un poco por detrás de la cola
   * el rótulo rojo cae en la mitad izquierda de la pantalla en escritorio y
   * dentro del plano cerrado de la carga en el móvil.
   *
   * Su costado izquierdo (x = −11) deja libre el carril por el que baja el
   * camión al entrar (x = −14). Estuvo en x = 2 y el final del rótulo rozaba
   * el titular a media bajada de la cámara: un metro a la izquierda lo aparta.
   */
  x: 1,
  z: -30,
};

/** Los dos portones de la fachada, medidos desde su borde izquierdo. */
const PORTONES = [
  { x: 2.4, ancho: 4.2, alto: 4.9 },
  { x: 13.4, ancho: 5.2, alto: 5.1 },
];

/**
 * El centro del portón izquierdo, en la `x` de la escena: **de ahí sale la
 * carretilla con el lote** (desde el 2026-11-18). Es lo que hace una de verdad
 * —carga en el almacén y lo lleva al camión—, y además deja la cámara alta
 * delante de la nave toda la intro, en vez de irse a la pila de contenedores.
 */
export const PUERTA_CARRETILLA =
  NAVE.x - NAVE.ancho / 2 + PORTONES[0].x + PORTONES[0].ancho / 2;

// Píxeles por metro de la textura de la fachada. 85 da 2048 px de ancho: a la
// distancia de la cámara la fachada no pasa de 600 px en pantalla, así que
// sobra para que las letras salgan limpias sin pesar de más.
const PX = 2048 / NAVE.ancho;
const ALTO_PX = Math.round(NAVE.alto * PX);

const COLOR = {
  bloque: '#f0efea',
  junta: '#dcdad3',
  enfoscado: '#f3f2ee',
  zocalo: '#8f8d88',
  moldura: '#e2e0da',
  marco: '#c4c1b9',
  cristal: '#5d5546',
  cristalBrillo: '#7a705b',
  hueco: '#2a2724',
  huecoFondo: '#4a4640',
  rojo: '#c4262c',
  azul: '#1f3168',
  teja: '#6f6a65',
};

/** Pasa metros de la fachada (x desde la izquierda, y desde el suelo) a
 *  píxeles del lienzo (y desde arriba). */
const px = (m: number) => m * PX;
const py = (m: number) => ALTO_PX - m * PX;

function pintarFachada(ctx: CanvasRenderingContext2D) {
  const w = ctx.canvas.width;

  // Planta baja: bloque pintado, con juntas horizontales cada 20 cm y
  // verticales a matajunta cada 40 cm. Muy suaves: a distancia lo que tienen
  // que dar es textura, no una cuadrícula.
  ctx.fillStyle = COLOR.bloque;
  ctx.fillRect(0, py(6.2), w, px(6.2));
  ctx.strokeStyle = COLOR.junta;
  ctx.lineWidth = 1.2;
  for (let fila = 0, y = 0.95; y < 6.2; fila++, y += 0.2) {
    ctx.beginPath();
    ctx.moveTo(0, py(y));
    ctx.lineTo(w, py(y));
    ctx.stroke();
    const desfase = fila % 2 ? 0.2 : 0;
    for (let x = desfase; x < NAVE.ancho; x += 0.4) {
      ctx.beginPath();
      ctx.moveTo(px(x), py(y));
      ctx.lineTo(px(x), py(Math.min(y + 0.2, 6.2)));
      ctx.stroke();
    }
  }

  // Planta alta: enfoscado liso.
  ctx.fillStyle = COLOR.enfoscado;
  ctx.fillRect(0, py(NAVE.alto), w, px(NAVE.alto - 6.2));

  // Moldura entre plantas, con su sombra debajo.
  ctx.fillStyle = COLOR.moldura;
  ctx.fillRect(0, py(6.32), w, px(0.12));
  const sombra = ctx.createLinearGradient(0, py(6.2), 0, py(5.95));
  sombra.addColorStop(0, 'rgba(0,0,0,0.10)');
  sombra.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sombra;
  ctx.fillRect(0, py(6.2), w, px(0.25));

  // Zócalo gris.
  ctx.fillStyle = COLOR.zocalo;
  ctx.fillRect(0, py(0.95), w, px(0.95));

  // Los dos portones: marco claro y el interior en penumbra, más oscuro abajo
  // y con el fondo de la nave apenas insinuado.
  for (const p of PORTONES) {
    ctx.fillStyle = COLOR.marco;
    ctx.fillRect(px(p.x - 0.18), py(p.alto + 0.18), px(p.ancho + 0.36), px(p.alto + 0.18));
    const hueco = ctx.createLinearGradient(0, py(p.alto), 0, py(0));
    hueco.addColorStop(0, COLOR.huecoFondo);
    hueco.addColorStop(0.55, COLOR.hueco);
    hueco.addColorStop(1, '#1b1917');
    ctx.fillStyle = hueco;
    ctx.fillRect(px(p.x), py(p.alto), px(p.ancho), px(p.alto));
    // La guía de la persiana enrollada, arriba del hueco.
    ctx.fillStyle = '#d6d3cc';
    ctx.fillRect(px(p.x), py(p.alto), px(p.ancho), px(0.22));
  }

  // Las cajas de contadores junto a los portones, en el zócalo.
  ctx.fillStyle = '#4b4a47';
  for (const x of [1.1, 10.4]) ctx.fillRect(px(x), py(1.25), px(0.4), px(0.5));

  // Cinco ventanas de cristal bronce con marco claro.
  for (const cx of [2.0, 6.3, 11.1, 16.3, 21.5]) {
    const ancho = 2.0;
    const x = cx - ancho / 2;
    ctx.fillStyle = COLOR.marco;
    ctx.fillRect(px(x - 0.08), py(8.25 + 0.08), px(ancho + 0.16), px(1.45 + 0.16));
    const cristal = ctx.createLinearGradient(0, py(8.25), 0, py(6.8));
    cristal.addColorStop(0, COLOR.cristalBrillo);
    cristal.addColorStop(1, COLOR.cristal);
    ctx.fillStyle = cristal;
    ctx.fillRect(px(x), py(8.25), px(ancho), px(1.45));
  }

  // El rótulo. La fachada real lleva una sans negrita de rótulo, de la familia
  // de la Helvetica/Arial, no la tipografía de la web: se pinta con esa.
  const fuente = (alto: number) =>
    `700 ${Math.round(px(alto))}px "Arial", "Helvetica Neue", Helvetica, sans-serif`;
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = COLOR.rojo;
  ctx.font = fuente(1.25);
  const rotulo = 'José María Ibáñez';
  // Ocupa de unos 6,3 a 19,2 m en el fotograma: se ajusta el cuerpo a ese
  // ancho en vez de fiarse de la métrica de la fuente que haya en el equipo.
  const anchoRotulo = px(12.9);
  const medido = ctx.measureText(rotulo).width;
  ctx.save();
  ctx.translate(px(6.3), py(8.45));
  ctx.scale(anchoRotulo / medido, 1);
  ctx.fillText(rotulo, 0, 0);
  ctx.restore();

  ctx.fillStyle = COLOR.azul;
  ctx.font = fuente(0.5);
  const transportes = 'TRANSPORTES';
  // Acaba antes de que empiece el rótulo rojo (6,3 m), con aire entre los dos.
  const anchoT = px(3.6);
  const medidoT = ctx.measureText(transportes).width;
  ctx.save();
  ctx.translate(px(1.9), py(8.5));
  ctx.scale(anchoT / medidoT, 1);
  ctx.fillText(transportes, 0, 0);
  ctx.restore();
  // El punto del logo delante de «TRANSPORTES».
  ctx.beginPath();
  ctx.arc(px(1.62), py(8.68), px(0.13), 0, Math.PI * 2);
  ctx.fill();

  // Remate de arriba: la sombra del alero sobre la pared.
  const alero = ctx.createLinearGradient(0, py(NAVE.alto), 0, py(NAVE.alto - 0.35));
  alero.addColorStop(0, 'rgba(0,0,0,0.16)');
  alero.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = alero;
  ctx.fillRect(0, py(NAVE.alto), w, px(0.35));
}

/** Los costados: enfoscado blanco con el zócalo, sin más. */
function pintarCostado(ctx: CanvasRenderingContext2D) {
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = COLOR.enfoscado;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = COLOR.zocalo;
  ctx.fillRect(0, h - h * (0.95 / NAVE.alto), w, h * (0.95 / NAVE.alto));
}

function textura(ancho: number, alto: number, pintar: (ctx: CanvasRenderingContext2D) => void) {
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  if (ctx) pintar(ctx);
  const t = new CanvasTexture(lienzo);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return { t, ctx };
}

/**
 * **Se ve desde el primer fotograma** (2026-11-18). Hasta entonces se fundía
 * al bajar la cámara a perfil, porque desde la cámara alta salía detrás del
 * titular; ahora la cámara alta encuadra el patio delante de ella y el rótulo
 * cae en la columna izquierda. Por eso ya no lleva materiales transparentes.
 *
 * **Cuatro llamadas de dibujo y no ocho**: era una caja con un material por
 * cara (seis llamadas, más el tejado). Ahora la caja lleva un solo material,
 * el del enfoscado, y la fachada va en un plano propio pegado delante. La
 * cara de arriba de la caja queda bajo el tejado y la de abajo no se ve nunca.
 */
export default function NaveAlmazora({ ref }: { ref?: RefObject<Group | null> }) {
  const { fachada, costado, repintar } = useMemo(() => {
    const f = textura(2048, ALTO_PX, pintarFachada);
    const c = textura(256, 128, pintarCostado);
    return {
      fachada: f.t,
      costado: c.t,
      // Las fuentes del sistema ya están, pero si el navegador tarda en tener
      // la métrica, se repinta en cuanto esté (igual que la lona).
      repintar: () => {
        if (!f.ctx) return;
        pintarFachada(f.ctx);
        f.t.needsUpdate = true;
      },
    };
  }, []);

  useEffect(() => {
    document.fonts?.ready.then(repintar).catch(() => {});
    return () => {
      fachada.dispose();
      costado.dispose();
    };
  }, [fachada, costado, repintar]);

  const { ancho, alto, fondo } = NAVE;
  return (
    <group ref={ref} position={[NAVE.x, 0, NAVE.z]}>
      {/* El bloque, todo de enfoscado. */}
      <mesh position={[0, alto / 2, -fondo / 2]} castShadow receiveShadow>
        <boxGeometry args={[ancho, alto, fondo]} />
        <meshStandardMaterial map={costado} roughness={0.92} />
      </mesh>
      {/* La fachada, un centímetro por delante del bloque para que no se
          peleen por el mismo plano. */}
      <mesh position={[0, alto / 2, 0.01]} receiveShadow>
        <planeGeometry args={[ancho, alto]} />
        <meshStandardMaterial map={fachada} roughness={0.88} />
      </mesh>

      {/* El tejado de teja: poca pendiente, a dos aguas hacia los costados, y
          un alero de 40 cm sobre la fachada. Es lo que de lejos convierte una
          caja blanca en una nave. */}
      {[-1, 1].map((lado) => (
        <mesh
          key={lado}
          position={[(lado * ancho) / 4, alto + 0.24, -fondo / 2 + 0.2]}
          rotation={[0, 0, -lado * 0.035]}
          castShadow
        >
          <boxGeometry args={[ancho / 2 + 0.5, 0.22, fondo + 0.8]} />
          <meshStandardMaterial color={COLOR.teja} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}
