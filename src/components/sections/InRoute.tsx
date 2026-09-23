import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

type Step = {
  title: string;
  description: string;
};

export default function InRoute() {
  const t = useTranslations('inRoute');
  const steps = t.raw('steps') as Step[];

  return (
    // Escena 3: el fondo azul noche lo pinta la banda 3D que sube desde abajo.
    <section data-scene="3" className="relative z-10 py-28 text-white">
      <Container>
        <h2 className="max-w-3xl font-display text-4xl uppercase leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          {t('title')}
        </h2>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
          {t('subtitle')}
        </p>

        <div className="mt-10">
          <Button href="/nosotros" variant="onDark">
            {t('cta')}
          </Button>
        </div>

        <h3 className="mt-20 font-display text-xs uppercase tracking-[0.3em] text-white/50">
          {t('stepsTitle')}
        </h3>

        <ol className="mt-8 grid gap-10 border-t border-white/15 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="font-display text-xs tracking-widest text-brand-red">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h4 className="mt-4 font-display text-xl uppercase tracking-tight">
                {step.title}
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
