import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Cta from '@/components/sections/Cta';
import Container from '@/components/ui/Container';
import CoverPlaceholder from '@/components/ui/CoverPlaceholder';
import HeaderPhoto from '@/components/ui/HeaderPhoto';
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

  // **El artículo más reciente va en la cabecera, y sale del listado.** La
  // pieza de la derecha de las demás páginas es una foto de la casa; aquí lo
  // que mejor representa la página es lo último que se ha publicado. Y se quita
  // de la lista de abajo a propósito: la misma portada dos veces en la misma
  // pantalla se lee como que no hay más fotos.
  const [destacado, ...resto] = posts;
  const visual = destacado?.cover ? (
    <Link href={`/blog/${destacado.slug}`} className="group block">
      <HeaderPhoto src={destacado.cover} ratio="3 / 2" />
      <p className="mt-6 font-display text-xs uppercase tracking-widest text-muted">
        <time dateTime={destacado.date}>
          {dateFormat.format(new Date(destacado.date))}
        </time>
        <span className="ml-3 text-brand-red-ink">
          {tBlog('readTime', { minutes: destacado.minutes })}
        </span>
      </p>
      <h2 className="mt-3 font-display text-2xl uppercase leading-tight tracking-tight text-ink transition-colors group-hover:text-brand-blue sm:text-3xl">
        {destacado.content[active].title}
      </h2>
    </Link>
  ) : null;
  const lista = visual ? resto : posts;

  return (
    <>
      <PageHeader
        title={t('title')}
        lead={t('titleLead')}
        intro={t('intro')}
        crumb={t('crumb')}
        path="/blog"
        facts={facts}
        visual={visual}
      />

      <section className="py-20">
        <Container>
          {/* Las interiores entraban en la rejilla sin avisar y parecían
              de otra web: abren con la misma cabecera que la portada. */}
          <SectionHeading
            title={t('listTitle')}
          />
          <ul className="mt-16 flex flex-col divide-y divide-line border-b border-t border-line">
            {lista.map((post) => {
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

                    {/* La columna de portada. Las diez de ahora son de
                        banco y provisionales (ver `cover` en
                        `content/blog.ts`). Si a un artículo le falta la suya,
                        `CoverPlaceholder` pinta un bloque de color que ocupa
                        su sitio exacto, así que se puede publicar sin tener
                        la foto el mismo día. */}
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
                      {/* **El filete rojo que crece, otra vez.**

                          Es el mismo gesto que las tarjetas del índice de la
                          portada, y está aquí por lo mismo: medido, el
                          listado del blog tenía rojo —los minutos de
                          lectura— pero **ni una aparición deliberada**, y un
                          color que solo sale en texto de pie de foto se lee
                          como un resto, no como un sistema.

                          Va debajo del enlace y no encima de la fila: lo que
                          marca es la acción, que es entrar a leer. En reposo
                          mide 0 y no ocupa sitio, así que la maquetación no
                          se mueve. */}
                      <span className="mt-5 inline-flex flex-col items-start gap-1.5 font-display text-xs uppercase tracking-widest text-brand-blue">
                        {tBlog('readMore')}
                        <span
                          aria-hidden="true"
                          className="h-0.5 w-0 bg-brand-red transition-all duration-300 group-hover:w-full"
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* **El índice del blog cerraba sin ninguna salida, y cada artículo sí
          la tiene.** O sea que quien se leía un artículo entero encontraba
          adónde ir, y quien ojeaba el listado —que es el que todavía no se ha
          decidido por nada— se quedaba al final de diez titulares y un borde
          de filete.

          Es la misma sección de cierre de todas las demás páginas, no una
          versión reducida: si el listado merece una llamada, merece la
          misma. Y de paso trae a esta página el único rojo con cuerpo que le
          faltaba, que era lo que quedaba pendiente de la medida del color. */}
      <Cta />
    </>
  );
}
