'use client';

import { useState } from 'react';
import Hanko from '../art/Hanko';

export const HANKO_LINES = [
  'Sniffed every source. Missing figures stay missing.',
  'No papers, no seal.',
  'Nobody pays me. I checked.',
  'Same inputs, same score. Every time.',
  'Frozen. The hash is right there.',
];

/**
 * Hanko sits at the edge of the page on wide screens. He speaks only when
 * clicked, one dry line at a time. No timed pop-ups.
 */
export default function HankoMargin() {
  const [line, setLine] = useState<number | null>(null);

  function speak() {
    setLine((n) => (n === null ? 0 : (n + 1) % HANKO_LINES.length));
  }

  return (
    <div className="pointer-events-none fixed bottom-0 right-4 z-20 hidden min-[1500px]:block">
      <div className="pointer-events-auto flex flex-col items-end">
        {line !== null && (
          <p
            role="status"
            data-testid="hanko-line"
            className="mb-1 max-w-[15rem] border border-ink bg-paper px-3 py-2 text-sm leading-snug text-ink"
          >
            {HANKO_LINES[line]}
          </p>
        )}
        <button
          type="button"
          onClick={speak}
          className="block cursor-pointer"
          aria-label={line === null ? 'Ask Hanko' : 'Ask Hanko again'}
          data-testid="hanko"
        >
          <Hanko pose="sit" mood="calm" certificate className="h-auto w-[118px]" />
        </button>
      </div>
    </div>
  );
}
