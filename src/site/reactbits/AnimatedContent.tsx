'use client';

// Adapted from React Bits AnimatedContent (https://reactbits.dev/r/AnimatedContent-TS-TW),
// MIT + Commons Clause licence. Changes: content is visible in the server HTML
// (no `invisible` class), so readers without JavaScript see everything; GSAP
// hides it before paint with a layout effect instead. Reduced motion skips the
// animation. The scroll-triggered entrance itself is unchanged.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useLayoutEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  scale?: number;
  threshold?: number;
  delay?: number;
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 60,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  className = '',
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const axis = direction === 'horizontal' ? 'x' : 'y';
    gsap.set(el, { [axis]: reverse ? -distance : distance, scale, opacity: initialOpacity });
    const tl = gsap.timeline({ paused: true, delay });
    tl.to(el, { [axis]: 0, scale: 1, opacity: 1, duration, ease });
    const st = ScrollTrigger.create({
      trigger: el,
      start: `top ${(1 - threshold) * 100}%`,
      once: true,
      onEnter: () => tl.play(),
    });
    return () => {
      st.kill();
      tl.kill();
      gsap.set(el, { clearProps: 'all' });
    };
  }, [distance, direction, reverse, duration, ease, initialOpacity, scale, threshold, delay]);

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
};

export default AnimatedContent;
