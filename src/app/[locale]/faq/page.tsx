import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import Container from '@/components/ui/Container';
import CoverPlaceholder from '@/components/ui/CoverPlaceholder';
import { PAGE_PHOTOS } from '@/content/media';
import PageHeader from '@/components/ui/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

type Item = {
  q: string;
  /** Una o varias respuestas; cada entrada es un párrafo. */
  a: string[];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  const meta = await getTranslations({ locale, namespace: 'meta' });

  return pageMetadata({
    locale,
    path: '/faq',
    title: t('title'),
    description: t('intro'),
    imageAlt: meta('ogAlt'),
  });
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('faq');
  const items = t.raw('items') as Item[];

  /**
   * Marcado `FAQPage` para buscadores.
   *
   * Esto no es adorno de SEO: una página de preguntas con este marcado puede
   * salir en Google con las preguntas desplegables debajo del resultado, y
   * ocupa el triple de alto en la lista. Es de lo poco que da un resultado
   * visible y rápido. Los datos salen de los mismos textos que se pintan
   * abajo, así que no pueden desincronizarse.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a.join(' '),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader title={t('title')} intro={t('intro')} path="/faq" />

      <section className="py-20">
        <Container>
          <SectionHeading
            title={t('listTitle')}
          />

          {/* Van **abiertas**, no en acordeón.
              Un acordeón tiene sentido cuando hay treinta preguntas y hay que
              poder barrerlas con la vista; con ocho, lo único que consigue es
              obligar a ocho clics para leer una página que cabe entera. Y lo
              que está plegado no lo lee nadie: ni el visitante que va con
              prisa ni, en la práctica, quien llega desde una búsqueda.

              Es una lista de definiciones de verdad (`dl`), que es exactamente
              lo que es: un término y su explicación. */}
          <dl className="mt-14 border-t border-line">
            {items.map((item) => (
              <div
                key={item.q}
                className="grid gap-4 border-b border-line py-10 lg:grid-cols-12 lg:gap-10"
              >
                {/* **Sin número, y es la regla del proyecto, no un gusto.**
                    Numerar afirma que hay una secuencia, y estas ocho se leen
                    en cualquier orden: aquí el `01` decoraba y mentía. Es lo
                    mismo que se quitó de las cabeceras de sección. (Los pasos
                    de la ruta sí lo llevan, porque recoger va antes de
                    entregar.)

                    Y de paso arregla lo que de verdad se veía mal: el número
                    empujaba la pregunta 27 px hacia abajo con un `mt-3`, así
                    que **la pregunta y su respuesta no arrancaban a la misma
                    altura**. En las respuestas de una línea eso dejaba un
                    escalón que parecía un hueco sin rellenar. Sin número, las
                    dos columnas empiezan arriba. */}
                <dt className="lg:col-span-5">
                  <h2 className="font-display text-2xl uppercase leading-tight tracking-tight text-ink">
                    {item.q}
                  </h2>
                </dt>

                <dd className="lg:col-span-7">
                  {item.a.map((paragraph, paragraphIndex) => (
                    <p
                      key={paragraph}
                      className={`text-base leading-relaxed text-muted ${
                        paragraphIndex > 0 ? 'mt-4' : ''
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </dd>
              </div>
            ))}
          </dl>

          {/* **La foto va detrás de las respuestas, no delante.** Quien entra
              aquí viene a leer; una imagen antes de la primera pregunta se
              interpone. Puesta al final hace de bisagra hacia el cierre: se
              acaban las respuestas, se ve a quien las da y entonces se pide
              presupuesto.

              La de ahora es de banco y provisional, y va **ya recortada a
              2,4:1 en el archivo**: no hay foto de banco que venga nativa tan
              ancha, así que recortarla al descargarla es lo que evita que el
              navegador se baje un tercio de alto para tirarlo. Ver
              `PAGE_PHOTOS`. */}
          <CoverPlaceholder
            cover={PAGE_PHOTOS.faq?.src}
            seed="faq"
            className="mt-20 aspect-[2.4] rounded-2xl"
            sizes="(max-width: 1024px) 100vw, 1150px"
          />
        </Container>
      </section>

      <Cta />
    </>
  );
}
