import { Scale } from 'lucide-react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CRITERIA, HALLMARK, HOUSE_WEIGHTS } from '../../src/scoring/veracity';
import { STANDARD_FROM, WATCHLIST_SPLIT_AT } from '../../src/build/admission';
import BandMark from '../../src/site/components/BandMark';
import Book from '../../src/site/components/Book';
import PageHead from '../../src/site/components/PageHead';
import { LATEST_EDITION } from '../../src/site/editions';
import { CRITERION_INFO } from '../../src/site/lib/criteria';
import { pct } from '../../src/site/lib/format';

export const metadata: Metadata = {
  title: 'Method',
  description: 'How the Veracity register scores, ranks, admits and strikes off tokenized-stock venues.',
};

const SECTIONS = [
  { id: 'score', label: 'The score' },
  { id: 'bands', label: 'Bands and the hallmark' },
  { id: 'standard', label: 'Registration standard' },
  { id: 'struck', label: 'Struck off' },
  { id: 'puppies', label: 'Puppies' },
  { id: 'off-chain', label: 'Off-chain venues' },
  { id: 'nulls', label: 'Missing figures' },
  { id: 'policy', label: 'When a score may move' },
  { id: 'corrections', label: 'Corrections' },
  { id: 'month', label: 'The month' },
  { id: 'integrity', label: 'Integrity' },
];

function Part({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const label = SECTIONS.find((s) => s.id === id);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid gap-6 border-t border-white/[0.07] py-12 lg:grid-cols-[16rem_1fr]">
      <div>
        <p className="chapter-tag">{String(SECTIONS.indexOf(label!) + 1).padStart(2, '0')}</p>
        <h2 id={`${id}-title`} className="mt-4 text-3xl">
          {title}
        </h2>
      </div>
      <div className="measure space-y-4 text-lg text-ink-2 [&_strong]:font-bold [&_strong]:text-ink [&_table]:text-base">{children}</div>
    </section>
  );
}

