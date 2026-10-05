import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildNextEdition } from '../src/build/carry';
import { computeDeltas } from '../src/build/deltas';
import { buildEdition, hashSnapshot, serializeEdition, toEditorial } from '../src/build/edition';
import { validateEdition } from '../src/build/validate';
import { band, HOUSE_WEIGHTS, veracity } from '../src/scoring/veracity';
import { usd } from '../src/site/lib/format';
import { applyWeights } from '../src/site/weight-url';
import type { Edition, Snapshot, SourceRegistry, Venue } from '../src/types';

const root = process.cwd();
const readJson = <T>(p: string): T => JSON.parse(readFileSync(join(root, p), 'utf8')) as T;
const sources = readJson<SourceRegistry>('data/sources.json');
const editionIds = readdirSync(join(root, 'data/editions'))
  .filter((f) => /^\d{4}-\d{2}\.json$/.test(f))
  .map((f) => f.slice(0, 7))
  .sort();

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

function venue(over: Partial<Venue> = {}): Venue {
  const scores = over.scores ?? { asset: 5, traction: 5, transparency: 5, compliance: 5, durability: 5 };
  const v = veracity(scores);
  return {
    id: 'test',
    name: 'Test',
    chain: 'robinhood-chain',
    resident: true,
    status: 'active',
    struckDate: null,
    admittedEdition: '2026-10',
    thesis: 'A test venue.',
    scores,
    veracity: v,
    band: band(v),
    rank: 1,
    rationale: { asset: 'a', traction: 'b', transparency: 'c', compliance: 'd', durability: 'e' },
    pairing: { assetType: 'tokenized-equity', custodian: null, jurisdiction: null, redeemable: false, verifiability: 'attestation' },
    metrics: { cumulativeVolumeUsd: null, dailyVolumeUsd: null, fees24hUsd: null, tvlUsd: null, asOf: '2026-10-01', sourceIds: [] },
    contracts: [],
    links: { site: null, docs: null },
    facts: [],
    ...over,
  };
}

function edition(venues: Venue[]): Edition {
  return {
    edition: '2026-10',
    published: '2026-10-05',
    dataAsOf: '2026-10-01',
    snapshotHash: `sha256:${'a'.repeat(64)}`,
    houseWeights: { ...HOUSE_WEIGHTS },
    disclosures: [],
    corrections: [],
    venues,
  };
}

describe.each(editionIds)('edition %s', (id) => {
  const ed = readJson<Edition>(`data/editions/${id}.json`);

  it('passes validation', () => {
    expect(() => validateEdition(ed, sources)).not.toThrow();
  });

  it('A-01: rebuilding from its snapshot is byte-identical', () => {
    const raw = readFileSync(join(root, `data/snapshots/${ed.dataAsOf}.json`), 'utf8');
    expect(hashSnapshot(raw)).toBe(ed.snapshotHash);
    const snapshot = JSON.parse(raw) as Snapshot;
    const rebuilt = buildEdition(snapshot, ed.venues.map(toEditorial), {
      edition: ed.edition,
      published: ed.published,
      dataAsOf: ed.dataAsOf,
      snapshotHash: ed.snapshotHash,
      disclosures: ed.disclosures,
      corrections: ed.corrections,
    });
    for (const v of rebuilt.venues) {
      const stored = ed.venues.find((s) => s.id === v.id);
      if (stored?.delta) v.delta = stored.delta;
    }
    expect(serializeEdition(rebuilt)).toBe(readFileSync(join(root, `data/editions/${id}.json`), 'utf8'));
  });

  it('A-02: browser recompute at house weights equals the build', () => {
    const ranked = ed.venues.filter((v) => v.status !== 'prelaunch');
    const shown = applyWeights(ranked, { ...HOUSE_WEIGHTS });
    expect(shown.map((v) => [v.id, v.veracity, v.band, v.rank])).toEqual(ranked.map((v) => [v.id, v.veracity, v.band, v.rank]));
  });

  it('A-03: no published figure is a zero standing in for "not published"', () => {
    for (const v of ed.venues) {
      for (const n of [v.metrics.cumulativeVolumeUsd, v.metrics.dailyVolumeUsd, v.metrics.fees24hUsd, v.metrics.tvlUsd]) {
        expect(n).not.toBe(0);
      }
    }
    expect(usd(null)).toBe('not published');
  });
});

