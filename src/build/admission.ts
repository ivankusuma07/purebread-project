import type { Venue } from '../types';

/**
 * Registration standard review. Non-blocking: returns findings, never throws.
 * Edition 01 listed every venue that could be found, before any standard
 * existed, so those records are grandfathered. The standard applies from
 * Edition 02.
 */
export const STANDARD_FROM = '2026-11';

/** Off-chain venues rank inline until there are this many, then the desk opens a watchlist. */
export const WATCHLIST_SPLIT_AT = 3;

export interface AdmissionFinding {
  id: string;
  failed: string[];
}

function hasMarketEvidence(v: Venue): boolean {
  const m = v.metrics;
  return m.cumulativeVolumeUsd != null || m.dailyVolumeUsd != null || m.fees24hUsd != null || m.tvlUsd != null;
}

/**
 * Machine-checkable conditions only. Condition 3 (a completed launch or live
 * market) has no direct field, so an all-null market record goes to a human
 * for launch evidence instead of failing outright.
 */
export function checkAdmission(venues: Venue[]): AdmissionFinding[] {
  const out: AdmissionFinding[] = [];
  for (const v of venues) {
    if (v.admittedEdition < STANDARD_FROM) continue;
    const failed: string[] = [];
    if (!v.contracts.some((c) => c.verified && c.address.length > 0)) {
      failed.push('1: no contract verified on a public chain explorer');
    }
    if (v.pairing.assetType === 'none') failed.push('2: the pairing claims no real-world backing');
    if (!hasMarketEvidence(v)) failed.push('3: no published market figures, confirm a completed launch by hand');
    if (v.links.site == null && v.links.docs == null) {
      failed.push('4: no interface or docs on a domain the operator controls');
    }
    if (failed.length > 0) out.push({ id: v.id, failed });
  }
  return out;
}

/** Informational: reports when off-chain venues reach the watchlist split. Never blocks a run. */
export function scopeNote(venues: Venue[]): string | null {
  const offChain = venues.filter((v) => !v.resident).length;
  return offChain >= WATCHLIST_SPLIT_AT
    ? `scope: ${offChain} off-chain venues reach the split threshold, open a resident register plus a watchlist`
    : null;
}
