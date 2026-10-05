import type { Band } from '../../scoring/veracity';
import { BAND_LABEL } from '../lib/format';

/** Swatch and text colour per karat band. */
export const BAND_COLOR: Record<Band, { swatch: string; text: string }> = {
  '22k': { swatch: 'var(--color-k22)', text: 'var(--color-k22)' },
  '18k': { swatch: 'var(--color-k18)', text: 'var(--color-k18)' },
  '14k': { swatch: 'var(--color-k14)', text: 'var(--color-k14-ink)' },
  '9k': { swatch: 'var(--color-k9)', text: 'var(--color-k9-ink)' },
  'below-hallmark': { swatch: 'var(--color-below)', text: 'var(--color-below-ink)' },
};

/** A karat band: a glowing dot and the name, or a tinted pill. */
export default function BandMark({ band, pill = false, className = '' }: { band: Band; pill?: boolean; className?: string }) {
  const c = BAND_COLOR[band];
  const dot =
    band !== 'below-hallmark' ? (
      <span aria-hidden className="inline-block size-2 rounded-full" style={{ background: c.swatch, boxShadow: `0 0 8px ${c.swatch}` }} />
    ) : null;
  if (pill) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-sm font-medium ${className}`}
        style={{ color: c.text, borderColor: `color-mix(in srgb, ${c.swatch} 40%, transparent)`, background: `color-mix(in srgb, ${c.swatch} 12%, transparent)` }}
        data-band={band}
      >
        {dot}
        {BAND_LABEL[band]}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${className}`} style={{ color: c.text }} data-band={band}>
      {dot}
      {BAND_LABEL[band]}
    </span>
  );
}
