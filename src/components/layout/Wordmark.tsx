import Image from 'next/image';

export default function Wordmark() {
  return (
    <span className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt=""
        width={420}
        height={286}
        priority
        className="h-9 w-auto"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-muted">
          Transportes
        </span>
        <span className="font-display text-lg uppercase tracking-tight text-ink">
          José María Ibáñez
        </span>
      </span>
    </span>
  );
}
