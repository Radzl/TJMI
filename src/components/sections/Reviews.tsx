import { useFormatter, useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import ReviewsTrack from '@/components/sections/ReviewsTrack';
import Image from 'next/image';
import { GOOGLE_PROFILE, sortedReviews } from '@/content/reviews';
import { REVIEWS_MUESTRA } from '@/content/reviews.muestra';

/**
 * Las reseñas de clientes.
 *
 * ## Por qué esta sección hacía falta
 *
 * En toda la web no había **ni una prueba social**: ni un logo de cliente, ni
 * un testimonio, ni un «trabajamos para». Para una empresa que recoge en más
 * de 150 fábricas de azulejo, lo que dicen esos clientes es el argumento que
 * ella no puede hacerse a sí misma: todo lo demás de la página lo firma la
 * propia casa.
 *
 * ## Dónde va, y el sitio es parte de la decisión
 *
 * Entre las sedes y el cierre. El orden queda «aquí estamos — esto dicen de
 * nosotros — cuéntanos qué necesitas»: la prueba cae **justo antes de pedir
 * algo**, que es cuando sirve. Más arriba, entre los servicios, sería una
 * interrupción; más abajo, nadie la lee.
 *
 * ## De rejilla a carrusel
 *
 * Esto fue una rejilla de tres columnas pegadas con un filete de un píxel
 * entre ellas, que es el mismo recurso que usan la banda de cifras y las
 * sedes. Allí funciona porque son datos; aquí no, porque **cada reseña es la
 * voz de una persona distinta** y pegadas se leen como una tabla de opiniones.
 * Ahora cada una es una tarjeta suelta con su aire alrededor, y la fila se
 * desplaza con puntos y flechas para pasar de una a otra. Ver `ReviewsTrack`
 * para el funcionamiento.
 *
 * Y la cita va a cuerpo mayor que el texto normal: es lo único de toda la
 * página que no lo firma la casa, así que no puede estar a tamaño de pie de
 * foto.
 *
 * ## Vacía no se pinta, y eso no es un descuido
 *
 * Mientras no haya reseñas de verdad, en producción **esta sección no existe**
 * —ni un hueco, ni un esqueleto—. El motivo es el mismo por el que
 * `content/reviews.ts` está vacío: unas tarjetas de relleno publicadas por
 * error no son un fallo de maquetación, son contenido falso.
 *
 * En desarrollo se pintan **reseñas de muestra** (`reviews.muestra.ts`): texto
 * lorem ipsum y retratos de banco, para poder juzgar la tarjeta de verdad antes
 * de tener el contenido. Antes era un armazón de barras grises, y con barras no
 * se ve cómo cae una cita larga ni cómo queda una cara en el pie. El lorem
 * ipsum es a propósito: nadie puede tomarlo por una opinión. Y no salen en
 * producción salvo que se encienda a mano `NEXT_PUBLIC_RESENAS_MUESTRA=1`
 * (ver `MUESTRA_PERMITIDA`).
 *
 * ## Sin marcado de valoración, y conviene saber por qué
 *
 * No lleva `AggregateRating` ni `Review` para buscadores. No es un olvido: ese
 * marcado se usa para pintar estrellas en los resultados de Google y **Google
 * no admite que un negocio publique el suyo propio** sobre sí mismo; además,
 * no hay nota media comprobada que declarar. El día que las reseñas vengan de
 * la ficha, se mira otra vez.
 */

/** Las cinco estrellas. Dibujadas aquí: son unos bytes y evitan una librería. */
function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <p className="flex items-center gap-1" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${
            i <= Math.round(rating) ? 'fill-brand-blue' : 'fill-line'
          }`}
          aria-hidden="true"
        >
          <path d="M10 1.6l2.47 5.3 5.53.72-4.06 3.9 1.05 5.68L10 14.5l-5 2.7 1.05-5.68L2 7.62l5.53-.72z" />
        </svg>
      ))}
    </p>
  );
}

/** Las iniciales de quien firma. Salen del nombre, no de ningún dato nuevo. */
function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

/** El ancho de tarjeta: una y pico en móvil, dos en tableta, tres en pantalla. */
const ANCHO =
  'w-[86%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]';

/**
 * Cuándo se pueden enseñar las reseñas de muestra (`reviews.muestra.ts`):
 * en desarrollo, o en una compilación donde se haya encendido a mano
 * `NEXT_PUBLIC_RESENAS_MUESTRA=1` —una vista previa para el cliente—. Nunca en
 * una compilación de producción normal.
 *
 * Sustituyen al armazón de barras grises que había antes: con texto y cara se
 * juzga la tarjeta de verdad, y el armazón obligaba a meter reseñas a mano,
 * capturar y quitarlas.
 */
const MUESTRA_PERMITIDA =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_RESENAS_MUESTRA === '1';

export default function Reviews() {
  const t = useTranslations('reviews');
  const formato = useFormatter();
  const reales = sortedReviews();
  // Con una sola reseña real, las de muestra desaparecen en todas partes.
  const items =
    reales.length > 0 ? reales : MUESTRA_PERMITIDA ? REVIEWS_MUESTRA : [];

  // Sin reseñas no hay sección: ni hueco, ni titular. Ver la nota de arriba.
  if (items.length === 0) return null;

  const total = items.length;

  return (
    <section data-bg="bone" className="relative z-10 bg-bone pb-28">
      <Container>
        <SectionHeading title={t('title')} lead={t('lead')} />

        <div className="mt-14">
          <ReviewsTrack
            count={total}
            labels={{
              region: t('title'),
              prev: t('prev'),
              next: t('next'),
              goTo: t.raw('goTo') as string,
            }}
          >
            {items.map((review) => (
                <li key={`${review.author}-${review.date}`} className={ANCHO}>
                  <figure className="reviews-card">
                    {/* La comilla no es adorno tonto: es lo que dice «esto lo
                        dijo alguien» antes de leer una palabra. Va detrás del
                        texto y muy clara, para no pelearse con él. */}
                    <span
                      className="pointer-events-none absolute right-6 top-2 select-none font-display text-7xl leading-none text-brand-red/15"
                      aria-hidden="true"
                    >
                      &rdquo;
                    </span>

                    <Stars
                      rating={review.rating}
                      label={t('rating', { n: review.rating })}
                    />

                    {/* El texto va en `blockquote` porque es una cita literal de
                        otra persona, no prosa nuestra. */}
                    <blockquote className="relative mt-7 text-lg leading-relaxed text-ink">
                      {review.text}
                    </blockquote>

                    <figcaption className="mt-auto flex items-center gap-4 border-t border-line pt-6">
                      {/* La foto de quien firma si la trae (las de Google
                          traen la del perfil) y, si no, sus iniciales en un
                          círculo, que salen del propio nombre y le ponen cara a
                          la cita sin suponer nada de nadie. Sin `alt`: el
                          nombre va justo al lado. */}
                      {review.photo ? (
                        <Image
                          src={review.photo}
                          alt=""
                          width={48}
                          height={48}
                          className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-line"
                        />
                      ) : (
                        <span
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 font-display text-sm tracking-tight text-azul-texto"
                          aria-hidden="true"
                        >
                          {iniciales(review.author)}
                        </span>
                      )}

                      {/* Empresa y fecha en dos líneas y no unidas con un
                          punto medio: es una de las cadenas con `·` que el
                          criterio de diseño de esta web ya quitó. */}
                      <span className="min-w-0">
                        <span className="block font-display text-sm uppercase tracking-tight text-ink">
                          {review.author}
                        </span>
                        {review.from && (
                          <span className="mt-0.5 block text-xs text-muted">
                            {review.from}
                          </span>
                        )}
                        <span className="mt-0.5 block text-xs text-muted">
                          {formato.dateTime(new Date(review.date), {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
          </ReviewsTrack>
        </div>

        {/* El enlace a la ficha solo existe cuando hay ficha: uno a ninguna
            parte es peor que ninguno. */}
        {GOOGLE_PROFILE && (
          <p className="mt-10 text-center">
            <a
              href={GOOGLE_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-sm uppercase tracking-widest text-brand-red-ink transition-colors hover:text-azul-texto"
            >
              {t('all')}
            </a>
          </p>
        )}
      </Container>
    </section>
  );
}
