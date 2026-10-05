import { band, HALLMARK } from '../scoring/veracity';
import type { Delta } from '../types';

export interface RankedVenue {
  id: string;
  veracity: number;
  rank: number;
}

/**
 * Movement against the prior edition, at house weights only. Reader weights
 * reorder the page but never change a published delta. New admissions and
 * puppies carry no delta.
 */
export function computeDeltas(curr: RankedVenue[], prev: RankedVenue[], basis: string): Record<string, Delta> {
  const prior = new Map(prev.filter((v) => v.rank > 0).map((v) => [v.id, v]));
  const out: Record<string, Delta> = {};
  for (const v of curr) {
    if (v.rank === 0) continue;
    const p = prior.get(v.id);
    if (!p) continue;
    out[v.id] = {
      veracity: v.veracity - p.veracity,
      rank: p.rank - v.rank,
      bandChanged: band(v.veracity) !== band(p.veracity),
      crossedHallmark: p.veracity >= HALLMARK !== v.veracity >= HALLMARK,
      basis,
    };
  }
  return out;
}
