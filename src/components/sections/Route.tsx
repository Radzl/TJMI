import { useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import CountUp from '@/components/ui/CountUp';

type Milestone = {
  value: string;
  label: string;
};

type CoverageItem = {
  title: string;
  description: string;
};

export default function Route() {
  const t = useTranslations('route');
  const milestones = t.raw('milestones') as Milestone[];
  const coverage = t.raw('coverage') as CoverageItem[];

  return (
    // Fondo propio y opaco: ya no hay 3D detrás, y así el texto en tinta nunca
    // puede quedarse sobre el azul noche de la sección anterior.
    <section data-bg="bone" className="relative z-10 bg-bone py-28">
      <Container>
        <h2 className="font-display text-4xl uppercase leading-none tracking-tight text-ink sm:text-5xl">
          {t('coverageTitle')}
        </h2>

        <dl className="mt-16 grid gap-10 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {milestones.map((milestone) => (
            <div key={milestone.label} className="flex flex-col-reverse gap-3">
              <dt className="text-sm text-muted">{milestone.label}</dt>
              <dd>
                <CountUp
                  value={milestone.value}
                  className="font-display text-4xl uppercase tracking-tight text-brand-blue tabular-nums"
                />
              </dd>
            </div>
          ))}
        </dl>

        <ul className="mt-20 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
          {coverage.map((item) => (
            <li key={item.title} className="flex gap-4">
              <span
                className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-red"
                aria-hidden="true"
              />
              <p className="text-base leading-relaxed text-muted">
                <b className="font-semibold text-ink">{item.title}</b>{' '}
                {item.description}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-10 font-display text-sm uppercase tracking-widest text-brand-blue">
          {t('sites')}
        </p>
      </Container>
    </section>
  );
}
