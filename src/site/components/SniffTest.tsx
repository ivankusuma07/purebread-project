'use client';

import { useId, useState } from 'react';
import { band, HALLMARK, veracity } from '../../scoring/veracity';
import Hanko from '../art/Hanko';
import BandMark from './BandMark';

/**
 * The sniff test: an illustration, not a venue. How much of the stock a venue
 * claims is actually sitting in the pool? Everything else is held at 5 out
 * of 10, so the asset criterion alone carries a venue across the hallmark.
 */
export default function SniffTest() {
  const [inPool, setInPool] = useState(30);
  const id = useId();
  const asset = Math.round(inPool / 10);
  const score = veracity({ asset, traction: 5, transparency: 5, compliance: 5, durability: 5 });
  const b = band(score);
  const mood = score >= HALLMARK + 150 ? 'alert' : score >= HALLMARK ? 'calm' : 'wary';

  return (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_200px]">
      <div>
        <label htmlFor={id} className="block text-ink">
          Of the stock this venue says backs its pairs, how much is actually in the pool?
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={10}
          value={inPool}
          onChange={(e) => setInPool(Number(e.target.value))}
          className="rule-range mt-4"
          aria-valuetext={`${inPool}% in the pool`}
        />
        <div className="mt-1 flex justify-between text-sm text-ink-2">
          <span>Stock on paper only</span>
          <span>Stock in the pool</span>
        </div>

        {/* the gap, drawn as two bars on the ledger */}
        <div aria-hidden className="mt-6 space-y-2 text-sm">
          <div className="grid grid-cols-[7rem_1fr] items-center gap-3">
            <span className="text-ink-2">Claimed</span>
            <span className="h-3 rounded-full bg-gradient-to-r from-white/70 to-white/90" />
          </div>
          <div className="grid grid-cols-[7rem_1fr] items-center gap-3">
            <span className="text-ink-2">In the pool</span>
            <span className="h-3 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-gradient-to-r from-gold-lo via-gold to-gold-hi shadow-[0_0_14px_rgba(242,193,78,0.6)] transition-[width] duration-300" style={{ width: `${inPool}%` }} />
            </span>
          </div>
        </div>

        <p className="num mt-6 text-lg text-ink" role="status" data-testid="sniff-result">
          Asset {asset}/10 gives a veracity of <span className="font-mincho text-4xl font-bold text-gold">{score}</span>,{' '}
          <BandMark band={b} />.
        </p>
        <p className="measure mt-2 text-sm text-ink-2">
          {score < HALLMARK
            ? 'Below the hallmark. Listed so readers can see it, but not certified.'
            : score < 585
              ? 'Over the hallmark, just. The papers check out on the minimum standard.'
              : 'Real stock behind the claim moves a venue up a whole band on its own.'}
        </p>
      </div>
      <div className="relative mx-auto w-44 md:w-full">
        <div aria-hidden className={`absolute inset-0 rounded-full blur-2xl transition-colors duration-500 ${score < HALLMARK ? "bg-vermilion/25" : "bg-gold/25"}`} />
        <Hanko pose="sit" mood={mood} title={`Hanko, ${mood === 'wary' ? 'ears back, unconvinced' : mood === 'alert' ? 'ears up, tail curled' : 'calm'}`} className="relative h-auto w-full" />
      </div>
    </div>
  );
}
