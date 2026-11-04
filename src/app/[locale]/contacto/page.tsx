import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import QuoteForm from '@/components/sections/QuoteForm';
import Sites from '@/components/sections/Sites';
import Container from '@/components/ui/Container';
import CoverPlaceholder from '@/components/ui/CoverPlaceholder';
import { PAGE_PHOTOS } from '@/content/media';
import PageHeader, { type PageFact } from '@/components/ui/PageHeader';
import { pageMetadata } from '@/lib/seo';
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
  const meta = await getTranslations({ locale, namespace: 'meta' });

  return pageMetadata({
    locale,
    path: '/contacto',
    title: t('title'),
    description: t('seoDescription'),
    imageAlt: meta('ogAlt'),
  });
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

      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumb={t('crumb')}
        path="/contacto"
        facts={t.raw('facts') as PageFact[]}
      />

      <section className="py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <QuoteForm
                whatsappUrl={tContact('whatsappUrl')}
                email={tContact('email')}
              />
            </div>

            {/* Vía rápida, para quien no quiere rellenar nada.

                **Eran cuatro tarjetas sueltas con tres maquetaciones
                distintas entre ellas:** WhatsApp ponía el nombre y el número
                en la misma línea, el correo etiqueta arriba y valor abajo, y
                las dos sedes etiqueta, número y horario. Cuatro cajas
                flotando en columna, cada una con su forma, al lado de una
                tarjeta de formulario que sí es una pieza entera.

                Ahora es **una sola tarjeta con cuatro filas** separadas por
                filete, y las cuatro con la misma forma. Así pesa lo mismo que
                el formulario que tiene al lado en vez de competir con él. */}
            <aside className="lg:col-span-2">
              <h2 className="font-display text-xs uppercase tracking-[0.18em] sm:tracking-[0.3em] text-muted">
                {tContact('directTitle')}
              </h2>

              <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
                {/* **WhatsApp no repite el número, y eso era un fallo.** La
                    tarjeta enseñaba `sites[0].phone`, que es exactamente el
                    fijo de Castellón que aparece dos filas más abajo con su
                    horario: el mismo número dos veces en la misma pantalla y
                    una de ellas etiquetada como otra cosa. Aquí lo que se
                    anuncia es la vía, no el número. */}
                <Via
                  href={tContact('whatsappUrl')}
                  externo
                  kicker="WhatsApp"
                  value={tContact('whatsappAria')}
                />

                <Via
                  href={`mailto:${tContact('email')}`}
                  kicker={tContact('emailLabel')}
                  value={tContact('email')}
                />

                {sites.map((site) => (
                  <Via
                    key={site.city}
                    href={`tel:${site.phoneHref}`}
                    kicker={site.city}
                    value={site.phone}
                    note={site.hours}
                  />
                ))}
              </ul>

              {/* **Aquí sobraban trescientos píxeles de columna vacía.** El
                  formulario de al lado es alto y la lista de vías es corta,
                  así que la mitad de abajo de esta columna no tenía nada.

                  Cuadrada y no apaisada: es lo que cabe en una columna
                  estrecha sin quedarse en una tira. Mientras no haya archivo
                  el hueco lo pinta `CoverPlaceholder`. Ver `PAGE_PHOTOS`. */}
              <CoverPlaceholder
                cover={PAGE_PHOTOS.contacto?.src}
                seed="contacto"
                className="mt-8 hidden aspect-square rounded-2xl lg:block"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </aside>
          </div>
        </Container>
      </section>

      <Sites />
    </>
  );
}

/**
 * Una vía de contacto: antetítulo, el dato sobre el que se actúa y una nota.
 *
 * Las cuatro usan esta misma forma a propósito. Con tres maquetaciones
 * distintas la lista no se leía como una lista, se leía como cuatro cosas que
 * habían caído ahí. Las que no tienen nota simplemente no la pintan, y en una
 * pila vertical eso no deja hueco —al revés que en una rejilla—.
 *
 * El fondo al pasar por encima usa `sand`, el escalón intermedio nuevo: sobre
 * blanco no había ningún tono al que ir que no fuera gris frío.
 */
function Via({
  href,
  kicker,
  value,
  note,
  externo,
}: {
  href: string;
  kicker: string;
  value: string;
  note?: string;
  externo?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
        className="group flex flex-col gap-1 px-6 py-5 transition-colors hover:bg-sand"
      >
        <span className="font-display text-xs uppercase tracking-widest text-muted">
          {kicker}
        </span>
        <span className="font-display text-lg tracking-tight text-brand-blue transition-colors group-hover:text-brand-blue-dark">
          {value}
        </span>
        {note && <span className="mt-1 text-xs text-muted">{note}</span>}
      </a>
    </li>
  );
}
