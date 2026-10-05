import { describe, expect, it } from 'vitest';
import { band, HOUSE_WEIGHTS, normalise, veracity } from '../src/scoring/veracity';
import { applyWeights, HOUSE_RAW, parseRawSliders, parseWeights, serializeRaw, serializeWeights } from '../src/site/weight-url';
import type { Venue } from '../src/types';

describe('scoring (U-01 to U-07)', () => {
  it('U-01: {8,8,6,6,7} scores 720', () => {
    expect(veracity({ asset: 8, traction: 8, transparency: 6, compliance: 6, durability: 7 })).toBe(720);
  });

  it('U-02: {2,1,5,1,2} scores 220', () => {
    expect(veracity({ asset: 2, traction: 1, transparency: 5, compliance: 1, durability: 2 })).toBe(220);
  });

  it('U-03: karat band boundaries', () => {
    expect(band(375)).toBe('9k');
    expect(band(374)).toBe('below-hallmark');
    expect(band(585)).toBe('14k');
    expect(band(584)).toBe('9k');
    expect(band(750)).toBe('18k');
    expect(band(749)).toBe('14k');
    expect(band(916)).toBe('22k');
    expect(band(915)).toBe('18k');
  });

  it('U-04: weights that do not sum to 1 throw', () => {
    const s = { asset: 8, traction: 8, transparency: 6, compliance: 6, durability: 7 };
    expect(() => veracity(s, { asset: 1, traction: 1, transparency: 1, compliance: 1, durability: 1 })).toThrow(/sum to 1/);
  });

  it('U-05: all sliders at zero fall back to equal weights', () => {
    const w = normalise({ asset: 0, traction: 0, transparency: 0, compliance: 0, durability: 0 });
    for (const v of Object.values(w)) expect(v).toBeCloseTo(0.2, 12);
  });

  it('U-06: ?w= round-trips exactly, bad input falls back to house weights', () => {
    expect(parseWeights(serializeWeights(HOUSE_WEIGHTS))).toEqual(HOUSE_WEIGHTS);
    expect(parseWeights('?w=6,5,4,3,2')).toEqual(HOUSE_WEIGHTS);
    const raw = { asset: 3, traction: 10, transparency: 4, compliance: 2, durability: 2 };
    expect(parseRawSliders(serializeRaw(raw))).toEqual(raw);
    for (const bad of ['', '?w=', '?w=1,2,3', '?w=a,b,c,d,e', '?w=1,2,3,4,5,6', '?x=1']) {
      expect(parseWeights(bad)).toEqual(HOUSE_WEIGHTS);
      expect(parseRawSliders(bad)).toEqual(HOUSE_RAW);
    }
    // Out-of-range values clamp to 0..10 rather than fail.
    expect(parseRawSliders('?w=99,-4,5,5,5')).toEqual({ asset: 10, traction: 0, transparency: 5, compliance: 5, durability: 5 });
  });

  it('U-07: ties break alphabetically', () => {
    const base = {
      scores: { asset: 5, traction: 5, transparency: 5, compliance: 5, durability: 5 },
    } as Venue;
    const ranked = applyWeights(
      [
        { ...base, id: 'z', name: 'Zeta' },
        { ...base, id: 'a', name: 'Alpha' },
        { ...base, id: 'm', name: 'Mu' },
      ],
      HOUSE_WEIGHTS,
    );
    expect(ranked.map((v) => v.name)).toEqual(['Alpha', 'Mu', 'Zeta']);
    expect(ranked.map((v) => v.rank)).toEqual([1, 2, 3]);
  });
});
