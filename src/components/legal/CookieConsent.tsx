'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import {
  ALL_ACCEPTED,
  ALL_REJECTED,
  getConsent,
  onPreferencesRequested,
  saveConsent,
  useConsent,
  useHydrated,
  type Choices,
} from '@/lib/consent';

const buttonBase =
  'inline-flex items-center justify-center rounded-full px-7 py-3 font-display text-sm uppercase tracking-widest transition-colors';

/**
 * Banner de cookies y panel de preferencias.
 *
 * "Aceptar" y "Rechazar" tienen el mismo tamaño, la misma forma y el mismo
 * peso visual a propósito: es lo que exige la AEPD y lo que más se sanciona
 * cuando no se cumple. El banner no lleva aspa de cerrar, porque cerrar sin
 * elegir no es consentir.
 */
export default function CookieConsent() {
  const t = useTranslations('cookies');
  const consent = useConsent();
  const hydrated = useHydrated();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Choices>(ALL_REJECTED);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const openPanel = useCallback(() => {
    const current = getConsent();
    setDraft(current ? { maps: current.maps } : ALL_REJECTED);
    restoreFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  // El enlace del pie abre este mismo panel: retirar el permiso tiene que ser
  // tan fácil como darlo.
  useEffect(() => onPreferencesRequested(openPanel), [openPanel]);

  // Con el panel abierto: el fondo no se scrollea, Escape cierra y el
  // tabulador da vueltas dentro del panel.
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const panel = panelRef.current;
    const previouslyFocused = restoreFocus.current;

    root.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel?.focus();
    document.addEventListener('keydown', onKeyDown);

    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  const decide = (choices: Choices) => {
    saveConsent(choices);
    setOpen(false);
  };

  // Hasta saber qué hay guardado no se pinta nada, para que el banner no le
  // parpadee a quien ya decidió.
  const showBanner = hydrated && consent === null && !open;

  return (
    <>
      {showBanner && (
        <section
          aria-labelledby="cookie-banner-title"
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-white p-6 shadow-[0_-8px_32px_rgba(17,21,28,0.08)] sm:p-8"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2
                id="cookie-banner-title"
                className="font-display text-lg uppercase tracking-tight text-ink"
              >
                {t('bannerTitle')}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t('bannerText')}{' '}
                <Link
                  href="/cookies"
                  className="text-brand-blue underline underline-offset-4"
                >
                  {t('policyLink')}
                </Link>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => decide(ALL_ACCEPTED)}
                className={`${buttonBase} bg-brand-blue text-white hover:bg-brand-blue-dark`}
              >
                {t('acceptAll')}
              </button>
              <button
                type="button"
                onClick={() => decide(ALL_REJECTED)}
                className={`${buttonBase} bg-ink text-white hover:bg-night`}
              >
                {t('rejectAll')}
              </button>
              <button
                type="button"
                onClick={openPanel}
                className="text-sm text-muted underline underline-offset-4 hover:text-brand-blue"
              >
                {t('configure')}
              </button>
            </div>
          </div>
        </section>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-night/50 p-4 sm:items-center">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-panel-title"
            tabIndex={-1}
            className="max-h-[85svh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8 shadow-xl"
          >
            <h2
              id="cookie-panel-title"
              className="font-display text-2xl uppercase tracking-tight text-ink"
            >
              {t('prefsTitle')}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {t('prefsIntro')}
            </p>

            <div className="mt-8 flex flex-col gap-5">
              {/* Las necesarias no se pueden desactivar: sin ellas la web no
                  funciona, y para esas la ley no obliga a pedir permiso. */}
              <div className="rounded-xl border border-line p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-sm uppercase tracking-widest text-ink">
                    {t('necessaryTitle')}
                  </h3>
                  <span className="shrink-0 rounded-full bg-bone px-3 py-1 text-xs text-muted">
                    {t('always')}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t('necessaryText')}
                </p>
              </div>

              <div className="rounded-xl border border-line p-5">
                <label className="flex cursor-pointer items-start justify-between gap-4">
                  <span className="font-display text-sm uppercase tracking-widest text-ink">
                    {t('mapsTitle')}
                  </span>
                  <input
                    type="checkbox"
                    checked={draft.maps}
                    onChange={(event) =>
                      setDraft({ maps: event.target.checked })
                    }
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand-blue)]"
                  />
                </label>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t('mapsText')}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => decide(draft)}
                className={`${buttonBase} bg-brand-blue text-white hover:bg-brand-blue-dark`}
              >
                {t('save')}
              </button>
              <button
                type="button"
                onClick={() => decide(ALL_REJECTED)}
                className={`${buttonBase} bg-ink text-white hover:bg-night`}
              >
                {t('rejectAll')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
