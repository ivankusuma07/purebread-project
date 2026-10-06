import Image from 'next/image';
import { VENUE_ICON_IDS } from '../venue-icons';

interface VenueIconProps {
  id: string;
  name: string;
  /** Rendered size in px. */
  size?: number;
  className?: string;
}

/**
 * A venue's official logo, taken from its own site (scripts/fetch-venue-icons.ts).
 * Venues without a verified logo get a letter mark, never a lookalike.
 * Decorative: the venue's name always sits next to it.
 */
export default function VenueIcon({ id, name, size = 32, className = '' }: VenueIconProps) {
  const shape = `shrink-0 overflow-hidden rounded-[28%] ring-1 ring-white/10 ${className}`;
  if (VENUE_ICON_IDS.has(id)) {
    return <Image src={`/venues/${id}.png`} alt="" width={size} height={size} className={`${shape} bg-white/[0.04] object-contain`} />;
  }
  return (
    <span
      aria-hidden
      className={`${shape} grid place-items-center bg-gradient-to-br from-white/[0.12] to-white/[0.03] font-mincho font-bold text-ink-2`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.48) }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
