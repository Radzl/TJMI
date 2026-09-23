import { getTranslations, setRequestLocale } from 'next-intl/server';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';

type Props = { params: Promise<{ locale: string }> };

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.blog');

  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} />

      {/* TODO: listado de artículos en MDX (F6) */}
      <section className="py-20">
        <Container>
          <p className="rounded-2xl border border-dashed border-line px-8 py-16 text-center text-muted">
            {t('empty')}
          </p>
        </Container>
      </section>
    </>
  );
}
