import { useFormatter, useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import ReviewsTrack from '@/components/sections/ReviewsTrack';
import { GOOGLE_PROFILE, sortedReviews } from '@/content/reviews';

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
 * En desarrollo sí se pinta el armazón, con barras en vez de texto, para poder
 * juzgar la maqueta antes de tener el contenido. Es la misma idea que
 * `CoverPlaceholder` en el blog: enseñar la forma sin inventarse el fondo.
 * Van cuatro y no tres **a propósito**: con tres caben en pantalla y los
 * mandos del carrusel se esconderían, así que no se podría ver la pieza que se
 * está diseñando.
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
 * El armazón que se ve solo en desarrollo. Barras, nunca palabras: una
 * tarjeta con texto de relleno es justo lo que no puede publicarse.
 */
function Skeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className={ANCHO}>
          <div className="reviews-card" aria-hidden="true">
            <span className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="h-4 w-4 rounded-sm bg-line" />
              ))}
            </span>

            <span className="mt-7 flex flex-col gap-3">
              {[100, 94, 99, 62].map((w, k) => (
                <span
                  key={k}
                  className="block h-3.5 rounded-sm bg-line"
                  style={{ width: `${w}%` }}
                />
              ))}
            </span>

            <span className="mt-auto flex items-center gap-4 border-t border-line pt-6">
              <span className="h-11 w-11 shrink-0 rounded-full bg-line" />
              <span className="flex flex-1 flex-col gap-2">
                <span className="block h-3 w-28 rounded-sm bg-line" />
                <span className="block h-2.5 w-20 rounded-sm bg-line/70" />
              </span>
            </span>
          </div>
        </li>
      ))}
    </>
  );
}

export default function Reviews() {
  const t = useTranslations('reviews');
  const formato = useFormatter();
  const items = sortedReviews();

  // En producción, sin reseñas no hay sección. Ver la nota de arriba.
  if (items.length === 0 && process.env.NODE_ENV !== 'development') return null;

  const total = items.length || 4;

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
            {items.length === 0 ? (
              <Skeleton />
            ) : (
              items.map((review) => (
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
                      {/* Las iniciales en un círculo. No es un avatar
                          inventado: sale del propio nombre y le pone cara a la
                          cita sin suponer nada de nadie. */}
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 font-display text-sm tracking-tight text-brand-blue"
                        aria-hidden="true"
                      >
                        {iniciales(review.author)}
                      </span>

                      <span className="min-w-0">
                        <span className="block font-display text-sm uppercase tracking-tight text-ink">
                          {review.author}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {[
                            review.from,
                            formato.dateTime(new Date(review.date), {
                              month: 'long',
                              year: 'numeric',
                            }),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))
            )}
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
              className="font-display text-sm uppercase tracking-widest text-brand-red-ink transition-colors hover:text-brand-blue"
            >
              {t('all')}
            </a>
          </p>
        )}
      </Container>
    </section>
  );
}
