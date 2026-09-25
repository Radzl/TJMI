import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LegalSections, {
  PendingNotice,
  type LegalSection,
} from '@/components/legal/LegalSections';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return { title: t('privacyTitle') };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.privacy');
  const sections = t.raw('sections') as LegalSection[];

  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} />

      <section className="py-20">
        <Container>
          <PendingNotice>{t('pending')}</PendingNotice>

          <p className="mb-12 font-display text-xs uppercase tracking-[0.3em] text-muted">
            {t('updated')}
          </p>

          <LegalSections sections={sections} />
        </Container>
      </section>
    </>
  );
}
