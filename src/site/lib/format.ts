import type { Band } from '../../scoring/veracity';

/** Null-safe money. Null never renders as zero. */
export function usd(value: number | null): string {
  if (value == null) return 'not published';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

/** Normalised weight (0..1) as a whole percentage. */
export function pct(weight: number): string {
  return `${Math.round(weight * 1000) / 10}%`;
}

/** `0x73e6…7b99`, or `sha256:df90…6d23` for prefixed hashes. */
export function shortHash(value: string, head = 4, tail = 4): string {
  const prefix = value.startsWith('sha256:') ? 'sha256:' : value.startsWith('0x') ? '0x' : '';
  const body = value.slice(prefix.length);
  if (body.length <= head + tail + 1) return value;
  return `${prefix}${body.slice(0, head)}…${body.slice(-tail)}`;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** 2026-10-01 → 1 October 2026 */
export function longDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** 2026-10-01 → 1 Oct */
export function shortDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1].slice(0, 3)}`;
}

/** 2026-10 → October 2026 */
export function editionMonth(id: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(id);
  if (!m) return id;
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** The month after a YYYY-MM edition, as "November 2026". */
export function nextEditionMonth(id: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(id);
  if (!m) return 'next month';
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]), 1));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export const BAND_LABEL: Record<Band, string> = {
  '22k': '22k',
  '18k': '18k',
  '14k': '14k',
  '9k': '9k',
  'below-hallmark': 'Below hallmark',
};

export const CHAIN_LABEL: Record<string, string> = {
  'robinhood-chain': 'Robinhood',
  solana: 'Solana',
  base: 'Base',
  ethereum: 'Ethereum',
};

export function chainLabel(chain: string): string {
  return CHAIN_LABEL[chain] ?? chain;
}

export const ASSET_TYPE_LABEL: Record<string, string> = {
  'tokenized-equity': 'Tokenized equity',
  'inventory-index': 'Inventory index',
  collectible: 'Collectible',
  synthetic: 'Synthetic',
  none: 'No real asset',
};

export const VERIFIABILITY_LABEL: Record<string, string> = {
  'on-chain': 'On-chain',
  'public-inventory': 'Public inventory',
  attestation: 'Attestation',
  none: 'None',
};

/** Signed whole number with a real minus sign: +25, −12, 0. */
export function signed(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return '0';
}
