import type { Edition } from '../../types';

/** The headline finding, as Fineness: does anything clear 18 karat? */
export function headlineFinding(edition: Edition): string {
  const ranked = edition.venues.filter((v) => v.status !== 'prelaunch' && v.status !== 'struck');
  const peak = Math.max(0, ...ranked.map((v) => v.veracity));
  if (peak >= 916) return 'A venue in this register clears 22 karat.';
  if (peak >= 750) return 'A venue in this register clears 18 karat.';
  return 'Nothing in this register clears 18 karat.';
}
