import { ArrowDown, Braces, Hash } from 'lucide-react';
import { HALLMARK } from '../../scoring/veracity';
import type { Edition } from '../../types';
import Hanko from '../art/Hanko';
import Seal from '../art/Seal';
import { editionMonth, shortDate, shortHash } from '../lib/format';
import Aurora from '../reactbits/Aurora';
import CountUp from '../reactbits/CountUp';
import DecryptedText from '../reactbits/DecryptedText';
import ShinyText from '../reactbits/ShinyText';
import SplitText from '../reactbits/SplitText';
import SpotlightCard from '../reactbits/SpotlightCard';
import StarBorder from '../reactbits/StarBorder';
import BandMark from './BandMark';
import CopyButton from './CopyButton';
import StampMoment from './StampMoment';

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

/** The headline finding, as Fineness: does anything clear 18 karat? */
export function headlineFinding(edition: Edition): string {
  const ranked = edition.venues.filter((v) => v.status !== 'prelaunch' && v.status !== 'struck');
  const peak = Math.max(0, ...ranked.map((v) => v.veracity));
  if (peak >= 916) return 'A venue in this register clears 22 karat.';
  if (peak >= 750) return 'A venue in this register clears 18 karat.';
  return 'Nothing in this register clears 18 karat.';
}

interface EditionHeadProps {
  edition: Edition;
  isLatest: boolean;
}

