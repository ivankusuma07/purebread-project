'use client';

import Image from 'next/image';
import { useState } from 'react';
import Magnet from '../reactbits/Magnet';

export const HANKO_LINES = [
  'Sniffed every source. Missing figures stay missing.',
  'No papers, no seal.',
  'Nobody pays me. I checked.',
  'Same inputs, same score. Every time.',
  'Frozen. The hash is right there.',
];

/**
 * Hanko sits in the corner on wide screens and leans toward the cursor. He
 * speaks when clicked, one dry line at a time. No timed pop-ups.
 */
export default function HankoMargin() {
  const [line, setLine] = useState<number | null>(null);

  return (
    <div className="pointer-events-none fixed bottom-0 right-4 z-40 hidden min-[1500px]:block">
      <div className="pointer-events-auto flex flex-col items-end">
        {line !== null && (
          <p
            role="status"
            data-testid="hanko-line"
            className="panel mb-2 max-w-[16rem] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-snug text-ink shadow-xl shadow-black/50"
          >
            {HANKO_LINES[line]}
          </p>
        )}
        <Magnet padding={80} magnetStrength={6}>
          <button
            type="button"
            onClick={() => setLine((n) => (n === null ? 0 : (n + 1) % HANKO_LINES.length))}
            className="group relative block cursor-pointer"
            aria-label={line === null ? 'Ask Hanko' : 'Ask Hanko again'}
            data-testid="hanko"
          >
            <span aria-hidden className="absolute inset-4 rounded-full bg-shiba/30 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-60" />
            <Image
              src="/hanko/inspector.webp"
              alt=""
              width={124}
              height={124}
              className="relative h-auto w-[124px] transition-transform duration-300 group-hover:-translate-y-1"
            />
          </button>
        </Magnet>
      </div>
    </div>
  );
}
