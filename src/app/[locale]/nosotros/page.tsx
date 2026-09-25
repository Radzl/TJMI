import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import BrandVideo from '@/components/ui/BrandVideo';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.about');
  const paragraphs = t.raw('body') as string[];

  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} />

      <section className="py-20">
        <Container>
          <div className="flex max-w-2xl flex-col gap-6 text-lg leading-relaxed text-muted">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <figure className="mt-16">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-night">
              <BrandVideo
                src="/media/video-corporativo.mp4"
                poster="/media/camion-01.jpg"
                label={t('videoLabel')}
                playLabel={t('videoPlay')}
              />
            </div>
            <figcaption className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              {t('videoCaption')}
            </figcaption>
          </figure>

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
