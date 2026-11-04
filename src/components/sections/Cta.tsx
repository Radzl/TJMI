import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function Cta() {
  const t = useTranslations('cta');
  const tContact = useTranslations('contact');

  return (
    // TODO: F6 — aquí irá el formulario de presupuesto
    //
    // Es el final de la página y era la pieza más pequeña de todas: una
    // tarjeta azul centrada de poco más de media pantalla, con el titular a
    // tamaño de subtítulo. Ahora es una sección entera en azul noche, con el
    // titular a tamaño cartel y alineado a la izquierda como el resto.
    //
    // El fondo de la página vira a azul noche aquí (`data-bg`), así que el
    // oscuro no entra como un rectángulo: lo funde `Backdrop`. Y como el pie
    // es blanco, el corte final es azul → blanco, que cierra en seco.
    <section
      data-bg="night"
      className="relative z-10 overflow-hidden bg-night-depth py-28 text-white lg:py-40"
    >
      {/* Sangra por la derecha: centrada y entera se leería como otro titular
          en vez de como el fondo que es. */}

      <Container className="relative">
        <div className="max-w-3xl">
          {/* Aquí había un «Presupuesto sin compromiso» en versales. Se ha
              quitado entero: era venta, no información, y el titular de debajo
              ya pide exactamente lo que hay que pedir. El formulario que viene
              a continuación deja claro por sí solo que es un presupuesto. */}
          <h2 className="font-display text-display-xl uppercase">
            {t('title')}
          </h2>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
            {t('subtitle')}
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
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
