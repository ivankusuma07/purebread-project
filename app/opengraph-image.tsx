/* eslint-disable @next/next/no-img-element -- next/og renders plain <img>; next/image does not work inside ImageResponse. */
import { ImageResponse } from 'next/og';
import { HALLMARK } from '../src/scoring/veracity';
import { LATEST_EDITION } from '../src/site/editions';
import { headlineFinding } from '../src/site/lib/finding';
import { art, C, Frame, HOST, OG_SIZE, ogFonts } from '../src/site/og';

export const alt = 'Veracity: most venues launch memecoins. Hanko checks the papers.';
export const size = OG_SIZE;
export const contentType = 'image/png';

/** The site-wide share card: the claim, this edition's leader, and Hanko with the seal. */
export default async function Image() {
  const ranked = LATEST_EDITION.venues.filter((v) => v.status !== 'prelaunch' && v.status !== 'struck');
  const top = ranked[0];
  const below = ranked.filter((v) => v.veracity < HALLMARK).length;
  const line1 = 'Most venues launch memecoins.';
  const line2 = 'Hanko checks the papers.';
  const finding = headlineFinding(LATEST_EDITION);
  const stats = `Edition ${LATEST_EDITION.edition}`;
  const leader = top ? `${top.name} leads at ${top.veracity}` : '';
  const belowText = `${below} below the hallmark`;
  const url = HOST;

  return new ImageResponse(
    (
      <Frame
        left={
          <span>
            <span style={{ color: C.gold }}>{stats}</span>
            {`  ·  ${[leader, belowText].filter(Boolean).join('  ·  ')}`}
          </span>
        }
        right={<span>{url}</span>}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 700 }}>
            <span style={{ fontFamily: 'Mincho', fontSize: 68, lineHeight: 1.08 }}>{line1}</span>
            <span style={{ fontFamily: 'Mincho', fontSize: 68, lineHeight: 1.08, color: C.gold }}>{line2}</span>
            <span style={{ marginTop: 22, fontSize: 28, color: C.muted }}>{finding}</span>
          </div>
          <div style={{ display: 'flex', position: 'relative', width: 330, height: 330 }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                borderRadius: 999,
                backgroundImage: 'radial-gradient(circle, rgba(255,90,69,0.45), transparent 68%)',
              }}
            />
            <img src={art('seal')} width={250} height={250} alt="" style={{ position: 'absolute', top: 30, left: 50, transform: 'rotate(-6deg)' }} />
            <img src={art('stamp-down')} width={130} height={156} alt="" style={{ position: 'absolute', bottom: -10, left: -20 }} />
          </div>
        </div>
      </Frame>
    ),
    { ...size, fonts: await ogFonts(line1 + line2, `${finding}${stats}${leader}${belowText}${url}VERACITY`) },
  );
}
