import type { EditionReview } from '../llm/review';
import type { Edition, Snapshot } from '../types';
import { computeDeltas } from './deltas';
import { buildEdition, type EditionInput, type EditorialVenue } from './edition';

/**
 * Build next month's edition. Editorial judgement (scores, rationale, thesis,
 * pairing, links, facts, status) carries forward; metrics come from the fresh
 * snapshot. A review may move scores inside the ±1 cap with new rationale.
 * Without one, every score carries and only the data refreshes. Struck-off
 * venues record the data date they were struck.
 */
export function buildNextEdition(
  prev: Edition,
  snapshot: Snapshot,
  providers: Record<string, string[]>,
  input: EditionInput,
  review?: EditionReview | null,
): Edition {
  const snapById = new Map(snapshot.venues.map((v) => [v.id, v]));
  const editorial: EditorialVenue[] = prev.venues.map((v) => {
    const snap = snapById.get(v.id);
    const rev = review?.venues[v.id];
    // Retained figures keep their sources; refreshed ones add the confirming provider.
    const sourceIds = [...new Set([...v.metrics.sourceIds, ...(providers[v.id] ?? [])])];
    const status = rev?.status ?? v.status;
    const struckDate = status === 'struck' ? (v.status === 'struck' ? (v.struckDate ?? input.dataAsOf) : input.dataAsOf) : null;
    return {
      id: v.id,
      name: v.name,
      chain: v.chain,
      resident: v.resident,
      status,
      struckDate,
      admittedEdition: v.admittedEdition,
      thesis: rev?.thesis ?? v.thesis,
      scores: rev ? { ...rev.scores } : { ...v.scores },
      rationale: rev ? { ...rev.rationale } : { ...v.rationale },
      pairing: { ...v.pairing },
      metrics: {
        cumulativeVolumeUsd: snap?.cumulativeVolumeUsd ?? null,
        dailyVolumeUsd: snap?.dailyVolumeUsd ?? null,
        fees24hUsd: snap?.fees24hUsd ?? null,
        tvlUsd: snap?.tvlUsd ?? null,
        sourceIds,
      },
      links: { ...v.links },
      facts: v.facts.map((f) => [...f] as [string, string]),
    };
  });

  const edition = buildEdition(snapshot, editorial, {
    ...input,
    corrections: [...(prev.corrections ?? []), ...(input.corrections ?? [])],
  });
  const deltas = computeDeltas(edition.venues, prev.venues, prev.edition);
  for (const v of edition.venues) {
    if (deltas[v.id]) v.delta = deltas[v.id];
  }
  return edition;
}
