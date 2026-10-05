'use client';

// Adapted from React Bits ElasticSlider (https://reactbits.dev/r/ElasticSlider-TS-TW),
// MIT + Commons Clause licence. Changes: controlled value with onChange, a
// visible label, role="slider" with arrow-key and Home/End support, and the
// site's gold styling. The elastic overflow and spring release are unchanged.

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';

const MAX_OVERFLOW = 40;

export interface ElasticSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: ReactNode;
  /** Read out after the value, e.g. "30% of the score". */
  valueText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  id?: string;
}

function decay(value: number, max: number): number {
  if (max === 0) return 0;
  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
  return sigmoid * max;
}

export default function ElasticSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  label,
  valueText,
  leftIcon,
  rightIcon,
  id,
}: ElasticSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<'left' | 'middle' | 'right'>('middle');
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  useMotionValueEvent(clientX, 'change', (latest: number) => {
    const el = trackRef.current;
    if (!el) return;
    const { left, right } = el.getBoundingClientRect();
    let over = 0;
    if (latest < left) {
      setRegion('left');
      over = left - latest;
    } else if (latest > right) {
      setRegion('right');
      over = latest - right;
    } else {
      setRegion('middle');
    }
    overflow.jump(decay(over, MAX_OVERFLOW));
  });

  const commit = (next: number) => {
    const stepped = Math.round(next / step) * step;
    const clamped = Math.min(max, Math.max(min, stepped));
    if (clamped !== value) onChange(clamped);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (e.buttons === 0 || !el) return;
    const { left, width } = el.getBoundingClientRect();
    commit(min + ((e.clientX - left) / width) * (max - min));
    clientX.jump(e.clientX);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    animate(scale, 1.06);
  };

  const handlePointerUp = () => {
    animate(overflow, 0, { type: 'spring', bounce: 0.5 });
    animate(scale, 1);
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: step * 2,
      PageDown: -step * 2,
    };
    if (e.key in moves) {
      e.preventDefault();
      commit(value + moves[e.key]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      commit(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      commit(max);
    }
  };

  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const labelId = id ? `${id}-label` : undefined;

  const scaleX = useTransform(() => {
    const el = trackRef.current;
    return el ? 1 + overflow.get() / el.getBoundingClientRect().width : 1;
  });
  const scaleY = useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.75]);
  const origin = useTransform(() => {
    const el = trackRef.current;
    if (!el) return 'center';
    const { left, width } = el.getBoundingClientRect();
    return clientX.get() < left + width / 2 ? 'right' : 'left';
  });
  const leftX = useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0));
  const rightX = useTransform(() => (region === 'right' ? overflow.get() / scale.get() : 0));

  return (
    <div className="grid grid-cols-[minmax(7.5rem,9rem)_1fr_2.5rem] items-center gap-x-3">
      <span id={labelId} className="text-sm leading-tight text-ink">
        {label}
      </span>
      <motion.div style={{ scale }} className="flex touch-none select-none items-center gap-2">
        <motion.span
          aria-hidden
          className="text-ink-3"
          animate={{ scale: region === 'left' ? [1, 1.3, 1] : 1, transition: { duration: 0.25 } }}
          style={{ x: leftX }}
        >
          {leftIcon}
        </motion.span>
        <div
          ref={trackRef}
          id={id}
          role="slider"
          tabIndex={0}
          aria-labelledby={labelId}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={valueText ? `${value}, ${valueText}` : String(value)}
          onKeyDown={handleKey}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
          className="relative flex flex-1 cursor-ew-resize touch-none items-center py-3"
        >
          <motion.div style={{ scaleX, scaleY, transformOrigin: origin }} className="flex h-[6px] flex-1">
            <div className="relative h-full flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-lo via-gold to-gold-hi shadow-[0_0_12px_rgba(242,193,78,0.6)]" style={{ width: `${pct}%` }} />
              {/* tick marks, like a rule */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(90deg, var(--color-paper) 1px, transparent 1px)',
                  backgroundSize: `${100 / (max - min)}% 100%`,
                }}
              />
            </div>
          </motion.div>
        </div>
        <motion.span
          aria-hidden
          className="text-ink-3"
          animate={{ scale: region === 'right' ? [1, 1.3, 1] : 1, transition: { duration: 0.25 } }}
          style={{ x: rightX }}
        >
          {rightIcon}
        </motion.span>
      </motion.div>
      <span className="num text-right font-mincho text-lg text-gold" aria-hidden>
        {value}
      </span>
    </div>
  );
}
