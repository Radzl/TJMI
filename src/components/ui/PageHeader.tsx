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
   * («Inicio / Servicios / Grupaje»). Sin él la miga de una página de servicio
   * mentiría: diría que cuelga de la portada cuando cuelga del listado.
   */
  parent?: { href: string; label: string };
  /**
   * Cómo se llama esta página en la miga, cuando su titular es demasiado largo
   * para caber ahí. El `h1` de un servicio dice «Grupaje de palés entre
   * Castellón y Madrid», que es lo que busca quien llega de Google; esa misma
   * frase en versales con prosa ancha ocupa dos líneas de miga. Por defecto es
   * el propio titular.
   */
  crumb?: string;
};

/**
 * La cabecera con la que abren todas las páginas interiores.
 *
 * ## Qué tenía de malo la anterior
 *
 * Era un `h1` y un párrafo apilados dentro de un bloque con `py-20`. No estaba
 * rota, estaba **sin componer**: la misma forma que tiene cualquier plantilla,
 * y por eso todas las páginas abrían igual y ninguna parecía tener detrás una
 * empresa de cuarenta años.
 *
 * ## Qué se le ha añadido, y por qué cada cosa se gana el sitio
 *
 * Lo que **no** se le ha puesto conviene decirlo primero, porque es lo que
 * pide el cuerpo cuando a uno le dicen «dale más profesionalidad»: ni número
 * decorativo, ni antetítulo en versales repitiendo el titular, ni entrada
 * animada. Esas tres se quitaron a conciencia de `SectionHeading` y volver a
 * meterlas aquí sería deshacerlo por la puerta de atrás. La página ya tiene su
 * momento orquestado y es la intro 3D.
 *
 * Lo que sí lleva:
 *
 *  - **Miga de pan.** No es adorno: es lo único de la cabecera que dice dónde
 *    estás y por dónde se vuelve. Además va con marcado `BreadcrumbList`, así
 *    que en Google el resultado enseña «Inicio › Servicios» en vez de la
 *    dirección cruda, que es de lo poco que se nota de verdad en los
 *    resultados.
 *  - **Composición a dos columnas.** El titular va en condensada y a cuerpo
 *    grande: necesita su propia columna o se come el ancho entero y empuja el
 *    párrafo a una franja fina debajo. Puestos uno al lado del otro se leen
 *    como una cabecera compuesta y no como dos bloques que cayeron ahí.
 *  - **Filete rojo corto** sobre el titular. Es el mismo gesto que abre el
 *    bloque destacado de Servicios: ata la página a la marca con un trazo, que
 *    es justo lo que la marca pide del rojo —acento, nunca fondo—.
 *  - **Banda de datos**, con los filetes dibujados por `gap-px` sobre fondo
 *    gris, igual que la banda de cifras de la portada. Es lo que de verdad
 *    separa una cabecera profesional de una bonita: entras a una página y en
 *    la primera pantalla ya tienes tres hechos comprobables.
 *
 * La banda se sale del `Container` por abajo a propósito, cruzando de lado a
 * lado: es lo que cierra la cabecera sin necesidad de un borde inferior.
 */
export default async function PageHeader({
  title,
  intro,
  path,
  facts,
  parent,
  crumb,
}: PageHeaderProps) {
  // La cabecera se traduce sola en vez de pedirle a cada página que le pase
  // el «Inicio»: es la misma palabra en las siete y pasarla a mano son siete
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

  // El marcado sale de `lib/seo.ts` y no de aquí. Estaba escrito dentro de
  // este componente, así que lo tenían todas las páginas **menos las entradas
  // del blog**, que son las únicas que no usan esta cabecera —y las más
  // hondas de la web, justo donde la miga sirve—.
  const breadcrumb = breadcrumbJsonLd(
    locale,
    trail.map((step) => ({ name: step.label, path: step.href })),
  );

  return (
    <header className="pt-28 lg:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <Container>
        <nav aria-label={home}>
          <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
            {trail.map((step, index) => {
              const last = index === trail.length - 1;

              return (
                <li key={step.href} className="flex items-center gap-2">
                  {index > 0 && (
                    <span aria-hidden="true" className="text-line">
                      /
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
                      className="transition-colors hover:text-brand-red-ink"
                    >
                      {step.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Sin párrafo, el titular se queda con todo el ancho: una columna
            de titular y media columna vacía al lado se lee como que falta
            algo. */}
        <div
          className={`mt-10 grid gap-8 lg:items-end lg:gap-16 ${
            intro ? 'lg:grid-cols-[1.15fr_1fr]' : ''
          }`}
        >
          <div>
            <span
              aria-hidden="true"
              className="block h-0.5 w-14 bg-brand-red"
            />
            <h1
              className={`mt-7 font-display text-display-lg uppercase text-ink ${
                intro ? '' : 'max-w-4xl'
              }`}
            >
              {title}
            </h1>
          </div>

          {/* El párrafo se alinea con la última línea del titular, no con la
              primera: así los dos descansan sobre la misma línea de suelo y la
              cabecera deja de parecer dos piezas sueltas. */}
          {intro && (
            <p className="max-w-xl text-lg leading-relaxed text-muted lg:pb-2">
              {intro}
            </p>
          )}
        </div>
      </Container>

      {facts && facts.length > 0 ? (
        // **Los filetes cruzan la pantalla, pero las cifras van dentro del
        // `Container`.** A sangre del todo, el primer dato quedaba 64 px a la
        // izquierda del titular que tiene justo encima, y 64 px de desajuste
        // entre dos cosas que se leen seguidas no parecen una decisión,
        // parecen un descuido. Así se queda el gesto de banda —las dos líneas
        // de lado a lado— sin romper la columna.
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
                  <p className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none tracking-tight text-brand-blue">
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
