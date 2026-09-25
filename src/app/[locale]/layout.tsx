import type { Metadata } from 'next';
import { Inter, Oswald } from 'next/font/google';
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

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
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
    title: t('title'),
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
      className={`${inter.variable} ${oswald.variable} h-full`}
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
