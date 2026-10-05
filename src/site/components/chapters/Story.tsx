import { Braces, Eye, Plus, Scale, Shuffle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { HALLMARK } from '../../../scoring/veracity';
import type { Edition } from '../../../types';
import Hanko from '../../art/Hanko';
import SpotlightCard from '../../reactbits/SpotlightCard';
import BandMark, { BAND_COLOR } from '../BandMark';
import Chapter from '../Chapter';
import SniffTest from '../SniffTest';

const BAND_ROWS = [
  { band: '22k' as const, from: 916, to: 1000, note: 'Top of the scale. No venue is expected here yet.' },
  { band: '18k' as const, from: 750, to: 915, note: 'High veracity. Nothing in the register clears it today.' },
  { band: '14k' as const, from: 585, to: 749, note: 'Where the current leaders sit.' },
  { band: '9k' as const, from: HALLMARK, to: 584, note: 'At or above the hallmark: certified.' },
  { band: 'below-hallmark' as const, from: 0, to: HALLMARK - 1, note: 'Listed for scrutiny, not certified.' },
];

export function BandsChapter({ n, edition }: { n: string; edition: Edition }) {
  const venues = edition.venues.filter((v) => v.status !== 'prelaunch' && v.status !== 'struck');
  const segments = [...BAND_ROWS].reverse();
  return (
    <Chapter
      id="bands"
      number={n}
      kicker="Karat"
      title={
        <>
          Scored like <span className="text-gold">gold</span>
        </>
      }
      lede="The cut points are real gold standards. 916 parts in a thousand is 22 karat; 375 is 9 karat, the lowest standard an assay office will hallmark. Every venue lands somewhere on this bar."
    >
      {/* The scale, with every venue plotted on it. */}
      <div className="panel p-6 sm:p-8">
        <div className="relative pb-16 pt-14">
          <div className="flex h-4 overflow-hidden rounded-full">
            {segments.map((s) => (
              <span
                key={s.band}
                className="h-full"
                style={{
                  width: `${((s.to - s.from + 1) / 1001) * 100}%`,
                  background: `linear-gradient(90deg, color-mix(in srgb, ${BAND_COLOR[s.band].swatch} 35%, transparent), ${BAND_COLOR[s.band].swatch})`,
                }}
                title={`${s.band}: ${s.from} to ${s.to}`}
              />
            ))}
          </div>
          {/* hallmark marker */}
          <div className="absolute bottom-6 top-6 w-0.5 bg-vermilion shadow-[0_0_14px_rgba(255,90,69,0.9)]" style={{ left: `${(HALLMARK / 1000) * 100}%` }}>
            <span className="num absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-vermilion/15 px-2 text-xs font-bold text-vermilion-ink">
              Hallmark {HALLMARK}
            </span>
          </div>
          {/* venues */}
          {venues.map((v, i) => (
            <div key={v.id} className="group absolute top-0 -translate-x-1/2" style={{ left: `${(v.veracity / 1000) * 100}%`, top: `${i % 2 === 0 ? 0 : 1.6}rem` }}>
              <span
                className="block size-3.5 rounded-full border-2 border-paper"
                style={{ background: BAND_COLOR[v.band].swatch, boxShadow: `0 0 12px ${BAND_COLOR[v.band].swatch}` }}
                title={`${v.name}: ${v.veracity}`}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-paper-deep px-2 py-0.5 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {v.name} <span className="num text-gold">{v.veracity}</span>
              </span>
            </div>
          ))}
          <div className="num absolute inset-x-0 bottom-0 flex justify-between text-xs text-ink-3">
            {[0, 250, 500, 750, 1000].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {BAND_ROWS.map((r) => (
            <li key={r.band} className={`rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 ${r.band === 'below-hallmark' ? 'border-vermilion/30' : ''}`}>
              <BandMark band={r.band} pill />
              <p className="num mt-3 font-mincho text-xl font-bold">
                {r.band === 'below-hallmark' ? `under ${HALLMARK}` : `${r.from} to ${r.to}`}
              </p>
              <p className="mt-1 text-sm text-ink-2">{r.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </Chapter>
  );
}

export function SniffChapter({ n }: { n: string }) {
  return (
    <Chapter
      id="sniff-test"
      number={n}
      kicker="Try it"
      title="The sniff test"
      lede="Most venues that trade stock tokens say a real share stands behind each one. Drag to see what the gap between claim and pool does to a score. Watch Hanko's ears."
    >
      <SpotlightCard className="panel p-6 sm:p-10" spotlightColor="rgba(255, 90, 69, 0.14)">
        <SniffTest />
      </SpotlightCard>
    </Chapter>
  );
}

const STEPS = [
  {
    pose: 'fetch' as const,
    title: 'Fetch',
    body: 'On the first of the month a job pulls every published figure: volume, fees, pool depth, and whether each contract is verified. Anything unpublished stays empty, never a guess or a zero. The raw pull is saved and hashed.',
  },
  {
    pose: 'judge' as const,
    title: 'Judge',
    body: 'Five criteria, 0 to 10 each. A score moves at most one point a month, only on new public evidence written into its rationale. An AI reviewer may propose; the code clamps it; two people sign off.',
  },
  {
    pose: 'stamp-down' as const,
    title: 'Freeze',
    body: 'House weights turn five scores into one number out of 1000. Venues are ranked, compared with last month, and frozen into an edition that never changes. Mistakes get a dated correction, original left in view.',
  },
];

export function MadeChapter({ n }: { n: string }) {
  return (
    <Chapter id="how-it-is-made" number={n} kicker="Process" title="How an edition is made">
      <ol className="relative grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <SpotlightCard key={s.title} as="li" className="panel lift flex flex-col p-6">
            <div className="relative mx-auto grid h-36 w-full place-items-center">
              <div aria-hidden className="absolute size-28 rounded-full bg-[radial-gradient(circle,rgba(242,193,78,0.25),transparent_70%)]" />
              <Hanko pose={s.pose} mood="calm" className={`relative h-full w-auto ${s.pose === 'judge' ? 'max-w-[190px]' : ''}`} />
            </div>
            <p className="mono mt-4 text-sm text-gold">Step {i + 1}</p>
            <h3 className="mt-1 text-2xl">{s.title}</h3>
            <p className="mt-2 text-ink-2">{s.body}</p>
          </SpotlightCard>
        ))}
      </ol>
    </Chapter>
  );
}

const USES = [
  {
    icon: Eye,
    title: 'Read the gap',
    body: 'Open any entry to see what backs its pairs, who holds it, and whether you can check. The asset score is where memecoin launchpads and real stock venues part ways.',
  },
  {
    icon: TrendingUp,
    title: 'Follow the deltas',
    body: 'Every edition shows how far each venue moved since the last, always at house weights, so a move means the evidence changed, not the arithmetic.',
  },
  {
    icon: Shuffle,
    title: 'Reweigh and share',
    body: "Care more about compliance than volume? Say so on the judge's sheet. The link updates as you go, and whoever opens it sees your order instantly.",
  },
  {
    icon: Braces,
    title: 'Pull the JSON',
    body: 'Every edition is a plain file at a fixed address. Open CORS, no key. Rebuild the scores yourself; the arithmetic is on the method page.',
  },
];

export function UsesChapter({ n }: { n: string }) {
  return (
    <Chapter id="uses" number={n} kicker="Use it" title="What you can do with it">
      <div className="grid gap-4 md:grid-cols-2">
        {USES.map((u) => (
          <SpotlightCard key={u.title} className="panel lift p-7">
            <span className="grid size-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <u.icon size={20} aria-hidden />
            </span>
            <h3 className="mt-5 text-2xl">{u.title}</h3>
            <p className="mt-2 text-ink-2">{u.body}</p>
          </SpotlightCard>
        ))}
      </div>
      <p className="mt-6 text-ink-3">
        Full rules on the{' '}
        <Link href="/method" className="text-gold">
          method page
        </Link>
        .
      </p>
    </Chapter>
  );
}

const LIMITS = [
  {
    title: 'These are judgements, not measurements.',
    body: "Five scores out of ten are an editor's reading of public evidence. The rules about when a score may move keep it honest, but don't make it a meter.",
  },
  {
    title: "What isn't published can't be scored up.",
    body: 'A venue that hides its volume gets no zero and no guess. Its figures say "not published", and the scores lean on what can be seen.',
  },
  {
    title: 'On-chain volume can be faked.',
    body: 'Wash trading inflates traction. We read volume next to fees and pool depth, but a determined venue can still flatter itself for a month.',
  },
  {
    title: 'We check the claim, not the custodian.',
    body: "When a venue names a regulated issuer, we record who and where. We don't audit the issuer. Not an audit, not a rating, not advice.",
  },
];

export function LimitsChapter({ n }: { n: string }) {
  return (
    <Chapter id="limits" number={n} kicker="Fine print" title="What these scores don't claim">
      <ol className="grid gap-4 md:grid-cols-2">
        {LIMITS.map((l, i) => (
          <li key={l.title} className="panel flex gap-5 p-6">
            <span className="mono text-3xl font-medium text-gold/40">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="font-gothic text-lg font-bold">{l.title}</h3>
              <p className="mt-1.5 text-ink-2">{l.body}</p>
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
    a: "Because gold is measured that way. Fineness is parts per thousand, and the karat bands fall at fixed points on that scale. A venue's veracity reads the same way: how much of what it claims is true.",
  },
  {
    q: 'What does the hallmark at 375 mean?',
    a: "It is the line between listed and certified. Venues below it stay in the register so readers can watch them, but they don't carry Hanko's seal.",
  },
  {
    q: 'How is the backing checked?',
    a: "From what the venue and its custodian publish: verified contracts on the explorer, custodian statements, inventory you can read on-chain. Where we can't check, the entry says so.",
  },
  {
    q: 'Can a venue pay to move up?',
    a: 'No. Nobody pays for inclusion, placement or removal, and there are no affiliate or referral links in any edition.',
  },
  {
    q: 'Why a Shiba?',
    a: "The Shiba is the internet's memecoin dog. Hanko is the one who doesn't launch memecoins: he checks whether there's a real asset behind the ones that claim it, and stamps the papers when there is. His name is the Japanese word for a personal seal.",
  },
];

export function FaqChapter({ n }: { n: string }) {
  return (
    <Chapter id="faq" number={n} kicker="FAQ" title="Questions">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="panel group px-6 py-4 transition-colors open:border-gold/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-mincho text-xl font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 text-gold transition-transform group-open:rotate-45">
                  <Plus size={16} />
                </span>
              </summary>
              <p className="measure mt-3 text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="relative mx-auto w-56 lg:w-full">
          <div aria-hidden className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(224,138,69,0.35),transparent_65%)] blur-xl" />
          <Hanko pose="sit" mood="calm" certificate title="Hanko inspecting a certificate" className="relative h-auto w-full" />
          <p className="relative mt-2 flex items-center justify-center gap-2 text-sm text-ink-3">
            <Scale size={14} aria-hidden /> Hanko, chief inspector
          </p>
        </div>
      </div>
    </Chapter>
  );
}
