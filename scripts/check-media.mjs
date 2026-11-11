/**
 * Comprueba que cada foto llega al tamaño que pide su hueco.
 *
 * El problema que viene a resolver no se ve mirando la web en el portátil: una
 * foto de 403 px de ancho metida en un hueco de 1.150 se ve "un poco blanda" y
 * se echa la culpa a la cámara. No es la cámara: está ampliada al triple. Esto
 * lo dice con un número.
 *
 * No usa ninguna librería: lee la cabecera del JPEG y busca el marcador de
 * inicio de cuadro (SOF), que es donde van el alto y el ancho. Para PNG y WebP
 * hace lo propio. Añadir `sharp` por esto sería meter una dependencia nativa de
 * 30 MB en un proyecto que no la necesita para nada más.
 *
 *   node scripts/check-media.mjs        (o: npm run check:fotos)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Lee el tamaño de un JPEG del marcador SOF. */
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    // SOF0..SOF15, menos DHT (C4), JPG (C8) y DAC (CC), que no son de cuadro.
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function webpSize(buf) {
  const tag = buf.toString('ascii', 12, 16);
  if (tag === 'VP8X') return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1, h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
  if (tag === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  if (tag === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function imageSize(file) {
  const buf = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return jpegSize(buf);
  if (ext === '.png') return pngSize(buf);
  if (ext === '.webp') return webpSize(buf);
  return null;
}

// El manifiesto está en TypeScript, así que se lee a mano en vez de importarlo:
// no merece la pena montar un compilador para esto.
const manifest = fs.readFileSync(
  path.join(root, 'src/content/media.ts'),
  'utf8',
);
const photos = [...manifest.matchAll(
  /src:\s*'([^']+)',\s*\n\s*needs:\s*(\d+),\s*\n\s*ratio:\s*([\d.]+),/g,
)].map((m) => ({ src: m[1], needs: Number(m[2]), ratio: Number(m[3]) }));

if (photos.length === 0) {
  console.error('No he podido leer ninguna foto del manifiesto. ¿Ha cambiado el formato de src/content/media.ts?');
  process.exit(1);
}

// Las portadas del blog van aparte: las rutas están en `content/blog.ts`, una
// por artículo, y el hueco —que es el mismo para las diez— en `BLOG_COVER`.
// Escribir diez entradas a mano en el manifiesto sería garantizar que algún
// día se publique un artículo y su portada no la mire nadie.
const coverSpec = manifest.match(
  /export const BLOG_COVER = \{\s*\n\s*needs:\s*(\d+),\s*\n\s*ratio:\s*([\d.]+),/,
);
if (coverSpec) {
  const blog = fs.readFileSync(path.join(root, 'src/content/blog.ts'), 'utf8');
  for (const m of blog.matchAll(/^\s*cover:\s*'([^']+)',$/gm)) {
    photos.push({
      src: m[1],
      needs: Number(coverSpec[1]),
      ratio: Number(coverSpec[2]),
    });
  }
}

let bad = 0;
const rows = [];

for (const photo of photos) {
  const file = path.join(root, 'public', photo.src.replace(/^\//, ''));
  if (!fs.existsSync(file)) {
    rows.push([photo.src, 'FALTA', '', '', 'el archivo no existe']);
    bad += 1;
    continue;
  }

  const size = imageSize(file);
  const kb = Math.round(fs.statSync(file).size / 1024);
  if (!size) {
    rows.push([photo.src, '?', `${kb} KB`, '', 'no sé leer este formato']);
    continue;
  }

  // Se distingue lo grave de lo justo a propósito. Un 6 % de menos no se ve y
  // marcarlo en rojo solo consigue que se deje de mirar el aviso; lo que sí se
  // ve, y mucho, es una foto ampliada al doble o recortada a la mitad.
  const notes = [];
  let serious = false;

  if (size.w < photo.needs * 0.85) {
    serious = true;
    notes.push(
      `se amplía ${(photo.needs / size.w).toFixed(1)}× (tiene ${size.w}, pide ${photo.needs})`,
    );
  } else if (size.w < photo.needs) {
    notes.push(`justa de ancho, le faltan ${photo.needs - size.w} px`);
  }

  // El recorte se hace a la proporción del hueco, así que de una foto vertical
  // metida en un hueco apaisado se tira medio encuadre.
  const ratio = size.w / size.h;
  if (ratio < photo.ratio * 0.72) {
    serious = true;
    const kept = Math.round((ratio / photo.ratio) * 100);
    notes.push(
      `es vertical (${ratio.toFixed(2)}) en un hueco de ${photo.ratio.toFixed(2)}: solo se ve el ${kept} %`,
    );
  }

  if (kb > 400) notes.push(`pesa ${kb} KB, conviene recomprimir`);

  if (serious) bad += 1;
  rows.push([
    photo.src,
    `${size.w}x${size.h}`,
    `${kb} KB`,
    `pide ${photo.needs}px`,
    notes.join(' · ') || 'bien',
  ]);
}

const widths = [0, 1, 2, 3].map((i) =>
  Math.max(...rows.map((r) => String(r[i]).length)),
);
for (const r of rows) {
  const line = r
    .slice(0, 4)
    .map((cell, i) => String(cell).padEnd(widths[i]))
    .join('  ');
  console.log(`${line}  ${r[4]}`);
}

console.log('');
if (bad) {
  console.log(
    `${bad} de ${rows.length} fotos están mal de verdad: se amplían o se recortan a la mitad.`,
  );
  console.log(
    'No rompe nada y por eso cuesta verlo, pero es de lo que más hace que una web parezca de aficionado.',
  );
  process.exit(1);
}
console.log(`Las ${rows.length} fotos dan la talla.`);

// Evita que un import accidental lo ejecute dos veces.
void pathToFileURL;
