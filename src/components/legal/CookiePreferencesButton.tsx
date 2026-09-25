'use client';

import { openPreferences } from '@/lib/consent';

type Props = {
  children: string;
};

/**
 * Enlace del pie que reabre el panel de cookies. Es lo que hace que retirar
 * el consentimiento sea tan fácil como darlo, que es lo que pide el RGPD.
 */
export default function CookiePreferencesButton({ children }: Props) {
  return (
    <button
      type="button"
      onClick={openPreferences}
      className="hover:text-brand-blue"
    >
      {children}
    </button>
  );
}
