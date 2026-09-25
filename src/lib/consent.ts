import { useSyncExternalStore } from 'react';

/**
 * Consentimiento de cookies.
 *
 * La decisión se guarda en una cookie propia (no en localStorage) con la fecha
 * y la versión: eso es la prueba del consentimiento que pide la AEPD. Mientras
 * no haya decisión, nada que no sea estrictamente necesario puede cargarse.
 */

/** Categorías que el usuario puede activar o desactivar. */
export const CATEGORIES = ['maps'] as const;
export type Category = (typeof CATEGORIES)[number];

export type Choices = Record<Category, boolean>;

export type Consent = Choices & {
  version: number;
  /** Cuándo se decidió, en ISO. */
  date: string;
};

export const CONSENT_COOKIE = 'tjmi_consent';
/**
 * Subir este número invalida los consentimientos ya dados y vuelve a
 * preguntar. Hay que hacerlo si se añade una categoría o un servicio nuevo.
 */
export const CONSENT_VERSION = 1;
/** 12 meses: pasado ese tiempo se vuelve a preguntar. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

const CHANGE_EVENT = 'tjmi:consent-change';
const OPEN_EVENT = 'tjmi:consent-open';

export const ALL_ACCEPTED: Choices = { maps: true };
export const ALL_REJECTED: Choices = { maps: false };

function parse(raw: string | null): Consent | null {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<Consent>;
    // Una versión antigua no vale: se trata como si no hubiera decisión.
    if (value.version !== CONSENT_VERSION) return null;

    return {
      version: CONSENT_VERSION,
      date: typeof value.date === 'string' ? value.date : '',
      maps: value.maps === true,
    };
  } catch {
    return null;
  }
}

function readCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

// Caché obligatoria: useSyncExternalStore necesita que getSnapshot devuelva
// siempre el mismo objeto mientras la cookie no cambie, o React se queda en
// bucle de renders.
let cachedRaw: string | null = null;
let cachedValue: Consent | null = null;
let primed = false;

/** La decisión actual, o `null` si todavía no hay ninguna. */
export function getConsent(): Consent | null {
  const raw = readCookie();

  if (!primed || raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
    primed = true;
  }

  return cachedValue;
}

export function saveConsent(choices: Choices) {
  const value: Consent = {
    ...choices,
    version: CONSENT_VERSION,
    date: new Date().toISOString(),
  };

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}` +
    `; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`;

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Cambia solo algunas categorías y deja el resto como estaban. */
export function updateConsent(partial: Partial<Choices>) {
  const current = getConsent();
  saveConsent({ ...ALL_REJECTED, ...(current ?? {}), ...partial });
}

/** Abre el panel de preferencias desde cualquier parte de la web. */
export function openPreferences() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onPreferencesRequested(handler: () => void) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function serverSnapshot(): Consent | null {
  return null;
}

/** La decisión actual, reactiva. */
export function useConsent(): Consent | null {
  return useSyncExternalStore(subscribe, getConsent, serverSnapshot);
}

const noopSubscribe = () => () => {};
const isTrue = () => true;
const isFalse = () => false;

/**
 * Si ya estamos en el navegador. En el servidor no se puede leer la cookie,
 * así que sin esto el banner parpadearía en cada visita aunque ya se hubiera
 * aceptado.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, isTrue, isFalse);
}
