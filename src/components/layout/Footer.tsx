import { useTranslations } from 'next-intl';
import CookiePreferencesButton from '@/components/legal/CookiePreferencesButton';
import Container from '@/components/ui/Container';
import { Link } from '@/i18n/navigation';
import Wordmark from './Wordmark';

const navLinks = [
  { href: '/servicios', key: 'services' },
  { href: '/nosotros', key: 'about' },
  { href: '/blog', key: 'blog' },
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
  const sites = tContact.raw('sites') as Site[];

  return (
    <footer className="relative z-10 border-t border-line bg-white">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
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
