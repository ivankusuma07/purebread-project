import { Archive, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Seal from '../art/Seal';
import { SITE } from '../config';
import { EDITIONS, LATEST_EDITION } from '../editions';
import { editionMonth, shortHash } from '../lib/format';
import { GitHubIcon, XIcon } from './BrandIcons';

/** A closing call to action, the archive of every edition, and the colophon. */
export default function Footer({ current }: { current?: string }) {
  const archive = [...EDITIONS].reverse();
  return (
    <footer className="mt-16 pb-40">
      <section className="relative overflow-hidden rounded-3xl border border-gold/20 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(242,193,78,0.18),transparent_55%),radial-gradient(90%_120%_at_0%_100%,rgba(255,90,69,0.14),transparent_60%)] px-6 py-12 sm:px-12">
        <Seal clean className="pointer-events-none absolute -right-10 -top-10 size-56 rotate-12 opacity-[0.12]" />
        <p className="chapter-tag">Every month</p>
        <h2 className="mt-4 max-w-2xl text-[clamp(2rem,1.4rem+2.4vw,3.4rem)]">
          Hanko checks the papers on the <span className="text-gold">1st</span>. You can check his.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-ink-2">Every score, every source, every edition, open and frozen. No key, no sign-up.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/method" className="btn btn-gold px-5 py-3 text-base no-underline">
            Read the method <ArrowUpRight size={16} aria-hidden />
          </Link>
          <Link href="/venues" className="btn px-5 py-3 text-base no-underline">
            Browse all venues
          </Link>
        </div>
      </section>

      <section id="archive" aria-labelledby="archive-title" className="pt-16">
        <h2 id="archive-title" className="flex items-center gap-2 text-2xl">
          <Archive size={20} aria-hidden className="text-gold" /> Archive
        </h2>
        <div className="panel mt-5 overflow-x-auto p-2">
          <table className="table-ledger min-w-[34rem]">
            <thead>
              <tr>
                <th scope="col">Edition</th>
                <th scope="col">Published</th>
                <th scope="col">Snapshot hash</th>
                <th scope="col">Data</th>
              </tr>
            </thead>
            <tbody>
              {archive.map((e) => (
                <tr key={e.edition} aria-current={e.edition === current ? 'page' : undefined}>
                  <td>
                    <Link href={`/editions/${e.edition}`} className="font-mincho text-lg font-bold no-underline">
                      {editionMonth(e.edition)}
                    </Link>
                    {e.edition === LATEST_EDITION.edition && (
                      <span className="ml-2 rounded-full bg-k14/15 px-2 py-0.5 text-xs text-k14">latest</span>
                    )}
                  </td>
                  <td className="num text-ink-2">{e.published}</td>
                  <td className="mono text-sm text-ink-2" title={e.snapshotHash}>
                    {shortHash(e.snapshotHash, 6, 6)}
                  </td>
                  <td>
                    <a href={`/editions/${e.edition}.json`} className="mono text-sm">
                      {e.edition}.json
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap items-start justify-between gap-6 border-t border-white/[0.07] pt-8 text-sm text-ink-3">
        <p className="max-w-xl">
          Veracity scores are editorial judgements on public information. Not an audit, a credit rating or investment
          advice. Stock tokens are not offered to US persons. Venue names and logos belong to their owners and are shown
          only to identify each venue; no venue endorses Veracity.
        </p>
        <ul className="flex items-center gap-5">
          <li>
            <Link href="/method">Method</Link>
          </li>
          <li>
            <Link href="/venues">Venues</Link>
          </li>
          <li>
            <Link href="/fee-router">Fee router</Link>
          </li>
          {SITE.github && (
            <li>
              <a href={SITE.github} aria-label="Source on GitHub" className="inline-flex hover:text-ink">
                <GitHubIcon />
              </a>
            </li>
          )}
          {SITE.x && (
            <li>
              <a href={SITE.x} aria-label="Veracity on X" className="inline-flex hover:text-ink">
                <XIcon />
              </a>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
