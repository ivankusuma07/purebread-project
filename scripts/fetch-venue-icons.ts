// Downloads each venue's official logo from its own site and stores it as a
// 128px PNG in public/venues/<id>.png, then writes src/site/venue-icons.ts so
// the site only links logos that exist.
//
//   pnpm tsx scripts/fetch-venue-icons.ts
//
// Every URL below was read from the venue's own <link rel="icon">,
// <link rel="apple-touch-icon"> or manifest on 6 October 2026, and each logo was
// checked by eye. A venue without a verified logo (Long.xyz: its site is behind a
// Cloudflare challenge, and cached copies elsewhere disagree) shows a letter
// mark instead. Never fill a gap from a lookalike.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const OFFICIAL: Record<string, string> = {
  pons: 'https://www.ponsfamily.com/apple-icon.png',
  stonkfun: 'https://www.stonkfun.xyz/stonkfun-logo.png',
  bankr: 'https://bankr.bot/pwa-icon-512.png',
  pair: 'https://pair.fund/pair-logo.png',
  flap: 'https://flap.sh/icon.svg',
  // pools.trade now redirects to pools.xyz, Uniswap Labs' renamed launchpad.
  'pools-trade': 'https://pools.xyz/apple-touch-icon.png',
  'factory-new': 'https://factorynewpad.fun/favicon.svg',
};

const SIZE = 128;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';

async function download(url: string): Promise<Buffer> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (attempt >= 3) throw new Error(`${url}: ${err instanceof Error ? err.message : err}`);
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
}

async function main(): Promise<void> {
  const outDir = join(process.cwd(), 'public', 'venues');
  mkdirSync(outDir, { recursive: true });
  const saved: string[] = [];
  for (const [id, url] of Object.entries(OFFICIAL)) {
    const raw = await download(url);
    // density renders SVG logos sharply before the resize.
    await sharp(raw, { density: 384 })
      .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(join(outDir, `${id}.png`));
    saved.push(id);
    console.log(`${id.padEnd(12)} ${url}`);
  }

  const manifest = `// Written by scripts/fetch-venue-icons.ts. Venues listed here have an official
// logo at public/venues/<id>.png; the rest show a letter mark.

export const VENUE_ICON_IDS: ReadonlySet<string> = new Set([
${saved.map((id) => `  '${id}',`).join('\n')}
]);
`;
  writeFileSync(join(process.cwd(), 'src', 'site', 'venue-icons.ts'), manifest);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
