import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Container from '@/components/ui/Container';
import CoverPlaceholder from '@/components/ui/CoverPlaceholder';
import PageHeader, { type PageFact } from '@/components/ui/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import { sortedPosts } from '@/content/blog';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.blog' });
  const meta = await getTranslations({ locale, namespace: 'meta' });

  return pageMetadata({
    locale,
    path: '/blog',
    title: t('title'),
    description: t('intro'),
    imageAlt: meta('ogAlt'),
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.blog');
  const tBlog = await getTranslations('blog');

  const active = (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale;
  const dateFormat = new Intl.DateTimeFormat(active, { dateStyle: 'long' });

  // Los dos datos del blog salen del propio contenido, no de `messages`: un
  // recuento escrito a mano se queda viejo en cuanto se publica un artículo, y
  // una fecha de actualización inventada es justo lo que no puede llevar una
  // cabecera que está ahí para dar confianza.
  const posts = sortedPosts();
  const monthFormat = new Intl.DateTimeFormat(active, {
    month: 'short',
    year: 'numeric',
  });
  const facts = (t.raw('facts') as PageFact[]).map((fact) => ({
    ...fact,
    value: fact.value
      .replace('{count}', String(posts.length))
      .replace(
        '{updated}',
        posts.length > 0 ? monthFormat.format(new Date(posts[0].date)) : '—',
      ),
  }));

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumb={t('crumb')}
        path="/blog"
        facts={facts}
      />

      <section className="py-20">
        <Container>
          {/* Las interiores entraban en la rejilla sin avisar y parecían
              de otra web: abren con la misma cabecera que la portada. */}
          <SectionHeading
            title={t('listTitle')}
          />
          <ul className="mt-16 flex flex-col divide-y divide-line border-b border-t border-line">
            {posts.map((post) => {
              const content = post.content[active];

              return (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group grid gap-4 py-10 md:grid-cols-12 md:gap-8"
                  >
                    <p className="font-display text-xs uppercase tracking-widest text-muted md:col-span-3">
                      <time dateTime={post.date}>
                        {dateFormat.format(new Date(post.date))}
                      </time>
                      <span className="mt-2 block text-brand-red-ink">
                        {tBlog('readTime', { minutes: post.minutes })}
                      </span>
                    </p>

                    {/* La columna de portada. Mientras no haya fotos pinta un
                        bloque de color que ocupa su sitio exacto, para poder
                        juzgar la página que va a quedar y no la de ahora. */}
                    <CoverPlaceholder
                      cover={post.cover}
                      seed={post.slug}
                      className="aspect-[3/2] rounded-xl md:col-span-4"
                      sizes="(max-width: 768px) 100vw, 30vw"
                    />

                    <div className="md:col-span-5">
                      <h2 className="font-display text-2xl uppercase leading-tight tracking-tight text-ink transition-colors group-hover:text-brand-blue sm:text-3xl">
                        {content.title}
                      </h2>
                      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
                        {content.excerpt}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 font-display text-xs uppercase tracking-widest text-brand-blue">
                        {tBlog('readMore')}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>
    </>
  );
}
