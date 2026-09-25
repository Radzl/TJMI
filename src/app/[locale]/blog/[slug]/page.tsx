import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { findPost, posts } from '@/content/blog';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { COMPANY_NAME, SITE_URL } from '@/lib/site';

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

  return {
    title: content.title,
    description: content.excerpt,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(
        routing.locales.map((code) => [code, `/${code}${path}`]),
      ),
    },
    openGraph: {
      type: 'article',
      title: content.title,
      description: content.excerpt,
      publishedTime: post.date,
      siteName: COMPANY_NAME,
      url: `${SITE_URL}/${locale}${path}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = findPost(slug);
  if (!post) notFound();

  const active = resolveLocale(locale);
  const content = post.content[active];
  const t = await getTranslations('blog');
  const dateFormat = new Intl.DateTimeFormat(active, { dateStyle: 'long' });

  // Marcado para buscadores. Los datos son nuestros y estáticos.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.excerpt,
    datePublished: post.date,
    inLanguage: active,
    author: { '@type': 'Organization', name: COMPANY_NAME },
    publisher: { '@type': 'Organization', name: COMPANY_NAME },
    mainEntityOfPage: `${SITE_URL}/${locale}/blog/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="py-20">
        <Container>
          <Link
            href="/blog"
            className="font-display text-xs uppercase tracking-widest text-muted hover:text-brand-blue"
          >
            ← {t('back')}
          </Link>

          <header className="mt-10 border-b border-line pb-10">
            <p className="flex flex-wrap items-center gap-3 font-display text-xs uppercase tracking-widest text-muted">
              <time dateTime={post.date}>
                {dateFormat.format(new Date(post.date))}
              </time>
              <span className="text-line">·</span>
              <span className="text-brand-red">
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

          <aside className="mt-20 max-w-2xl rounded-2xl border border-line p-10">
            <h2 className="font-display text-2xl uppercase tracking-tight text-ink">
              {t('ctaTitle')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {t('ctaText')}
            </p>
            <div className="mt-8">
              <Button href="/contacto">{t('ctaButton')}</Button>
            </div>
          </aside>
        </Container>
      </article>
    </>
  );
}
