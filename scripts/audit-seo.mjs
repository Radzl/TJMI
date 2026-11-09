// Auditoría SEO sobre el HTML que de verdad se sirve (`npm run check:seo`).
//
// **No mira el código: pide cada página.** Es lo que hay que hacer aquí,
// porque los fallos que esto destapó no se ven leyendo los archivos. El peor:
// 30 de las 32 páginas enseñaban el título y la descripción **de la portada**
// al compartirlas, y en el código cada una declaraba los suyos. Lo que pasaba
// es que ninguna declaraba `openGraph`, y los metadatos de Next no se funden
// campo a campo entre capas: si una página no lo define, hereda el del layout
// entero.
//
// Necesita el servidor levantado (`npm run dev`). Si escucha en
// otro puerto: `SEO_BASE=http://localhost:3001 npm run check:seo`.
//
// Sin librerías de parseo: expresiones regulares sobre el HTML, que para
// contar etiquetas y medir largos sobra. Es el mismo criterio que
// `check-media.mjs`, que lee la cabecera de un JPEG a mano en vez de traerse
// `sharp` para eso.
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.SEO_BASE ?? 'http://localhost:3000';
// Junto a las capturas del arnés visual, que ya está en `.gitignore`.
const OUT = 'tests/visual/salida';

/** Las rutas fijas, sin idioma. Espejo de `SITE_PATHS` en `lib/seo.ts`. */
const RUTAS = [
  '',
  '/servicios',
  '/servicios/grupaje',
  '/servicios/camion-completo',
  '/servicios/nacional-e-internacional',
  '/servicios/almacenaje',
  '/servicios/picking',
  '/servicios/contenedores',
  '/nosotros',
  '/blog',
  '/faq',
  '/contacto',
  '/cookies',
  '/privacidad',
  '/aviso-legal',
];

/** Lo que Google enseña de un título y de una descripción. */
const TITULO = { min: 25, max: 60 };
const DESC = { min: 110, max: 160 };

const uno = (html, re) => {
  const m = html.match(re);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
};
const todos = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

/** Quita etiquetas y deja el texto visible, para contar palabras. */
function texto(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const filas = [];

for (const locale of ['es', 'en']) {
  for (const ruta of RUTAS) {
    const url = `${BASE}/${locale}${ruta}`;
    let res;
    try {
      res = await fetch(url);
    } catch {
      console.error(
        `\n  No hay nadie escuchando en ${BASE}.\n` +
          '  Levanta el servidor con `npm run dev`, o pasa el\n' +
          '  puerto: SEO_BASE=http://localhost:3001 npm run check:seo\n',
      );
      process.exit(1);
    }
    const html = await res.text();

    const head = html.slice(0, html.indexOf('</head>') + 7);
    const body = html.slice(html.indexOf('<body'));
    const main = body.slice(body.indexOf('<main'), body.indexOf('</main>'));

    const h1s = todos(body, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map((h) => texto(h));
    const h2s = todos(main, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map((h) => texto(h));

    const jsonLd = todos(
      html,
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    );
    const tipos = jsonLd.flatMap((raw) => {
      try {
        const d = JSON.parse(raw);
        return (d['@graph'] ?? [d]).map((n) => n['@type']).flat();
      } catch {
        return ['ILEGIBLE'];
      }
    });

    const imgs = todos(body, /<img\b([^>]*)>/gi);

    filas.push({
      locale,
      ruta: ruta || '/',
      estado: res.status,
      title: uno(head, /<title[^>]*>([\s\S]*?)<\/title>/i),
      desc: uno(head, /<meta name="description" content="([^"]*)"/i),
      canonical: uno(head, /<link rel="canonical" href="([^"]*)"/i),
      hreflang: todos(head, /<link rel="alternate" hrefLang="([^"]*)"/gi).length,
      ogTitle: uno(head, /<meta property="og:title" content="([^"]*)"/i),
      ogImage: uno(head, /<meta property="og:image"[^>]*content="([^"]*)"/i),
      ogUrl: uno(head, /<meta property="og:url" content="([^"]*)"/i),
      ogType: uno(head, /<meta property="og:type" content="([^"]*)"/i),
      ogLocale: uno(head, /<meta property="og:locale" content="([^"]*)"/i),
      twitter: uno(head, /<meta name="twitter:card" content="([^"]*)"/i),
      h1n: h1s.length,
      h1: h1s[0] ?? null,
      h2n: h2s.length,
      palabras: texto(main).split(' ').filter(Boolean).length,
      jsonLd: tipos,
      imgs: imgs.length,
      sinAlt: imgs.filter((a) => !/\balt=/.test(a)).length,
    });
  }
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'seo-audit.json'), JSON.stringify(filas, null, 2));

