import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import type { ServiceDetail } from '@/components/ui/ServiceDialog';
import { posts } from '@/content/blog';
import { VIDEO_POSTER } from '@/content/media';
import { SERVICES } from '@/content/services';
import { Link } from '@/i18n/navigation';

/**
 * El compás entre el hero y la salida del camión: qué somos y dónde está todo.
 *
 * ## El problema que resuelve, con los números delante
 *
 * Se midió la portada en pantallas completas y el reparto era este:
 *
 *   portada entera ............ 19,4 pantallas (23,6 en móvil)
 *   intro 3D .................. de la 0 a la 11,4
 *   primer servicio nombrado .. pantalla 11,4
 *   formulario / cierre ....... pantalla 18 de 19,4
 *
 * O sea que la intro se llevaba el **59 % de la página**, y en una web B2B la
 * mitad de la gente no pasa del 50-60 % de scroll: había un porcentaje grande
 * de visitas que **nunca llegaba a leer qué vende la empresa**. La intro es el
 * encargo y se queda; lo que no puede ser es que sea el único camino.
 *
 * ## El titular dice algo, no señaliza
 *
 * Esto llegó a encabezarse «Por dónde seguir», que es mobiliario: una etiqueta
 * de navegación ocupando **el primer `h2` que se lee de toda la página**. Y en
 * ese punto el visitante sabe muy poco —el hero le ha dado la ruta y el plazo
 * y poco más—, así que gastar ese sitio en señalizar era tirarlo.
 *
 * Ahora lleva lo que **no está dicho en ningún otro sitio de la portada**: que
 * las dos naves son nuestras y que entre ellas no hay nadie más. El hero, el
 * titular de `InRoute` y la banda de cifras ya cuentan la ruta y las 24 horas
 * —tres veces—, así que repetirlo aquí una cuarta no añadía nada; y lo de
 * «sin depender de terceros» solo estaba escrito dentro de `/nosotros`.
 *
 * La señalización no se pierde: la hace el antetítulo de cada tarjeta, que es
 * donde de verdad sirve.
 *
 * ## Tres formas de tarjeta, y es lo que lo hace visual
 *
 * Era una banda entera de texto sobre crema, y en una página que presume de
 * imagen eso se queda corto. Ahora el mosaico mezcla **tres cosas distintas**:
 *
 * - **Una lista**: el bloque alto de Servicios, con los seis nombres dentro.
 * - **Una foto**: la tractora de la casa, y es la **primera fotografía de
 *   verdad** de toda la portada —lo de arriba es una maqueta 3D—. Va en la
 *   tarjeta de Nosotros, que es donde una foto significa algo.
 * - **Tres cifras**: los años, los metros de caja y los dos recuentos.
 *
 * La variedad no es decoración: seis celdas iguales se leen como una tabla, y
 * ya está escrito en este proyecto a cuenta de `/servicios` que una tabla no
 * invita a entrar en ninguna de sus celdas.
 *
 * ## Por qué justo aquí y no en otro sitio
 *
 * Va **entre el hero y la salida del camión**, y encaja con el guion en vez de
 * pelearse con él: el camión acaba de cargarse, hay un compás, y después
 * arranca.
 *
 * Técnicamente también es el único hueco limpio. Los disparadores de
 * `ScrollChoreography` cuelgan de `[data-scene]`, uno por sección, así que
 * meter una sección sin ese atributo **no descoloca ninguna escena**: el hero
 * sigue acabando en su `bottom bottom` y la carretera sigue empezando en su
 * `top bottom`.
 *
 * Por eso lleva fondo **opaco** y su `data-bg`: si fuera transparente se
 * vería el 3D congelado detrás, que es justo lo que no se quiere enseñar.
 *
 * ## «Más visual» no significa animado
 *
 * El criterio de diseño de este proyecto pide **una sola entrada orquestada en
 * toda la página, y es la intro 3D**. Una banda que entrara animada justo al
 * salir de ella competiría con el único momento que la página se permite. Lo
 * que se mueve aquí son transiciones de CSS: el filete rojo que crece, los
 * seis nombres que se encienden y la foto que se acerca un punto.
 */

