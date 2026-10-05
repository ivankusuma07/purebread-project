import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../types';
import { cleanMetric } from './http';
import { runIngest, type Providers } from './run';

const offline: Providers = {
  defillama: async () => ({ fees24hUsd: null, tvlUsd: null }),
  bitquery: async () => ({ cumulativeVolumeUsd: null, dailyVolumeUsd: null }),
  explorer: async () => null,
};

const prev: Snapshot = {
  snapshot: '2026-10-01',
  asOf: '2026-10-01',
  venues: [
    {
      id: 'v',
      cumulativeVolumeUsd: 100,
      dailyVolumeUsd: null,
      fees24hUsd: 5,
      tvlUsd: null,
      contracts: [{ label: 'factory', address: '0x1111111111111111111111111111111111111111', verified: true }],
    },
  ],
};

describe('ingest', () => {
  it('keeps only finite, non-negative numbers', () => {
    expect(cleanMetric(12)).toBe(12);
    expect(cleanMetric(-1)).toBeNull();
    expect(cleanMetric(Number.NaN)).toBeNull();
    expect(cleanMetric('12')).toBeNull();
  });

  it('never lets a fresh null overwrite a published figure, and writes atomically', async () => {
    const out = join(mkdtempSync(join(tmpdir(), 'veracity-')), 'snap.json');
    const { snapshot, providers, raw } = await runIngest(['v', 'unmapped'], out, '2026-11-01', prev, offline, {
      v: { defillamaSlug: 'v', bitqueryNetwork: 'robinhood' },
    });
    expect(snapshot.venues[0]).toMatchObject({ cumulativeVolumeUsd: 100, fees24hUsd: 5, dailyVolumeUsd: null });
    expect(snapshot.venues[0].contracts[0].verified).toBe(true);
    expect(snapshot.venues[1]).toMatchObject({ cumulativeVolumeUsd: null, dailyVolumeUsd: null, fees24hUsd: null, tvlUsd: null });
    expect(providers).toEqual({ v: [], unmapped: [] });
    expect(readFileSync(out, 'utf8')).toBe(raw);
  });

  it('takes fresh figures and records which provider confirmed them', async () => {
    const out = join(mkdtempSync(join(tmpdir(), 'veracity-')), 'snap.json');
    const live: Providers = {
      defillama: async () => ({ fees24hUsd: 9, tvlUsd: 1000 }),
      bitquery: async () => ({ cumulativeVolumeUsd: 200, dailyVolumeUsd: 20 }),
      explorer: async () => false,
    };
    const { snapshot, providers } = await runIngest(['v'], out, '2026-11-01', prev, live, {
      v: { defillamaSlug: 'v', bitqueryNetwork: 'robinhood' },
    });
    expect(snapshot.venues[0]).toMatchObject({ cumulativeVolumeUsd: 200, dailyVolumeUsd: 20, fees24hUsd: 9, tvlUsd: 1000 });
    expect(snapshot.venues[0].contracts[0].verified).toBe(false);
    expect(providers.v.sort()).toEqual(['bitquery', 'defillama', 'explorer']);
  });
});
