import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import { pageAlternates } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

type ServiceItem = {
  title: string;
  description: string;
};

// Una foto por servicio, en el mismo orden que los textos de `messages`.
const SERVICE_IMAGES = [
  '/media/grupaje.jpg',
  '/media/ftl.jpg',
  '/media/intl.jpg',
  '/media/almacen.jpg',
  '/media/picking.jpg',
  '/media/contenedores.jpg',
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.services' });

  return {
    title: t('title'),
    description: t('intro'),
    alternates: pageAlternates(locale, '/servicios'),
  };
}

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

          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <li
                key={item.title}
                className="group overflow-hidden rounded-2xl border border-line bg-white"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={SERVICE_IMAGES[index]}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-8">
                  <span className="font-display text-xs tracking-widest text-brand-red">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="mt-3 font-display text-xl uppercase tracking-tight text-ink">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Cta />
    </>
  );
}
