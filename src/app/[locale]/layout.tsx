import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';
import { hasLocale, NextIntlClientProvider, useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import CookieConsent from '@/components/legal/CookieConsent';
import Backdrop from '@/components/layout/Backdrop';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import SmoothScroll from '@/components/layout/SmoothScroll';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { CONSENT_INLINE_SCRIPT } from '@/lib/consentCookie';
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

/**
 * Color de la barra del sistema y esquema de color.
 *
 * `themeColor` es lo que tiñe la barra de estado en Chrome de Android, y se
 * declara aquí además de en el manifiesto porque el manifiesto **solo cuenta
 * si la web está instalada**; esto vale en cualquier visita.
 *
 * `colorScheme: 'light'` no es un detalle: esta web es clara y no tiene modo
 * oscuro. Sin declararlo, un navegador en modo oscuro se toma la libertad de
 * repintar por su cuenta los controles de formulario —los del presupuesto— y
 * entonces los campos salen con fondo gris oscuro sobre una tarjeta blanca.
 */
export const viewport: Viewport = {
  themeColor: '#34548a',
  colorScheme: 'light',
};

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
      /* **Obligatorio desde que el script de la cabecera marca el `<html>`.**
         Ese script pone `data-cookies="hecho"` **antes** de que React hidrate,
         así que React se encuentra en el `<html>` un atributo que él no había
         renderizado y avisa: «A tree hydrated but some attributes of the
         server rendered HTML didn't match the client properties».

         Se cazó en el aviso «1 Issue» de las herramientas de Next, y medido
         aparecía en **todas** las páginas y **solo cuando ya había cookie**,
         que es justo cuando el script hace algo. La portada sin cookie daba
         cero.

         Esto silencia el aviso **de este elemento y de su texto directo, nada
         más**: cualquier descuadre de verdad más adentro sigue avisando. Es
         el mismo apaño que usa `next-themes` y por el mismo motivo —un script
         que decide algo antes de pintar tiene que tocar el `<html>`, y el
         `<html>` lo renderiza React—. */
      suppressHydrationWarning
    >
      <head>
        {/* **Lo único que bloquea en esta cabecera, y se gana el sitio.**

            El banner de cookies es, medido, el elemento del LCP de la
            portada, y se pintaba al hidratar: 5,8 s de LCP con 5,4 de
            «render delay» cuando el primer pintado ya había ocurrido a los
            0,9. Sacado en el HTML se pinta con lo demás, pero entonces le
            parpadearía a quien ya decidió —en el servidor no se puede leer la
            cookie—. Esto lee la cookie, que es **propia**, y pone el atributo
            antes de que se pinte nada; el CSS hace el resto.

            El porqué de que un script que bloquea esté permitido aquí y no
            para el 3D está escrito en `CONSENT_ATTRIBUTE`: leer una cookie
            cuesta microsegundos y abrir un contexto WebGL costó 1.277 ms
            medidos. */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_INLINE_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <NextIntlClientProvider>
          <Backdrop />
          <SmoothScroll />
          <SkipLink />
          <Navbar />
          <main id="contenido" className="relative z-10 flex-1">
            {/* **Transición entre páginas**: un fundido corto del contenido al
                navegar, con la API nativa del navegador a través de React. La
                barra superior y el pie no se funden, solo lo que cambia. Las
                curvas y la duración están en `globals.css`
                (`::view-transition-*(.pagina)`), y con movimiento reducido no
                hay nada. En un navegador que no la entiende se navega igual
                que siempre, sin transición. */}
            <ViewTransition default="pagina">{children}</ViewTransition>
          </main>
          <Footer />
          <WhatsAppButton />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
