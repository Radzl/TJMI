import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function Cta() {
  const t = useTranslations('cta');
  const tContact = useTranslations('contact');

  return (
    // TODO: escena 6 (F6) — aquí irá el formulario de presupuesto
    // El fondo blanco cierra la intro 3D: a partir de aquí manda el contenido.
    <section data-scene="6" className="relative z-10 bg-white pb-28 pt-20">
      <Container>
        <div className="rounded-3xl bg-night px-8 py-20 text-center text-white sm:px-16">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-white/50">
            {t('eyebrow')}
          </p>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            {t('subtitle')}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/contacto" variant="accent">
              {t('button')}
            </Button>
            <Button href={tContact('whatsappUrl')} variant="onDark" external>
              {t('whatsapp')}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
