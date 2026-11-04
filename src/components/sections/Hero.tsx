import { useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import ScrollFade from '@/components/ui/ScrollFade';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    // Escenas 0 a 2: la altura extra da recorrido de scroll a la maniobra de
    // la grúa (coger, acercarse girando y cargar). Sin 3D esa altura sobra
    // y se quedaría en un hueco vacío, así que con movimiento reducido la
    // sección vuelve a medir lo que mide su contenido.
    //
    // Son 420svh y no 320 porque el disparador de esta sección termina en
    // `bottom bottom` (ver `ScrollChoreography`), que se come una pantalla:
    // el recorrido útil sigue siendo el de antes. A cambio, el titular deja
    // de despegarse una pantalla antes de que acabe la animación, que es lo
    // que dejaba un pantallazo de crema vacío con el camión de tira abajo.
    <section
      data-scene="1"
      className="relative z-10 min-h-[420svh] sin3d:min-h-0"
    >
      <div className="sticky top-20 h-[calc(100svh-5rem)] sin3d:static sin3d:h-auto sin3d:py-24">
        {/* El bloque de texto vive arriba y a la derecha: justo encima del
            camión, que en la maqueta 3D ocupa la franja baja derecha. */}
        <Container className="flex h-full flex-col justify-start pt-10 lg:pt-16">
          {/* **El bloque se aparta cuando se cierra el plano sobre el
              camión.** Ese momento existe porque es el único rato en que el
              camión está solo en pantalla y se le pueden ver los detalles —el
              rótulo de la lona, las rayas de la cabina, el operario dentro de
              la grúa—, y con el texto encima no llegaba a cumplirse: el plano
              se cerraba, el camión crecía, y lo que ganaba en tamaño lo perdía
              debajo del titular.

              El `start`/`end` **no es el de por defecto, y es importante**:
              tiene que ser el mismo que usa `ScrollChoreography` para el hero,
              porque si no una fracción de este disparador no es la misma
              fracción de aquel y el fundido cae medio pantallazo antes de que
              el plano empiece a cerrarse. Los números (0,84 → 0,98) son los
              del `closeUp` de `Scene.tsx`: si tocas uno, toca el otro. */}
          <ScrollFade
            start="top top"
            end="bottom bottom"
            outFrom={0.84}
            outTo={0.98}
            /* El bloque va a la derecha porque el camión ocupa la franja baja
               izquierda de la maqueta. **Sin 3D vuelve al ancho entero**: con
               la escena apagada, empujarlo a la derecha solo deja media
               pantalla de crema vacía a su izquierda. */
            className="lg:ml-auto lg:w-[54%] lg:min-w-[30rem] sin3d:lg:ml-0 sin3d:lg:w-full"
          >
            {/* Esto era una etiqueta en versales con prosa ancha y un filete
                rojo delante. El texto dice algo de verdad —que hay servicio
                nacional e internacional—, así que se queda; lo que se va es el
                disfraz de etiqueta, que no añadía información y es de los
                recursos que más delatan una web hecha en serie. Ahora es una
                frase, en la tipografía de texto y en caja baja. */}
            <p className="text-sm text-muted">{t('eyebrow')}</p>

            <h1 className="mt-4 font-display text-display-lg uppercase text-ink lg:mt-6">
              {t('title')}
            </h1>

            {/* **Esta frase estaba escrita y no se pintaba.** Llevaba tiempo en
                `messages` sin que ningún componente la usara, y resulta que es
                la más concreta de toda la web: dice que se recoge en más de 150
                fábricas y que se entrega puerta a puerta. El titular promete y
                esto es lo que lo sostiene; sin ella, la portada afirmaba sin
                dar un solo dato.

                La medida va corta a propósito: a renglón largo, un párrafo de
                apoyo deja de leerse de un vistazo, que es justo lo único que se
                le pide a un subtítulo. */}
            {/* **Más pequeño en móvil, y no es por estética.** Este párrafo cae
                sobre la maqueta 3D nada más entrar, así que cada línea de más
                es un trozo de escena tapado. A 16 px ocupaba cuatro líneas y
                104 px de alto; a 14 se queda en bastante menos y el patio
                respira. De tableta para arriba el texto va al lado del 3D y no
                encima, así que ahí recupera su tamaño. */}
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:mt-6 sm:text-base">
              {t('subtitle')}
            </p>

            {/* Aquí había un botón «Pedir presupuesto» y se ha quitado. No
                por sitio: el navbar ya lleva uno idéntico y vuelve en cuanto
                subes, así que eran **dos botones iguales en la misma
                pantalla**, que es lo que se lee como que la página aprieta. Y
                encima era el que caía sobre la lona del camión y tapaba el
                rótulo. */}
          </ScrollFade>
        </Container>
      </div>
    </section>
  );
}
