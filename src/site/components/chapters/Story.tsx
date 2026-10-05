import { Award } from 'lucide-react';
import Link from 'next/link';
import { HALLMARK } from '../../../scoring/veracity';
import Hanko from '../../art/Hanko';
import BandMark from '../BandMark';
import Chapter from '../Chapter';
import SniffTest from '../SniffTest';

export function SniffChapter({ n }: { n: string }) {
  return (
    <Chapter
      id="sniff-test"
      number={n}
      title="The sniff test"
      lede="Most venues that trade stock tokens say a real share stands behind each one. The register asks how much of that is true. Drag to see what the gap does to a score."
    >
      <SniffTest />
    </Chapter>
  );
}

const STEPS = [
  {
    pose: 'fetch' as const,
    title: 'Fetch',
    body: 'On the first of the month a job pulls every published figure: volume, fees, pool depth, and whether each contract is verified on the explorer. A figure that isn’t published stays empty. It is never filled with a guess or a zero. The raw pull is saved as a dated snapshot and hashed.',
  },
  {
    pose: 'judge' as const,
    title: 'Judge',
    body: 'Each venue is scored 0 to 10 on five criteria. A score moves at most one point a month, and only on new public evidence that is written into the rationale. An AI reviewer may propose moves; the code clamps anything outside the rule, and two people sign off.',
  },
  {
    pose: 'stamp-down' as const,
    title: 'Freeze',
    body: 'House weights turn the five scores into one number from 0 to 1000. The venues are ranked, compared with last month at house weights, and frozen into an edition that never changes. Mistakes get a dated correction with the original left in view.',
  },
];

