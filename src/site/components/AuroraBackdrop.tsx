'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import Aurora from '../reactbits/Aurora';

const STOPS = ['#B7791F', '#FF5A45', '#F2C14E'];

/** What readers see without WebGL running: the same colours, standing still. */
const STATIC = 'radial-gradient(60% 70% at 25% 0%, rgba(255,90,69,0.45), transparent 70%), radial-gradient(55% 65% at 75% 0%, rgba(242,193,78,0.4), transparent 70%)';

/**
 * The hero's aurora, kept cheap. It renders at half resolution and is scaled
 * up (it is a soft gradient, so nothing is lost), runs only while the hero is
 * on screen, and becomes a still gradient for readers who prefer less motion.
 */
export default function AuroraBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0" style={{ background: reduce || !onScreen ? STATIC : undefined }}>
      {!reduce && onScreen && (
        <div style={{ width: '50%', height: '50%', transform: 'scale(2)', transformOrigin: '0 0' }}>
          <Aurora colorStops={STOPS} amplitude={1.1} blend={0.55} speed={0.6} />
        </div>
      )}
    </div>
  );
}
