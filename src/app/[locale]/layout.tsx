import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider, useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import CookieConsent from '@/components/legal/CookieConsent';
import Backdrop from '@/components/layout/Backdrop';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import SmoothScroll from '@/components/layout/SmoothScroll';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { routing } from '@/i18n/routing';
import { COMPANY_NAME, SITE_URL } from '@/lib/site';
import '../globals.css';

/**
 * **Texto: IBM Plex Sans.** Antes era Inter, que es probablemente la sans a la
 * que más se recurre por defecto en el mundo y por eso no dice nada de nadie.
 * Plex se elige por un motivo que se puede comprobar, no por gusto: esta web
 * está llena de cifras —420 km, +4.000 m², el contador 01/06, teléfonos,
 * horarios— y Plex trae **cifras tabulares dibujadas**, no una variante
 * sintetizada por el navegador. Además viene de un linaje de ingeniería, que
 * es el registro de una empresa que mueve palés, no el de una startup.
 */
const body = IBM_Plex_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

/**
 * **Titulares: Archivo.** El brief pide sans condensada y robusta en
 * mayúsculas, así que la categoría no se discute; lo que se cambia es la
 * familia. Estaba en Oswald, que es de las tipografías más usadas de Google
 * Fonts y se reconoce al instante en cualquier web.
 *
 * Archivo es variable y trae **eje de anchura**, así que la condensación se
 * ajusta con un número (`--display-width` en `globals.css`) en vez de
 * depender de que exista un corte con ese nombre.
 */
const display = Archivo({
  variable: '--font-display',
  subsets: ['latin'],
  axes: ['wdth'],
});

type LocaleParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    // Base para que las URL relativas de canonical y Open Graph resuelvan.
    metadataBase: new URL(SITE_URL),
    // `default` es el título de la portada; `template` se lo aplica al resto
    // de páginas, que solo tienen que declarar su nombre corto.
    title: {
      default: t('title'),
      template: `%s | ${COMPANY_NAME}`,
    },
    description: t('description'),
    openGraph: {
      siteName: COMPANY_NAME,
      locale,
      title: t('title'),
      description: t('description'),
    },
  };
}

function SkipLink() {
  const t = useTranslations('nav');

  return (
    <a
      href="#contenido"
      className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded-full focus:bg-brand-blue focus:px-5 focus:py-2 focus:text-sm focus:text-white"
    >
      {t('skipToContent')}
    </a>
  );
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${body.variable} ${display.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <NextIntlClientProvider>
          <Backdrop />
          <SmoothScroll />
          <SkipLink />
          <Navbar />
          <main id="contenido" className="relative z-10 flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
