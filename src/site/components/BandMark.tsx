import type { Band } from '../../scoring/veracity';
import { BAND_LABEL } from '../lib/format';

/** Swatch colour (plan palette) and text colour (passes 4.5:1 on paper). */
export const BAND_COLOR: Record<Band, { swatch: string; text: string }> = {
  '22k': { swatch: 'var(--color-k22)', text: 'var(--color-k22)' },
  '18k': { swatch: 'var(--color-k18)', text: 'var(--color-k18)' },
  '14k': { swatch: 'var(--color-k14)', text: 'var(--color-k14-ink)' },
  '9k': { swatch: 'var(--color-k9)', text: 'var(--color-k9-ink)' },
  'below-hallmark': { swatch: 'var(--color-below)', text: 'var(--color-below-ink)' },
};

/** A karat band: a small square of its ink beside the name. Below hallmark gets no swatch. */
export default function BandMark({ band, className = '' }: { band: Band; className?: string }) {
  const c = BAND_COLOR[band];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${className}`} style={{ color: c.text }} data-band={band}>
      {band !== 'below-hallmark' && <span aria-hidden className="inline-block size-2.5" style={{ background: c.swatch }} />}
      {BAND_LABEL[band]}
    </span>
  );
}
