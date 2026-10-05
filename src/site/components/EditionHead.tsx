import { HALLMARK } from '../../scoring/veracity';
import type { Edition } from '../../types';
import Hanko from '../art/Hanko';
import Seal from '../art/Seal';
import { editionMonth, shortDate, shortHash } from '../lib/format';
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

/**
 * The title page of an edition. Hanko stamps the seal here, once per visit.
 * The seal is his ink mark on the frozen edition, printed beside the
 * snapshot hash that is its real integrity record.
 */
export default function EditionHead({ edition, isLatest }: EditionHeadProps) {
  const ranked = edition.venues.filter((v) => v.status !== 'prelaunch' && v.status !== 'struck');
  const below = ranked.filter((v) => v.veracity < HALLMARK).length;
  const puppies = edition.venues.filter((v) => v.status === 'prelaunch').length;

  return (
    <header className="pb-8 pt-8 min-[1200px]:pt-12">
      <p className="measure font-mincho text-[clamp(1.75rem,1.2rem+2.4vw,2.9rem)] font-bold leading-[1.2] text-ink">
        Most venues launch memecoins. Hanko checks the papers.
      </p>
      <p className="mt-3 text-lg text-ink-2" data-testid="finding">
        {headlineFinding(edition)}
      </p>

      <div className="mt-8 grid items-center gap-x-6 gap-y-4 sm:grid-cols-[auto_1fr]">
        <div className="relative flex items-end gap-1">
          <div aria-hidden className="relative -mb-1 hidden w-[84px] sm:block">
            <span data-hanko="up" className="absolute inset-0">
              <Hanko pose="stamp-up" mood="alert" className="h-auto w-full" />
            </span>
            <span data-hanko="down" className="block">
              <Hanko pose="stamp-down" mood="calm" className="h-auto w-full" />
            </span>
          </div>
          <div className="relative size-[104px] shrink-0">
            <span data-stamp="ink" aria-hidden className="absolute inset-0 rounded-seal border-4 border-vermilion opacity-0" />
            <span data-stamp="seal" className="block size-full -rotate-3">
              <Seal ring={`VERACITY · EDITION ${edition.edition} · ASSAY REGISTER ·`} title={`Edition ${edition.edition} seal`} className="size-full" />
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="font-mincho text-2xl text-ink">
            Edition {edition.edition}
            <span className="ml-3 font-gothic text-base font-normal text-ink-2">
              {editionMonth(edition.edition)}
              {isLatest ? ', latest' : ', archived'}
            </span>
          </h1>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.9375rem] text-ink-2">
            <span>Frozen {shortDate(edition.published)}</span>
            <span className="num" title={edition.snapshotHash} data-testid="snapshot-hash">
              snapshot {shortHash(edition.snapshotHash)}
            </span>
            <CopyButton value={edition.snapshotHash} what="snapshot hash" />
          </p>
          <p className="num mt-2 text-[0.9375rem] text-ink-2" data-testid="edition-facts">
            {ranked.length} venues · median {median(ranked.map((v) => v.veracity))} · {below} below hallmark
            {puppies > 0 && ` · ${puppies} puppies`} · data {shortDate(edition.dataAsOf)}
          </p>
        </div>
      </div>
      <StampMoment />
    </header>
  );
}
