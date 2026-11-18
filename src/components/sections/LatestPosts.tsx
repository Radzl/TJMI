import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import { sortedPosts } from '@/content/blog';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

/**
 * Los tres últimos artículos del blog, en la portada.
 *
 * **Por qué aquí.** La portada nombraba el blog en el índice de arriba («10
 * artículos») y no enseñaba ni uno: era la única sección de la web con fotos
 * propias de cada pieza y desde la portada no se veía ninguna. Y es contenido
 * que trabaja para vender: medidas de un palé, plazos, seguro, cuánto cuesta.
 * Son las preguntas que alguien se hace justo antes de pedir presupuesto.
 *
 * **Dónde va es parte de la decisión:** detrás de las sedes y delante del
 * cierre. El orden queda «esto es lo que hacemos — aquí estamos — lo que
 * conviene saber — cuéntanos qué necesitas», o sea la información útil justo
 * antes de la llamada a pedir presupuesto, que es cuando resuelve dudas. Más
 * arriba competiría con los servicios.
 *
 * **Se ordenan solos**, como el «Seguir leyendo» de los artículos: son los tres
 * más recientes por fecha y no hay lista escrita a mano que se quede vieja.
 *
 * **El titular dice algo y no señaliza.** «Del blog» sería una etiqueta de
 * navegación ocupando un `h2`; lo que se dice es para qué sirven esos tres
 * artículos.
 */
export default async function LatestPosts() {
  const locale = await getLocale();
  const t = await getTranslations('blog');
  const active = (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale;
  const dateFormat = new Intl.DateTimeFormat(active, { dateStyle: 'long' });

  const posts = sortedPosts().slice(0, 3);
  if (!posts.length) return null;

  return (
    <section data-bg="bone" className="relative z-10 bg-bone py-24 lg:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={t('latestTitle')} lead={t('latestIntro')} />
          <Link
            href="/blog"
            className="font-display text-xs uppercase tracking-widest text-brand-red-ink transition-colors hover:text-azul-texto"
          >
            {t('latestLink')}
          </Link>
        </div>

        <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {posts.map((post) => {
            const content = post.content[active];
            return (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  {/* Sin foto el artículo no se cae de la franja: el hueco
                      queda en arena, con la misma proporción. */}
                  <div className="photo relative aspect-[3/2] overflow-hidden rounded-xl bg-sand-deep">
                    {post.cover && (
                      <Image
                        src={post.cover}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-casa group-hover:scale-[1.04]"
                      />
                    )}
                  </div>

                  <p className="mt-5 font-display text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                    <time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time>
                    <span className="ml-3 text-brand-red-ink">
                      {t('readTime', { minutes: post.minutes })}
                    </span>
                  </p>

                  <h3 className="mt-3 font-display text-xl uppercase leading-tight tracking-tight text-ink transition-colors group-hover:text-azul-texto sm:text-2xl">
                    {content.title}
                  </h3>

                  {/* El filete rojo que crece, el mismo gesto que las tarjetas
                      del índice y el listado del blog. En reposo mide cero, así
                      que no mueve nada. */}
                  <span
                    aria-hidden="true"
                    className="mt-4 block h-0.5 w-0 bg-brand-red transition-[width] duration-300 ease-casa group-hover:w-16"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