describe('acceptance (A-04 to A-08)', () => {
  it('A-04: deltas are exact differences at house weights; new admissions have none', () => {
    const d = computeDeltas(
      [
        { id: 'a', veracity: 700, rank: 1 },
        { id: 'new', veracity: 500, rank: 2 },
      ],
      [{ id: 'a', veracity: 745, rank: 2 }],
      '2026-10',
    );
    expect(d.a).toEqual({ veracity: -45, rank: 1, bandChanged: false, crossedHallmark: false, basis: '2026-10' });
    expect(d.new).toBeUndefined();
    const crossed = computeDeltas([{ id: 'x', veracity: 370, rank: 5 }], [{ id: 'x', veracity: 380, rank: 4 }], '2026-10');
    expect(crossed.x.crossedHallmark).toBe(true);
    expect(crossed.x.bandChanged).toBe(true);
  });

  it('A-04: the carry step embeds house-weight deltas against the previous edition', () => {
    const prev = edition([
      venue({ id: 'a', name: 'A', scores: { asset: 6, traction: 6, transparency: 6, compliance: 6, durability: 6 }, rank: 1 }),
      venue({ id: 'b', name: 'B', rank: 2 }),
    ]);
    const snapshot: Snapshot = {
      snapshot: '2026-11-01',
      asOf: '2026-11-01',
      venues: prev.venues.map((v) => ({ id: v.id, cumulativeVolumeUsd: null, dailyVolumeUsd: null, fees24hUsd: null, tvlUsd: null, contracts: [] })),
    };
    const next = buildNextEdition(prev, snapshot, {}, {
      edition: '2026-11',
      published: '2026-11-05',
      dataAsOf: '2026-11-01',
      snapshotHash: `sha256:${'b'.repeat(64)}`,
    });
    expect(next.venues.map((v) => v.delta)).toEqual([
      { veracity: 0, rank: 0, bandChanged: false, crossedHallmark: false, basis: '2026-10' },
      { veracity: 0, rank: 0, bandChanged: false, crossedHallmark: false, basis: '2026-10' },
    ]);
    expect(() => validateEdition(next, sources)).not.toThrow();
  });

  it('A-05: an unknown sourceId fails the build', () => {
    const bad = edition([venue({ metrics: { ...venue().metrics, sourceIds: ['made-up'] } })]);
    expect(() => validateEdition(bad, sources)).toThrow(/unknown sourceId made-up/);
  });

  it('A-07: puppies are listed unranked, after every ranked venue', () => {
    const snapshot: Snapshot = { snapshot: '2026-10-01', asOf: '2026-10-01', venues: [] };
    const built = buildEdition(
      snapshot,
      [
        venue({ id: 'pup', name: 'Aardvark', status: 'prelaunch', scores: { asset: 9, traction: 9, transparency: 9, compliance: 9, durability: 9 } }),
        venue({ id: 'b', name: 'B' }),
        venue({ id: 'c', name: 'C', scores: { asset: 4, traction: 4, transparency: 4, compliance: 4, durability: 4 } }),
      ].map(toEditorial),
      { edition: '2026-10', published: '2026-10-05', dataAsOf: '2026-10-01', snapshotHash: `sha256:${'c'.repeat(64)}` },
    );
    expect(built.venues.map((v) => [v.id, v.rank])).toEqual([
      ['b', 1],
      ['c', 2],
      ['pup', 0],
    ]);
    expect(() => validateEdition(built, sources)).not.toThrow();
    expect(() => validateEdition(edition([venue({ status: 'prelaunch', rank: 3 })]), sources)).toThrow(/unranked/);
  });

  it('A-08: a correction needs two sign-offs', () => {
    const one = edition([venue()]);
    one.corrections = [{ date: '2026-10-09', note: 'Fixed a figure.', originalFigure: '$1.2M', signedBy: ['reviewer-a'] }];
    expect(() => validateEdition(one, sources)).toThrow(/two reviewer sign-offs/);
    const two = clone(one);
    two.corrections[0].signedBy.push('reviewer-b');
    expect(() => validateEdition(two, sources)).not.toThrow();
  });

  it('rejects a score that does not recompute, or a band that does not match', () => {
    expect(() => validateEdition(edition([venue({ veracity: 999 })]), sources)).toThrow(/recompute/);
    expect(() => validateEdition(edition([venue({ band: '22k' })]), sources)).toThrow(/band/);
  });

  it('records the strike date and keeps status and date in agreement', () => {
    expect(() => validateEdition(edition([venue({ status: 'struck', struckDate: null })]), sources)).toThrow(/struck/);
    expect(() => validateEdition(edition([venue({ status: 'active', struckDate: '2026-10-01' })]), sources)).toThrow(/struck/);
  });
});
