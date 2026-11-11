import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import CoverPlaceholder from '@/components/ui/CoverPlaceholder';
import { findPost, posts, sortedPosts } from '@/content/blog';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site';
import {
  breadcrumbJsonLd,
  organizationRef,
  pageMetadata,
  WEBSITE_ID,
} from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

function resolveLocale(locale: string): Locale {
  return (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale;
}

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = findPost(slug);
  if (!post) return {};

  const content = post.content[resolveLocale(locale)];
  const path = `/blog/${slug}`;

  const meta = await getTranslations({ locale, namespace: 'meta' });

  return pageMetadata({
    locale,
    path,
    title: content.title,
    description: content.excerpt,
    type: 'article',
    publishedTime: post.date,
    // Mientras el artículo no tenga portada propia va la del sitio. Antes se
    // quedaba sin imagen, y una tarjeta sin foto en WhatsApp es un renglón
    // gris que nadie abre.
    ...(post.cover ? { image: { url: `${SITE_URL}${post.cover}` } } : {}),
    imageAlt: post.cover ? content.title : meta('ogAlt'),
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = findPost(slug);
  if (!post) notFound();

  const active = resolveLocale(locale);
  const content = post.content[active];
  const t = await getTranslations('blog');
  const tContact = await getTranslations('contact');
  const nav = await getTranslations('nav');
  const dateFormat = new Intl.DateTimeFormat(active, { dateStyle: 'long' });

  // Los tres más recientes que no sean este. Se ordenan aquí y no se guarda
  // una lista de «relacionados» a mano: una lista a mano se queda desfasada en
  // cuanto se publica algo, y nadie se acuerda de repasarla.
  //
  // **Eran dos más la calculadora.** Al quitarla, la rejilla de tres columnas
  // se habría quedado con una celda vacía, así que entra un artículo más en
  // su sitio.
  const related = sortedPosts()
    .filter((other) => other.slug !== slug)
    .slice(0, 3);

  // Marcado para buscadores. Los datos son nuestros y estáticos.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.excerpt,
    ...(post.cover ? { image: `${SITE_URL}${post.cover}` } : {}),
    datePublished: post.date,
    // No hay fecha de revisión aparte, así que la de modificación es la de
    // publicación. Es cierto y Google la pide; inventarse una posterior para
    // parecer fresco es de los trucos que se acaban pagando.
    dateModified: post.date,
    inLanguage: active,
    // **Esto declaraba dos `Organization` sueltas, sin identificador.** Para
    // Google eran entidades nuevas que no tenían nada que ver con la empresa
    // de la portada, así que diez artículos no sumaban autoridad a nadie.
    author: organizationRef(),
    publisher: organizationRef(),
    isPartOf: { '@id': WEBSITE_ID },
    url: `${SITE_URL}/${locale}/blog/${slug}`,
    mainEntityOfPage: `${SITE_URL}/${locale}/blog/${slug}`,
  };

  // **Los artículos eran las únicas páginas sin miga de pan**, y son las más
  // hondas de la web: es donde más se nota, porque en el resultado de Google
  // se lee «Inicio › Blog › …» en vez de la dirección entera.
  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: nav('home'), path: '/' },
    { name: nav('blog'), path: '/blog' },
    { name: content.title, path: `/blog/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <article className="pt-20">
        <Container>
          <Link
            href="/blog"
            className="font-display text-xs uppercase tracking-widest text-muted hover:text-brand-blue"
          >
            {t('back')}
          </Link>

          {/* Portada del artículo. Aquí el recorte es 21:9, bastante más
              cerrado que el 3:2 del listado: al cambiar una foto hay que
              mirarla en los dos. Sin foto, un bloque de color. */}
          <CoverPlaceholder
            cover={post.cover}
            seed={post.slug}
            className="mt-10 aspect-[21/9] rounded-2xl"
            sizes="(max-width: 1024px) 100vw, 64rem"
          />

          <header className="mt-10 border-b border-line pb-10">
            <p className="flex flex-wrap items-center gap-3 font-display text-xs uppercase tracking-widest text-muted">
              <time dateTime={post.date}>
                {dateFormat.format(new Date(post.date))}
              </time>
              <span className="text-line">·</span>
              <span className="text-brand-red-ink">
                {t('readTime', { minutes: post.minutes })}
              </span>
            </p>

            <h1 className="mt-6 max-w-3xl font-display text-4xl uppercase leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {content.excerpt}
            </p>
          </header>

          <div className="mt-12 max-w-2xl">
            {content.body.map((block, index) => {
              if (block.type === 'h') {
                return (
                  <h2
                    key={index}
                    className="mt-12 font-display text-2xl uppercase tracking-tight text-ink first:mt-0"
                  >
                    {block.text}
                  </h2>
                );
              }

              if (block.type === 'ul') {
                return (
                  <ul key={index} className="mt-6 flex flex-col gap-3">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-4">
                        <span
                          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red"
                          aria-hidden="true"
                        />
                        <span className="text-base leading-relaxed text-muted">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p
                  key={index}
                  className="mt-6 text-base leading-relaxed text-muted"
                >
                  {block.text}
                </p>
              );
            })}
          </div>

          {/* **Seguir leyendo.** Un artículo que acaba y ya está deja a quien
              lo ha leído entero —o sea, a quien más interés tiene— sin ningún
              sitio al que ir. Van los dos más recientes que no sean este, y la
              calculadora: dos cosas para leer y una para usar. */}
          <nav className="mt-24 border-t border-line pt-10">
            <h2 className="font-display text-xs uppercase tracking-[0.18em] text-muted sm:tracking-[0.3em]">
              {t('moreTitle')}
            </h2>

            <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
              {related.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/blog/${other.slug}`}
                    className="group flex h-full flex-col bg-bone p-7 transition-colors hover:bg-white"
                  >
                    <span className="font-display text-xs uppercase tracking-widest text-muted">
                      <time dateTime={other.date}>
                        {dateFormat.format(new Date(other.date))}
                      </time>
                    </span>
                    <span className="mt-auto pt-4 font-display text-lg uppercase leading-tight tracking-tight text-ink transition-colors group-hover:text-brand-blue">
                      {other.content[active].title}
                    </span>
                  </Link>
                </li>
              ))}

            </ul>
          </nav>
        </Container>

        {/* **El cierre va a sangre y en azul noche, no en una tarjeta con
            marco.** Era un recuadro de la anchura del texto al final de la
            columna, o sea una nota más del artículo, y se leía como tal. Un
            artículo termina; esto es lo que pasa después, y tiene que notarse
            que cambia la cosa.

            Lleva `data-bg="night"`, así que el fondo de la página lo funde
            `Backdrop` en vez de entrar como un rectángulo. Y el titular
            pregunta en vez de ofrecer: quien acaba de leerse cuatro minutos
            sobre palés ya sabe que mueve palés. */}
        <aside
          data-bg="night"
          className="bg-night-depth mt-24 py-20 text-white lg:py-24"
        >
          <Container>
            <h2 className="max-w-3xl font-display text-display-md uppercase">
              {t('ctaTitle')}
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
              {t('ctaText')}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/contacto" variant="accent">
                {t('ctaButton')}
              </Button>
              <Button
                href={tContact('whatsappUrl')}
                variant="onDark"
                external
              >
                {t('ctaWhatsapp')}
              </Button>
            </div>
          </Container>
        </aside>
      </article>
    </>
  );
}
