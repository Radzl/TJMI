import { z } from 'zod';

/**
 * La solicitud de presupuesto, del lado del servidor.
 *
 * ## Por qué se valida dos veces
 *
 * El formulario ya valida en el navegador con este mismo esquema en
 * `QuoteForm`, y aun así aquí se vuelve a validar. No es desconfianza del
 * código propio: **cualquiera puede mandar un POST a esta ruta sin pasar por
 * el formulario**, y si el servidor se fía, lo que llega al correo de la
 * empresa es lo que el que mandó el POST quiera.
 *
 * Los mensajes de error de aquí van en español y sin traducir **a propósito**:
 * no los lee nadie. Quien usa el formulario ve los del navegador, que sí
 * están traducidos; estos solo existen para que el servidor pueda decir «esto
 * no vale» y quedar registrado.
 */
export const esquemaPresupuesto = z.object({
  origin: z.string().trim().min(2).max(120),
  destination: z.string().trim().min(2).max(120),
  pallets: z.string().trim().min(1).max(40),
  goods: z.string().trim().max(80),
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(40),
  details: z.string().trim().max(2000).optional().or(z.literal('')),
  consent: z.literal(true),

  /**
   * De qué idioma venía quien lo rellenó.
   *
   * No se usa para traducir el correo —lo lee la empresa, y va en español—
   * sino para **saber a quién responder en inglés**. Un cliente europeo que
   * rellena la versión inglesa y recibe la respuesta en español se queda
   * igual.
   */
  locale: z.enum(['es', 'en']).optional(),

  /**
   * El señuelo. Tiene que llegar **vacío**.
   *
   * Es un campo escondido que una persona no ve y por tanto no rellena, pero
   * que un robot de formularios rellena porque rellena todo lo que encuentra.
   * Es la defensa contra spam que **no le pide nada al visitante**: ni
   * captcha, ni «marca los semáforos», ni un tercero al que mandarle la IP de
   * nadie —que además caería dentro del consentimiento de cookies—.
   *
   * No para a un robot escrito a mano contra esta web en concreto. Para eso
   * está el límite de envíos, y aun así un ataque dirigido pasaría. Lo que
   * para es el 99 % que hay: robots genéricos que recorren formularios.
   */
  empresaWeb: z.string().max(0).optional(),
});

export type Presupuesto = z.infer<typeof esquemaPresupuesto>;

/**
 * El correo que recibe la empresa, en texto llano.
 *
 * **Va en texto y no en HTML**, y es decisión: un correo interno de aviso se
 * lee en el móvil, en dos segundos y para llamar por teléfono. El HTML aquí
 * solo añadiría formas de que se vea mal en un cliente de correo viejo y de
 * que algún filtro lo mande a spam.
 *
 * El orden no es el del formulario: **primero va lo que se necesita para
 * responder** —el teléfono y el nombre— y después el detalle del envío. Quien
 * abre esto normalmente va a llamar, no a leer.
 */
export function cuerpoDelCorreo(datos: Presupuesto): string {
  const linea = (etiqueta: string, valor?: string) =>
    valor ? `${etiqueta}: ${valor}` : null;

  return [
    `Nombre:    ${datos.name}`,
    linea('Empresa:  ', datos.company),
    `Teléfono:  ${datos.phone}`,
    `Email:     ${datos.email}`,
    '',
    '— El envío —',
    `Origen:    ${datos.origin}`,
    `Destino:   ${datos.destination}`,
    `Palés:     ${datos.pallets}`,
    `Mercancía: ${datos.goods}`,
    linea('Detalles:  ', datos.details),
    '',
    datos.locale === 'en'
      ? '⚠ Rellenado en la versión INGLESA de la web: responde en inglés.'
      : null,
    `Enviado desde el formulario de la web el ${new Date().toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
    })}.`,
  ]
    .filter((x) => x !== null)
    .join('\n');
}

/** El asunto, con lo justo para distinguirlo en la bandeja de entrada. */
export function asuntoDelCorreo(datos: Presupuesto): string {
  return `Presupuesto web · ${datos.origin} → ${datos.destination} · ${datos.pallets} palés`;
}
