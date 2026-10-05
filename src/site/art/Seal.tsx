import { useId } from 'react';

const VERMILION = '#d8342a';
const PAPER = '#e9eee8';

/** Hanko's head as a silhouette, centred on (50, 52) in a 100-unit box. */
const HEAD =
  'M27 44 C26 31 29 21 33 13 C40 17 45 23 47 29 Q50 28.4 53 29 C55 23 60 17 67 13 C71 21 74 31 73 44 C77 50 77 61 72 67 C67 74 59 78 50 78 C41 78 33 74 28 67 C23 61 23 50 27 44 Z';

export interface SealProps {
  /** Text set around the ring, e.g. "Veracity · Edition 2026-10". Omit for small sizes. */
  ring?: string;
  /** Skip the ink texture (tiny sizes, favicon). */
  clean?: boolean;
  className?: string;
  title?: string;
}

/**
 * The register's seal: a round vermilion hanko with Hanko's head cut out in
 * reverse. An ink filter roughens the edge and leaves small voids, the way a
 * rubber or stone seal prints on paper.
 */
export default function Seal({ ring, clean = false, className, title }: SealProps) {
  const uid = useId().replace(/:/g, '');
  const ringId = `${uid}-ring`;
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {!clean && (
        <defs>
          <filter id={`${uid}-ink`} x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={7} result="edge" />
            <feDisplacementMap in="SourceGraphic" in2="edge" scale={2.4} xChannelSelector="R" yChannelSelector="G" result="rough" />
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={1} seed={11} result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -50 0 0 0 39.5" result="speck" />
            <feComposite in="rough" in2="speck" operator="in" />
          </filter>
          <path id={ringId} d="M50 50 m-40 0 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0" />
        </defs>
      )}
      <g filter={clean ? undefined : `url(#${uid}-ink)`}>
        <circle cx={50} cy={50} r={47} fill={VERMILION} />
        {ring && !clean ? (
          <>
            <circle cx={50} cy={50} r={34} fill="none" stroke={PAPER} strokeWidth={1.4} />
            <text fill={PAPER} fontSize={8.2} fontFamily="var(--font-gothic)" fontWeight={700} letterSpacing={0.6}>
              <textPath href={`#${ringId}`} startOffset="0">
                {ring}
              </textPath>
            </text>
            <g transform="translate(50 52) scale(0.56) translate(-50 -48)">
              <path d={HEAD} fill={PAPER} />
              <SealFace />
            </g>
          </>
        ) : (
          <g transform="translate(50 52) scale(0.86) translate(-50 -48)">
            <path d={HEAD} fill={PAPER} />
            <SealFace />
          </g>
        )}
      </g>
    </svg>
  );
}

/** Eyes and nose carved back into the paper-coloured head. */
function SealFace() {
  return (
    <g fill={VERMILION}>
      <path d="M38 50 Q43 46 47 50 Q43 52.5 38 50 Z" />
      <path d="M53 50 Q57 46 62 50 Q57 52.5 53 50 Z" />
      <path d="M46 61 Q50 58.5 54 61 Q52 64.5 50 64.5 Q48 64.5 46 61 Z" />
      <path d="M50 64.5 V67.5 M50 67.5 Q47 70 44.5 68.5 M50 67.5 Q53 70 55.5 68.5" fill="none" stroke={VERMILION} strokeWidth={1.3} strokeLinecap="round" />
    </g>
  );
}