const n = (s) => (s ? s.length : 0);
const corta = (s, k) => (s ? (s.length > k ? s.slice(0, k - 1) + '…' : s) : '—');

console.log(
  `\n=== TÍTULOS Y DESCRIPCIONES (título ${TITULO.min}-${TITULO.max}, descripción ${DESC.min}-${DESC.max}) ===\n`,
);
console.log('loc ruta                              est  tít  des  h1  h2  pal  title');
for (const f of filas) {
  const avisoT = n(f.title) > TITULO.max || n(f.title) < TITULO.min ? '!' : ' ';
  const avisoD = n(f.desc) > DESC.max || n(f.desc) < DESC.min ? '!' : ' ';
  console.log(
    f.locale,
    f.ruta.padEnd(34),
    String(f.estado).padStart(3),
    String(n(f.title)).padStart(3) + avisoT,
    String(n(f.desc)).padStart(3) + avisoD,
    String(f.h1n).padStart(2),
    String(f.h2n).padStart(3),
    String(f.palabras).padStart(4),
    ' ',
    corta(f.title, 58),
  );
}

console.log('\n=== CABECERA SOCIAL Y MARCADO ===\n');
console.log('loc ruta                              og:img og:loc  og:type  tarjeta        json-ld');
for (const f of filas) {
  console.log(
    f.locale,
    f.ruta.padEnd(34),
    (f.ogImage ? 'sí' : 'NO').padEnd(6),
    (f.ogLocale ?? 'NO').padEnd(7),
    (f.ogType ?? 'NO').padEnd(8),
    (f.twitter ?? 'NO').padEnd(14),
    f.jsonLd.length ? f.jsonLd.join(', ') : 'ninguno',
  );
}

// **El fallo que no se ve de otra manera.** Si treinta páginas comparten el
// `og:title` y no es el suyo, es la herencia del layout otra vez.
const prestado = filas.filter(
  (f) => f.ogTitle && f.title && !f.title.startsWith(f.ogTitle.split(' | ')[0]),
);

const sinImg = filas.filter((f) => !f.ogImage).length;
const sinUrl = filas.filter((f) => !f.ogUrl).length;
const malLocale = filas.filter((f) => !/^[a-z]{2}_[A-Z]{2}$/.test(f.ogLocale ?? ''));
const malH1 = filas.filter((f) => f.h1n !== 1);
const altFalta = filas.reduce((a, f) => a + f.sinAlt, 0);

console.log('\n=== RESUMEN ===');
console.log(`  páginas auditadas:                  ${filas.length}`);
console.log(`  sin og:image:                       ${sinImg}`);
console.log(`  sin og:url:                         ${sinUrl}`);
console.log(`  con og:locale mal formado:          ${malLocale.length}`);
console.log(`  con el og:title de otra página:     ${prestado.length}`);
console.log(`  con h1 distinto de 1:               ${malH1.length}`);
console.log(`  <img> sin alt:                      ${altFalta}`);
console.log(`\n  Detalle completo en ${path.join(OUT, 'seo-audit.json')}`);

// Solo falla por lo que es fallo, no por lo que es criterio. Los largos de
// título y descripción se avisan con `!` arriba pero no tumban el comando: son
// recomendaciones y a veces hay motivo para pasarse. Un comando que salta por
// cosas opinables se deja de mirar a la tercera, que es lo mismo que se razonó
// con el umbral de `check:3d`.
const duros = [
  [sinImg, 'sin og:image'],
  [sinUrl, 'sin og:url'],
  [malLocale.length, 'con og:locale mal formado'],
  [prestado.length, 'con el og:title de otra página'],
  [malH1.length, 'sin un h1 exacto'],
  [altFalta, 'imagen(es) sin alt'],
].filter(([cuantos]) => cuantos > 0);

if (duros.length) {
  console.error(
    '\n  FALLA: ' + duros.map(([c, q]) => `${c} ${q}`).join(', ') + '\n',
  );
  process.exit(1);
}

console.log('\n  Todo correcto.\n');
