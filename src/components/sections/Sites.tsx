import { useTranslations } from 'next-intl';
import MapEmbed from '@/components/legal/MapEmbed';
import Container from '@/components/ui/Container';

type Site = {
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  hours: string;
  mapUrl: string;
  embedUrl: string;
};

export default function Sites() {
  const t = useTranslations('contact');
  const sites = t.raw('sites') as Site[];

  return (
    <section data-bg="bone" className="relative z-10 bg-bone pb-28">
      <Container>
        <h2 className="font-display text-4xl uppercase leading-none tracking-tight text-ink sm:text-5xl">
          {t('sitesTitle')}
        </h2>
        <p className="mt-6 max-w-xl text-lg text-muted">{t('sitesIntro')}</p>

        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {sites.map((site) => (
            <article
              key={site.city}
              className="overflow-hidden rounded-2xl border border-line bg-white"
            >
              <MapEmbed
                src={site.embedUrl}
                title={t('mapTitle', { city: site.city })}
                mapUrl={site.mapUrl}
              />

              <div className="p-8">
                <h3 className="font-display text-2xl uppercase tracking-tight text-ink">
                  {site.city}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  {site.address}
                </p>

                <dl className="mt-6 flex flex-col gap-2 text-sm text-muted">
                  <div className="flex gap-2">
                    <dt className="font-display uppercase tracking-widest text-ink">
                      {t('hoursLabel')}
                    </dt>
                    <dd>{site.hours}</dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <a
                    href={`tel:${site.phoneHref}`}
                    className="font-display text-xl tracking-tight text-brand-blue hover:text-brand-blue-dark"
                  >
                    {site.phone}
                  </a>
                  <a
                    href={site.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted underline underline-offset-4 hover:text-brand-blue"
                  >
                    {t('mapLink')}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
