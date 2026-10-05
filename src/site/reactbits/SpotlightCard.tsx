'use client';

// Adapted from React Bits SpotlightCard (https://reactbits.dev/r/SpotlightCard-TS-TW),
// MIT + Commons Clause licence. Changes: surface colours, radius and padding
// come from className instead of being hard-coded, so the card takes the
// site's theme; it can render as any element. The cursor spotlight is unchanged.

import React, { useRef, useState } from 'react';

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: string;
  as?: 'div' | 'article' | 'section' | 'li';
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(242, 193, 78, 0.18)',
  as: Tag = 'div',
}) => {
  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      onMouseMove={(e: React.MouseEvent<HTMLElement>) => {
        if (!ref.current || focused) return;
        const rect = ref.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onFocus={() => {
        setFocused(true);
        setOpacity(0.6);
      }}
      onBlur={() => {
        setFocused(false);
        setOpacity(0);
      }}
      onMouseEnter={() => setOpacity(0.6)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{ opacity, background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)` }}
      />
      {children}
    </Tag>
  );
};

export default SpotlightCard;
