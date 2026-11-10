/**
 * Mandar un correo desde el servidor.
 *
 * ## Por qué esto existe y no una librería
 *
 * Hay dos formas de mandar correo desde Next: una librería de SMTP
 * (`nodemailer`) o la API de un proveedor. Aquí va lo segundo, **por HTTP y
 * sin dependencia ninguna**:
 *
 * - `nodemailer` arrastra una conexión SMTP viva, y en un servidor que se
 *   apaga entre peticiones —como el de Vercel, que es donde va esta web— eso
 *   es justo lo que peor funciona: la conexión se abre y se cierra en cada
 *   envío y los proveedores de correo lo miran con lupa.
 * - Y este proyecto **evita añadir dependencias** por sistema: el comprobador
 *   de fotos lee las cabeceras de los JPEG a mano antes que instalar `sharp`,
 *   y los iconos se generan con el Chrome que ya hay. Una petición `fetch` no
 *   añade nada.
 *
 * ## La costura está aquí a propósito
 *
 * Todo lo que sabe **quién** manda el correo vive en esta función. Si mañana
 * se cambia de proveedor, se cambia aquí y ni la ruta ni el formulario se
 * enteran. Hoy habla con Resend porque tiene un plan gratuito que cubre de
 * sobra el volumen de un formulario de presupuesto.
 *
 * ## Si no está configurado, no se rompe nada
 *
 * Sin `RESEND_API_KEY` esto devuelve `'sin-configurar'` en vez de reventar, y
 * el formulario se va por WhatsApp como hacía antes. **Eso es deliberado:**
 * el día que se despliegue sin haber puesto las claves, la web sigue captando
 * clientes por el camino de siempre en vez de tragarse las solicitudes en
 * silencio, que es el fallo caro.
 */

export type ResultadoCorreo = 'enviado' | 'sin-configurar' | 'fallo';

type Envio = {
  asunto: string;
  cuerpo: string;
  /** A quién puede responder la empresa dándole a «Responder». */
  responderA?: string;
};

/**
 * Las tres variables de entorno, en un sitio.
 *
 * Están documentadas en `.env.example`. Las tres tienen que estar: sin
 * remitente verificado, el proveedor rechaza el envío, y sin destinatario no
 * hay a quién mandárselo.
 */
function configuracion() {
  const clave = process.env.RESEND_API_KEY;
  const para = process.env.PRESUPUESTO_TO;
  const de = process.env.PRESUPUESTO_FROM;

  if (!clave || !para || !de) return null;
  return { clave, para, de };
}

export async function enviarCorreo({
  asunto,
  cuerpo,
  responderA,
}: Envio): Promise<ResultadoCorreo> {
  const config = configuracion();
  if (!config) return 'sin-configurar';

  try {
    const respuesta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.clave}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.de,
        to: config.para.split(',').map((x) => x.trim()),
        subject: asunto,
        text: cuerpo,
        // **`reply_to` es lo que de verdad importa aquí.** El correo lo manda
        // el dominio de la web, así que sin esto darle a «Responder» le
        // escribe al remitente técnico y no al cliente. Con esto, responder
        // es responderle a quien ha pedido el presupuesto.
        ...(responderA ? { reply_to: responderA } : {}),
      }),
      // Un formulario que tarda diez segundos ya ha perdido al cliente. Si el
      // proveedor no contesta en ocho, se corta y el formulario se va por
      // WhatsApp, que es mejor que una rueda girando.
      signal: AbortSignal.timeout(8000),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '');
      console.error(
        `[correo] el proveedor devolvió ${respuesta.status}`,
        detalle.slice(0, 300),
      );
      return 'fallo';
    }

    return 'enviado';
  } catch (error) {
    console.error('[correo] no se ha podido enviar', error);
    return 'fallo';
  }
}
