/* eslint-disable @next/next/no-img-element -- next/og renders plain <img>; next/image does not work inside ImageResponse. */
// Shared pieces for the social share cards (Open Graph and X). The cards are
// rendered by next/og at build time: fonts are fetched as subsets holding only
// the glyphs each card uses, and Hanko and the seal come from the exported
// pose sheet in art/hanko.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactNode } from 'react';
import { SITE } from './config';

/** The site's host, shown on every card. */
export const HOST = SITE.url.replace(/^https?:\/\//, '');

export const OG_SIZE = { width: 1200, height: 630 };

export const C = {
  ink: '#070A12',
  cream: '#F3EFE6',
  muted: '#B9BFCE',
  dim: '#8A93A9',
  gold: '#F2C14E',
  goldHi: '#FFE7A3',
  vermilion: '#FF5A45',
};

/** Hanko or the seal as a data URI for an <img>. */
export function art(name: 'seal' | 'stamp-down' | 'inspector' | 'sniff-high' | 'sniff-low'): string {
  const svg = readFileSync(join(process.cwd(), 'art', 'hanko', `${name}.svg`), 'utf8');
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/** A Google font cut down to the characters in `text`. Null if the fetch fails; the card then uses the default face. */
async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Mincho for display text, Kaku Gothic for the rest. */
export async function ogFonts(display: string, body: string) {
  const [mincho, gothic] = await Promise.all([
    googleFont('Zen Old Mincho', 700, display),
    googleFont('Zen Kaku Gothic New', 500, `${body}${display}0123456789`),
  ]);
  return [
    ...(mincho ? [{ name: 'Mincho', data: mincho, weight: 700 as const, style: 'normal' as const }] : []),
    ...(gothic ? [{ name: 'Gothic', data: gothic, weight: 500 as const, style: 'normal' as const }] : []),
  ];
}

/** The card's ground: vault ink with a gold and vermilion glow, and the wordmark top left. */
export function Frame({ children, left, right }: { children: ReactNode; left: ReactNode; right: ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 64px',
        background: C.ink,
        backgroundImage:
          'radial-gradient(circle at 85% 0%, rgba(242,193,78,0.28), transparent 45%), radial-gradient(circle at 10% 110%, rgba(255,90,69,0.22), transparent 45%)',
        color: C.cream,
        fontFamily: 'Gothic',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src={art('seal')} width={44} height={44} alt="" />
        <span style={{ fontFamily: 'Mincho', fontSize: 30, letterSpacing: 6 }}>VERACITY</span>
      </div>
      {children}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, color: C.dim }}>
        <div style={{ display: 'flex', gap: 18 }}>{left}</div>
        <div style={{ display: 'flex' }}>{right}</div>
      </div>
    </div>
  );
}
