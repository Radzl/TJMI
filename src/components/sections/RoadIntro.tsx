import { useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import RouteOdometer from '@/components/ui/RouteOdometer';
import RouteProgress from '@/components/ui/RouteProgress';
import ScrollFade from '@/components/ui/ScrollFade';

export default function RoadIntro() {
  const t = useTranslations('route');

  return (
    // Última escena de la intro: la cámara gira a cenital, el camión recorre la
    // carretera por la derecha, frena al llegar y la intro cierra fundiendo a
    // oscuro. La sección es alta para que todo eso tenga sitio.
    <section
      data-scene="5"
      data-bg="bone"
      className="relative z-10 min-h-[300svh] motion-reduce:min-h-0"
    >
      <div className="sticky top-20 flex h-[calc(100svh-5rem)] items-center motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        <Container>
          {/* Entra cuando el suelo oscuro ya se ha retirado, para que este
              texto en tinta nunca caiga sobre fondo azul noche. */}
          <ScrollFade
            className="max-w-sm lg:max-w-md"
            inFrom={0.3}
            inTo={0.42}
            outFrom={0.84}
            outTo={0.94}
          >
            <h2 className="font-display text-4xl uppercase leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {t('title')}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
              {t('subtitle')}
            </p>

            {/* Los kilómetros suben al mismo ritmo al que avanza el camión. */}
            <p className="mt-12 flex items-baseline gap-2">
              <RouteOdometer
                total={t('odometer.value')}
                className="font-display text-6xl leading-none tracking-tight text-brand-blue tabular-nums sm:text-7xl"
              />
              <span className="font-display text-2xl uppercase tracking-tight text-brand-blue">
                {t('odometer.unit')}
              </span>
            </p>
            <p className="mt-3 font-display text-xs uppercase tracking-[0.3em] text-muted">
              {t('odometer.label')}
            </p>

            <RouteProgress
              origin={t('origin')}
              destination={t('destination')}
            />
          </ScrollFade>
        </Container>
      </div>
    </section>
  );
}
