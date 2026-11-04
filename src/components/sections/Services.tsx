import Image from 'next/image';
import { useTranslations } from 'next-intl';
import ServicesTrack from './ServicesTrack';
import Container from '@/components/ui/Container';
import { Link } from '@/i18n/navigation';
import Marquee from '@/components/ui/Marquee';
import SectionHeading from '@/components/ui/SectionHeading';
import { FEATURED_PHOTO, SERVICE_IMAGE_SRCS } from '@/content/media';

import type { ServiceDetail, ServiceLabels } from '@/components/ui/ServiceDialog';

type ServiceItem = ServiceDetail;

export default function Services() {
  const t = useTranslations('services');
  const tMarquee = useTranslations('marquee');
  const items = t.raw('items') as ServiceItem[];
  const serviceLabels = t.raw('detail') as ServiceLabels;
  const featuredTags = t.raw('featured.tags') as string[];
  const marqueeItems = tMarquee.raw('items') as string[];

  return (
    // **Esta sección iba en azul noche a toda altura, y se ha pasado a crema.**
    //
    // El motivo es del brief, no de gusto: dice «mucho espacio en blanco, azul
    // y rojo solo como acentos, **nunca como fondos masivos**», y autoriza
    // **una** sección oscura, la que sube desde abajo en la intro. Esta era
    // una segunda, y además dejaba la portada en zigzag —oscuro en `InRoute`,
    // claro en `RoadIntro`, oscuro aquí, claro, oscuro en el cierre—. Ahora la
    // página va clara de principio a fin y los dos oscuros que quedan son los
    // dos extremos: el momento de la intro y el cierre.
    //
    // De paso se arregla una incoherencia que ya estaba: el modal que abren
    // estas tarjetas **siempre fue blanco**, así que al pulsar se pasaba de
    // azul noche a papel sin motivo.
    //
    // Ojo: aquí NO puede haber `overflow-hidden`. El desfile horizontal fija
    // el bloque de las tarjetas, y un ancestro con overflow recortado rompe
    // el `position: sticky` que usa ScrollTrigger para fijarlo.
    <section
      data-bg="bone"
      className="relative z-10 bg-bone pb-0 pt-32 text-ink"
    >
      <Container className="relative">
        <SectionHeading title={t('title')} lead={t('intro')} />

        {/* Bloque destacado: es el servicio de la casa, así que no puede ir
            como una tarjeta más. Va a lo ancho, con la foto sangrando por el
            borde y un filete rojo arriba que lo señala. */}
        <article className="group/featured relative mt-16 overflow-hidden rounded-2xl border border-line bg-white lg:grid lg:grid-cols-[1fr_1.1fr]">
          <span
            className="absolute inset-x-0 top-0 h-px bg-brand-red"
            aria-hidden="true"
          />

          <div className="p-10 lg:p-14">
            <p className="flex items-center gap-3 font-display text-xs uppercase tracking-[0.18em] sm:tracking-[0.3em] text-brand-red-ink">
              <span
                className="h-1.5 w-1.5 rounded-full bg-brand-red"
                aria-hidden="true"
              />
              {t('featured.tag')}
            </p>

            <h3 className="mt-6 font-display text-3xl uppercase leading-[0.96] tracking-tight sm:text-4xl">
              {t('featured.title')}
            </h3>

            {/* El filete vertical ata el párrafo al titular y rompe la columna
                de texto suelta, que era lo que hacía plano el bloque. */}
            <p className="mt-6 border-l border-line pl-5 text-base leading-relaxed text-muted">
              {t('featured.description')}
            </p>

            <ul className="mt-9 flex flex-wrap gap-2">
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

          <div className="photo min-h-[280px] lg:min-h-[460px]">
            <Image
              src={FEATURED_PHOTO.src}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-700 group-hover/featured:scale-[1.03]"
            />
            {/* **Aquí tampoco va degradado.** Lo llevó, y la nota decía que
                sin él «la foto entra de golpe y el bloque se parte en dos
                mitades que no se hablan». Eso era cierto **con el panel en
                azul noche**: el degradado llevaba la foto hacia ese azul y
                cosía las dos mitades. Con el panel en blanco la lleva hacia el
                blanco, o sea que la destiñe justo por el lado por el que más
                se mira. Lo que cose las dos mitades ahora es el propio marco
                de la tarjeta. */}
          </div>
        </article>
      </Container>

      {/* Las tarjetas salen del Container a propósito: el desfile tiene que
          poder llegar hasta los dos bordes de la pantalla. */}
      <div className="mt-20">
        <ServicesTrack
          items={items}
          images={SERVICE_IMAGE_SRCS}
          hint={t('scrollHint')}
          labels={serviceLabels}
        />
      </div>

      {/* Pie de sección: el botón suelto en mitad del oscuro no decía nada.
          Con el filete y el recuento se lee como el cierre de un capítulo. */}
      <Container className="relative">
        {/* El recuento «06 · Servicios» que había aquí se ha ido: era una
            etiqueta en versales con prosa ancha y un punto medio de separador,
            o sea los tres recursos de plantilla a la vez, y no decía nada que
            no dijeran las seis tarjetas de encima. Queda el enlace solo. */}
        {/* Centrado, no a la derecha. Alineado al borde se entendía cuando
            compartía fila con el recuento «06 · Servicios»: eran dos cosas
            repartidas a los extremos. Quitado el recuento, un enlace solo
            pegado a la derecha se lee como que falta algo a su izquierda. */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-line pt-8">
          <Link
            href="/servicios"
            className="group/cta inline-flex items-center gap-3 font-display text-sm uppercase tracking-widest text-brand-red-ink transition-colors hover:text-brand-blue"
          >
            {t('cta')}
          </Link>
        </div>
      </Container>

      <div className="mt-20">
        <Marquee items={marqueeItems} />
      </div>
    </section>
  );
}
