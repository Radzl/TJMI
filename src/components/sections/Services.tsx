import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

type ServiceItem = {
  title: string;
  description: string;
};

// Una foto por servicio, en el mismo orden que los textos de `messages`.
const SERVICE_IMAGES = [
  '/media/grupaje.jpg',
  '/media/ftl.jpg',
  '/media/intl.jpg',
  '/media/almacen.jpg',
  '/media/picking.jpg',
  '/media/contenedores.jpg',
];

export default function Services() {
  const t = useTranslations('services');
  const items = t.raw('items') as ServiceItem[];
  const featuredTags = t.raw('featured.tags') as string[];

  return (
    // El oscuro no lo pone esta sección: lo pone el fondo de página, que ya ha
    // virado a azul noche durante el cierre de la intro. Así no entra ningún
    // rectángulo cortando el 3D.
    // TODO: F4 — pin + scroll horizontal de las tarjetas
    // Lleva su propio fondo oscuro, pero como el fondo de página ya ha virado
    // a azul noche durante el cierre de la intro, no se ve ningún borde.
    <section
      data-bg="night"
      className="relative z-10 overflow-hidden bg-night pb-28 pt-32 text-white"
    >
      <span
        aria-hidden="true"
        className="text-stroke pointer-events-none absolute left-0 top-6 select-none font-display text-[18vw] uppercase leading-none opacity-25"
      >
        {t('title')}
      </span>

      <Container className="relative">
        <h2 className="font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
          {t('title')}
        </h2>
        <p className="mt-6 max-w-xl text-lg text-white/70">{t('intro')}</p>

        <article className="mt-16 grid overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] lg:grid-cols-2">
          <div className="p-10 lg:p-12">
            <span className="font-display text-xs uppercase tracking-widest text-brand-red">
              {t('featured.tag')}
            </span>
            <h3 className="mt-4 font-display text-2xl uppercase tracking-tight sm:text-3xl">
              {t('featured.title')}
            </h3>
            <p className="mt-5 text-base leading-relaxed text-white/70">
              {t('featured.description')}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {featuredTags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-widest text-white/60"
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
          {items.map((item, index) => (
            <li
              key={item.title}
              className="group overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] transition-colors hover:border-white/40"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={SERVICE_IMAGES[index]}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <h3 className="font-display text-xl uppercase tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/65">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <Button href="/servicios" variant="onDark">
            {t('cta')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
