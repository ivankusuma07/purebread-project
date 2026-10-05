export const CRITERIA = ['asset', 'traction', 'transparency', 'compliance', 'durability'] as const;

export type Criterion = (typeof CRITERIA)[number];
export type Scores = Record<Criterion, number>;
export type Weights = Record<Criterion, number>;

export const HOUSE_WEIGHTS: Weights = {
  asset: 0.3, // what backs the pair, and can you check it
  traction: 0.25, // volume, share, fees, pool depth
  transparency: 0.2, // verified contracts, locks, docs, a named operator
  compliance: 0.15, // licences, prospectus, disclosure
  durability: 0.1, // age, shocks survived, dependencies
};

/** 375 parts per thousand is 9 karat, the lowest gold standard that can be hallmarked. */
export const HALLMARK = 375;

/**
 * Veracity in parts per thousand, 0..1000.
 * Scores are integers 0..10, weights must sum to 1, rounded once at the end.
 */
export function veracity(scores: Scores, weights: Weights = HOUSE_WEIGHTS): number {
  const total = CRITERIA.reduce((sum, c) => sum + weights[c], 0);
  if (Math.abs(total - 1) > 1e-9) throw new Error('weights must sum to 1');
  const mean = CRITERIA.reduce((sum, c) => sum + scores[c] * weights[c], 0);
  return Math.round(mean * 100);
}

export type Band = '22k' | '18k' | '14k' | '9k' | 'below-hallmark';

export const BANDS: readonly Band[] = ['22k', '18k', '14k', '9k', 'below-hallmark'];

/** Real gold standards: 916 is 22 karat, 750 is 18k, 585 is 14k, 375 is 9k. */
export function band(v: number): Band {
  if (v >= 916) return '22k';
  if (v >= 750) return '18k';
  if (v >= 585) return '14k';
  if (v >= HALLMARK) return '9k';
  return 'below-hallmark';
}

/** Slider integers 0..10 normalised to weights that sum to 1. All zero means equal weights. */
export function normalise(raw: Record<Criterion, number>): Weights {
  const sum = CRITERIA.reduce((a, c) => a + raw[c], 0);
  const out = {} as Weights;
  for (const c of CRITERIA) out[c] = sum === 0 ? 1 / CRITERIA.length : raw[c] / sum;
  return out;
}
