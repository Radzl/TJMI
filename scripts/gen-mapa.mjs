/**
 * Genera los trazados del mapa de la ruta (`src/components/sections/routeMapPaths.ts`)
 * a partir de Natural Earth, que es **dominio público**: ni licencia que
 * aceptar ni crédito obligatorio.
 *
 * **Por qué existe.** El mapa era un polígono de 24 puntos dibujado a mano, sin
 * Portugal, sin Baleares y con el corredor como una curva de Bézier que no
 * pasaba por ningún sitio. Ahora la costa y la frontera son las de verdad, las
 * dos provincias que importan —Castellón, donde se recoge, y Madrid, donde se
 * entrega— van marcadas, y el corredor sigue la A-3 por los pueblos por los
 * que pasa.
 *
 * **Las provincias no salen del IGN, y es a propósito.** Hay un paquete con las
 * provincias del IGN ya en TopoJSON, pero su licencia (CC BY 4.0) pide aceptar
 * unas condiciones de uso antes de tocar los archivos. Natural Earth trae las
 * provincias españolas en su capa de primer nivel y no pide nada.
 *
 * Es un archivo derivado, como los iconos: si se quiere cambiar algo, se cambia
 * aquí y se vuelve a lanzar.
 *
 * Uso:
 *   node scripts/gen-mapa.mjs <countries-10m.json de world-atlas> <ne_10m_admin_1_states_provinces.geojson>
 *
 * Los dos se descargan de:
 *   https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-10m.json
 *   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson
 */
import fs from 'node:fs';

const [paisesRuta, provinciasRuta] = process.argv.slice(2);
if (!paisesRuta || !provinciasRuta) {
  console.log('  uso: node scripts/gen-mapa.mjs countries-10m.json ne_10m_admin_1.geojson');
  process.exit(1);
}

// ── Lienzo y proyección ──────────────────────────────────────────────────
// Equirrectangular con el ancho corregido por el coseno de la latitud media.
// Para una zona del tamaño de la península no se distingue de una cónica, y
// es una cuenta que cualquiera puede rehacer a mano.
const ANCHO = 1000;
const LON = [-9.6, 4.6];
const LAT = [35.8, 44.0];
const K = Math.cos(((LAT[0] + LAT[1]) / 2) * (Math.PI / 180));
const ESCALA = ANCHO / ((LON[1] - LON[0]) * K);
const ALTO = Math.round((LAT[1] - LAT[0]) * ESCALA);

const proyectar = ([lon, lat]) => [
  (lon - LON[0]) * K * ESCALA,
  (LAT[1] - lat) * ESCALA,
];

// ── Simplificación (Douglas–Peucker) ─────────────────────────────────────
// A este tamaño un punto cada medio píxel no se ve. Sin simplificar, la costa
// de 10m son decenas de miles de puntos.
function distanciaASegmento(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const largo = dx * dx + dy * dy;
  if (!largo) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / largo;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function simplificar(puntos, tolerancia) {
  if (puntos.length < 3) return puntos;
  let max = 0;
  let indice = 0;
  const ultimo = puntos.length - 1;
  for (let i = 1; i < ultimo; i += 1) {
    const d = distanciaASegmento(puntos[i], puntos[0], puntos[ultimo]);
    if (d > max) {
      max = d;
      indice = i;
    }
  }
  if (max <= tolerancia) return [puntos[0], puntos[ultimo]];
  return [
    ...simplificar(puntos.slice(0, indice + 1), tolerancia).slice(0, -1),
    ...simplificar(puntos.slice(indice), tolerancia),
  ];
}

const r = (n) => Math.round(n * 10) / 10;

// Lo que cae fuera del lienzo se aplasta contra un marco un poco más grande
// que él. Es un recorte tosco, pero el borde que deja queda fuera de la vista,
// y es lo que evita trazar Argelia entera para que asome un pico de costa.
const MARGEN = 24;
const aplastar = ([x, y]) => [
  Math.max(-MARGEN, Math.min(ANCHO + MARGEN, x)),
  Math.max(-MARGEN, Math.min(ALTO + MARGEN, y)),
];

function anillo(coords, tolerancia, minimo = 0) {
  const proyectados = coords.map(proyectar);
  // Fuera del todo (Canarias, el interior de Argelia): ni se traza.
  if (
    proyectados.every(
      ([x, y]) => x < -MARGEN || x > ANCHO + MARGEN || y < -MARGEN || y > ALTO + MARGEN,
    )
  ) {
    return '';
  }
  const pts = simplificar(proyectados.map(aplastar), tolerancia);
  if (pts.length < 4) return '';
  // Islotes que a este tamaño son una mota: fuera.
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  if (Math.max(...xs) - Math.min(...xs) < minimo && Math.max(...ys) - Math.min(...ys) < minimo) {
    return '';
  }
  return 'M' + pts.map((p) => `${r(p[0])} ${r(p[1])}`).join('L') + 'Z';
}

function trazado(geometria, tolerancia, minimo) {
  const poligonos =
    geometria.type === 'Polygon' ? [geometria.coordinates] : geometria.coordinates;
  return poligonos
    .map((poligono) => anillo(poligono[0], tolerancia, minimo))
    .filter(Boolean)
    .join('');
}

// ── TopoJSON a geometrías ────────────────────────────────────────────────
// Un decodificador mínimo, para no añadir `topojson-client` por un guion que
// se lanza una vez: los arcos van cuantizados y en diferencias.
const topo = JSON.parse(fs.readFileSync(paisesRuta, 'utf8'));
const [sx, sy] = topo.transform.scale;
const [tx, ty] = topo.transform.translate;
const arcos = topo.arcs.map((arco) => {
  let x = 0;
  let y = 0;
  return arco.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * sx + tx, y * sy + ty];
  });
});

