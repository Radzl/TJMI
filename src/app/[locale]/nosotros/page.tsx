import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
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
