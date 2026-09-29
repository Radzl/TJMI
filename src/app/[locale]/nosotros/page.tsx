import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import VideoHero from '@/components/sections/VideoHero';
import Container from '@/components/ui/Container';
import RevealText from '@/components/ui/RevealText';
import { pageAlternates } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.about' });

  return {
    title: t('title'),
    description: t('intro'),
    alternates: pageAlternates(locale, '/nosotros'),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.about');
  const paragraphs = t.raw('body') as string[];

  return (
    <>
      <VideoHero
        src="/media/video-corporativo.mp4"
        poster="/media/camion-01.jpg"
        title={t('title')}
        intro={t('intro')}
        label={t('videoLabel')}
        soundOn={t('videoSoundOn')}
        soundOff={t('videoSoundOff')}
      />

      {/* El contenido sube por encima del vídeo con el borde redondeado: es
          lo que hace que se lea como que el vídeo se queda detrás. */}
      <section className="relative z-10 -mt-10 rounded-t-[2.5rem] bg-bone py-20 lg:-mt-14 lg:py-28">
        <Container>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            {t('videoCaption')}
          </p>

          <div className="mt-12 flex max-w-2xl flex-col gap-6 text-lg leading-relaxed text-muted">
            {paragraphs.map((paragraph) => (
              <RevealText key={paragraph}>{paragraph}</RevealText>
            ))}
          </div>

          <div className="mt-20 rounded-2xl border border-line p-10 lg:p-12">
            <span className="inline-block rounded-full border border-brand-red px-4 py-1.5 font-display text-xs uppercase tracking-widest text-brand-red">
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
