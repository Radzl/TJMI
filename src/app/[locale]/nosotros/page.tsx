import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import VideoFrame from '@/components/sections/VideoFrame';
import Container from '@/components/ui/Container';
import PageHeader, { type PageFact } from '@/components/ui/PageHeader';
import RevealText from '@/components/ui/RevealText';
import { VIDEO_POSTER } from '@/content/media';
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
    <>
      {/* **Primero el titular, después el vídeo.** Hubo una temporada en que
          esta página abría con el vídeo a sangre y el titular encima, y lo que
          pasaba es que se entraba a Nosotros sin saber que se había entrado a
          Nosotros: lo primero que se veía era un plano en movimiento sin nada
          que lo presentara. Ahora abre como las demás páginas interiores, con
          su cabecera y sus cifras, y el vídeo viene debajo haciendo de prueba
          de lo que la cabecera afirma, que es su sitio. */}
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumb={t('crumb')}
        path="/nosotros"
        facts={t.raw('facts') as PageFact[]}
      />

      <section className="relative z-10 bg-bone py-16 lg:py-20">
        <Container>
          <VideoFrame
            src="/media/video-corporativo.mp4"
            poster={VIDEO_POSTER.src}
            label={t('videoLabel')}
          />

          {/* Aquí había un pie que decía «Vídeo corporativo de la empresa.» y
              se quitó: explicar que eso de arriba es un vídeo no le dice nada
              a nadie. El `videoLabel` sigue como `aria-label` del elemento,
              que es donde hace falta de verdad. */}
          <div className="mt-20 flex max-w-2xl flex-col gap-6 text-lg leading-relaxed text-muted">
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
    </>
  );
}
