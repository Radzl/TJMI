import { useTranslations } from 'next-intl';
import CookiePreferencesButton from '@/components/legal/CookiePreferencesButton';
import Container from '@/components/ui/Container';
import { SERVICES } from '@/content/services';
import { Link } from '@/i18n/navigation';
import type { ServiceDetail } from '@/components/ui/ServiceDialog';
import Wordmark from './Wordmark';

const navLinks = [
  { href: '/servicios', key: 'services' },
  { href: '/nosotros', key: 'about' },
  { href: '/cobertura', key: 'coverage' },
  { href: '/blog', key: 'blog' },
  { href: '/faq', key: 'faq' },
  { href: '/contacto', key: 'contact' },
] as const;

const legalLinks = [
  { href: '/privacidad', key: 'privacy' },
  { href: '/aviso-legal', key: 'legalNotice' },
  { href: '/cookies', key: 'cookies' },
] as const;

type Site = {
  city: string;
  phone: string;
  phoneHref: string;
  hours: string;
};

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tContact = useTranslations('contact');
  const tServices = useTranslations('services');
  const sites = tContact.raw('sites') as Site[];
  const serviceItems = tServices.raw('items') as ServiceDetail[];

  return (
    <footer className="relative z-10 border-t border-line bg-white">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr_1fr_1.3fr]">
        <div>
          <Wordmark />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
            {t('tagline')}
          </p>
        </div>

        <div>
          <h2 className="font-display text-xs uppercase tracking-widest text-ink">
            {t('navTitle')}
          </h2>
          <ul className="mt-5 flex flex-col gap-3 text-sm text-muted">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-blue">
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* **Los seis servicios, enlazados desde todas las páginas.** No es
            por llenar el pie: cada uno tiene ahora su propia página, y una
            página a la que solo se llega desde el listado le cuesta mucho más
            posicionarse que una enlazada desde el sitio entero. Es, además,
            donde la gente busca cuando no encuentra algo en el menú. */}
        <div>
          <h2 className="font-display text-xs uppercase tracking-widest text-ink">
            {tNav('services')}
          </h2>
          <ul className="mt-5 flex flex-col gap-3 text-sm text-muted">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/servicios/${service.slug}`}
                  className="hover:text-brand-blue"
                >
                  {serviceItems[service.index].title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xs uppercase tracking-widest text-ink">
            {t('contactTitle')}
          </h2>
          <ul className="mt-5 flex flex-col gap-3 text-sm text-muted">
            <li>
              <a
                href={`mailto:${tContact('email')}`}
                className="hover:text-brand-blue"
              >
                {tContact('email')}
              </a>
            </li>
            <li>
              <a
                href={tContact('whatsappUrl')}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-blue"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xs uppercase tracking-widest text-ink">
            {t('sitesTitle')}
          </h2>
          <ul className="mt-5 flex flex-col gap-5 text-sm text-muted">
            {sites.map((site) => (
              <li key={site.city}>
                <span className="block font-display uppercase tracking-widest text-ink">
                  {site.city}
                </span>
                <a
                  href={`tel:${site.phoneHref}`}
                  className="mt-1 block hover:text-brand-blue"
                >
                  {site.phone}
                </a>
                <span className="mt-1 block text-xs">{site.hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {t('company')}. {t('rights')}
          </p>
          <ul className="flex flex-wrap gap-5">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-blue">
                  {t(link.key)}
                </Link>
              </li>
            ))}
            <li>
              <CookiePreferencesButton>
                {t('cookiePreferences')}
              </CookiePreferencesButton>
            </li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}
