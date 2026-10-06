import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-3xl items-center gap-8 px-4 py-16 sm:grid-cols-[1fr_180px]">
      <div>
        <p className="num text-ink-3">404</p>
        <h1 className="mt-2 text-4xl">Not in the register</h1>
        <p className="measure mt-3 text-ink-2">
          Hanko looked. There is no edition, venue or page at this address. Editions are filed by month, like 2026-10.
        </p>
        <p className="mt-6 flex gap-5">
          <Link href="/">Back to the register</Link>
          <Link href="/venues">All venues</Link>
        </p>
      </div>
      <Image src="/hanko/sniff-wary.webp" alt="Hanko, unconvinced" width={180} height={180} className="h-auto w-40 sm:w-full" />
    </main>
  );
}
