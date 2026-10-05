// Monthly ingest. Pulls published figures and never invents one.
//
// Retention: a fresh null never overwrites a figure that was published before
// (a gap can be transient). A fresh figure replaces the old one. The snapshot
// is written atomically: temp file, then rename.

import { rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { ContractRef, Snapshot, SnapshotVenue } from '../types';
import { fetchBitqueryVolume } from './bitquery';
import { fetchDefillamaStats } from './defillama';
import { fetchContractVerification } from './explorer';
import { VENUE_INGEST, type VenueIngestConfig } from './venues';

export interface Providers {
  defillama: typeof fetchDefillamaStats;
  bitquery: typeof fetchBitqueryVolume;
  explorer: typeof fetchContractVerification;
}

const LIVE: Providers = {
  defillama: fetchDefillamaStats,
  bitquery: fetchBitqueryVolume,
  explorer: fetchContractVerification,
};

async function ingestVenue(
  id: string,
  prev: SnapshotVenue | undefined,
  asOf: string,
  mapping: VenueIngestConfig | undefined,
  providers: Providers,
): Promise<{ venue: SnapshotVenue; used: string[] }> {
  const used = new Set<string>();
  let fees24hUsd = prev?.fees24hUsd ?? null;
  let tvlUsd = prev?.tvlUsd ?? null;
  let cumulativeVolumeUsd = prev?.cumulativeVolumeUsd ?? null;
  let dailyVolumeUsd = prev?.dailyVolumeUsd ?? null;

  if (mapping?.defillamaSlug) {
    const stats = await providers.defillama(mapping.defillamaSlug);
    if (stats.fees24hUsd != null) {
      fees24hUsd = stats.fees24hUsd;
      used.add('defillama');
    }
    if (stats.tvlUsd != null) {
      tvlUsd = stats.tvlUsd;
      used.add('defillama');
    }
  }

  // Mapped contracts win over carried ones: the mapping is where corrections land.
  const known: ContractRef[] = mapping?.contracts ?? prev?.contracts ?? [];
  const factories = known.filter((c) => c.label === 'factory').map((c) => c.address);
  if (mapping?.bitqueryNetwork && factories.length > 0) {
    const volume = await providers.bitquery(mapping.bitqueryNetwork, factories, asOf);
    if (volume.cumulativeVolumeUsd != null) cumulativeVolumeUsd = volume.cumulativeVolumeUsd;
    if (volume.dailyVolumeUsd != null) dailyVolumeUsd = volume.dailyVolumeUsd;
    if (volume.cumulativeVolumeUsd != null || volume.dailyVolumeUsd != null) used.add('bitquery');
  }

  const contracts = await Promise.all(
    known.map(async (c) => {
      const verified = await providers.explorer(c.address, mapping?.explorerApi);
      if (verified != null) used.add('explorer');
      return { ...c, verified: verified ?? c.verified };
    }),
  );

  return {
    venue: { id, cumulativeVolumeUsd, dailyVolumeUsd, fees24hUsd, tvlUsd, contracts },
    used: [...used],
  };
}

export interface RunResult {
  snapshot: Snapshot;
  /** Provider ids that contributed a figure, per venue. These become sourceIds. */
  providers: Record<string, string[]>;
  raw: string;
}

export async function runIngest(
  venueIds: string[],
  outputPath: string,
  asOf: string,
  prev?: Snapshot,
  providers: Providers = LIVE,
  mappings: Record<string, VenueIngestConfig> = VENUE_INGEST,
): Promise<RunResult> {
  const byId = new Map((prev?.venues ?? []).map((v) => [v.id, v]));
  const venues: SnapshotVenue[] = [];
  const used: Record<string, string[]> = {};
  for (const id of venueIds) {
    const r = await ingestVenue(id, byId.get(id), asOf, mappings[id], providers);
    venues.push(r.venue);
    used[id] = r.used;
  }
  const snapshot: Snapshot = { snapshot: asOf, asOf, venues };
  const raw = JSON.stringify(snapshot, null, 2) + '\n';
  const tmp = join(dirname(outputPath), `.${Date.now()}.tmp`);
  await writeFile(tmp, raw, 'utf8');
  await rename(tmp, outputPath);
  return { snapshot, providers: used, raw };
}
