import { Ban, CalendarClock, Database, FileCheck, ScrollText } from 'lucide-react';
import Link from 'next/link';
import { CRITERIA, HALLMARK } from '../../../scoring/veracity';
import type { Edition, SourceRegistry, Venue } from '../../../types';
import { SITE } from '../../config';
import { CRITERION_INFO } from '../../lib/criteria';
import { ASSET_TYPE_LABEL, longDate, nextEditionMonth, pct, VERIFIABILITY_LABEL } from '../../lib/format';
import BandMark from '../BandMark';
import Chapter from '../Chapter';
import CopyButton from '../CopyButton';

const listed = (venues: Venue[]) => venues.filter((v) => v.status !== 'prelaunch' && v.status !== 'struck');

export function MatrixChapter({ n, edition }: { n: string; edition: Edition }) {
  const venues = listed(edition.venues);
  return (
    <Chapter id="criteria" number={n} title="Criteria matrix" lede="Every venue on every criterion, out of 10. House weights in the column heads.">
      <div className="overflow-x-auto">
        <table className="table-ledger min-w-[40rem]">
          <thead>
            <tr>
              <th scope="col">Venue</th>
              {CRITERIA.map((c) => (
                <th key={c} scope="col" className="n">
                  {CRITERION_INFO[c].label}
                  <span className="block text-xs font-normal text-ink-3">{pct(edition.houseWeights[c])}</span>
                </th>
              ))}
              <th scope="col" className="n">
                Veracity
              </th>
            </tr>
          </thead>
          <tbody>
            {venues.map((v) => (
              <tr key={v.id} className={v.veracity < HALLMARK ? 'text-below-ink' : ''}>
                <th scope="row" className="py-2.5 pr-3 text-left font-mincho font-bold">
                  <Link href={`/venues/${v.id}`} className="no-underline hover:underline">
                    {v.name}
                  </Link>
                </th>
                {CRITERIA.map((c) => (
                  <td key={c} className="n">
                    {v.scores[c]}
                  </td>
                ))}
                <td className="n font-mincho font-bold">{v.veracity}</td>
              </tr>
            ))}
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
      title="Custody and papers"
      lede="Who holds what backs each venue's pairs, where they answer to a regulator, whether a holder can redeem, and how anyone can check."
    >
      <div className="overflow-x-auto">
        <table className="table-ledger min-w-[44rem]">
          <thead>
            <tr>
              <th scope="col">
                <span className="inline-flex items-center gap-1.5">
                  <FileCheck size={14} aria-hidden /> Venue
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
                <th scope="row" className="py-2.5 pr-3 text-left font-mincho font-bold">
                  {v.name}
                </th>
                <td>{ASSET_TYPE_LABEL[v.pairing.assetType]}</td>
                <td className={v.pairing.custodian ? '' : 'text-ink-3'}>{v.pairing.custodian ?? 'not published'}</td>
                <td className={v.pairing.jurisdiction ? '' : 'text-ink-3'}>{v.pairing.jurisdiction ?? 'not published'}</td>
                <td>{v.pairing.redeemable ? 'Yes' : 'No'}</td>
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
      title="Struck off the register"
      lede="A venue is struck off after 60 days without a launch, a dark interface, losing control of its domain or keys, or failing the pairing check on review. Its final score stays on record."
    >
      {struck.length === 0 ? (
        <p className="flex items-center gap-2 text-ink-2">
          <Ban size={16} aria-hidden /> No venue has been struck off.
        </p>
      ) : (
        <table className="table-ledger">
          <thead>
            <tr>
              <th scope="col">Venue</th>
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
                <th scope="row" className="py-2.5 pr-3 text-left font-mincho">
                  <Link href={`/venues/${v.id}`}>{v.name}</Link>
                </th>
                <td className="n">{v.veracity}</td>
                <td>
                  <BandMark band={v.band} />
                </td>
                <td className="num">{v.struckDate ? longDate(v.struckDate) : 'date not recorded'}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
      title="Data"
      lede="Each edition is one JSON file at a permanent address. Open CORS, no key, no rate card. Null means not published."
    >
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Database size={16} aria-hidden className="text-ink-2" />
        <a href={`/editions/${edition.edition}.json`} className="num break-all text-ink">
          {url}
        </a>
        <CopyButton value={url} what="edition URL" />
      </p>
      {/* No monospace anywhere: code is set in the gothic with tabular figures. */}
      <pre className="num mt-4 overflow-x-auto border-l-2 border-grid bg-paper-deep/60 py-3 pl-4 pr-3 font-gothic text-[0.8125rem] leading-relaxed text-ink">
        <code className="font-gothic">{`curl ${url}\n\n${excerpt}`}</code>
      </pre>
      <p className="mt-2 text-sm text-ink-3">
        Excerpt. The full file carries every venue with its rationale, pairing, figures, contracts and deltas.
      </p>
    </Chapter>
  );
}

export function NextChapter({ n, edition }: { n: string; edition: Edition }) {
  return (
    <Chapter id="next" number={n} title="Next edition">
      <p className="measure flex gap-2 text-ink-2">
        <CalendarClock size={18} aria-hidden className="mt-1 shrink-0" />
        <span>
          Edition {edition.edition} is frozen. The next edition is due in {nextEditionMonth(edition.edition)}, built
          from a fresh snapshot on the first of the month. It brings a registration review against the four conditions,
          any score moves with their evidence, and deltas against this edition.
        </span>
      </p>
    </Chapter>
  );
}

export function CorrectionsChapter({ n, edition }: { n: string; edition: Edition }) {
  return (
    <Chapter id="corrections" number={n} title="Corrections">
      {edition.corrections.length === 0 ? (
        <p className="text-ink-2">No corrections to this edition.</p>
      ) : (
        <ol className="ledger">
          {edition.corrections.map((c) => (
            <li key={`${c.date}-${c.note}`} className="py-3">
              <p className="num text-sm text-ink-3">{longDate(c.date)}</p>
              <p className="text-ink">{c.note}</p>
              <p className="text-sm text-ink-2">
                Originally published as <span className="line-through">{c.originalFigure}</span>. Signed off by{' '}
                {c.signedBy.join(' and ')}.
              </p>
            </li>
          ))}
        </ol>
      )}
    </Chapter>
  );
}

export function SourcesChapter({ n, edition, sources }: { n: string; edition: Edition; sources: SourceRegistry }) {
  return (
    <Chapter id="sources" number={n} title="Sources and disclosures">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="mb-2 flex items-center gap-2 font-gothic text-base font-bold">
            <ScrollText size={16} aria-hidden /> Disclosures
          </h3>
          <ul className="space-y-2 text-ink-2">
            {edition.disclosures.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-gothic text-base font-bold">Sources</h3>
          <ul className="space-y-1.5">
            {Object.entries(sources).map(([id, s]) => (
              <li key={id} className="text-ink-2">
                <a href={s.url} rel="noreferrer" className="text-ink">
                  {s.name}
                </a>
                <span className="ml-2 text-sm text-ink-3">{s.type}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Chapter>
  );
}

