import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LegalSections, {
  type LegalSection,
} from '@/components/legal/LegalSections';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import { pageAlternates } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

type Row = {
  name: string;
  owner: string;
  purpose: string;
  duration: string;
  category: string;
};

type Browser = { name: string; url: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.cookies' });

  return {
    title: t('title'),
    description: t('intro'),
    alternates: pageAlternates(locale, '/cookies'),
  };
}

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.cookies');
  const headers = t.raw('tableHeaders') as Record<string, string>;
  const rows = t.raw('rows') as Row[];
  const sections = t.raw('sections') as LegalSection[];
  const browsers = t.raw('browsers') as Browser[];

  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} />

      <section className="py-20">
        <Container>
          <p className="mb-12 font-display text-xs uppercase tracking-[0.3em] text-muted">
            {t('updated')}
          </p>

          <div className="flex flex-col gap-12">
            <section>
              <h2 className="font-display text-xl uppercase tracking-tight text-ink sm:text-2xl">
                {t('whatTitle')}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted">
                {t('whatText')}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl uppercase tracking-tight text-ink sm:text-2xl">
                {t('tableTitle')}
              </h2>

              {/* En móvil la tabla se lee mal, así que cada cookie se pinta
                  como una ficha. En pantalla ancha, tabla de verdad. */}
              <div className="mt-6 flex flex-col gap-5 md:hidden">
                {rows.map((row) => (
                  <div
                    key={row.name}
                    className="rounded-2xl border border-line bg-white p-6"
                  >
                    <p className="font-display text-sm uppercase tracking-widest text-ink">
                      {row.name}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {row.purpose}
                    </p>
                    <dl className="mt-4 flex flex-col gap-1 text-xs text-muted">
                      <div className="flex gap-2">
                        <dt>{headers.owner}:</dt>
                        <dd className="text-ink">{row.owner}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt>{headers.duration}:</dt>
                        <dd className="text-ink">{row.duration}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt>{headers.category}:</dt>
                        <dd className="text-ink">{row.category}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>

              <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line bg-white md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-bone">
                      {['name', 'owner', 'purpose', 'duration', 'category'].map(
                        (key) => (
                          <th
                            key={key}
                            scope="col"
                            className="p-4 font-display text-xs uppercase tracking-widest text-ink"
                          >
                            {headers[key]}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.name}
                        className="border-b border-line last:border-0 align-top"
                      >
                        <th
                          scope="row"
                          className="p-4 text-left font-display text-xs uppercase tracking-widest text-ink"
                        >
                          {row.name}
                        </th>
                        <td className="p-4 text-muted">{row.owner}</td>
                        <td className="p-4 text-muted">{row.purpose}</td>
                        <td className="p-4 text-muted">{row.duration}</td>
                        <td className="p-4 text-muted">{row.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <LegalSections sections={sections} />

            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {browsers.map((browser) => (
                <li key={browser.name}>
                  <a
                    href={browser.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-blue underline underline-offset-4 hover:text-brand-blue-dark"
                  >
                    {browser.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
