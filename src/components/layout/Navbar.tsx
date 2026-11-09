'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Container from '@/components/ui/Container';
import { Link, usePathname } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import Wordmark from './Wordmark';

const links = [
  { href: '/servicios', key: 'services' },
  { href: '/nosotros', key: 'about' },
  { href: '/blog', key: 'blog' },
  { href: '/faq', key: 'faq' },
  { href: '/contacto', key: 'contact' },
] as const;

export default function Navbar() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // `usePathname` de next-intl ya viene sin el prefijo de idioma, así que
  // vale igual en /es y en /en.
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // La barra se aparta al bajar y vuelve al subir: deja ver la intro entera
  // sin quitarle al usuario el acceso al menú.
  useEffect(() => {
    let last = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 160);
        last = y;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-[transform,background-color,border-color] duration-300 ${
        scrolled
          ? 'border-b border-line bg-bone/90 backdrop-blur'
          : 'border-b border-transparent bg-transparent'
      } ${hidden && !open ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <Container className="flex h-20 items-center justify-between">
        {/* **El nombre accesible tiene que contener el texto que se ve.**
            Llevaba `aria-label={t('home')}`, o sea «Inicio», y el enlace
            enseña «Transportes José María Ibáñez»: para quien navega por voz,
            decir lo que ve en pantalla **no activaba el enlace**. Es la norma
            WCAG 2.5.3 (*Label in Name*) y era el único fallo de accesibilidad
            real de toda la web, en todas las páginas, porque el navbar va en
            todas.

            **Y no se arregla escribiendo la cadena a mano en el `aria-label`.**
            Se intentó —`«Transportes José María Ibáñez, Inicio»`— y seguía
            fallando: el texto visible son dos `span` apilados y en versales,
            así que lo que lee el auditor no es la cadena que uno escribe.
            Acertar con el espaciado y el salto de línea exactos es un juego
            que se pierde al primer retoque de maquetación.

            Lo que no falla es quitar el `aria-label`: entonces el nombre
            accesible **es** el texto del enlace, y el destino se añade en un
            `sr-only` dentro, que cuenta para el nombre pero no es texto
            visible. Correcto por construcción, no por coincidencia. */}
        <Link href="/" onClick={() => setOpen(false)}>
          <Wordmark />
          <span className="sr-only">{t('home')}</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? 'page' : undefined}
              className={`relative font-display text-xs uppercase tracking-widest transition-colors after:absolute after:-bottom-2 after:left-0 after:h-px after:bg-brand-red after:transition-all after:duration-300 after:content-[''] hover:text-brand-blue ${
                isCurrent(link.href)
                  ? 'text-brand-blue after:w-full'
                  : 'text-ink after:w-0 hover:after:w-full'
              }`}
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
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                  className={`flex items-center gap-3 font-display text-sm uppercase tracking-widest ${
                    isCurrent(link.href) ? 'text-brand-blue' : 'text-ink'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-px bg-brand-red transition-all ${
                      isCurrent(link.href) ? 'w-6' : 'w-0'
                    }`}
                  />
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
