'use client';

import { useTranslations } from 'next-intl';
import { updateConsent, useConsent, useHydrated } from '@/lib/consent';

type Props = {
  src: string;
  title: string;
  /** Enlace a Google Maps, para quien no quiere aceptar las cookies. */
  mapUrl: string;
};

/**
 * Mapa de Google que no se carga hasta tener permiso.
 *
 * El iframe no existe en el DOM mientras no haya consentimiento: si estuviera
 * con `src` vacío o escondido, Google podría llegar a poner sus cookies igual.
 * Quien rechaza ve la dirección y un enlace directo a Maps, así que sigue
 * pudiendo llegar a la nave.
 */
export default function MapEmbed({ src, title, mapUrl }: Props) {
  const t = useTranslations('cookies');
  const consent = useConsent();
  const hydrated = useHydrated();

  if (hydrated && consent?.maps) {
    return (
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full border-0"
      />
    );
  }

  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 bg-bone px-6 text-center">
      <p className="max-w-sm text-sm leading-relaxed text-muted">
        {t('mapBlocked')}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => updateConsent({ maps: true })}
          className="inline-flex items-center justify-center rounded-full bg-brand-blue px-6 py-2.5 font-display text-xs uppercase tracking-widest text-white transition-colors hover:bg-brand-blue-dark"
        >
          {t('mapShow')}
        </button>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted underline underline-offset-4 hover:text-brand-blue"
        >
          {t('mapExternal')}
        </a>
      </div>
    </div>
  );
}
