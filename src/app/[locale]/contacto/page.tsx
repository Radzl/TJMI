import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import QuoteForm from '@/components/sections/QuoteForm';
import Sites from '@/components/sections/Sites';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import { pageAlternates } from '@/lib/seo';
import BusinessJsonLd from '@/components/seo/BusinessJsonLd';

type Props = { params: Promise<{ locale: string }> };

type Site = {
  city: string;
  phone: string;
  phoneHref: string;
  hours: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  return {
    title: t('title'),
    description: t('intro'),
    alternates: pageAlternates(locale, '/contacto'),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.contact');
  const tContact = await getTranslations('contact');
  const sites = tContact.raw('sites') as Site[];

  return (
    <>
      <BusinessJsonLd locale={locale} />

      <PageHeader title={t('title')} intro={t('intro')} />

      <section className="py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <QuoteForm
                whatsappUrl={tContact('whatsappUrl')}
                email={tContact('email')}
              />
            </div>

            {/* Vía rápida, para quien no quiere rellenar nada. */}
            <aside className="lg:col-span-2">
              <h2 className="font-display text-xs uppercase tracking-[0.3em] text-muted">
                {tContact('directTitle')}
              </h2>

              <div className="mt-6 flex flex-col gap-5">
                <a
                  href={tContact('whatsappUrl')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-6 py-5 transition-colors hover:border-brand-blue"
                >
                  <span className="font-display text-lg uppercase tracking-tight text-ink">
                    WhatsApp
                  </span>
                  <span className="text-sm text-muted">{sites[0].phone}</span>
                </a>

                <a
                  href={`mailto:${tContact('email')}`}
                  className="flex flex-col gap-1 rounded-2xl border border-line bg-white px-6 py-5 transition-colors hover:border-brand-blue"
                >
                  <span className="font-display text-xs uppercase tracking-widest text-muted">
                    {tContact('emailLabel')}
                  </span>
                  <span className="text-base text-ink">
                    {tContact('email')}
                  </span>
                </a>

                {sites.map((site) => (
                  <a
                    key={site.city}
                    href={`tel:${site.phoneHref}`}
                    className="flex flex-col gap-1 rounded-2xl border border-line bg-white px-6 py-5 transition-colors hover:border-brand-blue"
                  >
                    <span className="font-display text-xs uppercase tracking-widest text-muted">
                      {site.city}
                    </span>
                    <span className="font-display text-xl tracking-tight text-brand-blue">
                      {site.phone}
                    </span>
                    <span className="mt-1 text-xs text-muted">
                      {site.hours}
                    </span>
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <Sites />
    </>
  );
}
