import { useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';

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
    // TODO: escena 5 (F5) — vista cenital con el trazado Castellón → Madrid
    <section data-scene="5" className="relative z-10 py-28">
      <Container>
        <h2 className="max-w-3xl font-display text-4xl uppercase leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {t('title')}
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
          {t('subtitle')}
        </p>

        <dl className="mt-16 grid gap-10 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {milestones.map((milestone) => (
            <div key={milestone.label} className="flex flex-col-reverse gap-3">
              <dt className="text-sm text-muted">{milestone.label}</dt>
              <dd className="font-display text-4xl uppercase tracking-tight text-brand-blue">
                {milestone.value}
              </dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-20 font-display text-xs uppercase tracking-[0.3em] text-muted">
          {t('coverageTitle')}
        </h3>

        <ul className="mt-8 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
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
