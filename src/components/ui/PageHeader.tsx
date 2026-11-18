import type { CSSProperties, ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import Container from './Container';
import { Link } from '@/i18n/navigation';
import { breadcrumbJsonLd } from '@/lib/seo';

export type PageFact = {
  /** La cifra o el dato corto. Es lo que se lee primero. */
  value: string;
  /** Qué es esa cifra. Va debajo, pequeño. */
  label: string;
};

type PageHeaderProps = {
  title: string;
  /**
   * La parte del titular que va en grande. Tiene que ser **el principio exacto**
   * de `title`: lo que sobra va debajo, en la línea fina.
   *
   * Si coincide con el titular entero, va todo en grande y no hay línea fina
   * («PIDE PRESUPUESTO»). Si no se pasa, o no es el principio del titular, la
   * cabecera vuelve a lo de antes: el titular entero a un solo cuerpo. Así una
   * traducción que no encaje no rompe nada, solo deja de partirse.
   */
  lead?: string;
  /**
   * El párrafo de entrada, al lado del titular.
   *
   * **Opcional**, y hay una página que lo deja fuera a propósito: la de cada
   * servicio. Allí lo primero que tiene que verse después del titular es la
   * foto, y con el párrafo aquí la foto quedaba entre dos trozos de texto. Su
   * contenido no se pierde: baja a encabezar el cuerpo, debajo de la foto, que
   * es donde empieza a leerse de corrido.
   */
  intro?: string;
  /**
   * La ruta de esta página sin el idioma (`/servicios`, `/blog`…). La necesita
   * el marcado de la miga de pan, que va con direcciones absolutas.
   */
  path: string;
  /**
   * Dos o tres datos concretos de la página. Opcional a propósito: las páginas
   * legales no tienen ninguno que dar y una fila de cifras ahí sería relleno.
   */
  facts?: PageFact[];
  /**
   * El escalón intermedio de la miga, cuando esta página cuelga de otra
   * («Inicio › Servicios › Grupaje»). Sin él la miga de una página de servicio
   * mentiría: diría que cuelga de la portada cuando cuelga del listado.
   */
  parent?: { href: string; label: string };
  /**
   * Cómo se llama esta página en la miga, cuando su titular es demasiado largo
   * para caber ahí. Por defecto es el propio titular.
   */
  crumb?: string;
  /**
   * La pieza visual de la derecha: una foto de la casa, el artículo más
   * reciente… En móvil cae debajo del texto. Ver «Por qué cada página lleva su
   * imagen» más abajo.
   */
  visual?: ReactNode;
  /**
   * `false` para que la pieza de la derecha no salga en móvil. Es para
   * Contacto: allí el trabajo de la página es el formulario, y en una sola
   * columna la foto lo empujaba casi media pantalla más abajo.
   */
  visualEnMovil?: boolean;
  /**
   * Una pieza a lo ancho, debajo del titular y antes de la banda de datos. Es
   * para lo que tiene que verse grande y no cabe en media columna: el vídeo de
   * Nosotros.
   */
  wide?: ReactNode;
};

/**
 * La cabecera con la que abren todas las páginas interiores.
 *
 * Lo que **no** lleva conviene decirlo primero, porque es lo que pide el cuerpo
 * cuando a uno le dicen «dale más profesionalidad»: ni número decorativo, ni
 * antetítulo en versales repitiendo el titular, ni entrada animada. Esas tres
 * se quitaron a conciencia de `SectionHeading`. La página ya tiene su momento
 * orquestado y es la intro 3D.
 *
 * ## La miga de pan hacía de antetítulo
 *
 * Iba en versales, a 12 px y con prosa ancha —«INICIO / SERVICIOS»—, y justo
 * debajo el titular empezaba otra vez por «SERVICIOS». O sea, una etiqueta en
 * versales encima del titular repitiendo su primera palabra: exactamente el
 * recurso que este proyecto ya quitó de las cabeceras de sección.
 *
 * Ahora va en caja baja, a cuerpo de texto y en gris, con `›`: se lee como lo
 * que es, navegación, y no compite con el titular. **Hacerla discreta no le
 * cuesta nada al SEO**: lo que lee Google es el marcado `BreadcrumbList` de
 * aquí abajo, no el tamaño del texto que se ve.
 *
 * ## El titular partido en dos cuerpos
 *
 * Los titulares de estas páginas están escritos para el buscador («Servicios de
 * transporte y logística en Castellón») y se pintaban enteros a un solo
 * cuerpo: una masa de versales sin nada que mirar primero. Ahora la parte
 * fuerte va a cuerpo cartel y el resto debajo, en la misma familia pero abierta
 * y fina (`.titular-resto` en `globals.css`).
 *
 * **El `h1` sigue diciendo exactamente lo mismo**: las dos partes son `span`
 * dentro del mismo `h1`, con un espacio entre ellas, así que su texto es la
 * frase entera de siempre. Para Google no ha cambiado ni una letra.
 *
 * Dónde se parte lo dice cada página con `lead`, en `messages`, y no se
 * adivina: partir por la primera preposición daría «TRANSPORTE NACIONAL E
 * INTERNACIONAL / desde Castellón» bien y «CAMIÓN / completo de…» mal.
 *
 * ## Las rayas de la casa en vez del filete rojo
 *
 * El filete suelto de 56 × 2 pasa a ser las dos rayas de la puerta de la
 * tractora: roja fina encima, azul más gruesa debajo, las mismas que lleva el
 * zócalo del vídeo de Nosotros. Un filete rojo lo puede poner cualquiera; las
 * rayas solo son de esta casa.
 *
 * ## Por qué cada página lleva su imagen
 *
 * Las páginas interiores eran tipografía sobre crema de arriba abajo, al lado
 * de una portada cargadísima. La pieza de la derecha (`visual`) es lo que hace
 * que cada una tenga cara propia desde la primera pantalla. Y no es una foto
 * cualquiera: las de `HEADER_PHOTOS` son todas de la casa.
 *
 * Con imagen, el párrafo de entrada baja debajo del titular en la columna
 * izquierda, porque la derecha la ocupa la imagen. Sin imagen, la cabecera es
 * la de siempre: titular a la izquierda y párrafo a la derecha, alineado con
 * la última línea del titular.
 *
 * ## La banda de datos
 *
 * Con los filetes dibujados por `gap-px` sobre fondo gris, igual que la banda de
 * cifras de la portada. Se sale del `Container` por abajo a propósito, cruzando
 * de lado a lado: es lo que cierra la cabecera sin necesidad de un borde.
 */
export default async function PageHeader({
  title,
  lead,
  intro,
  path,
  facts,
  parent,
  crumb,
  visual,
  visualEnMovil = true,
  wide,
}: PageHeaderProps) {
  // La cabecera se traduce sola en vez de pedirle a cada página que le pase
  // el «Inicio»: es la misma palabra en todas y pasarla a mano son muchos
  // sitios donde se puede olvidar.
  const t = await getTranslations('nav');
  const locale = await getLocale();
  const home = t('home');

  // Los escalones, en orden. El de en medio solo aparece si la página cuelga
  // de otra, y así la lista visible y el marcado salen de la misma fuente: no
  // pueden decir cosas distintas.
  const trail = [
    { label: home, href: '/' },
    ...(parent ? [{ label: parent.label, href: parent.href }] : []),
    { label: crumb ?? title, href: path },
  ];

  const breadcrumb = breadcrumbJsonLd(
    locale,
    trail.map((step) => ({ name: step.label, path: step.href })),
  );

  // Dónde se parte el titular. Solo si `lead` es de verdad su principio: si
  // una traducción no encaja, el titular sale entero y no se pierde nada.
  const partido = lead && title.startsWith(lead) ? lead : null;
  const resto = partido ? title.slice(partido.length).trim() : '';
  // Un principio largo a cuerpo cartel se parte en cuatro líneas en un móvil
  // («TRANSPORTE NACIONAL E INTERNACIONAL»). Por encima de esta longitud baja
  // un escalón de la escala de titulares.
  const largo = !partido || partido.length > 24;
  const grande = largo ? 'text-display-lg' : 'text-display-xl';
  const ajuste = partido ? cabe(partido, largo) : undefined;

  const titular = (
    // `@container` es lo que deja medir el ancho de esta columna desde el CSS
    // del titular (ver `cabe`).
    <div className="@container">
      <Rayas />
      <h1 className="mt-7">
        {partido ? (
          <>
            <span
              className={`block font-display ${grande} uppercase text-ink`}
              style={ajuste}
            >
              {partido}
            </span>
            {resto && (
              <>
                {/* El espacio es lo que hace que el texto del `h1` sea la
                    frase entera y no «Serviciosde transporte…». */}{' '}
                <span className="titular-resto mt-3 block text-ink/80 sm:mt-4">
                  {resto}
                </span>
              </>
            )}
          </>
        ) : (
          <span
            className={`block font-display text-display-lg uppercase text-ink ${
              intro || visual ? '' : 'max-w-4xl'
            }`}
          >
            {title}
          </span>
        )}
      </h1>
    </div>
  );

  return (
    <header className="pt-28 lg:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <Container>
        <nav aria-label={home}>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            {trail.map((step, index) => {
              const last = index === trail.length - 1;

              return (
                <li key={step.href} className="flex items-center gap-2">
                  {index > 0 && (
                    <span aria-hidden="true" className="text-muted/60">
                      ›
                    </span>
                  )}
                  {/* El último escalón no es un enlace: ya estás en él. */}
                  {last ? (
                    <span aria-current="page" className="text-ink">
                      {step.label}
                    </span>
                  ) : (
                    <Link
                      href={step.href}
                      className="underline-offset-4 transition-colors hover:text-brand-red-ink hover:underline"
                    >
                      {step.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {visual ? (
          // Con imagen: titular y párrafo a la izquierda, imagen a la derecha.
          // Las dos columnas se apoyan abajo, en la misma línea de suelo.
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
            <div>
              {titular}
              {intro && (
                <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
                  {intro}
                </p>
              )}
            </div>
            <div className={visualEnMovil ? '' : 'hidden lg:block'}>{visual}</div>
          </div>
        ) : (
          // Sin imagen, la de siempre. Sin párrafo, el titular se queda con
          // todo el ancho: una columna de titular y media vacía al lado se lee
          // como que falta algo.
          <div
            className={`mt-10 grid gap-8 lg:items-end lg:gap-16 ${
              intro ? 'lg:grid-cols-[1.15fr_1fr]' : ''
            }`}
          >
            {titular}

            {/* El párrafo se alinea con la última línea del titular, no con
                la primera: así los dos descansan sobre la misma línea de suelo
                y la cabecera deja de parecer dos piezas sueltas. */}
            {intro && (
              <p className="max-w-xl text-lg leading-relaxed text-muted lg:pb-2">
                {intro}
              </p>
            )}
          </div>
        )}
      </Container>

      {/* La pieza ancha se sale del `Container` hacia los lados: es lo que la
          hace más grande que cualquier otra cosa de la página. En móvil va a
          sangre, de borde a borde. */}
      {wide && (
        <div className="mx-auto mt-12 w-full max-w-7xl sm:mt-14 sm:px-6 lg:px-10">
          {wide}
        </div>
      )}

      {facts && facts.length > 0 ? (
        <div className="mt-16 border-y border-line">
          <Container>
            {/* Las columnas salen de cuántos datos haya: con tres fijas, una
                banda de dos dejaba un hueco a la derecha que se leía como que
                faltaba un dato. El fondo gris es lo que dibuja los filetes
                entre celdas a través de `gap-px`. */}
            <div
              className={`grid gap-px bg-line ${
                facts.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
              }`}
            >
              {facts.map((fact) => (
                <div key={fact.label} className="bg-bone py-6 sm:px-6 sm:py-8 sm:first:pl-0 sm:last:pr-0">
                  <p className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none tracking-tight text-azul-texto">
                    {fact.value}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
                    {fact.label}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </div>
      ) : (
        <div className="mt-16 border-b border-line" />
      )}
    </header>
  );
}

/**
 * Lo que ocupa cada letra de Archivo a la anchura de los titulares
 * (`--display-width: 78`), en fracciones del cuerpo, con el espaciado de la
 * escala incluido. **Medido en el navegador**, no copiado de ninguna tabla:
 * diez veces cada letra seguida, dividido entre diez y entre el cuerpo.
 * Comprobado contra una palabra entera: «PRESUPUESTO» mide 5,885 em de verdad
 * y esta tabla da 5,913.
 *
 * Si se cambia de familia o de `--display-width`, **hay que volver a medirla**:
 * con números de otra letra el titular se saldría de su columna o quedaría
 * pequeño sin motivo.
 */
const ANCHO_LETRA: Record<string, number> = {
  A: 0.523, B: 0.541, C: 0.573, D: 0.578, E: 0.52, F: 0.463, G: 0.614,
  H: 0.576, I: 0.214, J: 0.432, K: 0.533, L: 0.423, M: 0.694, N: 0.577,
  Ñ: 0.577, O: 0.618, P: 0.521, Q: 0.618, R: 0.566, S: 0.512, T: 0.483,
  U: 0.57, V: 0.509, W: 0.748, X: 0.537, Y: 0.537, Z: 0.506, Á: 0.523,
  É: 0.52, Í: 0.214, Ó: 0.618, Ú: 0.57, Ü: 0.57,
};

/**
 * El cuerpo del principio del titular, para que **su palabra más larga quepa
 * siempre en la columna**.
 *
 * El fallo que arregla: con la foto al lado, el titular tiene media columna, y
 * una sola palabra larga a cuerpo cartel no se puede partir. «PRESUPUESTO» se
 * metía por debajo de la foto y «RECOGEMOS» la rozaba. Bajar el cuerpo para
 * todas castigaba a «SERVICIOS», que cabe de sobra.
 *
 * Así que el cuerpo es el menor de dos: el de la escala, o el que hace que la
 * palabra más ancha ocupe justo el ancho de la columna (`100cqi`, medido por
 * `@container`). Un 4 % de margen cubre el interletraje, que la tabla no ve.
 * Las palabras cortas se quedan en el cuerpo de la escala; solo encogen las que
 * no caben.
 */
function cabe(texto: string, largo: boolean): CSSProperties {
  const ancho = Math.max(
    ...texto
      .toUpperCase()
      .split(/\s+/)
      .map((palabra) =>
        [...palabra].reduce((suma, letra) => suma + (ANCHO_LETRA[letra] ?? 0.6), 0),
      ),
  );
  const escala = largo ? 'var(--text-display-lg)' : 'var(--text-display-xl)';
  return { fontSize: `min(${escala}, calc(100cqi / ${(ancho * 1.04).toFixed(3)}))` };
}

/**
 * Las dos rayas de la puerta de la tractora: roja fina encima, azul más gruesa
 * debajo (`public/media/camion-01.jpg`). Son las mismas del zócalo del vídeo.
 */
function Rayas() {
  return (
    <span aria-hidden="true" className="block w-16 sm:w-20">
      <span className="block h-[2px] bg-brand-red" />
      <span className="mt-1 block h-[5px] bg-brand-blue" />
    </span>
  );
}
