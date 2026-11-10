/**
 * ¿Hace la ruta del formulario lo que dice que hace?
 *
 * Son cinco casos y cada uno comprueba una decisión distinta de
 * `app/api/presupuesto/route.ts`. Se lanza contra un servidor levantado:
 *
 *   node tests/perf/medidas/presupuesto.mjs [base]
 *
 * **El caso que más importa es el primero**, y no es el obvio: sin claves de
 * correo configuradas la ruta tiene que contestar `sin-configurar` **con un
 * 200**, no reventar. De eso depende que el formulario caiga a WhatsApp en
 * vez de quedarse colgado, que es lo que hacía antes y lo que no se puede
 * perder.
 */
const BASE = process.argv[2] ?? 'http://localhost:3000';

/**
 * Una identidad distinta en cada pasada.
 *
 * **Sin esto el arnés no se puede relanzar:** la ruta limita a cinco envíos
 * cada diez minutos, así que la segunda vez seguida se come el límite de la
 * primera y canta cuatro fallos que no existen. Un arnés que no se puede
 * repetir se deja de usar.
 *
 * En local esta cabecera es la única que hay, así que la ruta la usa. En
 * producción nunca llega a usarse, porque la plataforma siempre pone
 * `x-real-ip` y esa va primero — ver `lib/peticion.ts`, donde está escrito
 * por qué ese orden es lo que impide falsear el límite.
 */
const QUIEN = `pruebas-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const VALIDO = {
  origin: 'Onda, Castellón',
  destination: 'Fuenlabrada, Madrid',
  pallets: '6',
  goods: 'Azulejo',
  name: 'Prueba Automática',
  company: 'Pruebas SL',
  email: 'prueba@example.com',
  phone: '600000000',
  details: 'Esto es una comprobación automática, no una solicitud real.',
  consent: true,
  locale: 'es',
  empresaWeb: '',
};

async function pedir(cuerpo) {
  const r = await fetch(`${BASE}/api/presupuesto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': QUIEN },
    body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
  });
  const datos = await r.json().catch(() => null);
  return { estado: r.status, datos };
}

const casos = [];
const comprobar = (nombre, bien, visto) => {
  casos.push({ nombre, bien, visto });
  console.log(
    `  ${bien ? 'OK  ' : 'MAL '} ${nombre.padEnd(46)} ${visto}`,
  );
};

// ── 1. Válido ────────────────────────────────────────────────────────────
{
  const { estado, datos } = await pedir(VALIDO);
  const correcto =
    (estado === 200 && datos?.ok === true) ||
    (estado === 200 &&
      datos?.ok === false &&
      ['sin-configurar', 'fallo'].includes(datos?.motivo));
  comprobar(
    'válido → 200 (enviado o sin-configurar)',
    correcto,
    `${estado} ${JSON.stringify(datos)}`,
  );
}

// ── 2. El señuelo relleno ────────────────────────────────────────────────
{
  const { estado, datos } = await pedir({ ...VALIDO, empresaWeb: 'robot' });
  comprobar(
    'señuelo relleno → 400 datos',
    estado === 400 && datos?.motivo === 'datos',
    `${estado} ${JSON.stringify(datos)}`,
  );
}

// ── 3. Sin consentimiento ────────────────────────────────────────────────
{
  const { estado, datos } = await pedir({ ...VALIDO, consent: false });
  comprobar(
    'sin consentimiento → 400 datos',
    estado === 400 && datos?.motivo === 'datos',
    `${estado} ${JSON.stringify(datos)}`,
  );
}

// ── 4. JSON roto ─────────────────────────────────────────────────────────
{
  const { estado, datos } = await pedir('{esto no es json');
  comprobar(
    'JSON roto → 400 datos',
    estado === 400 && datos?.motivo === 'datos',
    `${estado} ${JSON.stringify(datos)}`,
  );
}

// ── 5. El límite de envíos ───────────────────────────────────────────────
{
  // Ya van unos cuantos de los casos de arriba; se insiste hasta pasarse.
  let ultimo = null;
  for (let i = 0; i < 10; i += 1) ultimo = await pedir(VALIDO);
  comprobar(
    'muchos seguidos → 429 limite',
    ultimo.estado === 429 && ultimo.datos?.motivo === 'limite',
    `${ultimo.estado} ${JSON.stringify(ultimo.datos)}`,
  );
}

const fallos = casos.filter((c) => !c.bien).length;
console.log('');
console.log(
  fallos === 0
    ? '  Los cinco casos se comportan como dice la ruta.'
    : `  ${fallos} caso(s) no hacen lo que deberían.`,
);
process.exit(fallos === 0 ? 0 : 1);
