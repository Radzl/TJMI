'use client';

import { useProgress } from '@react-three/drei';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/** Tope de seguridad: si algún archivo se atasca, la web no se queda colgada. */
const MAX_WAIT = 4000;

export default function Preloader() {
  const { progress, active } = useProgress();
  const [expired, setExpired] = useState(false);
  const [gone, setGone] = useState(false);

  const done = expired || (!active && progress >= 100);
  const shown = Math.min(100, Math.round(progress));

  useEffect(() => {
    const safety = setTimeout(() => setExpired(true), MAX_WAIT);
    return () => clearTimeout(safety);
  }, []);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(id);
  }, [done]);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bone transition-opacity duration-500 ${
        done ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <Image
        src="/logo.png"
        alt=""
        width={420}
        height={286}
        priority
        className="h-16 w-auto"
      />

      <div className="mt-10 h-px w-40 overflow-hidden bg-line">
        <div
          className="h-full bg-brand-blue transition-[width] duration-300 ease-out"
          style={{ width: `${shown}%` }}
        />
      </div>

      <span className="mt-4 font-display text-xs uppercase tracking-[0.35em] text-muted tabular-nums">
        {shown}%
      </span>
    </div>
  );
}
