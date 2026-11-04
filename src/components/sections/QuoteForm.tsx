'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useForm, type Path } from 'react-hook-form';
import { z } from 'zod';

type Props = {
  whatsappUrl: string;
  email: string;
};

type Step = { title: string; hint: string };

const inputStyles =
  'mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-brand-blue';

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

export default function QuoteForm({ whatsappUrl, email }: Props) {
  const t = useTranslations('quote');
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState(0);
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

  // TODO: F6 — cuando haya servicio de correo, enviar desde el servidor en
  // lugar de abrir WhatsApp. El formulario y la validación ya sirven igual.
  const onSubmit = (values: Values) => {
    const text = encodeURIComponent(buildMessage(values));
    window.open(`${whatsappUrl}?text=${text}`, '_blank', 'noopener');
    setSent(true);
  };

  const sendByEmail = (values: Values) => {
    const subject = encodeURIComponent(t('title'));
    const body = encodeURIComponent(buildMessage(values));
    window.location.assign(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const isLast = step === STEP_FIELDS.length - 1;

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
      className="rounded-2xl border border-line bg-white p-8 lg:p-10"
    >
      <h2 className="font-display text-2xl uppercase tracking-tight text-ink">
        {t('title')}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted">{t('intro')}</p>

      {/* Barra de avance: da la sensación de que queda poco, que es justo lo
          que hace que la gente termine de rellenarlo. */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-display text-xs uppercase tracking-widest text-brand-blue">
            {t('stepOf', { current: step + 1, total: STEP_FIELDS.length })}
          </span>
          <span className="text-xs text-muted">{steps[step].hint}</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-brand-blue transition-[width] duration-500 ease-out"
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
            className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3 font-display text-sm uppercase tracking-widest text-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            {t('back')}
          </button>
        )}

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-brand-blue px-7 py-3 font-display text-sm uppercase tracking-widest text-white transition-colors hover:bg-brand-blue-dark"
        >
          {isLast ? t('submit') : t('next')}
        </button>

        {isLast && (
          <button
            type="button"
            onClick={handleSubmit(sendByEmail)}
            className="text-sm text-muted underline underline-offset-4 hover:text-brand-blue"
          >
            {t('submitEmail')}
          </button>
        )}
      </div>

      {sent && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-brand-blue/30 bg-brand-blue/5 px-5 py-4 text-sm leading-relaxed text-ink"
        >
          {t('sent')}
        </p>
      )}

      <p className="mt-6 text-xs leading-relaxed text-muted">{t('note')}</p>
    </form>
  );
}
