import { getTranslations, setRequestLocale } from 'next-intl/server';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import { sortedPosts } from '@/content/blog';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: string }> };

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.blog');
  const tBlog = await getTranslations('blog');

  const active = (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale;
  const dateFormat = new Intl.DateTimeFormat(active, { dateStyle: 'long' });

  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} />

      <section className="py-20">
        <Container>
          <ul className="flex flex-col divide-y divide-line border-b border-line">
            {sortedPosts().map((post) => {
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
                      <span className="mt-2 block text-brand-red">
                        {tBlog('readTime', { minutes: post.minutes })}
                      </span>
                    </p>

                    <div className="md:col-span-9">
                      <h2 className="font-display text-2xl uppercase leading-tight tracking-tight text-ink transition-colors group-hover:text-brand-blue sm:text-3xl">
                        {content.title}
                      </h2>
                      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
                        {content.excerpt}
                      </p>
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
