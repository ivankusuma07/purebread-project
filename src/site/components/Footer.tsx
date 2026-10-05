import { Archive } from 'lucide-react';
import Link from 'next/link';
import { SITE } from '../config';
import { EDITIONS, LATEST_EDITION } from '../editions';
import { editionMonth, shortHash } from '../lib/format';
import { GitHubIcon, XIcon } from './BrandIcons';

/** The colophon and the archive: every edition with its snapshot hash. */
export default function Footer({ current }: { current?: string }) {
  const archive = [...EDITIONS].reverse();
  return (
    <footer className="mt-16 border-t-2 border-ink pb-40 pt-10 text-sm text-ink-2">
      <section id="archive" aria-labelledby="archive-title">
        <h2 id="archive-title" className="mb-4 flex items-center gap-2 font-mincho text-xl text-ink">
          <Archive size={18} aria-hidden /> Archive
        </h2>
        <div className="overflow-x-auto">
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
                    <Link href={`/editions/${e.edition}`} className="text-ink">
                      {editionMonth(e.edition)}
                    </Link>
                    {e.edition === LATEST_EDITION.edition && <span className="ml-2 text-ink-3">latest</span>}
                  </td>
                  <td className="num">{e.published}</td>
                  <td className="num" title={e.snapshotHash}>
                    {shortHash(e.snapshotHash, 6, 6)}
                  </td>
                  <td>
                    <a href={`/editions/${e.edition}.json`} className="text-ink-2">
                      {e.edition}.json
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-10 grid gap-6 sm:grid-cols-[1fr_auto]">
        <p className="measure">
          Veracity scores are editorial judgements on public information. Veracity is not an audit, a credit rating or
          investment advice. Stock tokens are not offered to US persons.
        </p>
        <ul className="flex items-start gap-4">
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
              <a href={SITE.github} aria-label="Source on GitHub" className="inline-flex text-ink-2 hover:text-ink">
                <GitHubIcon />
              </a>
            </li>
          )}
          {SITE.x && (
            <li>
              <a href={SITE.x} aria-label="Veracity on X" className="inline-flex text-ink-2 hover:text-ink">
                <XIcon />
              </a>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
