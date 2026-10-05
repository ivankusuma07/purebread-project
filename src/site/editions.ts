import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { computeDeltas } from '../build/deltas';
import type { Delta, Edition, SourceRegistry, Venue } from '../types';

const DATA = join(process.cwd(), 'data');

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function loadEditions(): Edition[] {
  const dir = join(DATA, 'editions');
  return readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}\.json$/.test(f))
    .sort()
    .map((f) => readJson<Edition>(join(dir, f)));
}

export const EDITIONS: Edition[] = loadEditions();

export const LATEST_EDITION: Edition = EDITIONS[EDITIONS.length - 1];

export const KNOWN_EDITION_IDS: string[] = EDITIONS.map((e) => e.edition);

export const SOURCES: SourceRegistry = readJson<SourceRegistry>(join(DATA, 'sources.json'));

export function findEdition(id: string): Edition | undefined {
  return EDITIONS.find((e) => e.edition === id);
}

/** Verbatim file bytes, for the JSON route. */
export function editionFile(id: string): string {
  return readFileSync(join(DATA, 'editions', `${id}.json`), 'utf8');
}

/** Deltas against the previous edition. Stored deltas win; anything missing is derived. */
export function deltasFor(edition: Edition): Record<string, Delta> {
  const index = EDITIONS.findIndex((e) => e.edition === edition.edition);
  const computed = index <= 0 ? {} : computeDeltas(edition.venues, EDITIONS[index - 1].venues, EDITIONS[index - 1].edition);
  const out: Record<string, Delta> = { ...computed };
  for (const v of edition.venues) if (v.delta) out[v.id] = { ...v.delta };
  return out;
}

export interface VenueRecord {
  edition: string;
  snapshotHash: string;
  venue: Venue;
}

/** One venue across every edition it appears in, oldest first. */
export function venueHistory(id: string): VenueRecord[] {
  return EDITIONS.flatMap((e) => {
    const venue = e.venues.find((v) => v.id === id);
    return venue ? [{ edition: e.edition, snapshotHash: e.snapshotHash, venue }] : [];
  });
}

export function allVenueIds(): string[] {
  return [...new Set(EDITIONS.flatMap((e) => e.venues.map((v) => v.id)))];
}