/** The hero: the claim, the finding, Hanko stamping this edition's seal, and the numbers. */
export default function EditionHead({ edition, isLatest }: EditionHeadProps) {
  const ranked = edition.venues.filter((v) => v.status !== 'prelaunch' && v.status !== 'struck');
  const below = ranked.filter((v) => v.veracity < HALLMARK).length;
  const top = [...ranked].sort((a, b) => b.veracity - a.veracity)[0];
  const stats = [
    { label: 'Venues scored', value: ranked.length, note: `across ${new Set(ranked.map((v) => v.chain)).size} chains` },
    { label: 'Median veracity', value: median(ranked.map((v) => v.veracity)), note: 'out of 1000' },
    { label: 'Top score', value: top?.veracity ?? 0, note: top?.name ?? '' },
    { label: 'Below hallmark', value: below, note: `under ${HALLMARK}` },
  ];

  return (
    <header className="relative isolate pb-10 pt-14 lg:pt-20">
      {/* The aurora: molten gold into vermilion, behind the fold only. */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-4rem] -z-10 h-[760px] w-screen -translate-x-1/2 opacity-80 [mask-image:linear-gradient(to_bottom,black_35%,transparent)]">
        <Aurora colorStops={['#B7791F', '#FF5A45', '#F2C14E']} amplitude={1.1} blend={0.55} speed={0.6} />
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-ink-2 backdrop-blur">
            <span className="size-2 animate-pulse-dot rounded-full bg-k14" aria-hidden />
            Edition {edition.edition} {isLatest ? 'is live' : 'archived'}
            <span className="text-ink-3">·</span> {editionMonth(edition.edition)}
          </p>

          <h1 className="mt-6 text-[clamp(2.4rem,1.4rem+3.6vw,4.4rem)] leading-[1.04] tracking-tight">
            <SplitText
              tag="span"
              text="Most venues launch memecoins."
              textAlign="left"
              splitType="words"
              delay={70}
              duration={0.9}
              from={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
              to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              rootMargin="0px"
              className="block"
            />{' '}
            <ShinyText text="Hanko checks the papers." color="#F2C14E" shineColor="#FFF4D2" speed={3.2} delay={1.2} spread={110} className="pb-2" />
          </h1>

          <p className="mt-6 max-w-xl text-lg text-ink-2" data-testid="finding">
            {headlineFinding(edition)}
          </p>
          <p className="mt-2 max-w-xl text-ink-3">
            A monthly register of tokenized-stock venues, scored 0 to 1000 in karat bands. Real stock behind the claim, or
            just a memecoin with a ticker.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StarBorder as="a" href="#register" color="#F2C14E" speed="5s" backgroundColor="#110d04" textColor="#FFE7A3" borderColor="#5c4613" className="no-underline">
              <span className="inline-flex items-center gap-2 font-bold">
                Explore the register <ArrowDown size={16} aria-hidden />
              </span>
            </StarBorder>
            <a href={`/editions/${edition.edition}.json`} className="btn px-5 py-3 text-base no-underline">
              <Braces size={16} aria-hidden /> Pull the JSON
            </a>
          </div>
        </div>

        {/* The seal, and Hanko stamping it. */}
        <div className="relative mx-auto aspect-square w-full max-w-[420px]">
          <div aria-hidden className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(255_90_69/0.35),transparent_65%)] blur-2xl" />
          <div aria-hidden className="absolute inset-[4%] rounded-full border border-dashed border-gold/25 motion-safe:animate-[spin_60s_linear_infinite]" />
          <div aria-hidden className="absolute inset-[13%] rounded-full border border-white/10" />
          <div className="absolute inset-[18%]">
            <span data-stamp="ink" aria-hidden className="absolute inset-0 rounded-seal border-[6px] border-vermilion opacity-0" />
            <span data-stamp="seal" className="block size-full -rotate-6 drop-shadow-[0_0_40px_rgba(255,90,69,0.55)]">
              <Seal ring={`VERACITY · EDITION ${edition.edition} · ASSAY REGISTER ·`} title={`Edition ${edition.edition} seal`} className="size-full" />
            </span>
          </div>
          <div aria-hidden className="absolute -bottom-2 -left-2 w-[34%]">
            <span data-hanko="up" className="absolute inset-0">
              <Hanko pose="stamp-up" mood="alert" className="h-auto w-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]" />
            </span>
            <span data-hanko="down" className="block">
              <Hanko pose="stamp-down" mood="calm" className="h-auto w-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]" />
            </span>
          </div>
          {top && (
            <div className="panel absolute -right-2 top-[8%] px-4 py-2.5 text-sm shadow-xl shadow-black/40 sm:right-0">
              <p className="text-xs text-ink-3">Leading</p>
              <p className="font-mincho text-lg font-bold">
                {top.name} <span className="num text-gold">{top.veracity}</span>
              </p>
              <BandMark band={top.band} className="text-xs" />
            </div>
          )}
          <div className="panel absolute bottom-[10%] right-[-4px] px-4 py-2 text-sm shadow-xl shadow-black/40">
            <span className="text-ink-3">Hallmark </span>
            <span className="num font-bold text-vermilion-ink">{HALLMARK}</span>
          </div>
        </div>
      </div>

      {/* The numbers. */}
      <dl className="mt-14 grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="edition-facts">
        {stats.map((s) => (
          <SpotlightCard key={s.label} className="panel lift p-5">
            <dt className="text-sm text-ink-3">{s.label}</dt>
            <dd className="mt-2 font-mincho text-4xl font-bold leading-none sm:text-5xl">
              <CountUp to={s.value} duration={1.6} className="num text-gold" />
            </dd>
            <dd className="mt-2 truncate text-sm text-ink-2">{s.note}</dd>
          </SpotlightCard>
        ))}
      </dl>

      <div className="panel mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3.5 text-sm">
        <p className="flex min-w-0 items-center gap-2 text-ink-2">
          <Hash size={15} aria-hidden className="shrink-0 text-gold" />
          <span className="shrink-0 text-ink-3">Snapshot</span>
          <span className="mono truncate text-ink" title={edition.snapshotHash} data-testid="snapshot-hash">
            <DecryptedText text={shortHash(edition.snapshotHash, 10, 8)} animateOn="view" sequential speed={35} revealDirection="start" characters="0123456789abcdef" />
          </span>
          <CopyButton value={edition.snapshotHash} what="snapshot hash" />
        </p>
        <p className="text-ink-3">
          Frozen {shortDate(edition.published)} · data {shortDate(edition.dataAsOf)} · Robinhood Chain
        </p>
      </div>
      <StampMoment />
    </header>
  );
}
