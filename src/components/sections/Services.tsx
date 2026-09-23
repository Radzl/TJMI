import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

type ServiceItem = {
  title: string;
  description: string;
};

export default function Services() {
  const t = useTranslations('services');
  const items = t.raw('items') as ServiceItem[];
  const featuredTags = t.raw('featured.tags') as string[];

  return (
    // TODO: escena 4 (F4) — pin + scroll horizontal de las tarjetas
    <section
      data-scene="4"
      className="relative z-10 overflow-hidden pb-28 pt-40 sm:pt-52"
    >
      <span
        aria-hidden="true"
        className="text-stroke pointer-events-none absolute left-0 top-6 select-none font-display text-[18vw] uppercase leading-none"
      >
        {t('title')}
      </span>

      <Container className="relative">
        <h2 className="font-display text-4xl uppercase leading-none tracking-tight text-ink sm:text-5xl">
          {t('title')}
        </h2>
        <p className="mt-6 max-w-xl text-lg text-muted">{t('intro')}</p>

        <article className="mt-16 grid overflow-hidden rounded-2xl border border-line lg:grid-cols-2">
          <div className="p-10 lg:p-12">
            <span className="font-display text-xs uppercase tracking-widest text-brand-red">
              {t('featured.tag')}
            </span>
            <h3 className="mt-4 font-display text-2xl uppercase tracking-tight text-ink sm:text-3xl">
              {t('featured.title')}
            </h3>
            <p className="mt-5 text-base leading-relaxed text-muted">
              {t('featured.description')}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {featuredTags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-widest text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative min-h-[260px] lg:min-h-full">
            <Image
              src="/media/camion-02.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </article>

        <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-line bg-white p-8 transition-colors hover:border-brand-blue"
            >
              <h3 className="font-display text-xl uppercase tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <Button href="/servicios" variant="outline">
            {t('cta')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
