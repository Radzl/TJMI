import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

/**
 * 404 dentro del idioma: mantiene navbar, pie y tono de la casa, y en vez de
 * dejar al visitante tirado le ofrece las dos salidas útiles.
 */
export default function NotFound() {
  const t = useTranslations('pages.notFound');

  return (
    <section className="flex min-h-[70svh] items-center py-24">
      <Container>
        <p className="flex items-center gap-4 font-display text-xs uppercase tracking-[0.3em] text-muted">
          <span className="h-px w-10 bg-brand-red" aria-hidden="true" />
          {t('code')}
        </p>

        <h1 className="mt-6 max-w-3xl font-display text-4xl uppercase leading-[0.95] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {t('title')}
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          {t('intro')}
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/">{t('home')}</Button>
          <Button href="/contacto" variant="outline">
            {t('contact')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