/** The standing methodology. Every edition is built by these rules. */
export default function MethodPage() {
  return (
    <Book contents={SECTIONS.map((s) => ({ href: `#${s.id}`, label: s.label }))} edition={LATEST_EDITION.edition}>
      <PageHead
        crumbs={[['method']]}
        kicker="Standing rules"
        title={
          <>
            How the <span className="text-gold">assay</span> works
          </>
        }
        lede="The rules every edition is built by. Scores are editorial judgements on public information. Veracity is not an audit, a credit rating or investment advice."
        aside={
          <span className="hidden size-20 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold lg:grid">
            <Scale size={34} aria-hidden />
          </span>
        }
      />

      <Part id="score" title="The score">
        <p>
          Each venue gets a whole-number score from 0 to 10 on five criteria. House weights turn them into one figure:
          the weighted mean, multiplied by 100 and rounded once at the very end. That gives a veracity from 0 to 1000,
          read like the fineness of gold, in parts per thousand.
        </p>
        <table className="table-ledger panel">
          <thead>
            <tr>
              <th scope="col">Criterion</th>
              <th scope="col">What it asks</th>
              <th scope="col" className="n">
                House weight
              </th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c) => (
              <tr key={c}>
                <td className="font-bold text-ink">{CRITERION_INFO[c].label}</td>
                <td>{CRITERION_INFO[c].question}</td>
                <td className="n">{pct(HOUSE_WEIGHTS[c])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Weights must add up to one or the build stops. When two venues tie, they are ordered alphabetically, so a
          rebuild always gives the same order. A reader can reweigh the register on the judge&apos;s sheet; if every
          slider is at zero, the five criteria count equally.
        </p>
      </Part>

      <Part id="bands" title="Bands and the hallmark">
        <p>The bands are the gold standards an assay office uses.</p>
        <ul className="space-y-1.5">
          <li>
            <BandMark band="22k" /> from 916
          </li>
          <li>
            <BandMark band="18k" /> from 750
          </li>
          <li>
            <BandMark band="14k" /> from 585
          </li>
          <li>
            <BandMark band="9k" /> from {HALLMARK}
          </li>
          <li>
            <BandMark band="below-hallmark" /> under {HALLMARK}
          </li>
        </ul>
        <p>
          <strong>The hallmark is {HALLMARK}.</strong> A venue at or above it is certified and carries Hanko&apos;s
          seal. A venue below it stays in the register so readers can watch it, but it is listed, not certified.
        </p>
        <p>
          Month-on-month movement is always measured at house weights. Reweighing the register changes the order you
          see, never the published change.
        </p>
      </Part>

      <Part id="standard" title="Registration standard">
        <p>
          From Edition 02 ({STANDARD_FROM}), a venue is registered when all four of these hold at the data date:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>A contract deployed on a public chain and verified on that chain&apos;s explorer.</li>
          <li>A pairing asset that claims real-world backing, or a launch mechanic that sends value to one.</li>
          <li>At least one completed public launch or a live market.</li>
          <li>A public interface or documentation on a domain the operator controls.</li>
        </ol>
        <p>
          Edition 01 listed every venue that could be found, before the standard existed. Those venues are reviewed
          against it from Edition 02 on.
        </p>
      </Part>

      <Part id="struck" title="Struck off">
        <p>A venue is struck off the register after any of these:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>60 days without a launch;</li>
          <li>a public interface that goes dark;</li>
          <li>losing control of its domain or its keys;</li>
          <li>failing the pairing condition on review.</li>
        </ul>
        <p>
          A venue that fails the pairing condition is struck off rather than scored low. It was never in the category,
          and scoring it would bend the scale for everyone else. Its final score and the date stay on record.
        </p>
      </Part>

      <Part id="puppies" title="Puppies">
        <p>
          A venue registered before it has a completed launch is a puppy. It is listed, but it has no score, no band and
          no rank, because an absent market is not the same thing as a bad one. A puppy gets its first score in the
          edition after its first live market.
        </p>
      </Part>

      <Part id="off-chain" title="Off-chain venues">
        <p>
          Venues on chains other than Robinhood Chain rank in the same register, marked off-chain. Once there are{' '}
          {WATCHLIST_SPLIT_AT} of them, the register splits into a Robinhood Chain register and a watchlist.
        </p>
      </Part>

      <Part id="nulls" title="Missing figures">
        <p>
          A figure nobody has published is recorded as null and shown as &ldquo;not published&rdquo;. It is never a
          zero and never an estimate. Every published figure carries the id of its source, and the build stops if a
          source id isn&apos;t in the source list.
        </p>
        <p>
          A gap in this month&apos;s data doesn&apos;t erase last month&apos;s figure: a fresh null never overwrites a
          number that was published before. A fresh number always replaces the old one.
        </p>
      </Part>

      <Part id="policy" title="When a score may move">
        <p>
          <strong>No evidence, no move.</strong> A criterion changes only on new public evidence: a document, a
          verified contract, a completed launch, a licence, an incident. The evidence is written into that
          criterion&apos;s rationale in the edition where the score moves.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>At most one point per criterion per edition. A major event (a lost licence, a dark interface, lost keys) may move further, with a written reason from both reviewers.</li>
          <li>A score that doesn&apos;t move needs no new words. The standing rationale carries forward.</li>
          <li>Every moved score is signed off by two reviewers.</li>
          <li>In Editions 02 and 03 the baseline is still settling: one-point moves are allowed on judgement alone, marked &ldquo;calibration&rdquo; in the rationale. From Edition 04 the full rule applies.</li>
        </ul>
        <p>
          An AI reviewer may propose moves each month. The code checks every proposal: whole numbers only, one point at
          most, new rationale for every move, known venues only. Anything else is dropped, and an unreadable reply
          means the previous edition carries forward unchanged.
        </p>
      </Part>

      <Part id="corrections" title="Corrections">
        <p>
          Published editions are never edited. An error in a figure, score, band, rank or source is fixed with a dated
          correction note, the original figure kept in view, and two reviewer sign-offs. Corrections apply to the
          latest and the previous edition; older history stands. Typos are fixed quietly in the next edition.
        </p>
      </Part>

      <Part id="month" title="The month">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Day 1, 05:00 UTC: the data pull runs and writes a dated, hashed snapshot.</li>
          <li>Days 2 and 3: registration review against the four conditions.</li>
          <li>Days 4 to 6: score review. Every move cited, two sign-offs.</li>
          <li>Day 7: the edition freezes. Its snapshot hash and the deltas are recorded.</li>
          <li>Day 8: the page and the JSON are published.</li>
        </ol>
      </Part>

      <Part id="integrity" title="Integrity">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>No venue pays for inclusion, placement or removal.</li>
          <li>No affiliate or referral links, anywhere in an edition.</li>
          <li>Same inputs, same scores: every edition can be rebuilt from its snapshot, byte for byte.</li>
          <li>
            The JSON for every edition is public, with open CORS and no key. See the{' '}
            <a href={`/editions/${LATEST_EDITION.edition}.json`}>latest file</a>.
          </li>
        </ul>
      </Part>
    </Book>
  );
}
