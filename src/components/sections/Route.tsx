import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Container from '@/components/ui/Container';
import CountUp from '@/components/ui/CountUp';
import SectionHeading from '@/components/ui/SectionHeading';

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
    <section data-bg="night" className="tema-noche relative z-10 bg-bone py-28 lg:py-36">
      <Container>
        <SectionHeading
          title={t('coverageTitle')}
        />
      </Container>

      {/* Banda de cifras a sangre.
          Cuarenta años, ciento cincuenta pueblos y cuatro mil metros de nave
          son lo que de verdad vende esta empresa, y estaban puestos a tamaño
          de pie de foto en una fila gris. Ahora son una banda blanca que cruza
          la pantalla de lado a lado: se sale del `Container` a propósito,
          porque lo que la hace funcionar es justamente que no respete el
          margen del resto de la página.

          Las cifras no usan la escala de titulares aunque lo parezca. Un
          titular puede partirse en dos líneas sin pasar nada; «+4.000 m²»
          partido es un error de maquetación, así que lleva su propio `clamp`,
          ajustado para que la cifra más larga quepa en media columna de móvil. */}
      <div className="mt-16 border-y border-line bg-card">
        {/* `gap-px` sobre fondo gris dibuja los filetes entre celdas solo, sin
            tener que ir poniendo bordes a la primera, a la última y a las de
            la segunda fila cuando pasa de cuatro columnas a dos. */}
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.label}
              className="flex flex-col-reverse gap-3 bg-card px-6 py-12 lg:px-8 lg:py-16"
            >
              <dt className="text-sm leading-snug text-muted">
                {milestone.label}
              </dt>
              <dd>
                <CountUp
                  value={milestone.value}
                  className="font-display text-[clamp(2rem,4.2vw,3.25rem)] leading-none tracking-tight text-azul-texto tabular-nums"
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <Container>
        {/* Cada destino con su filete arriba: se lee como una tabla de rutas,
            que es lo que es, y no como una lista con viñetas.

            **Llevaban además un `01`–`04` en rojo, y se quitó.** Es la misma
            regla que vació las cabeceras de sección y las preguntas
            frecuentes: numerar afirma que hay una secuencia, y estos cuatro
            ámbitos no son pasos de nada —nadie contrata «Madrid y
            colindantes» después de «Castellón ⇄ Madrid»—. Quien manda aquí es
            la negrita que abre cada renglón, que dice hasta dónde se llega. */}
        <ul className="mt-20 grid gap-y-10 sm:grid-cols-2 sm:gap-x-12">
          {coverage.map((item) => (
            <li key={item.title} className="border-t border-line pt-6">
              <p className="text-base leading-relaxed text-muted">
                <b className="font-semibold text-ink">{item.title}</b>{' '}
                {item.description}
              </p>
            </li>
          ))}
        </ul>

        {/* **La línea de las sedes y el enlace a la cobertura, en la misma
            fila.** Las cuatro frases de arriba son un resumen, y un resumen
            sin salida se lee como todo lo que hay. La página entera cuenta
            hasta dónde llega cada nivel, con qué nave y en cuánto tiempo.

            Van al lado y no uno debajo del otro: son dos renglones cortos y
            apilados dejaban dos líneas sueltas al pie de una sección que ya
            es larga. */}
        <div className="mt-12 flex flex-wrap items-baseline gap-x-6 gap-y-3">
          <p className="font-display text-sm uppercase tracking-widest text-azul-texto">
            {t('sites')}
          </p>
          <Link
            href="/cobertura"
            className="font-display text-sm uppercase tracking-widest text-brand-red-ink transition-colors hover:text-azul-texto"
          >
            {t('coverageLink')}
          </Link>
        </div>
      </Container>
    </section>
  );
}
