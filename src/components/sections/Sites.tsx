import { useTranslations } from 'next-intl';
import MapEmbed from '@/components/legal/MapEmbed';
import SiteLocator from '@/components/sections/SiteLocator';
import { SITE_PHOTOS } from '@/content/media';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';

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
        <SectionHeading
          title={t('sitesTitle')}
          lead={t('sitesIntro')}
        />

        {/* Las dos sedes iban en tarjetas blancas con marco, una al lado de
            otra. Puestas en dos columnas el mapa se quedaba en un sello y la
            dirección en dos líneas apretadas, y el marco blanco sobre crema
            apenas se distinguía: pagábamos un borde por no ganar nada.

            Ahora cada sede ocupa el ancho entero y se separan con un filete,
            que es lo mismo que hace la lista de cobertura justo encima. El
            mapa gana la mitad del ancho y los datos respiran al lado. */}
        <ul className="mt-16 divide-y divide-line border-t border-line">
          {sites.map((site, index) => (
            <li
              key={site.city}
              className="grid gap-10 py-12 md:grid-cols-2 md:items-start md:gap-14"
            >
              <div className="overflow-hidden rounded-xl">
                <MapEmbed
                  src={site.embedUrl}
                  title={t('mapTitle', { city: site.city })}
                  mapUrl={site.mapUrl}
                  photo={SITE_PHOTOS[index]?.src}
                  // Las sedes van en el mismo orden que `contact.sites`:
                  // primero Almazora y después Fuenlabrada.
                  fondo={<SiteLocator sede={index === 0 ? 'castellon' : 'madrid'} />}
                />
              </div>

              <div className="md:pt-2">
                {/* Sin `01` / `02` delante: dos sedes no son dos pasos. Es la
                    misma regla que quitó la numeración de las cabeceras. */}
                <h3 className="font-display text-display-sm uppercase text-ink">
                  {site.city}
                </h3>

                <p className="mt-5 max-w-sm text-base leading-relaxed text-muted">
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

                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <a
                    href={`tel:${site.phoneHref}`}
                    className="font-display text-2xl tracking-tight text-brand-blue transition-colors hover:text-brand-blue-dark"
                  >
                    {site.phone}
                  </a>
                  <a
                    href={site.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-muted underline underline-offset-4 transition-colors hover:text-brand-blue"
                  >
                    {t('mapLink')}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
