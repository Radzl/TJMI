import { getTranslations } from 'next-intl/server';
import {
  BUSINESS_EMAIL,
  BUSINESS_SITES,
  HEAD_OFFICE,
  type BusinessSite,
} from '@/lib/business';
import { SERVICES } from '@/content/services';
import { DEFAULT_OG_IMAGE, ORGANIZATION_ID, WEBSITE_ID } from '@/lib/seo';
import { COMPANY_NAME, SITE_URL } from '@/lib/site';

type Props = { locale: string };

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
  const servicios = await getTranslations({ locale, namespace: 'services' });
  const items = servicios.raw('items') as { title: string }[];

  const graph = [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: COMPANY_NAME,
      legalName: `${COMPANY_NAME}, S.L.`,
      url: `${SITE_URL}/${locale}`,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
      email: BUSINESS_EMAIL,
      telephone: HEAD_OFFICE.telephone,
      description: t('description'),
      address: postalAddress(HEAD_OFFICE),
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Castellón' },
        { '@type': 'AdministrativeArea', name: 'Madrid' },
        { '@type': 'Country', name: 'España' },
      ],
      // **El teléfono como punto de contacto, además de como dato suelto.**
      // `telephone` dice cuál es el número; esto dice para qué sirve, en qué
      // idiomas atendemos y a quién. Es lo que permite que el número salga
      // como acción en la ficha, no solo como texto.
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: HEAD_OFFICE.telephone,
          email: BUSINESS_EMAIL,
          availableLanguage: ['es', 'en'],
          areaServed: 'ES',
        },
      ],
      // **Los seis servicios colgando de la empresa.** Cada ficha ya dice que
      // su proveedor es esta empresa; esto lo dice por el otro lado, y es lo
      // que convierte seis páginas sueltas en el catálogo de un negocio.
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: COMPANY_NAME,
        itemListElement: SERVICES.map((service) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: items[service.index].title,
            url: `${SITE_URL}/${locale}/servicios/${service.slug}`,
          },
        })),
      },
    },
    // **El nodo del sitio web, que no existía.** Sin él, las páginas que se
    // declaran `isPartOf` —los servicios y los artículos— apuntaban a un sitio
    // que nadie había presentado. Es además donde se declara que esto existe
    // en dos idiomas.
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE_URL}/${locale}`,
      name: COMPANY_NAME,
      inLanguage: locale,
      publisher: { '@id': ORGANIZATION_ID },
    },
    ...BUSINESS_SITES.map((site) => ({
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#${site.id}`,
      name: site.name,
      parentOrganization: { '@id': ORGANIZATION_ID },
      url: `${SITE_URL}/${locale}/contacto`,
      image: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
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
