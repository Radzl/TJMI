import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    // Escenas 0 a 2: la altura extra da recorrido de scroll a la maniobra de
    // la grúa (coger, acercarse girando y depositar). Sin 3D esa altura sobra
    // y se quedaría en un hueco vacío, así que con movimiento reducido la
    // sección vuelve a medir lo que mide su contenido.
    <section
      data-scene="1"
      className="relative z-10 min-h-[320svh] motion-reduce:min-h-0"
    >
      <div className="sticky top-20 h-[calc(100svh-5rem)] motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        {/* El bloque de texto vive arriba y a la derecha: justo encima del
            camión, que en la maqueta 3D ocupa la franja baja derecha. */}
        <Container className="flex h-full flex-col justify-start pt-10 lg:pt-16">
          <div className="lg:ml-auto lg:w-[54%] lg:min-w-[30rem]">
            <p className="flex items-center gap-4 font-display text-xs uppercase tracking-[0.3em] text-muted">
              <span className="h-px w-10 bg-brand-red" aria-hidden="true" />
              {t('eyebrow')}
            </p>

            <h1 className="mt-6 font-display text-4xl uppercase leading-[0.95] tracking-tight text-ink sm:text-5xl lg:mt-8 lg:text-6xl">
              {t('title')}
            </h1>

            <div className="mt-8 lg:mt-10">
              <Button href="/contacto">{t('ctaPrimary')}</Button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
