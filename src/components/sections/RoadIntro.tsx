import { useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import RouteOdometer from '@/components/ui/RouteOdometer';
import RouteProgress from '@/components/ui/RouteProgress';
import ScrollFade from '@/components/ui/ScrollFade';
import { ROAD_TRIGGER } from '@/lib/route';

export default function RoadIntro() {
  const t = useTranslations('route');

  return (
    // Última escena de la intro: la cámara gira a cenital, el camión recorre la
    // carretera por la derecha, frena al llegar y la intro cierra fundiendo a
    // oscuro. La sección es alta para que todo eso tenga sitio.
    //
    // **Vuelve a medir 480svh, y conviene saber por qué fue y vino.**
    //
    // Bajó a 420 para recortar el azul vacío del principio, y el recorte
    // estaba bien; lo que no se vio es que el disparador **también** pasó a
    // acabar en `bottom bottom`, o sea una pantalla antes. Entre las dos cosas
    // el tramo pasó de 5.220 a 3.780 px: **todo lo de dentro se comprimió un
    // 28 %** sin tocar una sola fracción. Medido: el fundido de entrada cayó
    // de 731 a 340 px y el de cierre de 418 a 265. Eso es lo que se veía como
    // «entra y sale muy brusco».
    //
    // Con 480svh y final en `bottom bottom` el tramo mide 4.320 px, que es
    // **exactamente el recorrido que antes se veía**: de los 5.220 de antes,
    // los últimos 900 ocurrían con el bloque fijo ya subiendo, o sea fuera de
    // pantalla. Así que no se recupera la espera vacía, se recuperan los
    // fundidos.
    <section
      data-scene="5"
      // **Acaba en `bottom bottom`, no en `bottom top`.** El bloque fijo de
      // esta sección se suelta cuando su borde inferior llega al de la
      // pantalla, y con el final por defecto el disparador seguía contando una
      // pantalla más: el 19 % final de la escena —la llegada a la nave y el
      // fundido de cierre— ocurría con el bloque ya subiendo. Medido: la nave
      // de destino no entraba en cuadro **nunca**. Mismo arreglo que el hero.
      data-scene-end={ROAD_TRIGGER.end}
      data-bg="bone"
      className="relative z-10 min-h-[480svh] sin3d:min-h-0"
    >
      <div className="sticky top-20 flex h-[calc(100svh-5rem)] items-end pb-14 sin3d:static sin3d:h-auto sin3d:py-24 sm:items-center sm:pb-0">
        <Container>
          {/* Entra cuando el suelo oscuro ya se ha retirado, para que este
              texto en tinta nunca caiga sobre fondo azul noche. */}
          {/* El trazado pasa por detrás de este bloque, y sobre el asfalto
              negro el texto en tinta no se lee. Cada letra lleva su propio
              halo crema: se apoya solo en el texto y deja el asfalto limpio.
              `text-shadow` se hereda, así que con ponerlo aquí vale para todo
              el bloque.

              **Aquí hubo un velo crema para móvil y hubo que quitarlo.** Era
              un degradado por detrás del bloque entero, y aunque resolvía la
              lectura, se comía la carretera: en una pantalla estrecha ese
              rectángulo tapa media escena y lo que se ve es una mancha, no un
              camión rodando. El halo por letra aguanta solo si es lo bastante
              ancho, y ahora lo es.

              Lo que de verdad lo resuelve es el encuadre: en móvil este bloque
              se va abajo (`items-end`) y la cámara cenital mira por delante
              del camión, así que el trazado ocupa la mitad de arriba y el
              texto la de abajo. Dejan de pelearse por el mismo sitio. */}
          <ScrollFade
            className="relative max-w-sm [text-shadow:0_0_3px_rgb(246_244_241),0_0_6px_rgb(246_244_241),0_0_12px_rgb(246_244_241),0_0_22px_rgb(246_244_241)] lg:max-w-md"
            inFrom={0.3}
            inTo={0.42}
            outFrom={0.92}
            outTo={0.99}
            // El mismo tramo que la escena 3D: si midieran distinto, una
            // fracción de aquí no sería la misma fracción de allí y el texto
            // entraría o saldría medio pantallazo a destiempo.
            start={ROAD_TRIGGER.start}
            end={ROAD_TRIGGER.end}
          >
            <div className="relative">
              <h2 className="font-display text-display-md uppercase text-ink">
                {t('title')}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
                {t('subtitle')}
              </p>

              {/* Los kilómetros suben al mismo ritmo al que avanza el camión. */}
              <p className="mt-12 flex items-baseline gap-2">
                <RouteOdometer
                  start={ROAD_TRIGGER.start}
                  end={ROAD_TRIGGER.end}
                  total={t('odometer.value')}
                  className="font-display text-6xl leading-none tracking-tight text-brand-blue tabular-nums sm:text-7xl"
                />
                <span className="font-display text-2xl uppercase tracking-tight text-brand-blue">
                  {t('odometer.unit')}
                </span>
              </p>
              <p className="mt-3 font-display text-xs uppercase tracking-[0.18em] text-muted sm:tracking-[0.3em]">
                {t('odometer.label')}
              </p>

              {/* **En móvil la barra deja hueco a la derecha**, igual que la
                  del desfile de servicios y por lo mismo: ahí vive el botón
                  flotante de WhatsApp, que mide 56 px a 24 del borde. Sin
                  este margen tapaba «Fuenlabrada (Madrid)» y el final de la
                  línea, o sea justo el destino, en la escena que va de
                  llegar a él. */}
              <div className="pr-16 sm:pr-0">
                <RouteProgress
                  start={ROAD_TRIGGER.start}
                  end={ROAD_TRIGGER.end}
                  origin={t('origin')}
                  destination={t('destination')}
                />
              </div>
            </div>
          </ScrollFade>
        </Container>
      </div>
    </section>
  );
}
