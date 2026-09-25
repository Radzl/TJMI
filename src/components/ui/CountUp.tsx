'use client';

import { useLocale } from 'next-intl';
import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

type Props = {
  /** Valor tal cual se escribe: "+4.000 m²", "24 h", "40"… */
  value: string;
  className?: string;
};

/** Separa prefijo, número y sufijo para animar solo la cifra. */
function parse(value: string) {
  const match = value.match(/^(\D*)([\d.,]+)(.*)$/);
  if (!match) return null;

  const [, prefix, digits, suffix] = match;
  const amount = Number(digits.replace(/[.,]/g, ''));
  if (!Number.isFinite(amount)) return null;

  return { prefix, suffix, amount, grouped: /[.,]/.test(digits) };
}

export default function CountUp({ value, className }: Props) {
  const locale = useLocale();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    const parsed = parse(value);
    if (!element || !parsed || prefersReducedMotion()) return;

    const format = new Intl.NumberFormat(locale, {
      useGrouping: parsed.grouped,
    });
    const counter = { amount: 0 };

    const animation = gsap.to(counter, {
      amount: parsed.amount,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = `${parsed.prefix}${format.format(
          Math.round(counter.amount),
        )}${parsed.suffix}`;
      },
      scrollTrigger: { trigger: element, start: 'top 85%', once: true },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
      element.textContent = value;
    };
  }, [value, locale]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
