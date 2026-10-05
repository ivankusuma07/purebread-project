'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CopyButtonProps {
  value: string;
  /** What is being copied, for screen readers: "snapshot hash", "address". */
  what: string;
  className?: string;
}

/** Copies, then confirms with a check for a moment. */
export default function CopyButton({ value, what, className = '' }: CopyButtonProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
    } catch {
      // Clipboard blocked: the value is on screen to select by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1 text-sm text-ink-2 underline decoration-grid underline-offset-4 hover:text-ink ${className}`}
      aria-label={done ? `Copied ${what}` : `Copy ${what}`}
      data-copy={value}
    >
      {done ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      <span>{done ? 'Copied' : 'Copy'}</span>
      <span className="sr-only" role="status">
        {done ? `${what} copied` : ''}
      </span>
    </button>
  );
}
