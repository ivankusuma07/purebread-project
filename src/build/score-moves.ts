import { CRITERIA, type Criterion } from '../scoring/veracity';
import type { Edition } from '../types';

export interface ScoreMove {
  id: string;
  name: string;
  criterion: Criterion;
  from: number;
  to: number;
  rationaleChanged: boolean;
}

export function scoreMoves(curr: Edition, prev: Edition): ScoreMove[] {
  const prior = new Map(prev.venues.map((v) => [v.id, v]));
  const moves: ScoreMove[] = [];
  for (const v of curr.venues) {
    const p = prior.get(v.id);
    if (!p) continue;
    for (const c of CRITERIA) {
      if (v.scores[c] === p.scores[c]) continue;
      moves.push({
        id: v.id,
        name: v.name,
        criterion: c,
        from: p.scores[c],
        to: v.scores[c],
        rationaleChanged: v.rationale[c] !== p.rationale[c],
      });
    }
  }
  return moves;
}

/**
 * Score policy assistant. Non-blocking: flags moves beyond ±1 and moves whose
 * rationale didn't change. `--strict` turns these into a halted run.
 */
export function warnScoreMoves(curr: Edition, prev: Edition): string[] {
  const warnings: string[] = [];
  for (const m of scoreMoves(curr, prev)) {
    if (Math.abs(m.to - m.from) > 1) {
      warnings.push(`${m.id} ${m.criterion}: moved ${m.from} -> ${m.to}, beyond the ±1 cap`);
    }
    if (!m.rationaleChanged) {
      warnings.push(`${m.id} ${m.criterion}: moved ${m.from} -> ${m.to} but the rationale is unchanged`);
    }
  }
  return warnings;
}
