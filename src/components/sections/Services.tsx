import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import ServicesTrack from './ServicesTrack';
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
    // Lleva su propio fondo oscuro, pero como el fondo de página ya ha virado
    // a azul noche durante el cierre de la intro, no se ve ningún borde.
    // Ojo: aquí NO puede haber `overflow-hidden`. El desfile horizontal fija
    // el bloque de las tarjetas, y un ancestro con overflow recortado rompe
    // el `position: sticky` que usa ScrollTrigger para fijarlo.
    <section data-bg="night" className="relative z-10 bg-night pb-28 pt-32 text-white">
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

      </Container>

      {/* Las tarjetas salen del Container a propósito: el desfile tiene que
          poder llegar hasta los dos bordes de la pantalla. */}
      <div className="mt-16">
        <ServicesTrack
          word={t('title')}
          items={items}
          images={SERVICE_IMAGES}
        />
      </div>

      <Container className="relative">
        <Button href="/servicios" variant="onDark">
          {t('cta')}
        </Button>
      </Container>
    </section>
  );
}
