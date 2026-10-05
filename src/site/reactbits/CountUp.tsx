'use client';

// Adapted from React Bits CountUp (https://reactbits.dev/r/CountUp-TS-TW),
// MIT + Commons Clause licence. Changes: the server renders the final value,
// so a reader without JavaScript sees the real number, never a zero; reduced
// motion shows the final value straight away. The spring count is unchanged.

import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  delay?: number;
  duration?: number;
  className?: string;
  separator?: string;
}

export default function CountUp({ to, from = 0, delay = 0, duration = 2, className = '', separator = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, { damping: 20 + 40 * (1 / duration), stiffness: 100 * (1 / duration) });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  const decimals = Math.max(...[from, to].map((n) => (String(n).split('.')[1] ?? '').replace(/0+$/, '').length));
  const format = useCallback(
    (latest: number) => {
      const out = Intl.NumberFormat('en-US', {
        useGrouping: !!separator,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(latest);
      return separator ? out.replace(/,/g, separator) : out;
    },
    [decimals, separator],
  );

  // Start from `from` once mounted, unless the reader prefers no motion.
  useEffect(() => {
    if (ref.current && !reduce) ref.current.textContent = format(from);
  }, [from, format, reduce]);

  useEffect(() => {
    if (!isInView || reduce) return;
    const t = setTimeout(() => motionValue.set(to), delay * 1000);
    return () => clearTimeout(t);
  }, [isInView, reduce, motionValue, to, delay]);

  useEffect(() => {
    const off = springValue.on('change', (latest: number) => {
      if (ref.current) ref.current.textContent = format(latest);
    });
    return () => off();
  }, [springValue, format]);

  return (
    <span className={className} ref={ref}>
      {format(to)}
    </span>
  );
}
