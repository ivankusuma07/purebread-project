import { createHash } from 'node:crypto';
import { band, HOUSE_WEIGHTS, veracity } from '../scoring/veracity';
import type { CorrectionNote, Edition, Snapshot, Venue } from '../types';

/** A venue record as the editors write it: everything the build doesn't derive. */
export interface EditorialVenue
  extends Omit<Venue, 'veracity' | 'band' | 'rank' | 'delta' | 'metrics' | 'contracts'> {
  metrics: Omit<Venue['metrics'], 'asOf'> & { asOf?: string };
}

/** Hash raw snapshot bytes for the edition header. */
export function hashSnapshot(content: string): string {
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

export interface EditionInput {
  edition: string;
  published: string;
  dataAsOf: string;
  snapshotHash: string;
  disclosures?: string[];
  corrections?: CorrectionNote[];
}

/** Highest veracity first. Ties break alphabetically so every rebuild orders the same way. */
export function byVeracity<T extends { veracity: number; name: string }>(a: T, b: T): number {
  return b.veracity - a.veracity || a.name.localeCompare(b.name, 'en');
}

/**
 * Merge snapshot metrics into the editorial records, score at house weights
 * and rank. Puppies (prelaunch) keep working scores for the record but take
 * rank 0 and sit after every ranked venue, so absence never reads as failure.
 */
export function buildEdition(snapshot: Snapshot, editorial: EditorialVenue[], input: EditionInput): Edition {
  const byId = new Map(snapshot.venues.map((v) => [v.id, v]));
  const scored = editorial.map((v) => {
    const score = veracity(v.scores, HOUSE_WEIGHTS);
    return {
      ...v,
      veracity: score,
      band: band(score),
      metrics: { ...v.metrics, asOf: v.metrics.asOf ?? snapshot.asOf },
      contracts: byId.get(v.id)?.contracts ?? [],
    };
  });
  const ranked = scored.filter((v) => v.status !== 'prelaunch').sort(byVeracity);
  const puppies = scored
    .filter((v) => v.status === 'prelaunch')
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return {
    edition: input.edition,
    published: input.published,
    dataAsOf: input.dataAsOf,
    snapshotHash: input.snapshotHash,
    houseWeights: { ...HOUSE_WEIGHTS },
    disclosures: input.disclosures ?? [],
    corrections: input.corrections ?? [],
    venues: [...ranked.map((v, i) => ({ ...v, rank: i + 1 })), ...puppies.map((v) => ({ ...v, rank: 0 }))],
  };
}

/** Strip derived fields so an edition can be rebuilt from its own records. */
export function toEditorial(v: Venue): EditorialVenue {
  return {
    id: v.id,
    name: v.name,
    chain: v.chain,
    resident: v.resident,
    status: v.status,
    struckDate: v.struckDate,
    admittedEdition: v.admittedEdition,
    thesis: v.thesis,
    scores: { ...v.scores },
    rationale: { ...v.rationale },
    pairing: { ...v.pairing },
    metrics: { ...v.metrics },
    links: { ...v.links },
    facts: v.facts.map((f) => [...f] as [string, string]),
  };
}

/** Fixed key order, so the file bytes never depend on how a record was assembled. */
function canonicalVenue(v: Venue): Venue {
  return {
    id: v.id,
    name: v.name,
    chain: v.chain,
    resident: v.resident,
    status: v.status,
    struckDate: v.struckDate,
    admittedEdition: v.admittedEdition,
    rank: v.rank,
    veracity: v.veracity,
    band: v.band,
    ...(v.delta ? { delta: { ...v.delta } } : {}),
    thesis: v.thesis,
    scores: { ...v.scores },
    rationale: { ...v.rationale },
    pairing: { ...v.pairing },
    metrics: { ...v.metrics },
    contracts: v.contracts.map((c) => ({ label: c.label, address: c.address, verified: c.verified })),
    links: { site: v.links.site, docs: v.links.docs },
    facts: v.facts,
  };
}

/** Canonical file form: fixed key order, two-space JSON, trailing newline. */
export function serializeEdition(edition: Edition): string {
  const canonical: Edition = {
    edition: edition.edition,
    published: edition.published,
    dataAsOf: edition.dataAsOf,
    snapshotHash: edition.snapshotHash,
    houseWeights: { ...edition.houseWeights },
    disclosures: edition.disclosures,
    corrections: edition.corrections,
    venues: edition.venues.map(canonicalVenue),
  };
  return JSON.stringify(canonical, null, 2) + '\n';
}
