'use client';

import { ChevronRight, RotateCcw, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CRITERIA, HALLMARK, HOUSE_WEIGHTS, normalise } from '../../scoring/veracity';
import type { Delta, Venue } from '../../types';
import Seal from '../art/Seal';
import { CRITERION_INFO } from '../lib/criteria';
import { ASSET_TYPE_LABEL, chainLabel, pct, signed, usd, VERIFIABILITY_LABEL } from '../lib/format';
import { applyWeights, HOUSE_RAW, isHouse as isHouseWeights, serializeRaw, type RawWeights } from '../weight-url';
import BandMark from './BandMark';
import JudgesSheet from './JudgesSheet';

type Filter = 'all' | 'certified' | 'below';

interface RegisterProps {
  venues: Venue[];
  deltas: Record<string, Delta>;
  initialRaw: RawWeights;
}

const sameRaw = (a: RawWeights, b: RawWeights) => CRITERIA.every((c) => a[c] === b[c]);

function DeltaMark({ delta }: { delta?: Delta }) {
  if (!delta) return <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs uppercase tracking-wider text-ink-3">new</span>;
  const label = `${signed(delta.veracity)} since ${delta.basis}`;
  if (delta.veracity === 0) {
    return (
      <span className="num text-sm text-ink-3" aria-label={label}>
        0
      </span>
    );
  }
  const up = delta.veracity > 0;
  return (
    <span className={`num inline-flex items-center gap-1 text-sm font-bold ${up ? 'text-k14' : 'text-vermilion-ink'}`} aria-label={label}>
      {up ? <TrendingUp size={14} aria-hidden /> : <TrendingDown size={14} aria-hidden />}
      {signed(delta.veracity)}
    </span>
  );
}

/** Ten segments, lit up to the score. */
function ScoreRule({ score }: { score: number }) {
  return (
    <span aria-hidden className="inline-flex gap-[3px] align-middle">
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={`inline-block h-3 w-[6px] rounded-[2px] ${i < score ? 'bg-gold shadow-[0_0_6px_rgba(242,193,78,0.6)]' : 'bg-white/10'}`}
        />
      ))}
    </span>
  );
}

