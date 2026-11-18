'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useForm, type Path } from 'react-hook-form';
import { z } from 'zod';

type Props = {
  whatsappUrl: string;
  email: string;
};

type Step = { title: string; hint: string };

const inputStyles =
  'mt-2 w-full rounded-xl border border-line bg-card px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-azul-texto';

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-display text-xs uppercase tracking-widest text-muted">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-2 block text-sm text-brand-red-ink">{error}</span>
      )}
    </label>
  );
}

/**
 * En qué punto está el envío.
 *
 * `whatsapp` no es un error: es el final bueno de la vía alternativa, y
 * también el de la red de seguridad cuando el servidor no puede. Por eso son
 * estados y no un booleano `sent`: lo que hay que contarle a quien está
 * delante es distinto en cada caso.
 */
type Estado = 'quieto' | 'enviando' | 'enviado' | 'whatsapp' | 'limite';

export default function QuoteForm({ whatsappUrl, email }: Props) {
  const t = useTranslations('quote');
  const locale = useLocale();
  const [estado, setEstado] = useState<Estado>('quieto');
  const [step, setStep] = useState(0);

  /**
   * El señuelo contra robots.
   *
   * Es un campo que **no se ve y que una persona no puede rellenar**, así que
   * si llega con algo escrito, quien lo mandó no es una persona. El servidor
   * lo rechaza como un dato inválido más —sin decirle que lo ha pillado, que
   * es justo lo que le serviría para aprender—.
   *
   * Se eligió esto y no un captcha por dos motivos, y el segundo es el que
   * manda en este proyecto: un captcha le pide trabajo al cliente justo en el
   * último paso, y **es un tercero al que se le manda la IP del visitante**,
   * o sea que caería dentro del consentimiento de cookies y la mayoría no
   * llegaría a verlo. Esto no le pide nada a nadie ni habla con nadie.
   */
  const [senuelo, setSenuelo] = useState('');
  const goodsOptions = t.raw('goodsOptions') as string[];
  const steps = t.raw('steps') as Step[];

  const schema = useMemo(
    () =>
      z.object({
        origin: z.string().trim().min(2, t('errors.origin')),
        destination: z.string().trim().min(2, t('errors.destination')),
        pallets: z.string().trim().min(1, t('errors.pallets')),
        goods: z.string(),
        name: z.string().trim().min(2, t('errors.name')),
        company: z.string().trim().optional(),
        email: z.string().trim().email(t('errors.email')),
        phone: z.string().trim().min(6, t('errors.phone')),
        details: z.string().trim().optional(),
        consent: z.literal(true, { message: t('errors.consent') }),
      }),
    [t],
  );

  type Values = z.infer<typeof schema>;

  // Qué se valida antes de dejar pasar de cada paso. Los campos que no están
  // en pantalla siguen registrados, así que lo escrito no se pierde al ir y
  // volver.
  const STEP_FIELDS: Path<Values>[][] = [
    ['pallets', 'goods', 'details'],
    ['origin', 'destination'],
    ['name', 'company', 'email', 'phone', 'consent'],
  ];

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { goods: goodsOptions[0] },
  });

  /** Arma un resumen legible con lo que ha rellenado el cliente. */
  const buildMessage = (values: Values) =>
    [
      t('messageIntro'),
      '',
      `${t('origin')}: ${values.origin}`,
      `${t('destination')}: ${values.destination}`,
      `${t('pallets')}: ${values.pallets}`,
      `${t('goods')}: ${values.goods}`,
      '',
      `${t('name')}: ${values.name}`,
      values.company ? `${t('company')}: ${values.company}` : null,
      `${t('email')}: ${values.email}`,
      `${t('phone')}: ${values.phone}`,
      values.details ? `${t('details')}: ${values.details}` : null,
    ]
      .filter(Boolean)
      .join('\n');

  /**
   * Abre WhatsApp con la solicitud preparada.
   *
   * Es a la vez **una vía que el cliente puede elegir** y **la red de
   * seguridad** si el envío por servidor no sale. Lo segundo es lo que hace
   * que este formulario no pueda tragarse una solicitud en silencio.
   */
  const abrirWhatsapp = (values: Values) => {
    const text = encodeURIComponent(buildMessage(values));
    window.open(`${whatsappUrl}?text=${text}`, '_blank', 'noopener');
  };

  /**
   * **Enviar de verdad, y caer a WhatsApp solo si no se puede.**
   *
   * Antes esto abría WhatsApp y ya está. El problema no era de comodidad: era
   * que quien rellenaba el formulario desde un ordenador sin WhatsApp de
   * escritorio, o desde un móvil con la sesión caída, **se quedaba sin
   * enviarlo y la empresa sin enterarse de que alguien lo había intentado**.
   * En una web cuyo trabajo es captar presupuestos, ese era el agujero más
   * caro que había.
   *
   * El orden importa: se intenta el servidor, y **solo si no sale** se abre
   * WhatsApp. Así la solicitud llega de las dos maneras posibles antes de
   * darse por perdida. Los tres finales son distintos a propósito:
   *
   * - `ok` → recibido, y se lo decimos.
   * - `limite` → ha mandado varias seguidas; no se reintenta ni se abre
   *   WhatsApp, porque lo más probable es que las anteriores sí llegaran.
   * - cualquier otra cosa, incluido que no haya red → WhatsApp, que es lo que
   *   hacía antes.
   */
  const onSubmit = async (values: Values) => {
    setEstado('enviando');

    try {
      const respuesta = await fetch('/api/presupuesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale, empresaWeb: senuelo }),
      });
      const datos = (await respuesta.json().catch(() => null)) as {
        ok?: boolean;
        motivo?: string;
      } | null;

      if (datos?.ok) {
        setEstado('enviado');
        return;
      }

      if (datos?.motivo === 'limite') {
        setEstado('limite');
        return;
      }
    } catch {
      // Sin red, o la petición cortada. Se trata igual que un fallo del
      // servidor: lo que no puede pasar es que se pierda lo escrito.
    }

    abrirWhatsapp(values);
    setEstado('whatsapp');
  };

  const sendByEmail = (values: Values) => {
    const subject = encodeURIComponent(t('title'));
    const body = encodeURIComponent(buildMessage(values));
    window.location.assign(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const enviarPorWhatsapp = (values: Values) => {
    abrirWhatsapp(values);
    setEstado('whatsapp');
  };

  const isLast = step === STEP_FIELDS.length - 1;
  const enviando = estado === 'enviando';

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((current) => current + 1);
  };

  // El submit del formulario se intercepta: pulsar Intro en un paso
  // intermedio tiene que avanzar, no enviar a medias.
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLast) {
      void handleSubmit(onSubmit)();
      return;
    }
    void goNext();
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className="rounded-2xl border border-line bg-card p-8 lg:p-10"
    >
      {/* **El señuelo.** No se ve, no llega por tabulador y los lectores de
          pantalla lo ignoran, así que **una persona no puede rellenarlo**; un
          robot de formularios sí, porque rellena todo lo que encuentra. Si
          llega con algo escrito, el servidor lo rechaza.

          Va con `sr-only` y no con `display: none` ni `hidden`: muchos robots
          saltan lo que está oculto de esas dos formas justo porque saben que
          suele ser una trampa, y lo que se busca es que caigan, no que lo
          esquiven. `autoComplete="off"` es para que el navegador no se lo
          rellene solo a alguien y le bloquee el envío sin motivo. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="empresa-web">No rellenar</label>
        <input
          id="empresa-web"
          name="empresa-web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={senuelo}
          onChange={(event) => setSenuelo(event.target.value)}
        />
      </div>

      <h2 className="font-display text-2xl uppercase tracking-tight text-ink">
        {t('title')}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted">{t('intro')}</p>

      {/* Barra de avance: da la sensación de que queda poco, que es justo lo
          que hace que la gente termine de rellenarlo. */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-display text-xs uppercase tracking-widest text-azul-texto">
            {t('stepOf', { current: step + 1, total: STEP_FIELDS.length })}
          </span>
          <span className="text-xs text-muted">{steps[step].hint}</span>
        </div>
        {/* **La barra va en rojo, y es la aparición de marca de esta página.**

            Medido contando los píxeles de los tres rojos de la casa en las
            siete páginas: `/contacto` daba **0,033 %**, la última de todas, y
            su mancha más grande eran 371 px. El resto llevan el botón rojo
            del cierre, que son casi nueve mil. O sea que la página que existe
            para pedir presupuesto era la que menos color de marca tenía.

            Tenía que ser algo que **esté ahí desde el primer momento**: el
            botón de enviar solo se pone rojo en el último paso y el filete
            del encabezado mide 56 × 2. Esta barra se ve nada más abrir, tiene
            cuerpo, y es un relleno —que es exactamente como el brief quiere
            el rojo—.

            El «Paso 1 de 3» de al lado **se queda en azul** a propósito: si
            los dos fueran rojos, el rojo pasaría a ser el color del bloque en
            vez del de la barra que avanza. */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-brand-red transition-[width] duration-500 ease-casa"
            style={{ width: `${((step + 1) / STEP_FIELDS.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="mt-8 font-display text-xl uppercase tracking-tight text-ink">
        {steps[step].title}
      </h3>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {step === 0 && (
          <>
            <Field label={t('pallets')} error={errors.pallets?.message}>
              <input
                {...register('pallets')}
                className={inputStyles}
                inputMode="numeric"
                placeholder={t('palletsPlaceholder')}
              />
            </Field>

            <Field label={t('goods')}>
              <select {...register('goods')} className={inputStyles}>
                {goodsOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label={t('detailsOptional')}>
                <textarea
                  {...register('details')}
                  rows={4}
                  className={`${inputStyles} resize-y`}
                  placeholder={t('detailsPlaceholder')}
                />
              </Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Field label={t('origin')} error={errors.origin?.message}>
              <input
                {...register('origin')}
                className={inputStyles}
                placeholder={t('originPlaceholder')}
                autoComplete="off"
              />
            </Field>

            <Field label={t('destination')} error={errors.destination?.message}>
              <input
                {...register('destination')}
                className={inputStyles}
                placeholder={t('destinationPlaceholder')}
                autoComplete="off"
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label={t('name')} error={errors.name?.message}>
              <input
                {...register('name')}
                className={inputStyles}
                autoComplete="name"
              />
            </Field>

            <Field label={t('companyOptional')}>
              <input
                {...register('company')}
                className={inputStyles}
                autoComplete="organization"
              />
            </Field>

            <Field label={t('email')} error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                className={inputStyles}
                autoComplete="email"
              />
            </Field>

            <Field label={t('phone')} error={errors.phone?.message}>
              <input
                {...register('phone')}
                type="tel"
                className={inputStyles}
                autoComplete="tel"
              />
            </Field>

            <div className="sm:col-span-2">
              <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                <input
                  {...register('consent')}
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-[#34548a]"
                />
                <span>{t('consent')}</span>
              </label>
              {errors.consent && (
                <p className="mt-2 text-sm text-brand-red-ink">
                  {errors.consent.message}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3 font-display text-sm uppercase tracking-widest text-ink transition-colors hover:border-azul-texto hover:text-azul-texto"
          >
            {t('back')}
          </button>
        )}

        <button
          type="submit"
          /* **El último paso va en rojo, y los intermedios no.**

             Medido sobre las siete páginas contando los píxeles de los tres
             rojos de la casa: `/contacto` tenía **0,033 %** y su mancha roja
             más grande eran 371 px —un filete de 1 px y dos numeritos—,
             mientras el resto de páginas llevan el botón del cierre, que son
             casi nueve mil. O sea que la página que existe **para** pedir
             presupuesto era la que menos color de marca tenía de toda la web.

             No se arregla metiendo rojo por meterlo: se arregla usando el que
             ya existe donde significa algo. `accent` (`bg-brand-red`) es el
             color que esta web le da a la acción que cierra, y aquí la acción
             que cierra es enviar. «Siguiente» no cierra nada, así que sigue
             en azul: si los tres pasos fueran rojos, el rojo dejaría de
             marcar el final y volvería a ser decoración.

             Blanco sobre `#d03b40` da **4,79:1**, por encima del 4,5 que pide
             la WCAG para texto pequeño. Es el mismo par que ya usa `Button`
             con `variant="accent"`. */
          disabled={enviando}
          className={`inline-flex items-center justify-center rounded-full px-7 py-3 font-display text-sm uppercase tracking-widest text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isLast
              ? 'bg-brand-red hover:bg-brand-blue'
              : 'bg-brand-blue hover:bg-brand-blue-dark'
          }`}
        >
          {isLast ? (enviando ? t('sending') : t('submit')) : t('next')}
        </button>

        {/* **Las dos vías manuales siguen aquí, y eso no es un resto.** El
            botón rojo ya manda la solicitud al correo de la empresa, pero
            media provincia pide presupuesto por WhatsApp y quiere ver el
            mensaje salir de su propio teléfono. Quitarlas sería cambiar una
            forma de contactar que funciona por una que funciona igual. */}
        {isLast && !enviando && (
          <>
            <button
              type="button"
              onClick={handleSubmit(enviarPorWhatsapp)}
              className="text-sm text-muted underline underline-offset-4 hover:text-azul-texto"
            >
              {t('submitWhatsapp')}
            </button>
            <button
              type="button"
              onClick={handleSubmit(sendByEmail)}
              className="text-sm text-muted underline underline-offset-4 hover:text-azul-texto"
            >
              {t('submitEmail')}
            </button>
          </>
        )}
      </div>

      {/* **Un solo sitio para el desenlace, y el texto cambia según cuál
          sea.** `role="status"` hace que un lector de pantalla lo lea en
          cuanto aparece sin robarle el foco a nadie, que es justo lo que se
          quiere de un «recibido». */}
      {estado !== 'quieto' && estado !== 'enviando' && (
        <p
          role="status"
          className={`mt-6 rounded-xl border px-5 py-4 text-sm leading-relaxed ${
            estado === 'limite'
              ? 'border-brand-red/30 bg-brand-red/5 text-ink'
              : 'border-azul-texto/30 bg-brand-blue/5 text-ink'
          }`}
        >
          {estado === 'enviado' && t('sent')}
          {estado === 'whatsapp' && t('sentWhatsapp')}
          {estado === 'limite' && t('tooMany')}
        </p>
      )}

      <p className="mt-6 text-xs leading-relaxed text-muted">{t('note')}</p>
    </form>
  );
}
