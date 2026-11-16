import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import RouteMap from '@/components/sections/RouteMap';
import Container from '@/components/ui/Container';
import HeaderPhoto from '@/components/ui/HeaderPhoto';
import { HEADER_PHOTOS } from '@/content/media';
import PageHeader, { type PageFact } from '@/components/ui/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

type Area = {
  name: string;
  detail: string;
  points: string[];
};

type Sede = {
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  hours: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.coverage' });
  const meta = await getTranslations({ locale, namespace: 'meta' });

  return pageMetadata({
    locale,
    path: '/cobertura',
    title: t('seoTitle'),
    description: t('seoDescription'),
    imageAlt: meta('ogAlt'),
  });
}

/**
 * `/cobertura` — dónde se recoge y dónde se entrega.
 *
 * ## Por qué existe esta página
 *
 * «Rutas y cobertura» vivía **solo como una sección de la portada**, o sea
 * cuatro frases de una línea a once pantallas de scroll de la cabecera. Dicho
 * de otra forma: la web no competía por ninguna búsqueda de cobertura, que es
 * exactamente lo que teclea un cliente —«transporte Castellón Madrid»,
 * «recogida de palés en Onda», «envío a Madrid desde Castellón»—. Es el mismo
 * razonamiento que partió `/servicios` en seis páginas: **una página con seis
 * cosas compite por una búsqueda; seis páginas compiten por seis.**
 *
 * ## De dónde sale el contenido
 *
 * **De cosas ya publicadas, no de afirmaciones nuevas.** Los cuatro niveles
 * salen de `route.coverage`, los puntos de cada uno de los `includes` de los
 * servicios, y las paradas del mapa de `route.mapStops`. La única excepción
 * está marcada en `CLAUDE.md`: la lista de localidades del clúster azulejero,
 * que es consistente con el «+150 localidades» que la empresa ya publica —son
 * más que los 135 municipios de la provincia— pero que conviene que el
 * cliente confirme.
 *
 * **Y no repite lo que ya dice otra página.** Dos páginas con el mismo
 * contenido compiten entre ellas, que es justo lo que se corrigió al acortar
 * el listado de servicios. Aquí no se cuenta qué es el grupaje: se cuenta
 * hasta dónde llega.
 *
 * ## Cómo se llega
 *
 * Desde el pie, que va en todas las páginas, y desde la propia sección de
 * cobertura de la portada. No desde el menú: son ya cinco entradas y una
 * sexta en una condensada en versales empieza a apretar en portátiles.
 */
export default async function CoveragePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.coverage');
  const tRoute = await getTranslations('route');
  const tContact = await getTranslations('contact');

  const areas = t.raw('areas') as Area[];
  const towns = t.raw('towns') as string[];
  const sedes = tContact.raw('sites') as Sede[];

  return (
    <>
      <PageHeader
        title={t('title')}
        lead={t('titleLead')}
        intro={t('intro')}
        crumb={t('crumb')}
        path="/cobertura"
        visual={<HeaderPhoto src={HEADER_PHOTOS.cobertura.src} />}
        facts={t.raw('facts') as PageFact[]}
      />

      {/* **El mapa es el mismo de la portada, y se reutiliza a propósito.**
          Es la pieza que explica el corredor sin una sola palabra de más, y
          repetir el componente no es repetir contenido: lo que se posiciona
          es el texto de alrededor, que aquí es otro. */}
      <RouteMap
        title={tRoute('mapTitle')}
        intro={tRoute('mapIntro')}
        origin={tRoute('origin')}
        destination={tRoute('destination')}
        // Con la unidad: aquí iba solo el número y el mapa de esta página
        // ponía «420» a secas, mientras el de la portada decía «420 km».
        distance={`${tRoute('odometer.value')} ${tRoute('odometer.unit')}`}
        stops={
          tRoute.raw('mapStops') as { title: string; detail: string }[]
        }
        legend={
          tRoute.raw('mapLegend') as { pickup: string; delivery: string; sea: string }
        }
      />

      <section data-bg="bone" className="relative z-10 bg-bone py-28">
        <Container>
          <SectionHeading title={t('areasTitle')} lead={t('areasIntro')} />

          {/* Cuatro bloques en dos columnas, separados por filete, como la
              banda de cifras y las sedes. Una rejilla de tarjetas con marco
              convertiría cuatro ámbitos en cuatro productos, y no lo son:
              son el mismo servicio llegando más o menos lejos. */}
          <ul className="mt-16 grid gap-px border border-line bg-line lg:grid-cols-2">
            {areas.map((area) => (
              <li key={area.name} className="bg-white p-8 lg:p-10">
                <h3 className="font-display text-2xl uppercase leading-tight tracking-tight text-ink">
                  {area.name}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  {area.detail}
                </p>
                <ul className="mt-7 flex flex-col gap-3 border-t border-line pt-6">
                  {area.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-sm leading-relaxed text-muted"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section data-bg="bone" className="relative z-10 bg-bone pb-28">
        <Container>
          <SectionHeading title={t('townsTitle')} lead={t('townsIntro')} />

          {/* Las localidades van como etiquetas y no como lista con viñetas:
              son nombres sueltos, no frases, y en columna darían una lista de
              doce renglones de dos palabras. Es el mismo recurso que las
              etiquetas del bloque destacado de Servicios. */}
          <ul className="mt-12 flex flex-wrap gap-2">
            {towns.map((town) => (
              <li
                key={town}
                className="rounded-full border border-line bg-white px-4 py-1.5 text-xs uppercase tracking-widest text-muted"
              >
                {town}
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted">
            {t('townsNote')}
          </p>
        </Container>
      </section>

      <section data-bg="bone" className="relative z-10 bg-bone pb-28">
        <Container>
          <SectionHeading title={t('sitesTitle')} lead={t('sitesIntro')} />

          {/* **Aquí no va `Sites`, y es decisión.** Aquel componente monta el
              hueco del mapa, que arrastra el consentimiento de cookies y un
              bloque alto por sede. En esta página las naves son un dato de
              cobertura —de dónde sale y dónde llega—, no una invitación a
              visitarlas: para eso está `/contacto`, que es adonde lleva el
              enlace del pie. */}
          <ul className="mt-14 grid gap-px border-y border-line bg-line sm:grid-cols-2">
            {sedes.map((sede) => (
              <li key={sede.city} className="bg-white px-6 py-10 lg:px-8">
                <h3 className="font-display text-xs uppercase tracking-[0.18em] text-brand-red-ink sm:tracking-[0.3em]">
                  {sede.city}
                </h3>
                <p className="mt-5 text-base leading-relaxed text-ink">
                  {sede.address}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {sede.hours}
                </p>
                <a
                  href={`tel:${sede.phoneHref}`}
                  className="mt-5 inline-block font-display text-sm uppercase tracking-widest text-brand-blue transition-colors hover:text-brand-red-ink"
                >
                  {sede.phone}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Cta />
    </>
  );
}