function VenueDetail({ v, weights, delta }: { v: Venue; weights: Record<string, number>; delta?: Delta }) {
  return (
    <div className="grid gap-x-10 gap-y-6 px-4 pb-6 pt-2 sm:pl-[4.25rem] lg:grid-cols-[1fr_17rem]">
      <div>
        <p className="measure border-l-2 border-gold/60 pl-4 font-mincho text-lg text-ink">{v.thesis}</p>
        <dl className="mt-6 space-y-3.5">
          {CRITERIA.map((c) => (
            <div key={c} className="grid grid-cols-[7.5rem_1fr] gap-x-4 gap-y-1 sm:grid-cols-[8.5rem_auto_1fr]">
              <dt className="text-sm text-ink">
                {CRITERION_INFO[c].label}
                <span className="num ml-1.5 text-xs text-ink-3">{pct(weights[c])}</span>
              </dt>
              <dd className="num flex items-center gap-2 text-sm text-ink">
                <ScoreRule score={v.scores[c]} />
                <span>{v.scores[c]}/10</span>
              </dd>
              <dd className="col-span-2 text-sm text-ink-2 sm:col-span-1">{v.rationale[c]}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="panel space-y-4 self-start p-4 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
          <dt className="text-ink-3">Pairing</dt>
          <dd>{ASSET_TYPE_LABEL[v.pairing.assetType]}</dd>
          <dt className="text-ink-3">Custodian</dt>
          <dd>{v.pairing.custodian ?? 'not published'}</dd>
          <dt className="text-ink-3">Redeemable</dt>
          <dd>{v.pairing.redeemable ? 'Yes' : 'No'}</dd>
          <dt className="text-ink-3">Checked by</dt>
          <dd>{VERIFIABILITY_LABEL[v.pairing.verifiability]}</dd>
          <dt className="text-ink-3">Daily volume</dt>
          <dd className="num">{usd(v.metrics.dailyVolumeUsd)}</dd>
          <dt className="text-ink-3">Fees, 24h</dt>
          <dd className="num">{usd(v.metrics.fees24hUsd)}</dd>
          <dt className="text-ink-3">TVL</dt>
          <dd className="num">{usd(v.metrics.tvlUsd)}</dd>
        </dl>
        {delta?.bandChanged && <p className="text-gold">Changed band since {delta.basis}.</p>}
        <Link href={`/venues/${v.id}`} className="btn btn-gold w-full justify-center no-underline">
          Read the venue papers <ChevronRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function HallmarkLine() {
  return (
    <div className="flex items-center gap-3 px-4 py-3" role="separator" aria-label={`The hallmark, ${HALLMARK}`} data-testid="hallmark-line">
      <span className="hallmark-rule flex-1" />
      <span className="num shrink-0 rounded-full border border-vermilion/50 bg-vermilion/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-vermilion-ink">
        Hallmark · {HALLMARK}
      </span>
      <span className="hallmark-rule w-10 sm:w-24" />
    </div>
  );
}

/**
 * The ranked ledger. Server-rendered at the reader's weights (from `?w=`), so a
 * shared link shows the sender's order before any script runs. Rows re-sort
 * with a layout animation and the hallmark line slides with them.
 */
export default function Register({ venues, deltas, initialRaw }: RegisterProps) {
  const [raw, setRaw] = useState<RawWeights>(initialRaw);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const reduce = useReducedMotion();

  const house = sameRaw(raw, HOUSE_RAW);
  const weights = house ? HOUSE_WEIGHTS : normalise(raw);
  const custom = !isHouseWeights(weights);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (house) url.searchParams.delete('w');
    else url.searchParams.set('w', serializeRaw(raw).slice(3));
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, '', next);
    }
  }, [raw, house]);

  const ranked = useMemo(
    () => applyWeights(venues.filter((v) => v.status !== 'prelaunch' && v.status !== 'struck'), weights),
    // weights derive from raw
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [venues, raw],
  );
  const puppies = venues.filter((v) => v.status === 'prelaunch');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ranked.filter((v) => {
      if (filter === 'certified' && v.veracity < HALLMARK) return false;
      if (filter === 'below' && v.veracity >= HALLMARK) return false;
      if (!q) return true;
      return [v.name, v.chain, chainLabel(v.chain), ASSET_TYPE_LABEL[v.pairing.assetType]].some((s) => s.toLowerCase().includes(q));
    });
  }, [ranked, query, filter]);

  const cutIndex = shown.findIndex((v) => v.veracity < HALLMARK);
  const transition = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 38 };

  return (
    <section id="register" aria-labelledby="register-title" className="chapter">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="chapter-tag mb-4">
            <span>01</span>
            <span aria-hidden className="text-gold/50">/</span>
            <span>Ranked</span>
          </p>
          <h2 id="register-title" className="chapter-title">
            The register
          </h2>
          <p className="measure mt-3 text-lg text-ink-2">Every venue, ranked by veracity. Open a row for the evidence.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 focus-within:border-gold/60">
            <Search size={15} aria-hidden className="text-ink-3" />
            <span className="sr-only">Search venues</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Venue, chain or pairing"
              className="w-44 bg-transparent text-ink outline-none placeholder:text-ink-3"
            />
          </label>
          <div role="group" aria-label="Show" className="flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            {(
              [
                ['all', 'All'],
                ['certified', 'Hallmarked'],
                ['below', 'Below hallmark'],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" className="btn border-transparent px-3 py-1" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {custom && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-3 text-sm text-gold-hi"
          data-testid="custom-banner"
        >
          <span>Custom weights. This is your ranking, not the house register.</span>
          <button type="button" className="btn py-1" onClick={() => setRaw({ ...HOUSE_RAW })}>
            <RotateCcw size={14} aria-hidden /> Reset to house weights
          </button>
        </div>
      )}

      <div className="panel overflow-hidden">
        <div className="hidden grid-cols-[2.75rem_1fr_6.5rem_9rem_5rem_2.25rem_1.25rem] gap-x-4 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.12em] text-ink-3 sm:grid">
          <span>#</span>
          <span>Venue</span>
          <span className="text-right">Veracity</span>
          <span>Band</span>
          <span>Change</span>
          <span className="sr-only">Seal</span>
          <span />
        </div>

        <LayoutGroup>
          <ol className="ledger" data-testid="register-rows">
            {shown.length === 0 && <li className="px-4 py-8 text-center text-ink-2">No venue matches that search.</li>}
            {shown.map((v, i) => {
              const certified = v.veracity >= HALLMARK;
              return [
                i === cutIndex ? (
                  <motion.li key="hallmark" layout="position" transition={transition} className="!border-t-0">
                    <HallmarkLine />
                  </motion.li>
                ) : null,
                <motion.li
                  key={v.id}
                  layout="position"
                  transition={transition}
                  data-venue={v.id}
                  data-veracity={v.veracity}
                  className={i === cutIndex ? '!border-t-0' : ''}
                >
                  <details className="group">
                    <summary
                      className={`grid cursor-pointer list-none grid-cols-[2.25rem_1fr_auto] items-center gap-x-3 px-4 py-4 transition-colors hover:bg-white/[0.035] group-open:bg-white/[0.035] sm:grid-cols-[2.75rem_1fr_6.5rem_9rem_5rem_2.25rem_1.25rem] sm:gap-x-4 [&::-webkit-details-marker]:hidden ${
                        certified ? 'text-ink' : 'text-below-ink'
                      }`}
                    >
                      <span
                        className={`num grid size-8 place-items-center rounded-full text-sm font-bold sm:size-9 ${
                          v.rank <= 3 ? 'bg-gradient-to-br from-gold-hi to-gold-lo text-paper' : 'bg-white/[0.06] text-ink-2'
                        }`}
                      >
                        {v.rank}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-mincho text-[1.2rem] font-bold leading-tight sm:text-[1.35rem]">{v.name}</span>
                        <span className="mt-1 flex items-center gap-2 text-sm text-ink-3">
                          {chainLabel(v.chain)}
                          {!v.resident && <span className="rounded-full border border-white/10 px-2 text-xs">off-chain</span>}
                          <span className="sm:hidden">
                            <DeltaMark delta={deltas[v.id]} />
                          </span>
                        </span>
                        <span className={`score-bar mt-2 hidden max-w-xs sm:block ${certified ? '' : 'below'}`} aria-hidden>
                          <span style={{ width: `${v.veracity / 10}%` }} />
                        </span>
                      </span>
                      <span className={`num text-right font-mincho text-[1.6rem] font-bold leading-none sm:text-3xl ${certified ? 'text-gold' : ''}`}>
                        {v.veracity}
                        <span className="mt-1 block text-right font-gothic text-xs font-normal sm:hidden">
                          <BandMark band={v.band} />
                        </span>
                      </span>
                      <span className="hidden sm:block">
                        <BandMark band={v.band} pill />
                      </span>
                      <span className="hidden sm:block">
                        <DeltaMark delta={deltas[v.id]} />
                      </span>
                      <span className="hidden sm:block">
                        {certified && (
                          <span
                            data-stamp="row"
                            style={{ ['--i' as string]: i }}
                            className="block size-8 -rotate-6 drop-shadow-[0_0_10px_rgba(255,90,69,0.6)]"
                            title="Hallmarked"
                          >
                            <Seal clean className="size-8" />
                          </span>
                        )}
                      </span>
                      <ChevronRight size={16} aria-hidden className="hidden text-ink-3 transition-transform group-open:rotate-90 sm:block" />
                    </summary>
                    <VenueDetail v={v} weights={weights} delta={deltas[v.id]} />
                  </details>
                </motion.li>,
              ];
            })}
          </ol>
        </LayoutGroup>
      </div>

      {puppies.length > 0 && (
        <div className="panel mt-4 px-5 py-4 text-sm">
          <p className="text-ink-2">Puppies: registered, not yet ranked. They get a score once they have a live market.</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {puppies.map((v) => (
              <li key={v.id}>
                <Link href={`/venues/${v.id}`} className="btn no-underline">
                  {v.name} <span className="text-ink-3">{chainLabel(v.chain)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <JudgesSheet raw={raw} onChange={setRaw} isHouse={!custom} />
    </section>
  );
}
