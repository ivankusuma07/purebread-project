import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Edition, Snapshot } from '../types';
import { clampMove, reviewEdition } from './review';

const prev = JSON.parse(readFileSync(join(process.cwd(), 'data/editions/2026-10.json'), 'utf8')) as Edition;
const snapshot: Snapshot = { snapshot: '2026-11-01', asOf: '2026-11-01', venues: [] };
const [first, second] = prev.venues;

const reply = (body: unknown) => async () => (typeof body === 'string' ? body : JSON.stringify(body));

describe('A-06: guarded AI review', () => {
  it('clamps moves to ±1 and keeps integers in 0..10', () => {
    expect(clampMove(5, 8)).toBe(6);
    expect(clampMove(5, 1)).toBe(4);
    expect(clampMove(10, 11)).toBe(10);
    expect(clampMove(5, 5.5)).toBe(5);
    expect(clampMove(5, 'seven')).toBe(5);
  });

  it('applies a +3 proposal as +1, only with fresh rationale', async () => {
    const review = await reviewEdition(
      reply({
        venues: {
          [first.id]: {
            scores: { ...first.scores, asset: first.scores.asset + 3, traction: first.scores.traction + 1 },
            rationale: { ...first.rationale, asset: 'A custodian statement was published on 3 November.' },
          },
        },
      }),
      prev,
      snapshot,
    );
    expect(review?.venues[first.id].scores.asset).toBe(first.scores.asset + 1);
    expect(review?.venues[first.id].rationale.asset).toBe('A custodian statement was published on 3 November.');
    // Traction moved without new rationale, so it is dropped.
    expect(review?.venues[first.id].scores.traction).toBe(first.scores.traction);
  });

  it('drops a move whose rationale is empty', async () => {
    const review = await reviewEdition(
      reply({
        venues: { [second.id]: { scores: { ...second.scores, asset: second.scores.asset - 1 }, rationale: { asset: '   ' } } },
      }),
      prev,
      snapshot,
    );
    expect(review?.venues[second.id].scores).toEqual(second.scores);
  });

  it('ignores unknown venue ids and never adds a venue', async () => {
    const review = await reviewEdition(reply({ venues: { 'not-a-venue': { scores: { asset: 10 } } } }), prev, snapshot);
    expect(Object.keys(review?.venues ?? {}).sort()).toEqual(prev.venues.map((v) => v.id).sort());
  });

  it('returns null on garbage so the previous edition carries', async () => {
    expect(await reviewEdition(reply('I cannot help with that.'), prev, snapshot)).toBeNull();
    expect(await reviewEdition(async () => null, prev, snapshot)).toBeNull();
    expect(await reviewEdition(reply({ venues: 'nope' }), prev, snapshot)).toBeNull();
  });

  it('ignores a strike that gives no reason', async () => {
    const review = await reviewEdition(reply({ venues: { [first.id]: { status: 'struck' } } }), prev, snapshot);
    expect(review?.venues[first.id].status).toBe(first.status);
    const withReason = await reviewEdition(
      reply({ venues: { [first.id]: { status: 'struck', strikeReason: 'Interface dark for 60 days.' } } }),
      prev,
      snapshot,
    );
    expect(withReason?.venues[first.id].status).toBe('struck');
  });
});
