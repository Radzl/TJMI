import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import RevealHeading from '@/components/ui/RevealHeading';
import RouteSteps from '@/components/sections/RouteSteps';
import ScrollFade from '@/components/ui/ScrollFade';

type Step = {
  /** El sitio o la cifra de esa parada: Castellón, Almazora, 420 km, Madrid. */
  place: string;
  title: string;
  description: string;
};

export default function InRoute() {
  const t = useTranslations('inRoute');
  const steps = t.raw('steps') as Step[];

  return (
    // Escena 3: el fondo azul noche lo pinta el suelo 3D que sube desde abajo.
    //
    // El hueco de arriba es deliberado: dentro de él caben, por este orden, el
    // arranque del camión y la subida del azul noche. Solo después asoma el
    // texto, que es blanco y necesita el fondo ya hecho. Si lo acortas, el
    // titular aparece sobre crema o el camión se va sin que se le vea avanzar.
    //
    // Sin 3D no hay suelo oscuro detrás, así que este texto blanco se quedaría
    // sobre el crema de la página: con movimiento reducido la sección se pinta
    // su propio fondo azul noche y quita el hueco de arriba.
    <section
      data-scene="3"
      // **Arranca cuando el índice opaco ya ha salido, no cuando esta sección
      // asoma por abajo.** Con `top bottom` el disparador empezaba una
      // pantalla antes, y esa pantalla la tapaba entera el índice: el camión
      // se asomaba un instante, la cámara lo subía detrás del panel y el
      // suelo azul se llenaba sin que se viera nada. Al descubrirse el panel
      // el camión ya se había ido y volvía a entrar: eso era el parpadeo.
      data-scene-start="top top"
      // El hueco crece justo esa pantalla (140 → 240svh) para que el
      // disparador siga midiendo los mismos 3.055 px. Así ninguna de las
      // fracciones afinadas —el recorrido, el llenado, la salida del texto—
      // cambia de sitio ni de velocidad.
      className="relative z-10 pb-28 pt-[240svh] text-white sin3d:bg-night sin3d:pt-28"
    >
      <Container>
        {/* Se retira antes de que el suelo oscuro se vaya: si no, este texto
            claro se quedaría en blanco sobre el fondo crema. Pero lo justo:
            con la salida más temprana el bloque de pasos se apagaba todavía
            en pantalla, y en móvil, donde ocupa mucho más alto, daba la
            sensación de que la sección ni llegaba a aparecer. */}
        <ScrollFade outFrom={0.9} outTo={0.98}>
          <RevealHeading
            text={t('title')}
            // A tamaño cartel: es el centro emocional de la página y pedía peso.
            // Fluido para que no haya que ir saltando por puntos de corte.
            className="max-w-4xl font-display text-display-xl uppercase"
          />

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
            {t('subtitle')}
          </p>

          <div className="mt-10">
            <Button href="/nosotros" variant="onDark">
              {t('cta')}
            </Button>
          </div>

          <RouteSteps title={t('stepsTitle')} steps={steps} />
        </ScrollFade>
      </Container>
    </section>
  );
}
