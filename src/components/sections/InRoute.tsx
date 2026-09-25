import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import RevealHeading from '@/components/ui/RevealHeading';
import ScrollFade from '@/components/ui/ScrollFade';

type Step = {
  title: string;
  description: string;
};

export default function InRoute() {
  const t = useTranslations('inRoute');
  const steps = t.raw('steps') as Step[];

  return (
    // Escena 3: el fondo azul noche lo pinta el suelo 3D que sube desde abajo.
    // El hueco de arriba es deliberado: deja que el suelo termine de subir y de
    // llenar la pantalla antes de que asome el texto.
    // Sin 3D no hay suelo oscuro detrás, así que este texto blanco se quedaría
    // sobre el crema de la página: con movimiento reducido la sección se pinta
    // su propio fondo azul noche y quita el hueco de arriba.
    <section
      data-scene="3"
      className="relative z-10 pb-28 pt-[75svh] text-white motion-reduce:bg-night motion-reduce:pt-28"
    >
      <Container>
        {/* Se retira antes de que el suelo oscuro se vaya: si no, este texto
            claro se quedaría en blanco sobre el fondo crema. */}
        <ScrollFade outFrom={0.8} outTo={0.92}>
          <RevealHeading
            text={t('title')}
            className="max-w-3xl font-display text-4xl uppercase leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          />

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
        </ScrollFade>
      </Container>
    </section>
  );
}
