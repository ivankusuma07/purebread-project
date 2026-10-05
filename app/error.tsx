'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-16">
      <h1 className="text-3xl">This page didn&apos;t load</h1>
      <p className="measure mt-3 text-ink-2">
        Something went wrong while drawing it. The register itself is unchanged: editions are frozen files.
      </p>
      {error.digest && <p className="num mt-2 text-sm text-ink-3">Reference {error.digest}</p>}
      <p className="mt-6 flex gap-4">
        <button type="button" className="btn" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn no-underline">
          Back to the register
        </Link>
      </p>
    </main>
  );
}
