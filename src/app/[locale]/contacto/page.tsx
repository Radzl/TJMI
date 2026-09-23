import { getTranslations, setRequestLocale } from 'next-intl/server';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';

type Props = { params: Promise<{ locale: string }> };

type Site = {
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  hours: string;
  mapUrl: string;
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.contact');
  const tContact = await getTranslations('contact');
  const sites = tContact.raw('sites') as Site[];

  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} />

      <section className="py-20">
        <Container>
          <div className="flex flex-wrap gap-x-12 gap-y-6 border-b border-line pb-12">
            <div>
              <p className="font-display text-xs uppercase tracking-widest text-muted">
                {tContact('emailLabel')}
              </p>
              <a
                href={`mailto:${tContact('email')}`}
                className="mt-2 block text-lg text-ink hover:text-brand-blue"
              >
                {tContact('email')}
              </a>
            </div>
            <div>
              <p className="font-display text-xs uppercase tracking-widest text-muted">
                WhatsApp
              </p>
              <a
                href={tContact('whatsappUrl')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-lg text-ink hover:text-brand-blue"
              >
                {sites[0].phone}
              </a>
            </div>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {sites.map((site) => (
              <article
                key={site.city}
                className="rounded-2xl border border-line p-8"
              >
                <h2 className="font-display text-2xl uppercase tracking-tight text-ink">
                  {site.city}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  {site.address}
                </p>

                <p className="mt-6 font-display text-xs uppercase tracking-widest text-muted">
                  {tContact('hoursLabel')}
                </p>
                <p className="mt-2 text-sm text-muted">{site.hours}</p>

                <a
                  href={`tel:${site.phoneHref}`}
                  className="mt-6 block font-display text-xl tracking-tight text-brand-blue hover:text-brand-blue-dark"
                >
                  {site.phone}
                </a>

                <a
                  href={site.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block text-sm text-muted underline underline-offset-4 hover:text-brand-blue"
                >
                  {tContact('mapLink')}
                </a>
              </article>
            ))}
          </div>

          {/* TODO: formulario de presupuesto (F6) */}
          <p className="mt-12 max-w-xl text-base leading-relaxed text-muted">
            {t('formSoon')}
          </p>
        </Container>
      </section>
    </>
  );
}
