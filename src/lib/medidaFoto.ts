import fs from 'node:fs';
import path from 'node:path';

/**
 * Ancho y alto de una foto de `public/`, leídos de su propia cabecera.
 *
 * **Para qué existe.** Open Graph pide `og:image:width` y `og:image:height`
 * para pintar la tarjeta la primera vez que alguien comparte el enlace; sin
 * ellos, Facebook y LinkedIn la piden, la miden y a veces enseñan la primera
 * tarjeta sin foto. Escribir los números a mano al lado de cada foto es
 * garantizar que el día que se cambie el archivo se queden los viejos, así que
 * se leen del archivo.
 *
 * Solo se usa al generar las páginas (las fichas de servicio son estáticas),
 * así que leer el disco aquí no le cuesta nada a ninguna visita. Mismo lector
 * de cabecera que `scripts/check-media.mjs`, que tampoco mete `sharp` por
 * esto.
 *
 * Devuelve `{}` si no puede leerla: las medidas son una ayuda, no un requisito,
 * y una tarjeta sin ellas sigue funcionando.
 */
export function medidaFoto(src: string): { width?: number; height?: number } {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', src));
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return {};
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      // SOF0..SOF15, menos DHT (C4), JPG (C8) y DAC (CC), que no son de cuadro.
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  } catch {
    // Sin archivo o ilegible: sin medidas.
  }
  return {};
}
