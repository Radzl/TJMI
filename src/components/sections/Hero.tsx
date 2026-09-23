import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    // Escenas 1 y 2: la altura extra da recorrido de scroll a la grúa.
    <section data-scene="1" className="relative z-10 min-h-[200svh]">
      <div className="sticky top-20 h-[calc(100svh-5rem)]">
        <Container className="flex h-full flex-col justify-start pt-8 lg:justify-center lg:pt-0">
          <p className="flex items-center gap-4 font-display text-xs uppercase tracking-[0.3em] text-muted">
            <span className="h-px w-10 bg-brand-red" aria-hidden="true" />
            {t('eyebrow')}
          </p>

          <h1 className="mt-6 max-w-2xl font-display text-4xl uppercase leading-[0.95] tracking-tight text-ink sm:text-6xl lg:mt-8 lg:text-7xl">
            {t('title')}
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg lg:mt-8">
            {t('subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap gap-4 lg:mt-10">
            <Button href="/contacto">{t('ctaPrimary')}</Button>
            <Button href="/servicios" variant="outline">
              {t('ctaSecondary')}
            </Button>
          </div>
        </Container>

        <Container className="absolute inset-x-0 bottom-10">
          <span className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-muted">
            {t('scroll')}
          </span>
        </Container>
      </div>
    </section>
  );
}
