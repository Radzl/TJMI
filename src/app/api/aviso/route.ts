import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * `POST /api/aviso` — recoge los fallos que ocurren en el navegador de un
 * visitante.
 *
 * ## Qué problema resuelve
 *
 * **No había forma de enterarse de nada.** Si a alguien se le caía una página
 * o la escena 3D, el error se quedaba en la consola de su navegador. Las dos
 * veces que ha pasado en este proyecto —el postprocesado que dejó el Canvas
 * en negro y la cabecera de seguridad que mató el 3D en producción— se
 * descubrieron porque alguien fue a mirar.
 *
 * Ahora el fallo llega aquí, **se escribe en el registro del servidor** y, si
 * hay un `AVISOS_WEBHOOK` configurado, se reenvía a donde se quiera: un canal
 * de Slack, un Discord, lo que sea que acepte un POST con JSON.
 *
 * ## Por qué el reenvío va desde el servidor
 *
 * Porque un servicio de errores de los normales mete un script en la página,
 * y eso **caería dentro del consentimiento de cookies**: o sea que la mayoría
 * no lo tendría activo justo cuando más falta hace. Desde aquí el visitante
 * no habla con nadie más que con esta web.
 *
 * ## Qué NO se guarda
 *
 * Ni cookies, ni identificadores, ni nada que haya escrito el visitante. El
 * mensaje, el principio de la traza, la ruta y el navegador. Y no se almacena:
 * se escribe en el registro, que es lo que ya hace cualquier servidor con
 * cada petición.
 */

const esquema = z.object({
  motivo: z.string().max(40),
  mensaje: z.string().max(500),
  digest: z.string().max(80).optional(),
  traza: z.string().max(1200).optional(),
  ruta: z.string().max(300).optional(),
  agente: z.string().max(200).optional(),
});

/**
 * El límite, y aquí es más estricto que en el formulario a propósito.
 *
 * **Un fallo en bucle puede lanzar el mismo error cientos de veces por
 * segundo.** El cliente ya se limita solo a tres por pestaña, pero el cliente
 * es justo lo que está roto cuando esto se usa, así que el servidor no puede
 * fiarse de él. Veinte por IP y hora es de sobra para enterarse de un
 * problema y poco para que el aviso se convierta en el problema.
 */
const LIMITE = { avisos: 20, ventanaMs: 60 * 60 * 1000 };
const recibidos = new Map<string, number[]>();

function demasiados(ip: string): boolean {
  const ahora = Date.now();
  const previos = (recibidos.get(ip) ?? []).filter(
    (t) => ahora - t < LIMITE.ventanaMs,
  );

  if (previos.length >= LIMITE.avisos) {
    recibidos.set(ip, previos);
    return true;
  }

  previos.push(ahora);
  recibidos.set(ip, previos);

  if (recibidos.size > 500) {
    for (const [clave, marcas] of recibidos) {
      if (marcas.every((t) => ahora - t >= LIMITE.ventanaMs))
        recibidos.delete(clave);
    }
  }

  return false;
}

function direccion(peticion: Request): string {
  const cabecera =
    peticion.headers.get('x-forwarded-for') ??
    peticion.headers.get('x-real-ip') ??
    '';
  return cabecera.split(',')[0]?.trim() || 'local';
}

export async function POST(peticion: Request) {
  if (demasiados(direccion(peticion))) {
    // **204 y no 429.** A quien manda esto no le sirve de nada saber que se
    // ha pasado del límite: es una página rota avisando, no alguien
    // esperando una respuesta. Y un 429 en la consola encima del error
    // original solo añade ruido a quien esté depurando.
    return new NextResponse(null, { status: 204 });
  }

  let crudo: unknown;
  try {
    crudo = await peticion.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const datos = esquema.safeParse(crudo);
  if (!datos.success) return new NextResponse(null, { status: 204 });

  const { motivo, mensaje, digest, traza, ruta, agente } = datos.data;

  // Esto es lo que de verdad hace falta y lo que funciona sin configurar
  // nada: queda en el registro del servidor, que en Vercel se lee desde el
  // panel y en cualquier otro sitio desde donde se lean los registros.
  console.error(
    `[aviso] ${motivo} en ${ruta ?? '?'}${digest ? ` (digest ${digest})` : ''}: ${mensaje}`,
    traza ? `\n${traza}` : '',
    agente ? `\n${agente}` : '',
  );

  const webhook = process.env.AVISOS_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // `text` es el campo que entienden Slack y Discord sin configurar
        // nada más. El resto va aparte por si el destino sabe leerlo.
        body: JSON.stringify({
          text: `⚠ Web TJMI · ${motivo} en ${ruta ?? '?'}\n${mensaje}`,
          motivo,
          mensaje,
          digest,
          ruta,
          agente,
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch (error) {
      console.error('[aviso] no se ha podido reenviar al webhook', error);
    }
  }

  return new NextResponse(null, { status: 204 });
}
