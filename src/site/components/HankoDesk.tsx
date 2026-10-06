'use client';

import { useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Band } from '../../scoring/veracity';
import { BAND_LABEL } from '../lib/format';
import { BAND_COLOR } from './BandMark';

export interface DeskPaper {
  name: string;
  band: Band;
  veracity: number;
}

/** Milliseconds per stamp, and how long the paw stays down. */
const PACE = { calm: { cycle: 3000, down: 650 }, rush: { cycle: 1100, down: 340 } };
const RUSH_FOR = 6000;
const FIRST_STAMP = 500;

/**
 * The hero scene: Hanko at his desk, stamping one venue's papers after another.
 * Two aligned renders (paw up, paw down) swap on a loop; the badge, the ink and
 * the counter are drawn on top. Clicking him rushes the stamping for a few
 * seconds. Pauses off screen and in background tabs; with reduced motion the
 * paw stays down on the first paper.
 */
export default function HankoDesk({ papers, children }: { papers: DeskPaper[]; children?: ReactNode }) {
  const reduce = useReducedMotion();
  const [down, setDown] = useState(false);
  const [stamped, setStamped] = useState(0);
  const [rush, setRush] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const scene = useRef<HTMLDivElement>(null);
  const rushTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Only stamp while someone can see it.
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    let inView = true;
    const sync = () => setOnScreen(inView && !document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  useEffect(() => {
    if (reduce || !onScreen) return;
    const pace = rush ? PACE.rush : PACE.calm;
    let timer: ReturnType<typeof setTimeout>;
    const lift = () => {
      setDown(false);
      timer = setTimeout(slam, pace.cycle - pace.down);
    };
    const slam = () => {
      setDown(true);
      setStamped((n) => n + 1);
      scene.current?.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(3px) scaleY(0.995)' }, { transform: 'translateY(0)' }],
        { duration: 220, easing: 'ease-out' },
      );
      timer = setTimeout(lift, pace.down);
    };
    timer = setTimeout(slam, FIRST_STAMP);
    return () => clearTimeout(timer);
  }, [reduce, onScreen, rush]);

  useEffect(() => () => clearTimeout(rushTimer.current), []);

  const hurry = useCallback(() => {
    setRush(true);
    clearTimeout(rushTimer.current);
    rushTimer.current = setTimeout(() => setRush(false), RUSH_FOR);
  }, []);

  const paper = papers.length ? papers[Math.max(0, stamped - 1) % papers.length] : undefined;
  const showDown = down || !!reduce;
  const showBadge = paper && (stamped > 0 || reduce);

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <p className="mb-2 flex items-center justify-end gap-2.5 text-xs uppercase tracking-[0.14em] text-ink-3">
        <span className="size-1.5 animate-pulse-dot rounded-full bg-gold" aria-hidden />
        Hanko on duty
        <span className="num rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 font-bold text-gold" data-testid="desk-count">
          {stamped} stamped
        </span>
      </p>

      <div className="relative aspect-square">
        <div aria-hidden className="absolute inset-[6%_10%_22%] rounded-full bg-[radial-gradient(circle,rgb(242_193_78/0.22),rgb(255_90_69/0.12)_45%,transparent_70%)] blur-2xl" />

        <button
          type="button"
          onClick={hurry}
          aria-label="Hanko stamping venue papers. Click to hurry him up."
          className="absolute inset-0 cursor-pointer rounded-3xl [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,black_78%,transparent),linear-gradient(to_right,transparent,black_7%,black_93%,transparent)] focus-visible:outline-offset-4"
          data-testid="hanko-desk"
        >
          <div ref={scene} className="absolute inset-0">
            <Image
              src="/hanko/stamp-up.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 540px, 92vw"
              loading="eager"
              fetchPriority="high"
              className="object-contain"
              style={{ opacity: showDown ? 0 : 1 }}
            />
            <Image
              src="/hanko/stamp-down.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 540px, 92vw"
              loading="eager"
              className="object-contain"
              style={{ opacity: showDown ? 1 : 0 }}
            />
          </div>

          {/* Steam off the tea. */}
          <span aria-hidden className="absolute left-[11%] top-[64%] motion-reduce:hidden">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute block h-4 w-1.5 animate-steam rounded-full bg-white/50 blur-[2px]"
                style={{ left: `${i * 7 - 7}px`, animationDelay: `${i * 0.7}s` }}
              />
            ))}
          </span>

          {/* The ink, and the badge for the paper just stamped. */}
          {down && !reduce && (
            <span
              key={`ink-${stamped}`}
              aria-hidden
              className="absolute left-[40%] top-[63%] size-[14%] rounded-full border-4 border-vermilion animate-[ink-spread_700ms_ease-out_both]"
            />
          )}
          {showBadge && paper && (
            <span
              key={`badge-${stamped}`}
              aria-hidden
              className="absolute left-[52%] top-[68%] z-10 rounded-md motion-reduce:-rotate-6 border-[3px] bg-[#fbf6ea] px-3 py-1.5 text-left font-mono leading-tight motion-safe:animate-[seal-land_420ms_cubic-bezier(0.2,0.9,0.3,1.15)_both]"
              style={{ borderColor: BAND_COLOR[paper.band].swatch, boxShadow: `inset 0 0 0 2px #fbf6ea, inset 0 0 0 3px ${BAND_COLOR[paper.band].swatch}, 0 8px 20px rgb(0 0 0 / 0.35)` }}
            >
              <span className="block max-w-[11rem] truncate text-[0.62rem] uppercase tracking-[0.16em] text-[#5b5346]">{paper.name}</span>
              <span className="block text-sm font-bold uppercase tracking-[0.08em] text-[#2a2418]">
                {BAND_LABEL[paper.band]} <span className="text-[#8a7f6b]">·</span> {paper.veracity}
              </span>
            </span>
          )}
        </button>

        {children}
      </div>

      <p className="mt-8 flex items-center justify-end gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-ink-3">
        Click Hanko to rush the stamping
        <span className={rush ? 'font-bold text-gold' : 'text-ink-3'}>{rush ? 'Rushing' : 'Steady'}</span>
      </p>
    </div>
  );
}
