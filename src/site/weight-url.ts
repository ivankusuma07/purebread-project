import { band, CRITERIA, normalise, veracity } from '../scoring/veracity';
import type { Criterion, Weights } from '../scoring/veracity';
import type { Venue } from '../types';
import { HOUSE_WEIGHTS } from '../scoring/veracity';

export type RawWeights = Record<Criterion, number>;

/** House slider positions. Normalised they equal HOUSE_WEIGHTS (6/20 = 0.30 and so on). */
export const HOUSE_RAW: RawWeights = { asset: 6, traction: 5, transparency: 4, compliance: 3, durability: 2 };

export interface Preset {
  id: string;
  label: string;
  note: string;
  values: RawWeights;
}

export const PRESETS: Preset[] = [
  { id: 'house', label: 'House weights', note: '30 / 25 / 20 / 15 / 10', values: HOUSE_RAW },
  {
    id: 'traction',
    label: 'Traction first',
    note: 'Volume and depth count most',
    values: { asset: 3, traction: 10, transparency: 4, compliance: 2, durability: 2 },
  },
  {
    id: 'compliance',
    label: 'Compliance first',
    note: 'Licences and disclosure count most',
    values: { asset: 4, traction: 2, transparency: 10, compliance: 10, durability: 4 },
  },
  {
    id: 'equal',
    label: 'Equal',
    note: '20% on each criterion',
    values: { asset: 5, traction: 5, transparency: 5, compliance: 5, durability: 5 },
  },
];

const PRESET_SCALE = 20;

function clampSlider(value: number): number {
  if (!Number.isFinite(value)) return Number.NaN;
  return Math.min(10, Math.max(0, Math.round(value)));
}

/** The `w` token from a query string, or null when absent or empty. */
function weightToken(search: string): string | null {
  if (!search) return null;
  const query = search.includes('?') ? search.slice(search.indexOf('?')) : search;
  try {
    const token = new URLSearchParams(query).get('w');
    return token == null || token.trim() === '' ? null : token;
  } catch {
    return null;
  }
}

/**
 * Raw slider integers from `?w=a,b,c,d,e` in criteria order. Keeps the
 * sender's values so a shared link renders their ranking before first paint.
 * Anything malformed falls back to house sliders.
 */
export function parseRawSliders(search: string): RawWeights {
  const token = weightToken(search);
  if (token == null) return { ...HOUSE_RAW };
  const parts = token.split(',').map((p) => clampSlider(Number(p.trim())));
  if (parts.length !== CRITERIA.length || parts.some((n) => !Number.isFinite(n))) return { ...HOUSE_RAW };
  const raw = {} as RawWeights;
  CRITERIA.forEach((c, i) => {
    raw[c] = parts[i];
  });
  return raw;
}

/** Normalised weights from `?w=`. Invalid or empty input falls back to house weights. */
export function parseWeights(search: string): Weights {
  if (weightToken(search) == null) return { ...HOUSE_WEIGHTS };
  const raw = parseRawSliders(search);
  const isHouseFallback = CRITERIA.every((c) => raw[c] === HOUSE_RAW[c]);
  return isHouseFallback ? { ...HOUSE_WEIGHTS } : normalise(raw);
}

/** Raw sliders to `?w=a,b,c,d,e`. */
export function serializeRaw(raw: RawWeights): string {
  return `?w=${CRITERIA.map((c) => clampSlider(raw[c]) || 0).join(',')}`;
}

/** Normalised weights to `?w=` slider integers on a 20-point scale. */
export function serializeWeights(weights: Weights): string {
  const ints = CRITERIA.map((c) => {
    const v = weights[c];
    if (!Number.isFinite(v)) return 0;
    return Math.min(10, Math.max(0, Math.round(v * PRESET_SCALE)));
  });
  if (ints.every((n) => n === 0)) return '?w=2,2,2,2,2';
  return `?w=${ints.join(',')}`;
}

export function isHouse(weights: Weights): boolean {
  return CRITERIA.every((c) => Math.abs(weights[c] - HOUSE_WEIGHTS[c]) < 1e-9);
}

/** Rescore at reader weights, highest first with the alphabetical tie-break, and re-rank. */
export function applyWeights(venues: Venue[], weights: Weights): Venue[] {
  const scored = venues.map((v) => {
    const score = veracity(v.scores, weights);
    return { ...v, veracity: score, band: band(score) };
  });
  scored.sort((a, b) => b.veracity - a.veracity || a.name.localeCompare(b.name, 'en'));
  return scored.map((v, i) => ({ ...v, rank: i + 1 }));
}
