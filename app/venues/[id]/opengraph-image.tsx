/* eslint-disable @next/next/no-img-element -- next/og renders plain <img>; next/image does not work inside ImageResponse. */
import { ImageResponse } from 'next/og';
import { HALLMARK } from '../../../src/scoring/veracity';
import { allVenueIds, venueHistory } from '../../../src/site/editions';
import { BAND_LABEL, chainLabel } from '../../../src/site/lib/format';
import { art, C, Frame, HOST, OG_SIZE, ogFonts } from '../../../src/site/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'A venue in the Veracity register';

export function generateStaticParams() {
  return allVenueIds().map((id) => ({ id }));
}

const BAND_HEX: Record<string, string> = {
  '22k': '#C9A7FF',
  '18k': '#74AEFF',
  '14k': '#5AD692',
  '9k': '#F2C14E',
  'below-hallmark': '#8F97AB',
};

/** One card per venue: its name, score and band, and Hanko's verdict. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const records = venueHistory(id);
  const latest = records[records.length - 1];
  const v = latest.venue;
  const puppy = v.status === 'prelaunch';
  const hallmarked = !puppy && v.veracity >= HALLMARK;
  const thesis = v.thesis.length > 120 ? `${v.thesis.slice(0, 117)}...` : v.thesis;
  const meta = `${chainLabel(v.chain)} · edition ${latest.edition}`;
  const score = puppy ? 'Not yet scored' : String(v.veracity);
  const band = puppy ? 'Puppy' : BAND_LABEL[v.band];
  const verdict = puppy ? 'Registered, not yet ranked' : hallmarked ? 'Hallmarked' : 'Listed, not certified';
  const kicker = 'Venue papers';
  const url = HOST;

  return new ImageResponse(
    (
      <Frame
        left={<span>{meta}</span>}
        right={<span>{url}</span>}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640 }}>
            <span style={{ fontSize: 24, color: C.gold, letterSpacing: 4 }}>{kicker.toUpperCase()}</span>
            <span style={{ fontFamily: 'Mincho', fontSize: 88, lineHeight: 1.05, marginTop: 8 }}>{v.name}</span>
            <span style={{ marginTop: 18, fontSize: 28, lineHeight: 1.35, color: C.muted }}>{thesis}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 340 }}>
            <div style={{ display: 'flex', position: 'relative', width: 300, height: 220, justifyContent: 'center' }}>
              {hallmarked && <img src={art('seal')} width={200} height={200} alt="" style={{ position: 'absolute', top: 0, right: 0, transform: 'rotate(-8deg)', opacity: 0.9 }} />}
              <img src={art(hallmarked ? 'sniff-high' : 'sniff-low')} width={170} height={204} alt="" style={{ position: 'absolute', bottom: -10, left: 10 }} />
            </div>
            <span style={{ fontFamily: 'Mincho', fontSize: puppy ? 44 : 110, lineHeight: 1, color: hallmarked ? C.gold : C.muted, marginTop: 18 }}>{score}</span>
            <span
              style={{
                display: 'flex',
                marginTop: 14,
                fontSize: 22,
                whiteSpace: 'nowrap',
                padding: '6px 18px',
                borderRadius: 999,
                color: BAND_HEX[v.band],
                border: `2px solid ${BAND_HEX[v.band]}`,
              }}
            >
              {band} · {verdict}
            </span>
          </div>
        </div>
      </Frame>
    ),
    { ...size, fonts: await ogFonts(`${v.name}${score}`, `${kicker.toUpperCase()}${thesis}${meta}${url}${band}${verdict} · VERACITY`) },
  );
}
