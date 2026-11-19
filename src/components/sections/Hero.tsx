import { useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import ScrollFade from '@/components/ui/ScrollFade';
import { PARTITURA } from '@/lib/partitura';
import { ANCHO_MOVIL } from '@/lib/pantalla';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    // Escenas 0 a 2: la altura extra da recorrido de scroll a la maniobra de
    // la grúa (coger, acercarse girando y cargar). Sin 3D esa altura sobra
    // y se quedaría en un hueco vacío, así que con movimiento reducido la
    // sección vuelve a medir lo que mide su contenido.
    //
    // Son 500svh: 400 de recorrido más la pantalla que se come el disparador,
    // que termina en `bottom bottom` (ver `ScrollChoreography`). A cambio, el
    // titular deja de despegarse una pantalla antes de que acabe la
    // animación, que es lo que dejaba un pantallazo de crema vacío con el
    // camión de tira abajo.
    //
    // Fueron 420 hasta D3 (2026-11-18): la entrada del camión se lleva los
    // primeros 80svh (`ENTRADA` en `lib/partitura.ts`) y la carga conserva
    // los 320 de siempre, así que no va más deprisa.
    <section
      data-scene="1"
      className="relative z-10 min-h-[500svh] sin3d:min-h-0"
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

              **El tramo y los números ya no se escriben aquí.** El fundido mide
              solo el mismo tramo que la escena (lo saca de la sección con
              `tramoDeEscena`) y la fracción sale de `PARTITURA`, la misma de
              la que tira el primer plano de `Scene.tsx`. Antes iban copiados a
              mano, con un aviso de «si tocas uno, toca el otro», y un fundido
              que medía otro tramo llegó a caer medio pantallazo antes del
              plano. */}
          <ScrollFade
            outFrom={PARTITURA.hero.textoSale[0]}
            outTo={PARTITURA.hero.textoSale[1]}
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
            <p className="text-sm text-ink/80">{t('eyebrow')}</p>

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
                sobre la maqueta 3D, así que cada línea de más es un trozo de
                escena tapado. A 16 px ocupaba cuatro líneas y 104 px de alto;
                a 14 se queda en bastante menos y el patio respira. De tableta
                para arriba el texto va al lado del 3D y no encima, así que ahí
                recupera su tamaño.

                **Y en móvil no está desde el principio: entra cuando el lote
                va a entrar en el camión.** Durante la maniobra en tres cuartos
                las torres de contenedores subían hasta él y se le metían
                debajo; ver `subtituloMovil` en `PARTITURA`. Se apaga solo con
                la opacidad, así que sigue ocupando su sitio y el titular no se
                mueve cuando aparece.

                `sin3d:opacity-100!` es la red: si la escena no llega a montarse
                (sin WebGL, o se cae) no hay maniobra que esperar, y el
                `!important` gana a la opacidad que escribe el disparador. Con
                movimiento reducido `ScrollFade` ni siquiera se monta. */}
            <ScrollFade
              inFrom={PARTITURA.hero.subtituloMovil[0]}
              inTo={PARTITURA.hero.subtituloMovil[1]}
              media={`(max-width: ${ANCHO_MOVIL - 1}px)`}
              className="sin3d:opacity-100!"
            >
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/80 sm:mt-6 sm:text-base">
                {t('subtitle')}
              </p>
            </ScrollFade>

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
