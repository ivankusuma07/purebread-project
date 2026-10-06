import { ExternalLink, FileCheck, Link2 } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CRITERIA, HALLMARK, HOUSE_WEIGHTS } from '../../../src/scoring/veracity';
import Seal from '../../../src/site/art/Seal';
import BandMark from '../../../src/site/components/BandMark';
import PageHead from '../../../src/site/components/PageHead';
import VenueIcon from '../../../src/site/components/VenueIcon';
import Book from '../../../src/site/components/Book';
import CopyButton from '../../../src/site/components/CopyButton';
import { explorerAddress } from '../../../src/site/config';
import { allVenueIds, LATEST_EDITION, SOURCES, venueHistory, type VenueRecord } from '../../../src/site/editions';
import { CRITERION_INFO } from '../../../src/site/lib/criteria';
import {
  ASSET_TYPE_LABEL,
  BAND_LABEL,
  chainLabel,
  longDate,
  pct,
  shortHash,
  signed,
  usd,
  VERIFIABILITY_LABEL,
} from '../../../src/site/lib/format';

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return allVenueIds().map((id) => ({ id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const history = venueHistory(id);
  const v = history[history.length - 1]?.venue;
  if (!v) return { title: 'Venue papers' };
  const title = v.status === 'prelaunch' ? `${v.name}: not yet scored` : `${v.name}: veracity ${v.veracity}, ${BAND_LABEL[v.band]}`;
  const description = v.thesis;
  return {
    title: `${v.name} papers`,
    description: `${title}. ${description}`,
    openGraph: { type: 'article', title, description, url: `/venues/${v.id}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/** Score history across editions, with the hallmark drawn in vermilion. */
function HistoryChart({ records, name }: { records: VenueRecord[]; name: string }) {
  const W = 640;
  const H = 180;
  const top = 18;
  const bottom = 150;
  const y = (v: number) => bottom - (v / 1000) * (bottom - top);
  const x = (i: number) => (records.length <= 1 ? W / 2 : 50 + (i * (W - 100)) / (records.length - 1));
  const points = records.map((r, i) => `${x(i).toFixed(1)},${y(r.venue.veracity).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Veracity of ${name} by edition`} className="h-auto w-full max-w-2xl">
      {[0, 250, 500, 750, 1000].map((t) => (
        <g key={t}>
          <line x1={30} x2={W} y1={y(t)} y2={y(t)} stroke="var(--color-grid-soft)" />
          <text x={0} y={y(t) + 4} fontSize={11} fill="var(--color-ink-3)" className="num">
            {t}
          </text>
        </g>
      ))}
      <line x1={30} x2={W} y1={y(HALLMARK)} y2={y(HALLMARK)} stroke="var(--color-vermilion)" strokeWidth={1.5} />
      <text x={W} y={y(HALLMARK) - 5} fontSize={11} textAnchor="end" fill="var(--color-vermilion-ink)">
        the hallmark · {HALLMARK}
      </text>
      {records.length > 1 && <polyline points={points} fill="none" stroke="var(--color-ink)" strokeWidth={2} />}
      {records.map((r, i) => (
        <g key={r.edition}>
          <circle cx={x(i)} cy={y(r.venue.veracity)} r={4} fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth={2} />
          <text x={x(i)} y={y(r.venue.veracity) - 10} fontSize={13} textAnchor="middle" fill="var(--color-ink)" fontFamily="var(--font-mincho)">
            {r.venue.status === 'prelaunch' ? '' : r.venue.veracity}
          </text>
          <text x={x(i)} y={H - 4} fontSize={11} textAnchor="middle" fill="var(--color-ink-3)">
            {r.edition}
          </text>
        </g>
      ))}
    </svg>
  );
}

const CONTENTS = [
  { href: '#history', label: 'History' },
  { href: '#scores', label: 'Scores' },
  { href: '#custody', label: 'Custody and pairing' },
  { href: '#figures', label: 'Figures' },
  { href: '#contracts', label: 'Contracts and links' },
];

/** A venue's papers: everything the register knows about it, across editions. */
export default async function VenuePage({ params }: { params: Params }) {
  const { id } = await params;
  const records = venueHistory(id);
  if (records.length === 0) notFound();
  const current = records[records.length - 1].venue;
  const latest = records[records.length - 1];
  const puppy = current.status === 'prelaunch';
  const hallmarked = !puppy && current.veracity >= HALLMARK;

  const order = LATEST_EDITION.venues;
  const at = order.findIndex((v) => v.id === id);
  const prev = at > 0 ? order[at - 1] : null;
  const next = at >= 0 && at < order.length - 1 ? order[at + 1] : null;

  return (
    <Book contents={CONTENTS} edition={latest.edition}>
      <PageHead
        crumbs={[['venues', '/venues'], ['papers']]}
        kicker={`${chainLabel(current.chain)}${current.resident ? '' : ' · off-chain'} · admitted ${current.admittedEdition}`}
        title={
          <span className="flex items-center gap-4">
            <VenueIcon id={current.id} name={current.name} size={64} />
            {current.name}
          </span>
        }
        lede={
          <>
            <p className="font-mincho text-xl text-ink">{current.thesis}</p>
            <p className="mt-3 text-sm text-ink-3">
              Scored in edition {latest.edition}, snapshot <span className="mono">{shortHash(latest.snapshotHash)}</span>
              {current.status === 'struck' && current.struckDate && ` · struck off ${longDate(current.struckDate)}`}
              {current.status === 'paused' && ' · paused'}
              {puppy && ' · puppy, not yet ranked'}
            </p>
          </>
        }
        aside={
          <div className="panel flex items-center gap-6 px-6 py-5">
            {puppy ? (
              <p className="text-ink-2">Not yet scored</p>
            ) : (
              <>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-3">Veracity</p>
                  <p className={`num font-mincho text-6xl font-bold leading-none ${hallmarked ? 'text-gold' : 'text-below-ink'}`}>{current.veracity}</p>
                  <p className="mt-2 flex items-center gap-2">
                    <BandMark band={current.band} pill />
                    {current.delta && <span className="num text-sm text-ink-2">{signed(current.delta.veracity)} since {current.delta.basis}</span>}
                  </p>
                </div>
                {hallmarked ? (
                  <Seal className="size-20 -rotate-6 drop-shadow-[0_0_24px_rgba(255,90,69,0.6)]" title="Hallmarked" />
                ) : (
                  <p className="max-w-[10rem] text-sm text-below-ink">Below the hallmark: listed, not certified.</p>
                )}
              </>
            )}
          </div>
        }
      />

      <section id="history" aria-labelledby="history-title" className="panel mb-4 p-6 sm:p-8">
        <h2 id="history-title" className="mb-6 text-3xl">
          History
        </h2>
        <HistoryChart records={records} name={current.name} />
        <div className="mt-6 overflow-x-auto">
          <table className="table-ledger min-w-[34rem]">
            <thead>
              <tr>
                <th scope="col">Edition</th>
                <th scope="col" className="n">
                  Veracity
                </th>
                <th scope="col">Band</th>
                <th scope="col" className="n">
                  Rank
                </th>
                <th scope="col">Snapshot</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.edition}>
                  <td>
                    <Link href={`/editions/${r.edition}`}>{r.edition}</Link>
                  </td>
                  <td className="n">{r.venue.status === 'prelaunch' ? '' : r.venue.veracity}</td>
                  <td>{r.venue.status === 'prelaunch' ? 'not scored' : <BandMark band={r.venue.band} />}</td>
                  <td className="n">{r.venue.rank || ''}</td>
                  <td className="num" title={r.snapshotHash}>
                    {shortHash(r.snapshotHash)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="scores" aria-labelledby="scores-title" className="panel mb-4 p-6 sm:p-8">
        <h2 id="scores-title" className="mb-6 text-3xl">
          Scores
        </h2>
        <dl className="ledger">
          {CRITERIA.map((c) => (
            <div key={c} className="grid gap-x-8 gap-y-1 py-4 sm:grid-cols-[12rem_1fr]">
              <dt>
                <span className="font-mincho text-lg font-bold">{CRITERION_INFO[c].label}</span>
                <span className="num ml-2 font-mincho text-lg">{current.scores[c]}/10</span>
                <span className="block text-sm text-ink-3">
                  {pct(HOUSE_WEIGHTS[c])} of the score · {CRITERION_INFO[c].question}
                </span>
              </dt>
              <dd className="measure text-ink-2">{current.rationale[c]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="custody" aria-labelledby="custody-title" className="panel mb-4 p-6 sm:p-8">
        <h2 id="custody-title" className="mb-6 text-3xl flex items-center gap-2">
          <FileCheck size={20} aria-hidden /> Custody and pairing
        </h2>
        <dl className="grid max-w-xl grid-cols-[10rem_1fr] gap-x-6 gap-y-2">
          <dt className="text-ink-3">Pairs against</dt>
          <dd>{ASSET_TYPE_LABEL[current.pairing.assetType]}</dd>
          <dt className="text-ink-3">Custodian</dt>
          <dd>{current.pairing.custodian ?? 'not published'}</dd>
          <dt className="text-ink-3">Jurisdiction</dt>
          <dd>{current.pairing.jurisdiction ?? 'not published'}</dd>
          <dt className="text-ink-3">Redeemable</dt>
          <dd>{current.pairing.redeemable ? 'Yes' : 'No'}</dd>
          <dt className="text-ink-3">How to check</dt>
          <dd>{VERIFIABILITY_LABEL[current.pairing.verifiability]}</dd>
        </dl>
      </section>

      <section id="figures" aria-labelledby="figures-title" className="panel mb-4 p-6 sm:p-8">
        <h2 id="figures-title" className="mb-6 text-3xl">
          Figures
        </h2>
        <dl className="grid max-w-xl grid-cols-[10rem_1fr] gap-x-6 gap-y-2">
          <dt className="text-ink-3">Cumulative volume</dt>
          <dd className="num">{usd(current.metrics.cumulativeVolumeUsd)}</dd>
          <dt className="text-ink-3">Daily volume</dt>
          <dd className="num">{usd(current.metrics.dailyVolumeUsd)}</dd>
          <dt className="text-ink-3">Fees, 24h</dt>
          <dd className="num">{usd(current.metrics.fees24hUsd)}</dd>
          <dt className="text-ink-3">TVL</dt>
          <dd className="num">{usd(current.metrics.tvlUsd)}</dd>
          <dt className="text-ink-3">As of</dt>
          <dd className="num">{longDate(current.metrics.asOf)}</dd>
          <dt className="text-ink-3">Sources</dt>
          <dd>
            {current.metrics.sourceIds.length === 0
              ? 'none yet'
              : current.metrics.sourceIds.map((s, i) => (
                  <span key={s}>
                    {i > 0 && ', '}
                    <a href={SOURCES[s]?.url}>{SOURCES[s]?.name ?? s}</a>
                  </span>
                ))}
          </dd>
        </dl>
        {current.facts.length > 0 && (
          <ul className="mt-6 space-y-2">
            {current.facts.map(([figure, note]) => (
              <li key={figure + note} className="grid grid-cols-[6rem_1fr] gap-4">
                <span className="num font-mincho text-lg font-bold">{figure}</span>
                <span className="text-ink-2">{note}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="contracts" aria-labelledby="contracts-title" className="panel mb-4 p-6 sm:p-8">
        <h2 id="contracts-title" className="mb-6 text-3xl flex items-center gap-2">
          <Link2 size={20} aria-hidden /> Contracts and links
        </h2>
        {current.contracts.length === 0 ? (
          <p className="text-ink-2">No contract address is on record yet. Addresses are added once checked on the explorer.</p>
        ) : (
          <ul className="ledger max-w-2xl">
            {current.contracts.map((c) => (
              <li key={c.address} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5">
                <span className="w-24 text-ink-2">{c.label}</span>
                <a href={explorerAddress(c.address, current.chain)} className="num" title={c.address}>
                  {shortHash(c.address)}
                </a>
                <CopyButton value={c.address} what={`${c.label} address`} />
                <span className="text-sm text-ink-3">
                  {current.chain === 'solana' ? 'Solana account' : c.verified ? 'source verified on the explorer' : 'source not verified'}
                </span>
              </li>
            ))}
          </ul>
        )}
        <ul className="mt-5 space-y-1.5">
          {current.links.site && (
            <li>
              <a href={current.links.site} rel="noreferrer" className="inline-flex items-center gap-1.5">
                {current.links.site.replace(/^https?:\/\//, '')} <ExternalLink size={14} aria-hidden />
              </a>
            </li>
          )}
          {current.links.docs && (
            <li>
              <a href={current.links.docs} rel="noreferrer" className="inline-flex items-center gap-1.5">
                Documentation <ExternalLink size={14} aria-hidden />
              </a>
            </li>
          )}
          {!current.links.site && !current.links.docs && <li className="text-ink-2">Site and docs: not yet verified.</li>}
        </ul>
      </section>

      <nav aria-label="Other venues" className="flex justify-between gap-4 pt-6">
        {prev ? (
          <Link href={`/venues/${prev.id}`} className="btn no-underline">
            Previous: {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/venues/${next.id}`} className="btn no-underline">
            Next: {next.name}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </Book>
  );
}
