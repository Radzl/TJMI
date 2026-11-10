import { NextResponse } from 'next/server';
import { enviarCorreo } from '@/lib/correo';
import {
  asuntoDelCorreo,
  cuerpoDelCorreo,
  esquemaPresupuesto,
} from '@/lib/presupuesto';

/**
 * `POST /api/presupuesto` — recibe una solicitud y la manda al correo de la
 * empresa.
 *
 * ## Qué problema resuelve
 *
 * **El formulario no enviaba nada.** Los tres pasos validaban, la barra
 * avanzaba y al darle a enviar lo que hacía era **abrir WhatsApp** con el
 * texto preparado. O sea que quien lo rellenaba desde un ordenador sin
 * WhatsApp de escritorio, o desde un móvil con WhatsApp sin sesión, se
 * quedaba sin enviarlo **y la empresa sin enterarse de que alguien lo había
 * intentado**. Para una web cuyo trabajo es captar presupuestos, ese era el
 * agujero más caro que tenía.
 *
 * ## El proxy de idiomas no toca esta ruta
 *
 * Su `matcher` excluye `api` explícitamente (`src/proxy.ts`), así que
 * `/api/presupuesto` no se convierte en `/es/api/presupuesto`. **Comprobado
 * antes de escribir la ruta**, porque el filtro que deja fuera el sitemap y
 * el manifiesto es el del punto en el nombre, y aquí no hay punto.
 *
 * ## Lo que devuelve, y por qué importa el motivo
 *
 * Siempre JSON con `{ ok }` y, si no, un `motivo`. El formulario **decide qué
 * hacer según el motivo**: con `sin-configurar` o `fallo` se va por WhatsApp
 * como hacía antes, así que no se pierde la solicitud; con `limite` avisa y
 * no reintenta.
 */

/** Cuántos envíos se admiten por IP y en cuánto tiempo. */
const LIMITE = { envios: 5, ventanaMs: 10 * 60 * 1000 };

/**
 * El contador de envíos por IP.
 *
 * **Está en memoria, y hay que saber lo que eso significa**: en un servidor
 * que se apaga entre peticiones, cada instancia lleva su propia cuenta y el
 * contador se borra al reciclarse. O sea que **esto no es un muro contra un
 * ataque**: es lo que impide que un dedo nervioso mande la misma solicitud
 * ocho veces y que un robot tonto llene el buzón en un minuto.
 *
 * Un límite de verdad pide un almacén compartido. No se ha montado porque
 * sería meter una base de datos en una web que no tiene ninguna, y para el
 * volumen de un formulario de presupuesto el señuelo más esto sobra. Si algún
 * día llega spam de verdad, **ese** es el momento de montarlo, no antes.
 */
const envios = new Map<string, number[]>();

function demasiados(ip: string): boolean {
  const ahora = Date.now();
  const previos = (envios.get(ip) ?? []).filter(
    (t) => ahora - t < LIMITE.ventanaMs,
  );

  if (previos.length >= LIMITE.envios) {
    envios.set(ip, previos);
    return true;
  }

  previos.push(ahora);
  envios.set(ip, previos);

  // La tabla se limpia sola: sin esto, una instancia que viva mucho acumula
  // una entrada por cada IP que haya pasado alguna vez.
  if (envios.size > 500) {
    for (const [clave, marcas] of envios) {
      if (marcas.every((t) => ahora - t >= LIMITE.ventanaMs)) envios.delete(clave);
    }
  }

  return false;
}

/**
 * De dónde viene la petición.
 *
 * `x-forwarded-for` lo pone el proxy de delante y puede traer varias IP
 * separadas por comas: la primera es la del cliente. Si no hay ninguna
 * —desarrollo local— se usa una etiqueta fija, que para el límite vale igual.
 */
function direccion(peticion: Request): string {
  const cabecera =
    peticion.headers.get('x-forwarded-for') ??
    peticion.headers.get('x-real-ip') ??
    '';
  return cabecera.split(',')[0]?.trim() || 'local';
}

export async function POST(peticion: Request) {
  const ip = direccion(peticion);

  if (demasiados(ip)) {
    return NextResponse.json({ ok: false, motivo: 'limite' }, { status: 429 });
  }

  let crudo: unknown;
  try {
    crudo = await peticion.json();
  } catch {
    return NextResponse.json({ ok: false, motivo: 'datos' }, { status: 400 });
  }

  const datos = esquemaPresupuesto.safeParse(crudo);
  if (!datos.success) {
    // **El señuelo se trata como un dato inválido más**, y a propósito: a un
    // robot no se le dice «te he pillado», porque eso es justo lo que le sirve
    // para aprender a no caer. Se le dice lo mismo que a cualquier envío mal
    // formado.
    return NextResponse.json({ ok: false, motivo: 'datos' }, { status: 400 });
  }

  const resultado = await enviarCorreo({
    asunto: asuntoDelCorreo(datos.data),
    cuerpo: cuerpoDelCorreo(datos.data),
    responderA: datos.data.email,
  });

  if (resultado === 'enviado') {
    return NextResponse.json({ ok: true });
  }

  // **Ni `sin-configurar` ni `fallo` son un 500 para el visitante.** La
  // solicitud no se ha perdido: el formulario la va a mandar por WhatsApp. Se
  // devuelve 200 con el motivo para que el navegador no lo pinte de rojo en
  // la consola de quien esté mirando, y queda el `console.error` del lado del
  // servidor, que es donde sirve.
  return NextResponse.json({ ok: false, motivo: resultado });
}
