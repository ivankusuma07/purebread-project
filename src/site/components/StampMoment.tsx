'use client';

import { useEffect } from 'react';

export const STAMP_KEY = 'veracity:stamped';

/**
 * Inline head script. Runs before first paint, so a first visit starts with
 * the seal hidden instead of flashing it. Skipped with reduced motion, on
 * repeat visits this session, and on pages without an edition seal. Without
 * JavaScript it never runs and everything is visible.
 */
export const STAMP_HEAD_SCRIPT = `try{var p=location.pathname;if((p==='/'||p.indexOf('/editions/')===0)&&!sessionStorage.getItem('${STAMP_KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('stamp-pending')}}catch(e){}`;

/** Plays the stamp once: Hanko's paw comes down, the seal lands, rows take their imprints. */
export default function StampMoment() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains('stamp-pending')) return;
    html.classList.add('stamp-run');
    const done = setTimeout(() => {
      html.classList.remove('stamp-run', 'stamp-pending');
      try {
        sessionStorage.setItem(STAMP_KEY, '1');
      } catch {
        // Storage blocked: the moment may replay, which is harmless.
      }
    }, 1200);
    return () => clearTimeout(done);
  }, []);
  return null;
}
