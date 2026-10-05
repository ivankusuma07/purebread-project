import Link from 'next/link';
import Seal from '../art/Seal';

/** The seal and the name. The seal gets a soft vermilion halo on hover. */
export default function Wordmark() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5 no-underline" aria-label="Veracity, the register">
      <span className="relative">
        <span aria-hidden className="absolute inset-0 rounded-full bg-vermilion/40 blur-md transition-opacity duration-300 group-hover:opacity-100 sm:opacity-0" />
        <Seal className="relative size-8 shrink-0 transition-transform duration-300 group-hover:-rotate-12" clean />
      </span>
      <span className="font-mincho text-lg font-bold tracking-[0.18em] text-ink">VERACITY</span>
    </Link>
  );
}
