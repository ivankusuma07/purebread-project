import type { Metadata } from 'next';
import Link from 'next/link';
import { HALLMARK } from '../../src/scoring/veracity';
import BandMark from '../../src/site/components/BandMark';
import Book from '../../src/site/components/Book';
import { LATEST_EDITION } from '../../src/site/editions';
import { ASSET_TYPE_LABEL, chainLabel, editionMonth } from '../../src/site/lib/format';
import type { Venue } from '../../src/types';

export const metadata: Metadata = {
  title: 'Venues',
  description: 'Every venue in the Veracity register, including puppies not yet ranked and venues struck off.',
};

const STATUS_NOTE: Record<Venue['status'], string> = {
  active: '',
  paused: 'paused',
  prelaunch: 'puppy, not yet ranked',
  struck: 'struck off',
};

/** Every venue in the latest edition: ranked first, then puppies, then the struck off. */
export default function VenuesPage() {
  const all = LATEST_EDITION.venues;
  const ranked = all.filter((v) => v.status === 'active' || v.status === 'paused');
  const rest = all.filter((v) => v.status === 'prelaunch' || v.status === 'struck');
  const rows = [...ranked, ...rest];

  return (
    <Book contents={[{ href: '#venues', label: 'All venues' }]} edition={LATEST_EDITION.edition}>
      <header className="pb-6 pt-8 min-[1200px]:pt-12">
        <p className="text-sm text-ink-2">
          <Link href="/">Register</Link> / venues
        </p>
        <h1 className="mt-3 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">Venues</h1>
        <p className="measure mt-3 text-ink-2">
          Every venue in edition {LATEST_EDITION.edition} ({editionMonth(LATEST_EDITION.edition)}). Open a venue&apos;s
          papers for its history, scores, custody and contracts.
        </p>
      </header>

      <section id="venues" aria-label="Venue index" className="border-t-2 border-ink">
        <div className="overflow-x-auto">
          <table className="table-ledger min-w-[38rem]">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Venue</th>
                <th scope="col">Pairing</th>
                <th scope="col" className="n">
                  Veracity
                </th>
                <th scope="col">Band</th>
                <th scope="col">Admitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => {
                const unranked = v.status === 'prelaunch' || v.status === 'struck';
                return (
                  <tr key={v.id} className={!unranked && v.veracity < HALLMARK ? 'text-below-ink' : ''}>
                    <td className="num text-ink-3">{unranked ? '' : v.rank}</td>
                    <td>
                      <Link href={`/venues/${v.id}`} className="font-mincho text-lg font-bold no-underline hover:underline">
                        {v.name}
                      </Link>
                      <span className="block text-sm text-ink-3">
                        {chainLabel(v.chain)}
                        {!v.resident && ' · off-chain'}
                        {STATUS_NOTE[v.status] && ` · ${STATUS_NOTE[v.status]}`}
                      </span>
                    </td>
                    <td>{ASSET_TYPE_LABEL[v.pairing.assetType]}</td>
                    <td className="n font-mincho text-lg font-bold">{v.status === 'prelaunch' ? '' : v.veracity}</td>
                    <td>{v.status === 'prelaunch' ? <span className="text-ink-3">not yet scored</span> : <BandMark band={v.band} />}</td>
                    <td className="num">{v.admittedEdition}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Book>
  );
}
