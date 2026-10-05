/*
 * Hanko, the register's inspector. Brush-ink line in indigo, flat Shiba red,
 * cream mask, and the vermilion of his seal as the only bright mark. One
 * figure, posed by props, so every pose shares the same line and palette.
 * These are working vectors; the plan calls for a hand-drawn final set.
 */

export type HankoPose = 'sit' | 'fetch' | 'judge' | 'stamp-up' | 'stamp-down';
export type HankoMood = 'calm' | 'alert' | 'wary';

const INK = '#1f2b4a';
const RED = '#c67b3d';
const CREAM = '#f3ead8';
const PAPER = '#e9eee8';
const GRID = '#9fb8a3';
const VERMILION = '#d8342a';

const LINE = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

/** A thick limb or tail: ink outline under a coloured core. */
function Limb({ d, color = RED, width = 13 }: { d: string; color?: string; width?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={width + 5} />
      <path d={d} stroke={color} strokeWidth={width} />
    </g>
  );
}

function Ears({ mood }: { mood: HankoMood }) {
  const back = mood === 'wary';
  return back ? (
    <g {...LINE}>
      <path d="M63 72 L42 42 L88 49 Z" fill={RED} />
      <path d="M137 72 L158 42 L112 49 Z" fill={RED} />
      <path d="M66 64 L53 47 L80 51 Z" fill={CREAM} stroke="none" />
      <path d="M134 64 L147 47 L120 51 Z" fill={CREAM} stroke="none" />
    </g>
  ) : (
    <g {...LINE}>
      <path d="M60 70 C60 48 64 30 71 19 C80 25 90 35 97 44 Z" fill={RED} />
      <path d="M140 70 C140 48 136 30 129 19 C120 25 110 35 103 44 Z" fill={RED} />
      <path d="M68 60 C68 46 71 36 74 30 C80 35 86 40 89 46 Z" fill={CREAM} stroke="none" />
      <path d="M132 60 C132 46 129 36 126 30 C120 35 114 40 111 46 Z" fill={CREAM} stroke="none" />
    </g>
  );
}

function Face({ mood, mouthFull }: { mood: HankoMood; mouthFull?: boolean }) {
  // Side-eye is his resting face: pupils to one side under a heavy lid.
  const look = mood === 'alert' ? 0 : 3.5;
  const lid = mood === 'alert' ? 1.6 : 2.8;
  const pupil = mood === 'alert' ? 3.6 : 3.1;
  return (
    <g>
      {/* urajiro: the cream mask on cheeks and muzzle */}
      <ellipse cx={73} cy={103} rx={14} ry={11} fill={CREAM} />
      <ellipse cx={127} cy={103} rx={14} ry={11} fill={CREAM} />
      <ellipse cx={100} cy={106} rx={25} ry={18} fill={CREAM} />
      {/* eyebrow spots */}
      <ellipse cx={85} cy={63} rx={5} ry={2.8} fill={CREAM} />
      <ellipse cx={115} cy={63} rx={5} ry={2.8} fill={CREAM} />
      {/* eyes */}
      <path d="M76 78 Q85 71 94 78 Q85 83 76 78 Z" fill={PAPER} stroke={INK} strokeWidth={1.2} />
      <path d="M106 78 Q115 71 124 78 Q115 83 106 78 Z" fill={PAPER} stroke={INK} strokeWidth={1.2} />
      <circle cx={85 + look} cy={78} r={pupil} fill={INK} />
      <circle cx={115 + look} cy={78} r={pupil} fill={INK} />
      <path d="M74.5 77 Q85 69.5 95.5 77" fill="none" stroke={INK} strokeWidth={lid} strokeLinecap="round" />
      <path d="M104.5 77 Q115 69.5 125.5 77" fill="none" stroke={INK} strokeWidth={lid} strokeLinecap="round" />
      {/* nose and mouth */}
      <path d="M93 95 Q100 90 107 95 Q104 101 100 101 Q96 101 93 95 Z" fill={INK} />
      {!mouthFull && (
        <path d="M100 100 L100 105 M100 105 Q94 110 89 107 M100 105 Q106 110 111 107" fill="none" {...LINE} strokeWidth={1.8} />
      )}
    </g>
  );
}

