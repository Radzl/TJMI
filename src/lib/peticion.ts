/**
 * De dónde viene una petición, para contar envíos por visitante.
 *
 * ## El orden de las cabeceras no es indiferente: es lo que impide falsearlo
 *
 * La primera versión miraba **`x-forwarded-for` primero**, que es lo que todo
 * el mundo escribe, y **se puede falsear**. Esa cabecera la puede poner el
 * cliente: el proxy de delante no la sustituye, le **añade** la IP real
 * detrás. O sea que una petición que llegue con
 *
 *     x-forwarded-for: 1.2.3.4
 *
 * acaba siendo `1.2.3.4, <ip real>` — y leer el primer valor, que es lo
 * correcto cuando la cabecera la pone solo el proxy, aquí devuelve justo el
 * que ha elegido quien ataca. Cambiando ese valor en cada petición, el límite
 * de envíos deja de existir.
 *
 * **Lo que sí pone la plataforma y el cliente no puede tocar** es
 * `x-vercel-forwarded-for` y `x-real-ip`. Por eso van primero. `x-forwarded-for`
 * se queda **de último recurso**, para que esto siga funcionando en local,
 * donde no hay plataforma delante y ninguna de las otras dos existe.
 *
 * ## Y por eso las pruebas pueden mandar la suya
 *
 * En local la única cabecera disponible es la que el cliente manda, así que
 * los guiones de `tests/perf/medidas/` envían un `x-forwarded-for` distinto
 * en cada pasada. Sin eso el arnés **no se puede relanzar**: la segunda vez
 * dentro de diez minutos se come el límite de la primera y canta cuatro
 * fallos que no existen. Un arnés que no se puede repetir se deja de usar.
 *
 * En producción esa cabecera nunca llega a usarse, porque `x-real-ip` siempre
 * está.
 */
export function direccionDe(peticion: Request): string {
  const cabecera =
    peticion.headers.get('x-vercel-forwarded-for') ??
    peticion.headers.get('x-real-ip') ??
    peticion.headers.get('x-forwarded-for') ??
    '';

  return cabecera.split(',')[0]?.trim() || 'local';
}

/**
 * Un contador de peticiones por visitante, en memoria.
 *
 * **Hay que saber lo que eso significa:** en un servidor que se apaga entre
 * peticiones, cada instancia lleva su propia cuenta y el contador se borra al
 * reciclarse. O sea que **esto no es un muro contra un ataque**: es lo que
 * impide que un dedo nervioso mande la misma solicitud ocho veces y que un
 * robot tonto llene el buzón en un minuto.
 *
 * Un límite de verdad pide un almacén compartido, o sea meter una base de
 * datos en una web que no tiene ninguna. Si algún día llega spam de verdad,
 * **ese** es el momento de montarlo, no antes.
 */
export function creaLimite({
  cuantas,
  ventanaMs,
}: {
  cuantas: number;
  ventanaMs: number;
}) {
  const vistas = new Map<string, number[]>();

  return function demasiadas(quien: string): boolean {
    const ahora = Date.now();
    const previas = (vistas.get(quien) ?? []).filter(
      (t) => ahora - t < ventanaMs,
    );

    if (previas.length >= cuantas) {
      vistas.set(quien, previas);
      return true;
    }

    previas.push(ahora);
    vistas.set(quien, previas);

    // La tabla se limpia sola: sin esto, una instancia que viva mucho acumula
    // una entrada por cada visitante que haya pasado alguna vez.
    if (vistas.size > 500) {
      for (const [clave, marcas] of vistas) {
        if (marcas.every((t) => ahora - t >= ventanaMs)) vistas.delete(clave);
      }
    }

    return false;
  };
}
