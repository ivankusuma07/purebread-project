// The model proposes, the code decides. Every proposal is checked here:
// integers only, at most ±1 per criterion, a fresh rationale for every move,
// known venue ids only. Anything that fails a check falls back to the carried
// value, so a confused model can't corrupt an edition. Status can only stay or
// become "struck"; the model never adds a venue.

import { CRITERIA, type Criterion, type Scores } from '../scoring/veracity';
import type { Edition, Snapshot, VenueStatus } from '../types';
import type { Complete } from './client';

export interface VenueReview {
  scores: Scores;
  rationale: Record<Criterion, string>;
  thesis: string;
  status: VenueStatus;
  strikeReason: string | null;
}

export interface EditionReview {
  venues: Record<string, VenueReview>;
  notes: string[];
}

interface RawVenue {
  scores?: Record<string, unknown>;
  rationale?: Record<string, unknown>;
  thesis?: unknown;
  status?: unknown;
  strikeReason?: unknown;
}

export function clampMove(from: number, proposed: unknown): number {
  if (typeof proposed !== 'number' || !Number.isInteger(proposed)) return from;
  const bounded = Math.min(10, Math.max(0, proposed));
  return Math.min(from + 1, Math.max(from - 1, bounded));
}

const SYSTEM = `You review venues for Veracity, a monthly register that scores tokenized-stock venues 0-1000 in karat bands.
Rules, with no exceptions:
- Scores are integers 0..10 on asset, traction, transparency, compliance, durability.
- A score moves at most 1 point per criterion per edition, and only on fresh public evidence.
- Every moved score needs a rewritten rationale that cites the evidence. Unmoved scores keep their text.
- status is "active", "paused" or "struck". Strike only for: 60 days without a launch, a dark interface, loss of domain or keys, or a failed pairing check. Give strikeReason.
- Never invent a venue. Missing figures stay missing.
Reply with one JSON object and nothing else:
{"venues":{"<id>":{"scores":{"asset":n,"traction":n,"transparency":n,"compliance":n,"durability":n},"rationale":{"asset":"...","traction":"...","transparency":"...","compliance":"...","durability":"..."},"thesis":"...","status":"active","strikeReason":null}},"notes":["..."]}`;

function prompt(prev: Edition, snapshot: Snapshot): string {
  const snap = new Map(snapshot.venues.map((v) => [v.id, v]));
  const blocks = prev.venues
    .filter((v) => v.status !== 'struck')
    .map((v) => {
      const s = snap.get(v.id);
      return [
        `## ${v.id} (${v.name}, ${v.chain}, ${v.status})`,
        `scores: ${CRITERIA.map((c) => `${c}=${v.scores[c]}`).join(' ')}`,
        `rationale: ${CRITERIA.map((c) => `${c}="${v.rationale[c]}"`).join(' | ')}`,
        `thesis: "${v.thesis}"`,
        `pairing: ${v.pairing.assetType}; custodian ${v.pairing.custodian ?? 'none'}; redeemable ${v.pairing.redeemable}; ${v.pairing.verifiability}`,
        `fresh figures: cumulative ${s?.cumulativeVolumeUsd ?? 'null'}, daily ${s?.dailyVolumeUsd ?? 'null'}, fees24h ${s?.fees24hUsd ?? 'null'}, tvl ${s?.tvlUsd ?? 'null'}`,
      ].join('\n');
    });
  return [`Edition ${prev.edition}. Fresh snapshot as of ${snapshot.asOf}.`, ...blocks, 'Return the JSON object.'].join(
    '\n\n',
  );
}

function extractJson(reply: string): unknown | null {
  const start = reply.indexOf('{');
  const end = reply.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(reply.slice(start, end + 1));
  } catch {
    return null;
  }
}

const ALLOWED: VenueStatus[] = ['active', 'paused', 'struck'];

/** Null when the model is unusable. The caller then carries the previous edition. */
export async function reviewEdition(complete: Complete, prev: Edition, snapshot: Snapshot): Promise<EditionReview | null> {
  const user = prompt(prev, snapshot);
  let parsed = extractJson((await complete(SYSTEM, user)) ?? '');
  if (parsed == null) parsed = extractJson((await complete(SYSTEM, `${user}\n\nReply with the JSON object only.`)) ?? '');
  if (parsed == null || typeof parsed !== 'object') return null;
  const root = parsed as { venues?: Record<string, RawVenue>; notes?: unknown };
  if (typeof root.venues !== 'object' || root.venues === null) return null;

  const venues: Record<string, VenueReview> = {};
  for (const v of prev.venues) {
    const raw = v.status === 'struck' ? undefined : root.venues[v.id];
    const scores = { ...v.scores };
    const rationale = { ...v.rationale };
    let thesis = v.thesis;
    let status = v.status;
    let strikeReason: string | null = null;
    if (raw && typeof raw === 'object') {
      for (const c of CRITERIA) {
        const moved = clampMove(v.scores[c], raw.scores?.[c]);
        const text = raw.rationale?.[c];
        // A move only counts with new, non-empty rationale.
        if (moved !== v.scores[c] && typeof text === 'string' && text.trim() && text.trim() !== v.rationale[c]) {
          scores[c] = moved;
          rationale[c] = text.trim();
        }
      }
      if (typeof raw.thesis === 'string' && raw.thesis.trim()) thesis = raw.thesis.trim();
      // Puppies stay puppies until an editor promotes them.
      if (v.status !== 'prelaunch' && ALLOWED.includes(raw.status as VenueStatus)) {
        const next = raw.status as VenueStatus;
        const reason = typeof raw.strikeReason === 'string' ? raw.strikeReason.trim() : '';
        // A strike without a stated reason is ignored.
        if (next !== 'struck' || reason) {
          status = next;
          strikeReason = next === 'struck' ? reason : null;
        }
      }
    }
    venues[v.id] = { scores, rationale, thesis, status, strikeReason };
  }
  const notes = Array.isArray(root.notes) ? root.notes.filter((n): n is string => typeof n === 'string').slice(0, 20) : [];
  return { venues, notes };
}