function Tail({ mood }: { mood: HankoMood }) {
  return mood === 'wary' ? (
    <Limb d="M134 186 C152 194 166 204 172 220" width={12} />
  ) : (
    <g>
      <Limb d="M136 178 C170 178 180 146 164 133 C150 122 136 138 148 149" width={14} />
      <path d="M140 172 C164 170 172 148 162 140" fill="none" stroke={CREAM} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

function SealStick({ x, y, small }: { x: number; y: number; small?: boolean }) {
  const w = small ? 9 : 11;
  const h = small ? 11 : 18;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={small ? 2 : 1} fill={INK} />
      <rect x={x} y={y + h} width={w} height={3} fill={VERMILION} />
    </g>
  );
}

function Body({ pose, mood }: { pose: HankoPose; mood: HankoMood }) {
  const rightLegDown = pose !== 'stamp-up' && pose !== 'stamp-down';
  return (
    <g>
      <Tail mood={mood} />
      {/* haunches */}
      <ellipse cx={70} cy={202} rx={22} ry={19} fill={RED} {...LINE} />
      <ellipse cx={130} cy={202} rx={22} ry={19} fill={RED} {...LINE} />
      {/* body and bib */}
      <path d="M66 216 C60 170 74 132 100 128 C126 132 140 170 134 216 Z" fill={RED} {...LINE} />
      <path d="M85 216 C83 178 89 147 100 143 C111 147 117 178 115 216 Z" fill={CREAM} />
      {/* forelegs: white socks, inspector's armband on the left */}
      <rect x={79} y={166} width={16} height={50} rx={7} fill={CREAM} {...LINE} />
      <rect x={79} y={177} width={16} height={7} fill={GRID} {...LINE} strokeWidth={1.6} />
      <ellipse cx={87} cy={217} rx={11} ry={5.5} fill={CREAM} {...LINE} />
      {rightLegDown && (
        <>
          <rect x={105} y={166} width={16} height={50} rx={7} fill={CREAM} {...LINE} />
          <ellipse cx={113} cy={217} rx={11} ry={5.5} fill={CREAM} {...LINE} />
        </>
      )}
      {/* the hanko on its cord, and a jeweller's loupe tucked in the collar */}
      <path d="M78 121 Q100 142 122 121" fill="none" stroke={INK} strokeWidth={1.5} />
      {rightLegDown && <SealStick x={95} y={133} small />}
      <circle cx={121} cy={131} r={5.5} fill={PAPER} stroke={INK} strokeWidth={1.8} />
      <path d="M125 135 L130 141" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      {/* head */}
      <Ears mood={mood} />
      <path d="M55 86 C52 56 76 40 100 40 C124 40 148 56 145 86 C143 110 124 125 100 125 C76 125 57 110 55 86 Z" fill={RED} {...LINE} />
      <Face mood={mood} mouthFull={pose === 'fetch'} />
      {pose === 'fetch' && (
        <g {...LINE} strokeWidth={1.8}>
          <rect x={66} y={101} width={68} height={10} fill={PAPER} />
          <circle cx={66} cy={106} r={6.5} fill={PAPER} />
          <circle cx={134} cy={106} r={6.5} fill={PAPER} />
          <path d="M76 104 H120 M76 108 H112" strokeWidth={1} />
        </g>
      )}
      {pose === 'stamp-up' && (
        <g>
          <Limb d="M118 152 C136 142 146 124 150 104" color={CREAM} width={14} />
          <SealStick x={145} y={78} />
          <ellipse cx={151} cy={101} rx={9} ry={7} fill={CREAM} {...LINE} />
        </g>
      )}
      {pose === 'stamp-down' && (
        <g>
          <Limb d="M118 152 C138 162 148 178 150 196" color={CREAM} width={14} />
          <SealStick x={145} y={200} />
          <ellipse cx={151} cy={199} rx={9} ry={7} fill={CREAM} {...LINE} />
        </g>
      )}
    </g>
  );
}

/** A certificate at his feet with a small seal, for the inspecting pose. */
function Certificate() {
  return (
    <g transform="rotate(-6 150 212)">
      <rect x={128} y={200} width={42} height={27} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      <path d="M134 208 H160 M134 213 H156 M134 218 H150" stroke={INK} strokeWidth={1} />
      <circle cx={162} cy={220} r={4} fill={VERMILION} />
    </g>
  );
}

/** Balance scale: a stock certificate against a memecoin. */
function Scale() {
  return (
    <g {...LINE} strokeWidth={2}>
      <path d="M250 222 V96 M228 222 H272" fill="none" />
      <path d="M200 112 L300 92" fill="none" />
      <circle cx={250} cy={102} r={4} fill={INK} />
      {/* heavier side: the certificate */}
      <path d="M200 112 L186 150 M200 112 L214 150" fill="none" strokeWidth={1.2} />
      <path d="M182 150 H218 Q216 160 200 160 Q184 160 182 150 Z" fill={PAPER} />
      <rect x={188} y={130} width={24} height={18} fill={PAPER} strokeWidth={1.4} />
      <path d="M192 136 H208 M192 141 H204" strokeWidth={1} />
      <circle cx={206} cy={144} r={2.6} fill={VERMILION} stroke="none" />
      {/* lighter side: the memecoin */}
      <path d="M300 92 L286 130 M300 92 L314 130" fill="none" strokeWidth={1.2} />
      <path d="M282 130 H318 Q316 140 300 140 Q284 140 282 130 Z" fill={PAPER} />
      <circle cx={300} cy={121} r={8} fill={GRID} strokeWidth={1.4} />
      <path d="M297 118 L303 124 M303 118 L297 124" strokeWidth={1.2} />
    </g>
  );
}

export interface HankoProps {
  pose?: HankoPose;
  mood?: HankoMood;
  /** Shows the certificate he is inspecting. */
  certificate?: boolean;
  title?: string;
  className?: string;
}

export default function Hanko({ pose = 'sit', mood = 'calm', certificate = false, title, className }: HankoProps) {
  const wide = pose === 'judge';
  return (
    <svg
      viewBox={wide ? '0 0 330 240' : '0 0 200 240'}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d="M30 228 C70 225 130 226 175 228" fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round" opacity={0.6} />
      <Body pose={pose} mood={mood} />
      {certificate && pose === 'sit' && <Certificate />}
      {pose === 'stamp-down' && <circle cx={150.5} cy={229} r={7} fill={VERMILION} opacity={0.85} />}
      {wide && <Scale />}
    </svg>
  );
}
