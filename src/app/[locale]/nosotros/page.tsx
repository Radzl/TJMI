import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import VideoFrame from '@/components/sections/VideoFrame';
import Container from '@/components/ui/Container';
import PageHeader, { type PageFact } from '@/components/ui/PageHeader';
import RevealText from '@/components/ui/RevealText';
import { VIDEO_CON_AUDIO, VIDEO_POSTER } from '@/content/media';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.about' });
  const meta = await getTranslations({ locale, namespace: 'meta' });

  return pageMetadata({
    locale,
    path: '/nosotros',
    title: t('title'),
    description: t('seoDescription'),
    imageAlt: meta('ogAlt'),
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.about');
  const paragraphs = t.raw('body') as string[];

  return (
    // Página oscura: el tema noche se aplica a todo el contenido. Ver
    // `.tema-noche` en `globals.css`. **Pinta su propio fondo** (`bg-bone`,
    // que dentro del tema noche es azul noche): si dependiera del fondo de
    // la página, al llegar desde el menú se quedaba crema y el titular crema
    // desaparecía. Ver `Backdrop`.
    <div className="tema-noche bg-bone" data-bg="night">
      {/* **Primero el titular, después el vídeo, y el vídeo en grande.** Hubo
          una temporada en que esta página abría con el vídeo a sangre y el
          titular encima, y se entraba a Nosotros sin saber que se había
          entrado a Nosotros. Después fue al revés de más: el vídeo quedaba
          debajo de la banda de cifras, a una pantalla de distancia y del
          ancho del texto, como un elemento más de la página.

          Ahora va **dentro de la cabecera, justo debajo del titular y antes de
          las cifras**, y más ancho que el resto de la página (`wide` en
          `PageHeader`). Es el mejor material que tiene la casa: se ve la nave,
          el camión y a la gente, y es lo que demuestra lo que el titular
          afirma. Tiene que ser lo segundo que se ve, no lo quinto.

          Aquí no hay foto a la derecha del titular: la imagen de esta página
          es el vídeo. Y no hay pie de vídeo: decía «Vídeo corporativo de la
          empresa.» y explicar que eso es un vídeo no le dice nada a nadie. El
          `videoLabel` sigue como `aria-label`, que es donde hace falta. */}
      <PageHeader
        title={t('title')}
        lead={t('titleLead')}
        intro={t('intro')}
        crumb={t('crumb')}
        path="/nosotros"
        facts={t.raw('facts') as PageFact[]}
        wide={
          <VideoFrame
            src="/media/video-corporativo.mp4"
            poster={VIDEO_POSTER.src}
            label={t('videoLabel')}
            // Sin audio en el archivo no hay botón de sonido: ver
            // `VIDEO_CON_AUDIO`.
            soundLabel={VIDEO_CON_AUDIO ? t('videoSound') : undefined}
          />
        }
      />

      <section className="relative z-10 bg-bone py-16 lg:py-20">
        <Container>
          <div className="flex max-w-2xl flex-col gap-6 text-lg leading-relaxed text-muted">
            {paragraphs.map((paragraph) => (
              <RevealText key={paragraph}>{paragraph}</RevealText>
            ))}
          </div>

          <div className="mt-20 rounded-2xl border border-line p-10 lg:p-12">
            <span className="inline-block rounded-full border border-brand-red-ink px-4 py-1.5 font-display text-xs uppercase tracking-widest text-brand-red-ink">
              {t('sustainabilityBadge')}
            </span>
            <h2 className="mt-6 max-w-xl font-display text-3xl uppercase tracking-tight text-ink">
              {t('sustainabilityTitle')}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
              {t('sustainabilityText')}
            </p>
          </div>
        </Container>
      </section>

      <Cta />
    </div>
  );
}