function unirArcos(indices) {
  const puntos = [];
  for (const i of indices) {
    const arco = i < 0 ? arcos[~i].slice().reverse() : arcos[i];
    puntos.push(...(puntos.length ? arco.slice(1) : arco));
  }
  return puntos;
}

function geometriaTopo(g) {
  if (g.type === 'Polygon') {
    return { type: 'Polygon', coordinates: g.arcs.map(unirArcos) };
  }
  return {
    type: 'MultiPolygon',
    coordinates: g.arcs.map((poligono) => poligono.map(unirArcos)),
  };
}

const paises = Object.fromEntries(
  topo.objects.countries.geometries
    .filter((g) => g.arcs)
    .map((g) => [g.properties.name, geometriaTopo(g)]),
);

// ── Provincias ───────────────────────────────────────────────────────────
const admin1 = JSON.parse(fs.readFileSync(provinciasRuta, 'utf8'));
const provincia = (nombres) => {
  const f = admin1.features.find(
    (x) => x.properties.adm0_a3 === 'ESP' && nombres.includes(x.properties.name),
  );
  if (!f) throw new Error('No encuentro la provincia: ' + nombres.join(' / '));
  return f.geometry;
};

// ── El corredor: la A-3, por los pueblos por los que pasa ────────────────
// Almazora baja por la A-7 hasta Sagunto y la costa de Valencia, y desde ahí
// sube por la A-3 hasta Madrid. Las coordenadas son las de cada pueblo; a
// este tamaño la diferencia con el trazado exacto de la autovía no se ve.
const CORREDOR = [
  [-0.061, 39.947], // Almazora
  [-0.278, 39.68], // Sagunto
  [-0.44, 39.48], // enlace con la A-3
  [-0.79, 39.42], // Buñol
  [-1.1, 39.488], // Requena
  [-1.205, 39.567], // Utiel
  [-1.6, 39.533], // Minglanilla
  [-1.909, 39.563], // Motilla del Palancar
  [-2.282, 39.613], // Honrubia
  [-3.006, 40.011], // Tarancón
  [-3.44, 40.3], // Arganda
  [-3.794, 40.284], // Fuenlabrada
].map(proyectar);

const punto = (lonlat) => proyectar(lonlat).map(r);

const salida = {
  viewBox: `0 0 ${ANCHO} ${ALTO}`,
  spain: trazado(paises.Spain, 0.9, 6),
  portugal: trazado(paises.Portugal, 0.9, 6),
  // Lo que asoma por el borde: Francia, Andorra y el norte de África. Va en
  // un tono casi del fondo, solo para que la península no flote en el vacío.
  neighbours: ['France', 'Andorra', 'Morocco', 'Algeria']
    .map((n) => (paises[n] ? trazado(paises[n], 2, 10) : ''))
    .join(''),
  castellon: trazado(provincia(['Castellón', 'Castelló', 'Castellón/Castelló']), 0.6, 0),
  madrid: trazado(provincia(['Madrid', 'Comunidad de Madrid']), 0.6, 0),
  corridor:
    'M' + CORREDOR.map((p) => `${r(p[0])} ${r(p[1])}`).join('L'),
  from: punto([-0.061, 39.947]),
  to: punto([-3.794, 40.284]),
  valencia: punto([-0.376, 39.47]),
};

const bytes = Object.values(salida).join('').length;

const ts = `/**
 * Trazados del mapa de la ruta. **Archivo generado**: no se edita a mano.
 *
 * Lo produce \`node scripts/gen-mapa.mjs\` a partir de Natural Earth (dominio
 * público). Si hace falta cambiar algo —el encuadre, la simplificación, los
 * pueblos del corredor—, se cambia en el guion y se vuelve a lanzar.
 */
export const ROUTE_MAP = ${JSON.stringify(salida, null, 2)} as const;
`;

fs.writeFileSync('src/components/sections/routeMapPaths.ts', ts);
console.log(`  ${ANCHO}×${ALTO} · ${Math.round(bytes / 1024)} KB de trazado`);
for (const [k, v] of Object.entries(salida)) {
  if (typeof v === 'string') console.log(`    ${k.padEnd(11)} ${String(v.length).padStart(6)} caracteres`);
}
