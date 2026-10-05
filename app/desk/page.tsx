import type { Metadata } from 'next';
import { checkAdmission, scopeNote } from '../../src/build/admission';
import { scoreMoves, warnScoreMoves } from '../../src/build/score-moves';
import { unmappedVenues } from '../../src/ingest/venues';
import DeskClient from '../../src/site/components/DeskClient';
import { EDITIONS, LATEST_EDITION } from '../../src/site/editions';

export const metadata: Metadata = {
  title: 'Editorial desk',
  description: 'Internal review desk. Not linked publicly.',
  robots: { index: false, follow: false },
};

/** Internal desk. The server works everything out from the frozen editions; the client only tracks review state. */
export default function DeskPage() {
  const curr = LATEST_EDITION;
  const prev = EDITIONS.length > 1 ? EDITIONS[EDITIONS.length - 2] : null;
  return (
    <DeskClient
      edition={curr.edition}
      published={curr.published}
      dataAsOf={curr.dataAsOf}
      snapshotHash={curr.snapshotHash}
      basis={prev?.edition ?? null}
      venueCount={curr.venues.length}
      moves={prev ? scoreMoves(curr, prev) : []}
      warnings={prev ? warnScoreMoves(curr, prev) : []}
      admission={checkAdmission(curr.venues)}
      scope={scopeNote(curr.venues)}
      unmapped={unmappedVenues(curr.venues.map((v) => v.id))}
    />
  );
}
