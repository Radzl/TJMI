import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import HeaderPhoto from '@/components/ui/HeaderPhoto';
import PageHeader, { type PageFact } from '@/components/ui/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import type {
  ServiceDetail,
  ServiceLabels,
} from '@/components/ui/ServiceDialog';
import { HEADER_PHOTOS } from '@/content/media';
import { SERVICES } from '@/content/services';
import { Link } from '@/i18n/navigation';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.services' });
  const meta = await getTranslations({ locale, namespace: 'meta' });

  return pageMetadata({
    locale,
    path: '/servicios',
    title: t('title'),
    description: t('intro'),
    imageAlt: meta('ogAlt'),
  });
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.services');
  const tServices = await getTranslations('services');
  const items = tServices.raw('items') as ServiceDetail[];
  const labels = tServices.raw('detail') as ServiceLabels;
  const featuredTags = tServices.raw('featured.tags') as string[];

  return (
    <>
      <PageHeader
        title={t('title')}
        lead={t('titleLead')}
        intro={t('intro')}
        crumb={t('crumb')}
        path="/servicios"
        visual={<HeaderPhoto src={HEADER_PHOTOS.servicios.src} />}
        facts={t.raw('facts') as PageFact[]}
      />

      <section className="py-20">
        <Container>
          <article className="rounded-2xl border border-line p-10 lg:p-12">
            {/* **Sin número.** Llevaba un `01` porque la cabecera de la
                lista de abajo llevaba un `02`; quitados los números de
                `SectionHeading`, este se quedó solo y un `01` que no abre
                ninguna cuenta se lee como un resto de plantilla. Queda la
                etiqueta con su punto, igual que en la portada. */}
            <p className="flex items-center gap-3 font-display text-xs uppercase tracking-[0.18em] text-brand-red-ink sm:tracking-[0.3em]">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red"
                aria-hidden="true"
              />
              <span>{tServices('featured.tag')}</span>
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl uppercase tracking-tight text-ink">
              {tServices('featured.title')}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
              {tServices('featured.description')}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {featuredTags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-widest text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </article>

          {/* Las interiores entraban en la rejilla sin avisar y parecían
              de otra web: abren con la misma cabecera que la portada. */}
          <SectionHeading className="mt-20 lg:mt-28" title={t('listTitle')} />

          {/* **Aquí los servicios ya no se cuentan enteros: se enlazan.**
              Cada uno tiene desde ahora su propia página
              (`/servicios/<slug>`) con el texto largo, lo que incluye y
              cuándo interesa.

              El motivo no es aligerar esta página, es que **dos páginas con el
              mismo contenido compiten entre ellas**: Google acaba quedándose
              con una sola y normalmente no es la que querrías. Así que el
              detalle vive en un único sitio y esto hace de índice, que es para
              lo que sirve un listado.

              Y de paso resuelve lo que de verdad importaba: quien busca
              «grupaje Castellón Madrid» aterriza en una página que habla solo
              de grupaje, no en una donde el grupaje es un sexto de lo que hay. */}
          {/* **Van en filas alternas, no en rejilla.** Estuvieron en una
              rejilla de tres por dos con los filetes pegados: seis cuadrados
              tocándose se leen como una tabla, y una tabla no invita a entrar
              en ninguna de sus celdas. Aquí cada servicio ocupa su fila, con
              la foto a un lado y el texto al otro, y el lado se alterna.

              **El texto va en espejo**: cuando la foto está a la izquierda, el
              titular, el filete y el enlace se alinean a la derecha, y al
              revés en la fila siguiente. Es lo que convierte seis bloques
              iguales en un zigzag, que es lo que hace que la vista baje sola.
              Lo que **no** se invierte es el sentido de lectura del párrafo:
              el texto va siempre en banderola, nunca justificado a la derecha
              en varias líneas, que es ilegible.

              En móvil no hay espejo que valga: una columna, foto encima y
              texto debajo, todo a la izquierda. Alternar en una sola columna
              no se vería como ritmo, se vería como que algo baila. */}
          <ul className="mt-12 flex flex-col divide-y divide-line border-t border-b border-line">
            {SERVICES.map((service, index) => {
              const item = items[service.index];
              const mirrored = index % 2 === 1;

              return (
                <li key={service.slug}>
                  <Link
                    href={`/servicios/${service.slug}`}
                    className="group grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16"
                  >
                    <span
                      className={`photo block aspect-[4/3] w-full rounded-2xl sm:aspect-[16/9] lg:aspect-[4/3] ${
                        mirrored ? 'lg:order-2' : ''
                      }`}
                    >
                      <Image
                        src={service.photo.src}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </span>

                    <span
                      className={`flex flex-col ${
                        mirrored ? 'lg:items-start' : 'lg:items-end lg:text-right'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="block h-0.5 w-12 bg-brand-red"
                      />
                      <span className="mt-6 font-display text-3xl uppercase tracking-tight text-ink transition-colors group-hover:text-brand-blue sm:text-4xl">
                        {item.title}
                      </span>
                      <span className="mt-5 max-w-md text-base leading-relaxed text-muted">
                        {item.description}
                      </span>

                      {/* **Los tres datos son lo que le faltaba a esta
                          página.** Cada fila medía unos 440 px para dar dos
                          líneas de texto: la foto se quedaba en la mitad y al
                          lado sobraban doscientos píxeles de columna vacía.
                          Seis seguidas hacían una página larguísima que no
                          contaba nada, y es la página que debería vender.

                          Van separados por filete y no por viñetas: una
                          viñeta a la derecha, en las filas en espejo, queda
                          colgando del lado que no es. El filete funciona en
                          los dos sentidos. */}
                      {item.highlights && (
                        <span
                          className={`mt-7 flex flex-col gap-2 border-t border-line pt-5 ${
                            mirrored ? '' : 'lg:items-end'
                          }`}
                        >
                          {item.highlights.map((dato) => (
                            <span
                              key={dato}
                              className="font-display text-xs uppercase tracking-[0.14em] text-ink"
                            >
                              {dato}
                            </span>
                          ))}
                        </span>
                      )}

                      <span className="mt-7 font-display text-xs uppercase tracking-widest text-brand-red-ink">
                        {labels.see}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-14">
            <Button href="/contacto">{labels.quote}</Button>
          </div>
        </Container>
      </section>

      <Cta />
    </>
  );
}