/** Lo común a las tres formas: el enlace, el filete que crece y el antetítulo. */
function Marco({
  href,
  kicker,
  oscura = false,
  className = '',
  children,
}: {
  href: string;
  kicker: string;
  /** La de la foto: va sobre azul noche, así que el texto se invierte. */
  oscura?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden p-7 transition-colors lg:p-8 ${
        oscura ? 'bg-night' : 'bg-bone hover:bg-white'
      } ${className}`}
    >
      {/* El filete rojo crece al pasar por encima: es el mismo gesto que abre
          la sección, a escala de tarjeta. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 z-20 h-0.5 w-0 bg-brand-red transition-[width] duration-300 ease-out group-hover:w-full"
      />

      {/* **Este antetítulo sí se gana el sitio**, al revés que los que se
          quitaron de las cabeceras de sección: ahí repetían el encabezado, y
          aquí dice a qué página vas, que es lo único que el resto no dice. Es
          además lo que hace que la tarjeta se lea como pulsable sin tener que
          escribirle un «Ver» debajo cinco veces. */}
      <span
        className={`relative z-10 font-display text-xs uppercase tracking-widest ${
          oscura ? 'text-white/90' : 'text-muted'
        }`}
      >
        {kicker}
      </span>

      {children}
    </Link>
  );
}

/** Las tres de cifra: el número manda y el texto lo explica. */
function TarjetaCifra({
  href,
  kicker,
  figure,
  label,
  text,
}: {
  href: string;
  kicker: string;
  figure: string;
  label: string;
  text: string;
}) {
  return (
    <Marco href={href} kicker={kicker}>
      {/* La cifra lleva su propio `clamp` y no la escala de titulares: un
          titular puede partirse en dos líneas sin pasar nada, pero «13,6 m»
          partido es una errata. Misma regla que la banda de cifras. */}
      <span className="relative z-10 mt-5 font-display text-[clamp(2.5rem,3.4vw,3.1rem)] leading-none tracking-tight text-ink tabular-nums transition-colors group-hover:text-brand-blue">
        {figure}
      </span>

      <span className="relative z-10 mt-2 font-display text-sm uppercase tracking-tight text-ink">
        {label}
      </span>

      <span className="relative z-10 mt-3 text-sm leading-relaxed text-muted">
        {text}
      </span>
    </Marco>
  );
}

export default function Overview() {
  const t = useTranslations('overview');
  const tServices = useTranslations('services');
  const tContact = useTranslations('contact');
  const tFaq = useTranslations('faq');
  const formato = useFormatter();

  const items = tServices.raw('items') as ServiceDetail[];

  // Los recuentos salen del contenido: uno escrito a mano se queda viejo en
  // cuanto se publica un artículo o se añade una pregunta, y nadie se acuerda
  // de repasarlo. Es la misma regla que la cabecera del blog.
  const articulos = posts.length;
  const preguntas = (tFaq.raw('items') as unknown[]).length;


  return (
    <section
      data-bg="bone"
      className="relative z-10 flex min-h-[72svh] items-center bg-bone py-20 lg:min-h-[86svh] lg:py-24"
    >
      <Container>
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <span aria-hidden="true" className="block h-0.5 w-14 bg-brand-red" />

            <h2 className="mt-7 font-display text-display-md uppercase text-ink">
              {t('title')}
            </h2>
          </div>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted lg:mt-0 lg:pb-1">
            {t('lead')}
          </p>
        </div>

        {/* El mosaico: un bloque alto, una foto ancha y dos cifras. Los filetes
            los dibuja `gap-px` sobre fondo de línea, como la banda de cifras,
            para no ir poniendo bordes a mano al cambiar de una a tres
            columnas.

            **Eran cinco destinos y ahora son cuatro**, porque la calculadora
            se ha quitado de la web. El reparto se rehizo entero en vez de
            dejar la celda vacía: con `row-span-2` en Servicios y `col-span-2`
            en la foto, la rejilla de 3 × 2 se llena exacta y sin huecos, y de
            paso **la foto gana el doble de ancho**, que es la forma en la que
            una foto se lee mejor. En tableta las dos grandes ocupan fila
            entera y las dos cifras comparten la última. */}
        <nav className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          <Marco
            href="/servicios"
            kicker={t('cards.services.kicker')}
            className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
          >
            <span className="relative z-10 mt-4 font-display text-display-sm uppercase text-ink transition-colors group-hover:text-brand-blue">
              {t('cards.services.title')}
            </span>

            <span className="relative z-10 mt-3 text-sm leading-relaxed text-muted">
              {t('cards.services.text')}
            </span>

            {/* **Los seis siguen aquí, y por eso esta banda sigue valiendo lo
                que valía**: el primer servicio se nombra en la pantalla 4,2 y
                no en la 11,4. Van como texto y no como seis enlaces porque la
                tarjeta entera ya es un enlace y un enlace no puede llevar otro
                dentro. No se pierde enlazado interno: las seis páginas de
                servicio cuelgan del pie en toda la web. */}
            <ul className="relative z-10 mt-7 border-t border-line lg:mt-auto">
              {SERVICES.map((service) => (
                <li
                  key={service.slug}
                  className="border-b border-line py-2.5 font-display text-sm uppercase tracking-tight text-muted transition-colors last:border-b-0 group-hover:text-ink"
                >
                  {items[service.index].title}
                </li>
              ))}
            </ul>
          </Marco>

          {/* **La foto, y es la primera de verdad de toda la portada.** Lo de
              arriba es una maqueta 3D: por bien que esté, no demuestra que la
              empresa exista. Esta sí, y por eso va en la tarjeta de Nosotros.

              El hueco es mucho más pequeño que el de `/nosotros`, de donde sale
              el archivo, así que el ancho que ese hueco declara en el
              manifiesto ya cubre este de sobra. El `alt` va vacío a propósito:
              el texto de al lado ya dice lo que es. */}
          <Marco
            href="/nosotros"
            kicker={t('cards.about.kicker')}
            oscura
            className="min-h-[260px] justify-end sm:col-span-2 lg:col-span-2"
          >
            <span aria-hidden="true" className="absolute inset-0">
              <span className="photo block h-full w-full">
                <Image
                  src={VIDEO_POSTER.src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </span>
              {/* Sin el velo, el texto blanco cae sobre el cielo claro de la
                  foto y no se lee. Va de abajo arriba porque el texto se apoya
                  en el borde inferior, y **cierra alto a propósito**: el
                  antetítulo es lo que queda más arriba y le toca justo la
                  cabina blanca.

                  **Medido sobre los píxeles, no a ojo.** Con el velo cerrando
                  en `night/20` el antetítulo daba 3,20 de contraste; subiendo
                  el texto a `white/90` llegaba a 4,41, que sigue por debajo
                  del 4,5 que pide la WCAG para texto pequeño. Con `night/58`
                  queda en **5,43**, y las otras tres líneas en 7,7, 10,1 y
                  12,9. Si tocas el degradado o la foto, vuelve a medirlo. */}
              <span className="absolute inset-0 bg-gradient-to-t from-night via-night/88 to-night/58" />
            </span>

            <span className="relative z-10 mt-5 font-display text-[clamp(2.5rem,3.4vw,3.1rem)] leading-none tracking-tight text-white tabular-nums">
              {t('cards.about.figure')}
            </span>

            <span className="relative z-10 mt-2 font-display text-sm uppercase tracking-tight text-white">
              {t('cards.about.label')}
            </span>

            <span className="relative z-10 mt-3 text-sm leading-relaxed text-white/70">
              {t('cards.about.text')}
            </span>
          </Marco>

          <TarjetaCifra
            href="/faq"
            kicker={t('cards.faq.kicker')}
            figure={formato.number(preguntas)}
            label={t('cards.faq.label')}
            text={t('cards.faq.text')}
          />

          <TarjetaCifra
            href="/blog"
            kicker={t('cards.blog.kicker')}
            figure={formato.number(articulos)}
            label={t('cards.blog.label')}
            text={t('cards.blog.text')}
          />
        </nav>

        {/* **El CTA va discreto y es decisión.** El navbar ya lleva el botón y
            vuelve en cuanto subes, y la portada cierra con una sección entera
            dedicada a pedirlo: un tercer botón a tamaño completo aquí sería la
            página apretando en el primer compás, que es justo cuando todavía
            no se ha ganado nada. El teléfono va al lado y no debajo: quien no
            quiere rellenar nada quiere llamar. */}
        <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-3">
          <span className="text-sm text-muted">{t('ctaLead')}</span>

          <Link
            href="/contacto"
            className="font-display text-sm uppercase tracking-widest text-brand-red-ink transition-colors hover:text-brand-blue"
          >
            {t('cta')}
          </Link>

          <a
            href={`tel:${tContact('sites.0.phoneHref')}`}
            className="font-display text-sm uppercase tracking-widest text-brand-blue transition-colors hover:text-brand-red-ink"
          >
            {tContact('sites.0.phone')}
          </a>
        </div>
      </Container>
    </section>
  );
}
