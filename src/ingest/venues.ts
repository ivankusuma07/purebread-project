// Where each venue's figures come from. Phase 0 fills this in, one venue at a
// time, only after confirming that the provider really lists that venue and
// that each address is the venue's own contract on the chain explorer.
//
// A venue with no mapping keeps null metrics. That renders as "not published",
// which is the honest default, never zero.

import type { ContractRef } from '../types';

export interface VenueIngestConfig {
  /** DefiLlama protocol slug for fees and TVL. */
  defillamaSlug?: string;
  /** Bitquery network name, e.g. "robinhood" or "solana". */
  bitqueryNetwork?: string;
  /** Contracts checked on the explorer. Factory contracts also feed Bitquery. */
  contracts?: ContractRef[];
  /** Blockscout-compatible API for this venue's chain, if not the default. */
  explorerApi?: string;
}

export const VENUE_INGEST: Record<string, VenueIngestConfig> = {};

/** Venues still waiting on a verified data mapping. The desk lists these. */
export function unmappedVenues(ids: string[]): string[] {
  return ids.filter((id) => {
    const m = VENUE_INGEST[id];
    return !m || (!m.defillamaSlug && (m.contracts ?? []).length === 0);
  });
}
