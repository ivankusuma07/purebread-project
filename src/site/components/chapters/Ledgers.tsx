import { Ban, CalendarClock, Database, FileCheck, ScrollText, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { CRITERIA, HALLMARK } from '../../../scoring/veracity';
import type { Edition, SourceRegistry, Venue } from '../../../types';
import { SITE } from '../../config';
import { CRITERION_INFO } from '../../lib/criteria';
import { ASSET_TYPE_LABEL, longDate, nextEditionMonth, pct, VERIFIABILITY_LABEL } from '../../lib/format';
import SpotlightCard from '../../reactbits/SpotlightCard';
import BandMark from '../BandMark';
import Chapter from '../Chapter';
import CopyButton from '../CopyButton';

const listed = (venues: Venue[]) => venues.filter((v) => v.status !== 'prelaunch' && v.status !== 'struck');

/** A score cell lit in gold by its value. */
function Heat({ score, dim }: { score: number; dim: boolean }) {
  return (
    <span
      className="num mx-auto grid size-10 place-items-center rounded-lg text-sm font-bold"
      style={{
        background: dim ? `rgb(143 151 171 / ${0.05 + score * 0.02})` : `rgb(242 193 78 / ${0.06 + score * 0.06})`,
      }}
    >
      {score}
    </span>
  );
}

export function MatrixChapter({ n, edition }: { n: string; edition: Edition }) {
  const venues = listed(edition.venues);
  return (
    <Chapter id="criteria" number={n} kicker="Heatmap" title="Criteria matrix" lede="Every venue on every criterion, out of 10. Brighter is stronger. House weights in the column heads.">
      <div className="panel overflow-x-auto p-2">
        <table className="table-ledger min-w-[44rem]">
          <thead>
            <tr>
              <th scope="col">Venue</th>
              {CRITERIA.map((c) => (
                <th key={c} scope="col" className="text-center!">
                  {CRITERION_INFO[c].label}
                  <span className="mono mt-0.5 block text-[0.7rem] text-gold/70">{pct(edition.houseWeights[c])}</span>
                </th>
              ))}
              <th scope="col" className="n">
                Veracity
              </th>
            </tr>
          </thead>
          <tbody>
            {venues.map((v) => {
              const dim = v.veracity < HALLMARK;
              return (
                <tr key={v.id} className={dim ? 'text-below-ink' : ''}>
                  <th scope="row" className="text-left font-mincho text-lg font-bold">
                    <Link href={`/venues/${v.id}`} className="no-underline">
                      {v.name}
                    </Link>
                  </th>
                  {CRITERIA.map((c) => (
                    <td key={c} className="py-2!">
                      <Heat score={v.scores[c]} dim={dim} />
                    </td>
                  ))}
                  <td className={`n font-mincho text-xl font-bold ${dim ? '' : 'text-gold'}`}>{v.veracity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Chapter>
  );
}

export function CustodyChapter({ n, edition }: { n: string; edition: Edition }) {
  const venues = listed(edition.venues);
  return (
    <Chapter
      id="custody"
      number={n}
      kicker="Papers"
      title="Custody and papers"
      lede="Who holds what backs each venue's pairs, where they answer to a regulator, whether a holder can redeem, and how anyone can check."
    >
      <div className="panel overflow-x-auto p-2">
        <table className="table-ledger min-w-[46rem]">
          <thead>
            <tr>
              <th scope="col">
                <span className="inline-flex items-center gap-1.5">
                  <FileCheck size={13} aria-hidden /> Venue
                </span>
              </th>
              <th scope="col">Pairing</th>
              <th scope="col">Custodian</th>
              <th scope="col">Jurisdiction</th>
              <th scope="col">Redeemable</th>
              <th scope="col">Checked by</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((v) => (
              <tr key={v.id}>
                <th scope="row" className="text-left font-mincho text-lg font-bold">
                  {v.name}
                </th>
                <td>{ASSET_TYPE_LABEL[v.pairing.assetType]}</td>
                <td className={v.pairing.custodian ? '' : 'text-ink-3'}>{v.pairing.custodian ?? 'not published'}</td>
                <td className={v.pairing.jurisdiction ? '' : 'text-ink-3'}>{v.pairing.jurisdiction ?? 'not published'}</td>
                <td>
                  <span className={`rounded-full px-2.5 py-0.5 text-sm ${v.pairing.redeemable ? 'bg-k14/15 text-k14' : 'bg-white/5 text-ink-3'}`}>
                    {v.pairing.redeemable ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>{VERIFIABILITY_LABEL[v.pairing.verifiability]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Chapter>
  );
}

export function StruckChapter({ n, edition }: { n: string; edition: Edition }) {
  const struck = edition.venues.filter((v) => v.status === 'struck');
  return (
    <Chapter
      id="struck-off"
      number={n}
      kicker="Removed"
      title="Struck off the register"
      lede="Struck off after 60 days without a launch, a dark interface, losing control of domain or keys, or failing the pairing check on review. The final score stays on record."
    >
      {struck.length === 0 ? (
        <div className="panel flex items-center gap-4 p-6 text-ink-2">
          <span className="grid size-11 place-items-center rounded-xl bg-k14/10 text-k14">
            <ShieldCheck size={20} aria-hidden />
          </span>
          <p>
            <span className="block font-bold text-ink">Clean sheet.</span>
            No venue has been struck off.
          </p>
        </div>
      ) : (
        <div className="panel overflow-x-auto p-2">
          <table className="table-ledger">
            <thead>
              <tr>
                <th scope="col">
                  <span className="inline-flex items-center gap-1.5">
                    <Ban size={13} aria-hidden /> Venue
                  </span>
                </th>
                <th scope="col" className="n">
                  Final veracity
                </th>
                <th scope="col">Band</th>
                <th scope="col">Struck off</th>
              </tr>
            </thead>
            <tbody>
              {struck.map((v) => (
                <tr key={v.id}>
                  <th scope="row" className="text-left font-mincho">
                    <Link href={`/venues/${v.id}`}>{v.name}</Link>
                  </th>
                  <td className="n">{v.veracity}</td>
                  <td>
                    <BandMark band={v.band} pill />
                  </td>
                  <td className="num">{v.struckDate ? longDate(v.struckDate) : 'date not recorded'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Chapter>
  );
}

export function DataChapter({ n, edition }: { n: string; edition: Edition }) {
  const url = `${SITE.url}/editions/${edition.edition}.json`;
  const sample = edition.venues[0];
  const excerpt = JSON.stringify(
    {
      edition: edition.edition,
      published: edition.published,
      snapshotHash: edition.snapshotHash,
      venues: [{ id: sample.id, rank: sample.rank, veracity: sample.veracity, band: sample.band, scores: sample.scores }],
    },
    null,
    2,
  );
  return (
    <Chapter
      id="data"
      number={n}
      kicker="Open data"
      title={
        <>
          Every edition is a <span className="text-gold">JSON file</span>
        </>
      }
      lede="One file per month at a permanent address. Open CORS, no key, no rate card. Null means not published."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          {[
            ['Open CORS', 'Fetch it from any site or script.'],
            ['No key', 'No sign-up, no rate card, no tracking.'],
            ['Rebuildable', 'The snapshot hash in the header lets you check the inputs.'],
          ].map(([t, d]) => (
            <SpotlightCard key={t} className="panel p-5">
              <p className="flex items-center gap-2 font-bold">
                <Database size={16} aria-hidden className="text-gold" /> {t}
              </p>
              <p className="mt-1 text-sm text-ink-2">{d}</p>
            </SpotlightCard>
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#05070d] shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-3 rounded-full bg-vermilion/80" />
              <span className="size-3 rounded-full bg-gold/80" />
              <span className="size-3 rounded-full bg-k14/80" />
            </span>
            <span className="mono truncate text-xs text-ink-3">{edition.edition}.json</span>
            <CopyButton value={url} what="edition URL" />
          </div>
          <pre className="mono overflow-x-auto p-5 text-[0.8125rem] leading-relaxed">
            <code>
              <span className="text-k14">$</span> <span className="text-ink">curl</span> <span className="text-gold">{url}</span>
              {'\n\n'}
              <span className="text-ink-2">{excerpt}</span>
            </code>
          </pre>
        </div>
      </div>
    </Chapter>
  );
}

/** Next edition, corrections and sources: the colophon, side by side. */
export function ColophonChapter({ edition, sources }: { edition: Edition; sources: SourceRegistry }) {
  return (
    <section aria-label="Colophon" className="grid gap-4 pb-8 pt-4 lg:grid-cols-3">
      <SpotlightCard as="section" className="panel p-6">
        <h2 id="next" className="flex items-center gap-2 text-2xl">
          <CalendarClock size={20} aria-hidden className="text-gold" /> Next edition
        </h2>
        <p className="mt-3 text-ink-2">
          Edition {edition.edition} is frozen. The next is due in <span className="text-ink">{nextEditionMonth(edition.edition)}</span>,
          from a fresh snapshot on the 1st: a registration review, any score moves with their evidence, and deltas against
          this edition.
        </p>
      </SpotlightCard>
      <SpotlightCard as="section" className="panel p-6">
        <h2 id="corrections" className="text-2xl">
          Corrections
        </h2>
        {edition.corrections.length === 0 ? (
          <p className="mt-3 text-ink-2">No corrections to this edition.</p>
        ) : (
          <ol className="mt-3 space-y-3">
            {edition.corrections.map((c) => (
              <li key={`${c.date}-${c.note}`}>
                <p className="num text-sm text-ink-3">{longDate(c.date)}</p>
                <p>{c.note}</p>
                <p className="text-sm text-ink-2">
                  Was <span className="line-through">{c.originalFigure}</span>. Signed off by {c.signedBy.join(' and ')}.
                </p>
              </li>
            ))}
          </ol>
        )}
      </SpotlightCard>
      <SpotlightCard as="section" className="panel p-6">
        <h2 id="sources" className="flex items-center gap-2 text-2xl">
          <ScrollText size={20} aria-hidden className="text-gold" /> Sources
        </h2>
        <ul className="mt-3 space-y-1.5">
          {Object.entries(sources).map(([id, s]) => (
            <li key={id} className="flex items-baseline justify-between gap-3">
              <a href={s.url} rel="noreferrer">
                {s.name}
              </a>
              <span className="mono text-xs text-ink-3">{s.type}</span>
            </li>
          ))}
        </ul>
        <h3 className="mt-5 font-gothic text-sm font-bold uppercase tracking-wider text-ink-3">Disclosures</h3>
        <ul className="mt-2 space-y-2 text-sm text-ink-2">
          {edition.disclosures.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </SpotlightCard>
    </section>
  );
}
