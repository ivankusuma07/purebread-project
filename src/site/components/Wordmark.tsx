import Link from 'next/link';
import Seal from '../art/Seal';

/** The book's title: the small seal and the name, set in Mincho. */
export default function Wordmark() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5 no-underline" aria-label="Veracity, the register">
      <Seal className="size-8 shrink-0" clean />
      <span className="font-mincho text-xl font-bold tracking-[0.12em] text-ink">VERACITY</span>
    </Link>
  );
}
