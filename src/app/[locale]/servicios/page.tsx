import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';

type Props = { params: Promise<{ locale: string }> };

type ServiceItem = {
  title: string;
  description: string;
};

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.services');
  const tServices = await getTranslations('services');
  const items = tServices.raw('items') as ServiceItem[];
  const featuredTags = tServices.raw('featured.tags') as string[];

  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} />

      <section className="py-20">
        <Container>
          <article className="rounded-2xl border border-line p-10 lg:p-12">
            <span className="font-display text-xs uppercase tracking-widest text-brand-red">
              {tServices('featured.tag')}
            </span>
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

          <ul className="mt-12 flex flex-col divide-y divide-line border-y border-line">
            {items.map((item, index) => (
              <li key={item.title} className="grid gap-6 py-10 md:grid-cols-12">
                <span className="font-display text-xs tracking-widest text-brand-red md:col-span-1">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="font-display text-2xl uppercase tracking-tight text-ink md:col-span-4">
                  {item.title}
                </h2>
                <p className="text-base leading-relaxed text-muted md:col-span-7">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Cta />
    </>
  );
}
