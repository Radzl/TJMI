import { NextResponse } from 'next/server';
import { enviarCorreo } from '@/lib/correo';
import { creaLimite, direccionDe } from '@/lib/peticion';
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

/**
 * Cuántos envíos se admiten por visitante y en cuánto tiempo.
 *
 * Cinco cada diez minutos: de sobra para corregir un dato y volver a
 * mandarlo, y poco para que un robot llene el buzón. El contador y la
 * forma de identificar al visitante viven en `lib/peticion.ts`, que es
 * donde está escrito por qué el orden de las cabeceras importa.
 */
const demasiados = creaLimite({ cuantas: 5, ventanaMs: 10 * 60 * 1000 });
export async function POST(peticion: Request) {
  const ip = direccionDe(peticion);

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