export function MadeChapter({ n }: { n: string }) {
  return (
    <Chapter id="how-it-is-made" number={n} title="How an edition is made">
      <ol className="ledger">
        {STEPS.map((s, i) => (
          <li key={s.title} className="grid items-center gap-x-8 gap-y-3 py-6 sm:grid-cols-[150px_1fr]">
            <Hanko pose={s.pose} mood="calm" className={`h-auto ${s.pose === 'judge' ? 'w-[150px]' : 'w-[110px]'}`} />
            <div>
              <h3 className="flex items-baseline gap-3 text-xl">
                <span className="num font-gothic text-base font-normal text-ink-3">{i + 1}</span>
                {s.title}
              </h3>
              <p className="measure mt-2 text-ink-2">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Chapter>
  );
}

export function UsesChapter({ n }: { n: string }) {
  return (
    <Chapter id="uses" number={n} title="What you can do with it">
      <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg">Read the gap</h3>
          <p className="mt-1.5 text-ink-2">
            Open any entry to see what backs its pairs, who holds it, and whether you can check. The asset score is where
            the memecoin launchpads and the real stock venues part ways.
          </p>
        </div>
        <div>
          <h3 className="text-lg">Follow the deltas</h3>
          <p className="mt-1.5 text-ink-2">
            Every edition shows how far each venue moved since the last one, always at house weights, so a move means
            the evidence changed, not the arithmetic.
          </p>
        </div>
        <div>
          <h3 className="text-lg">Reweigh and share</h3>
          <p className="mt-1.5 text-ink-2">
            If you care more about compliance than volume, say so on the judge&apos;s sheet. The link updates as you go,
            and whoever opens it sees your order before the page has even loaded its scripts.
          </p>
        </div>
        <div>
          <h3 className="text-lg">Pull the JSON</h3>
          <p className="mt-1.5 text-ink-2">
            Every edition is a plain file at a fixed address, with open CORS and no key. Rebuild the scores yourself; the
            arithmetic is on the <Link href="/method">method</Link> page.
          </p>
        </div>
      </div>
    </Chapter>
  );
}

const BAND_ROWS = [
  { band: '22k' as const, range: '916 to 1000', note: 'Top of the scale. No venue is expected here yet.' },
  { band: '18k' as const, range: '750 to 915', note: 'High veracity. Nothing in the register clears it today.' },
  { band: '14k' as const, range: '585 to 749', note: 'Where the current leaders sit.' },
  { band: '9k' as const, range: '375 to 584', note: 'At or above the hallmark: certified.' },
  { band: 'below-hallmark' as const, range: 'under 375', note: 'Listed for scrutiny, not certified.' },
];

export function BandsChapter({ n }: { n: string }) {
  return (
    <Chapter
      id="bands"
      number={n}
      title="Bands"
      lede={
        <>
          The cut points are real gold standards. 916 parts in a thousand is 22 karat; 375 is 9 karat, the lowest
          standard an assay office will hallmark. Veracity uses the same line.
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="table-ledger min-w-[30rem]">
          <thead>
            <tr>
              <th scope="col">
                <span className="inline-flex items-center gap-1.5">
                  <Award size={14} aria-hidden /> Band
                </span>
              </th>
              <th scope="col">Veracity</th>
              <th scope="col">What it means</th>
            </tr>
          </thead>
          <tbody>
            {BAND_ROWS.map((r) => (
              <tr key={r.band} className={r.band === 'below-hallmark' ? 'border-t-2 border-vermilion' : ''}>
                <td>
                  <BandMark band={r.band} />
                </td>
                <td className="num whitespace-nowrap">{r.range}</td>
                <td className="text-ink-2">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-vermilion-ink">The vermilion rule is the hallmark, {HALLMARK}.</p>
    </Chapter>
  );
}

const LIMITS = [
  {
    title: 'These are judgements, not measurements.',
    body: 'Five scores out of ten are an editor’s reading of public evidence. The rules about when a score may move keep that reading honest, but they don’t make it a meter.',
  },
  {
    title: 'What isn’t published can’t be scored up.',
    body: 'A venue that hides its volume isn’t penalised with a zero, and it isn’t rewarded with a guess. Its figures say "not published", and the scores lean on what can be seen.',
  },
  {
    title: 'On-chain volume can be faked.',
    body: 'Wash trading inflates traction. We read volume next to fees and pool depth, but a determined venue can still flatter its numbers for a month.',
  },
  {
    title: 'We check the claim, not the custodian.',
    body: 'When a venue says a regulated issuer holds the shares, we record who and where. We don’t audit the issuer. Not an audit, not a rating, not investment advice.',
  },
];

export function LimitsChapter({ n }: { n: string }) {
  return (
    <Chapter id="limits" number={n} title="What these scores don't claim">
      <ol className="grid gap-x-12 gap-y-6 md:grid-cols-2">
        {LIMITS.map((l, i) => (
          <li key={l.title} className="grid grid-cols-[1.5rem_1fr] gap-x-2">
            <span className="num text-ink-3">{i + 1}</span>
            <div>
              <h3 className="font-gothic text-base font-bold">{l.title}</h3>
              <p className="mt-1 text-ink-2">{l.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Chapter>
  );
}

const FAQ = [
  {
    q: 'Why a score out of 1000?',
    a: 'Because gold is measured that way. Fineness is parts per thousand, and the karat bands fall at fixed points on that scale. A venue’s veracity reads the same way: how much of what it claims is true, in parts per thousand.',
  },
  {
    q: 'What does the hallmark at 375 mean?',
    a: 'It is the line between listed and certified. Venues below it stay in the register so readers can watch them, but they don’t carry Hanko’s seal.',
  },
  {
    q: 'How is the backing checked?',
    a: 'From what the venue and its custodian publish: verified contracts on the explorer, custodian statements, inventory you can read on-chain. Where we can’t check, the entry says so.',
  },
  {
    q: 'Can a venue pay to move up?',
    a: 'No. Nobody pays for inclusion, placement or removal, and there are no affiliate or referral links in any edition.',
  },
  {
    q: 'Why a Shiba?',
    a: 'The Shiba is the internet’s memecoin dog. Hanko is the one who doesn’t launch memecoins: he checks whether there’s a real asset behind the ones that claim it, and stamps the papers when there is. His name is the Japanese word for a personal seal.',
  },
];

export function FaqChapter({ n }: { n: string }) {
  return (
    <Chapter id="faq" number={n} title="Questions">
      <div className="grid gap-10 lg:grid-cols-[1fr_180px]">
        <div className="ledger border-y border-grid-soft">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-3">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 font-mincho text-lg font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="font-gothic text-ink-3 group-open:hidden">
                  +
                </span>
                <span aria-hidden className="hidden font-gothic text-ink-3 group-open:inline">
                  −
                </span>
              </summary>
              <p className="measure mt-2 text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
        <Hanko pose="sit" mood="calm" certificate title="Hanko inspecting a certificate" className="mx-auto h-auto w-40 lg:w-full" />
      </div>
    </Chapter>
  );
}
