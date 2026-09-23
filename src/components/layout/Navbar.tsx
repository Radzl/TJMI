'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Container from '@/components/ui/Container';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import Wordmark from './Wordmark';

const links = [
  { href: '/servicios', key: 'services' },
  { href: '/nosotros', key: 'about' },
  { href: '/blog', key: 'blog' },
  { href: '/contacto', key: 'contact' },
] as const;

export default function Navbar() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" aria-label={t('home')} onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-xs uppercase tracking-widest text-ink transition-colors hover:text-brand-blue"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <LocaleSwitcher />
          <Link
            href="/contacto"
            className="rounded-full bg-brand-blue px-6 py-2.5 font-display text-xs uppercase tracking-widest text-white transition-colors hover:bg-brand-blue-dark"
          >
            {t('quote')}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? t('closeMenu') : t('openMenu')}
          className="lg:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-line bg-white lg:hidden">
          <Container className="flex flex-col gap-6 py-8">
            <nav className="flex flex-col gap-5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-sm uppercase tracking-widest text-ink"
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-between border-t border-line pt-6">
              <LocaleSwitcher />
              <Link
                href="/contacto"
                onClick={() => setOpen(false)}
                className="rounded-full bg-brand-blue px-6 py-2.5 font-display text-xs uppercase tracking-widest text-white"
              >
                {t('quote')}
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
