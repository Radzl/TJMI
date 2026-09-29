import { routing } from '@/i18n/routing';

/**
 * Todas las rutas fijas de la web, sin el prefijo de idioma.
 *
 * Es la lista que alimenta el sitemap. Si añades una página, añádela aquí o
 * Google no se enterará de que existe.
 */
export const SITE_PATHS = [
  '',
  '/servicios',
  '/nosotros',
  '/blog',
  '/contacto',
  '/cookies',
  '/privacidad',
  '/aviso-legal',
] as const;

/**
 * Canonical y hreflang de una página.
 *
 * El canonical le dice a Google cuál es la dirección buena de esta página, y
 * el hreflang que la versión en español y la inglesa son la misma página en
 * dos idiomas, no contenido duplicado. `x-default` es a cuál mandar a quien
 * no encaje en ninguno de los dos.
 *
 * Las URL van relativas: el `metadataBase` del layout les pone el dominio.
 */
export function pageAlternates(locale: string, path = '') {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((code) => [code, `/${code}${path}`]),
      ),
      'x-default': `/${routing.defaultLocale}${path}`,
    },
  };
}
