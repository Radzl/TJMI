'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function LocaleSwitcher() {
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-xs uppercase tracking-widest">
      {routing.locales.map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 && <span className="text-line">/</span>}
          <Link
            href={pathname}
            locale={locale}
            aria-current={locale === activeLocale ? 'true' : undefined}
            className={
              locale === activeLocale
                ? 'font-display text-azul-texto'
                : 'font-display text-muted hover:text-ink'
            }
          >
            {locale}
          </Link>
        </span>
      ))}
    </div>
  );
}
