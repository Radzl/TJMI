import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

type Variant = 'primary' | 'accent' | 'outline' | 'onDark';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 font-display text-sm uppercase tracking-widest transition-colors';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-blue text-white hover:bg-brand-blue-dark',
  accent: 'bg-brand-red text-white hover:bg-brand-blue',
  outline: 'border border-line text-ink hover:border-azul-texto hover:text-azul-texto',
  onDark: 'bg-white text-night hover:bg-brand-red hover:text-white',
};

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
};

export default function Button({
  href,
  children,
  variant = 'primary',
  external = false,
  className = '',
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
