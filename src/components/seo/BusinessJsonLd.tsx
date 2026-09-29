import { getTranslations } from 'next-intl/server';
import {
  BUSINESS_EMAIL,
  BUSINESS_SITES,
  HEAD_OFFICE,
  type BusinessSite,
} from '@/lib/business';
import { COMPANY_NAME, SITE_URL } from '@/lib/site';

type Props = { locale: string };

const ORGANIZATION_ID = `${SITE_URL}/#organizacion`;

function postalAddress(site: BusinessSite) {
  return {
    '@type': 'PostalAddress',
    streetAddress: site.streetAddress,
    postalCode: site.postalCode,
    addressLocality: site.addressLocality,
    addressRegion: site.addressRegion,
    addressCountry: 'ES',
  };
}

/**
 * Marcado de empresa para buscadores.
 *
 * Es lo que alimenta la ficha lateral de Google: nombre, teléfono, dirección
 * y horario de cada nave. Va como un grafo con tres nodos —la empresa y sus
 * dos sedes— enlazados por `@id`, de modo que Google entiende que las dos
 * naves son de la misma empresa y no tres negocios distintos.
 *
 * Se repite en la portada y en contacto; al compartir `@id` no cuentan como
 * duplicado.
 */
export default async function BusinessJsonLd({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const graph = [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: COMPANY_NAME,
      legalName: `${COMPANY_NAME}, S.L.`,
      url: `${SITE_URL}/${locale}`,
      logo: `${SITE_URL}/logo.png`,
      email: BUSINESS_EMAIL,
      telephone: HEAD_OFFICE.telephone,
      description: t('description'),
      address: postalAddress(HEAD_OFFICE),
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Castellón' },
        { '@type': 'AdministrativeArea', name: 'Madrid' },
        { '@type': 'Country', name: 'España' },
      ],
    },
    ...BUSINESS_SITES.map((site) => ({
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#${site.id}`,
      name: site.name,
      parentOrganization: { '@id': ORGANIZATION_ID },
      url: `${SITE_URL}/${locale}/contacto`,
      telephone: site.telephone,
      email: BUSINESS_EMAIL,
      address: postalAddress(site),
      openingHoursSpecification: site.hours.map((block) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: block.opens,
        closes: block.closes,
      })),
    })),
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': graph,
        }),
      }}
    />
  );
}
