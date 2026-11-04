import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import type {
  ServiceDetail,
  ServiceLabels,
} from '@/components/ui/ServiceDialog';
import { SERVICES, findService } from '@/content/services';
import { Link } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/site';
import { organizationRef, pageMetadata, WEBSITE_ID } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Solo existen estas seis: cualquier otra dirección es un 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = findService(slug);
  if (!service) return {};

  const t = await getTranslations({ locale, namespace: 'services' });
  const items = t.raw('items') as ServiceDetail[];
  const item = items[service.index];

  const meta = await getTranslations({ locale, namespace: 'meta' });

  return pageMetadata({
    locale,
    path: `/servicios/${slug}`,
    title: item.seoTitle ?? item.title,
    description: item.seoDescription ?? item.description,
    // **Sin foto propia por servicio, y es decisión.** Lo suyo sería la que
    // encabeza cada ficha, pero tres de las seis son verticales y de menos de
    // 500 px —lo canta `npm run check:fotos`—: como tarjeta social saldrían
    // recortadas y borrosas, peor que la del camión. Cuando lleguen las
    // apaisadas que pide el `brief` de `content/media.ts`, aquí.
    imageAlt: meta('ogAlt'),
  });
}

/** Lista con viñeta de color; se repite en los dos bloques de la ficha. */
function Points({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'red' | 'blue';
}) {
  return (
    <section>
      <h2 className="font-display text-xs uppercase tracking-[0.18em] text-ink sm:tracking-[0.3em]">
        {title}
      </h2>
      <ul className="mt-6 flex flex-col gap-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span
              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                tone === 'red' ? 'bg-brand-red' : 'bg-brand-blue'
              }`}
              aria-hidden="true"
            />
            <span className="text-base leading-relaxed text-muted">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * La página propia de cada servicio.
 *
 * ## Por qué existen estas seis páginas
 *
 * El texto largo de cada servicio llevaba tiempo escrito y solo se veía en dos
 * sitios donde no lo lee ni Google ni casi nadie: dentro del modal de la
 * portada, que hay que abrir a mano, y amontonado con los otros cinco en
 * `/servicios`. Una sola página con seis servicios compite por una sola
 * búsqueda; seis páginas compiten por seis, y lo que teclea un cliente es
 * «grupaje Castellón Madrid», no «servicios de transporte».
 *
 * ## Y por qué el listado se quedó corto
 *
 * Al abrir estas páginas, `/servicios` dejó de repetir el texto largo. No es
 * por aligerar: **dos páginas con el mismo contenido compiten entre ellas** y
 * Google acaba quedándose con una, normalmente no la que querrías. El listado
 * hace de índice y el detalle vive aquí, en un solo sitio.
 *
 * El marcado `Service` enlaza con el nodo de la empresa por `@id`, el mismo
 * que usa `BusinessJsonLd`, para que Google entienda que este servicio lo
 * presta esa empresa y no uno suelto.
 */
export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const service = findService(slug);
  if (!service) notFound();

  const t = await getTranslations('services');
  const items = t.raw('items') as ServiceDetail[];
  const labels = t.raw('detail') as ServiceLabels;
  const item = items[service.index];

  const others = SERVICES.filter((other) => other.slug !== slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: item.heading ?? item.title,
    description: item.seoDescription ?? item.description,
    serviceType: item.title,
    // **Esto apuntaba a `#empresa` y la empresa se declara como
    // `#organizacion`.** O sea que las seis fichas decían tener un proveedor
    // que no existe en ninguna parte: para Google, un servicio sin empresa
    // detrás, que es justo lo contrario de lo que este marcado está para
    // decir. Ahora el identificador vive en un solo sitio (`lib/seo.ts`) y no
    // se puede volver a desincronizar escribiéndolo a mano.
    provider: organizationRef(),
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Castellón' },
      { '@type': 'AdministrativeArea', name: 'Madrid' },
      { '@type': 'Country', name: 'España' },
    ],
    isPartOf: { '@id': WEBSITE_ID },
    url: `${SITE_URL}/${locale}/servicios/${slug}`,
    inLanguage: locale,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* **Sin párrafo en la cabecera, y es lo que ordena toda la página.**
          Con él, la foto quedaba entre dos trozos de texto: primero la línea
          de entrada, luego la foto y luego el resto. Partir la lectura en dos
          con una imagen en medio no es componer, es interrumpir. El texto de
          entrada no se pierde: baja a encabezar el cuerpo, debajo de la foto. */}
      <PageHeader
        title={item.heading ?? item.title}
        crumb={item.title}
        path={`/servicios/${slug}`}
        parent={{ href: '/servicios', label: labels.backToAll }}
      />

      <section className="py-14 lg:py-20">
        <Container>
          {/* La foto, a lo ancho y lo primero. Dejó de ir en una columna al
              lado del texto: en escritorio quedaba bien, pero en móvil —que es
              donde se lee esto— no hay dos columnas, así que la foto caía en
              mitad del texto sin remedio. A lo ancho funciona igual en los dos
              sitios, y de paso la foto se ve del tamaño que merece. */}
          <div className="photo aspect-[4/3] rounded-2xl sm:aspect-[2/1]">
            <Image
              src={service.photo.src}
              alt=""
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
            />
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              {/* La entrada va a mayor cuerpo que el resto: es la frase que
                  resume el servicio y la que lee quien no va a leer más. */}
              <p className="font-display text-display-sm uppercase text-ink">
                {item.description}
              </p>

              {item.long?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-7 text-lg leading-relaxed text-muted"
                >
                  {paragraph}
                </p>
              ))}

              <div className="mt-12 border-t border-line pt-10">
                <Button href="/contacto">{labels.quote}</Button>
              </div>
            </div>

            {/* Las dos listas se van a la columna de al lado en escritorio:
                son de consulta, no de lectura seguida, y debajo del texto
                largo quedaban a un scroll de distancia de donde surge la
                pregunta. En móvil caen detrás, que es el único sitio posible. */}
            <div className="flex flex-col gap-12 lg:col-span-5 lg:border-l lg:border-line lg:pl-10">
              {item.includes && item.includes.length > 0 && (
                <Points
                  title={labels.includes}
                  items={item.includes}
                  tone="red"
                />
              )}
              {item.bestFor && item.bestFor.length > 0 && (
                <Points
                  title={labels.bestFor}
                  items={item.bestFor}
                  tone="blue"
                />
              )}
            </div>
          </div>

          {/* Los otros cinco, enlazados. Es lo que hace que estas seis páginas
              se sostengan entre ellas en vez de quedar cada una en un callejón
              sin salida, y lo que deja a un paso el servicio que de verdad
              buscaba quien entró por el que no era. */}
          <nav className="mt-20 border-t border-line pt-10">
            <h2 className="font-display text-xs uppercase tracking-[0.18em] text-muted sm:tracking-[0.3em]">
              {labels.otherTitle}
            </h2>
            <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/servicios/${other.slug}`}
                    className="group flex h-full flex-col bg-bone p-7 transition-colors hover:bg-white"
                  >
                    <span className="font-display text-lg uppercase tracking-tight text-ink transition-colors group-hover:text-brand-blue">
                      {items[other.index].title}
                    </span>
                    <span className="mt-3 text-sm leading-relaxed text-muted">
                      {items[other.index].description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      <Cta />
    </>
  );
}
