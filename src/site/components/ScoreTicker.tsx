'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import type { Venue } from '../../types';
import { chainLabel, signed } from '../lib/format';
import LogoLoop from '../reactbits/LogoLoop';
import { BAND_COLOR } from './BandMark';
import VenueIcon from './VenueIcon';

/** A strip of every ranked venue and its score, looping under the hero. Pauses on hover. */
export default function ScoreTicker({ venues }: { venues: Venue[] }) {
  const items = venues
    .filter((v) => v.status !== 'prelaunch' && v.status !== 'struck')
    .map((v) => ({
      title: `${v.name} ${v.veracity}`,
      href: `/venues/${v.id}`,
      node: (
        <span className="flex items-center gap-3 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-2 pr-4 text-sm">
          <span className="num grid size-7 place-items-center rounded-full bg-white/5 text-xs text-ink-3">{v.rank}</span>
          <VenueIcon id={v.id} name={v.name} size={24} />
          <span className="font-mincho text-base font-bold text-ink">{v.name}</span>
          <span className="text-ink-3">{chainLabel(v.chain)}</span>
          <span className="num font-bold" style={{ color: BAND_COLOR[v.band].text }}>
            {v.veracity}
          </span>
          {v.delta && v.delta.veracity !== 0 ? (
            <span className={`num inline-flex items-center gap-1 ${v.delta.veracity > 0 ? 'text-k14' : 'text-vermilion-ink'}`}>
              {v.delta.veracity > 0 ? <TrendingUp size={13} aria-hidden /> : <TrendingDown size={13} aria-hidden />}
              {signed(v.delta.veracity)}
            </span>
          ) : (
            <span className="text-xs uppercase tracking-wider text-ink-3">{v.delta ? 'steady' : 'new'}</span>
          )}
        </span>
      ),
    }));

  return (
    <div className="relative -mx-4 border-y border-white/[0.06] bg-white/[0.015] py-3 sm:-mx-6" aria-label="Scores this edition">
      <LogoLoop logos={items} speed={45} direction="left" logoHeight={40} gap={14} pauseOnHover fadeOut fadeOutColor="#070a12" ariaLabel="Venue scores this edition" />
    </div>
  );
}
