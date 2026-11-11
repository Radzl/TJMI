/**
 * Mide la proporción de una lista de candidatos, sin descargarlos enteros.
 *
 * **Esto existe por un fallo concreto.** La hoja de contactos recorta todas
 * las miniaturas a 3:2, así que **esconde si el original es vertical**. Tres
 * de las doce primeras elegidas resultaron ser verticales de 1800 × 2700, que
 * es exactamente el problema que esta web ya tiene con tres fotos de servicio
 * —«son verticales metidas en huecos apaisados»—.
 *
 * Baja una versión de 240 px de ancho, lee la cabecera JPEG y dice la
 * proporción. Cuesta unos kilobytes por candidato.
 *
 * Uso: node scripts/fotos/medir.mjs 34908275 37637866 ...
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function medirJpeg(ruta) {
  const b = fs.readFileSync(ruta);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marca = b[i + 1];
    if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) {
      return { alto: b.readUInt16BE(i + 5), ancho: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'medir-'));

console.log('  id          proporción   orientación');
for (const id of process.argv.slice(2)) {
  const f = path.join(tmp, `${id}.jpg`);
  try {
    execFileSync('curl', [
      '-sL',
      '--max-time',
      '30',
      '-o',
      f,
      `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=240`,
    ]);
    const m = medirJpeg(f);
    if (!m) {
      console.log(`  ${id.padEnd(11)} no se puede leer`);
      continue;
    }
    const r = m.ancho / m.alto;
    const cual =
      r >= 1.7 ? 'apaisada ancha' : r >= 1.25 ? 'apaisada' : r > 0.95 ? 'casi cuadrada' : 'VERTICAL';
    console.log(`  ${id.padEnd(11)} ${r.toFixed(2).padStart(5)}        ${cual}`);
  } catch {
    console.log(`  ${id.padEnd(11)} fallo al bajarla`);
  }
}

fs.rmSync(tmp, { recursive: true, force: true });
