// Writes Hanko's pose sheet and the seal to art/hanko/*.svg from the same
// components the site renders, so the files and the page never drift apart.
//
//   pnpm art:export

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import Hanko, { type HankoProps } from '../src/site/art/Hanko';
import Seal from '../src/site/art/Seal';

const out = join(process.cwd(), 'art', 'hanko');
mkdirSync(out, { recursive: true });

const poses: Record<string, HankoProps> = {
  'inspector': { pose: 'sit', mood: 'calm', certificate: true },
  'fetch': { pose: 'fetch', mood: 'calm' },
  'judge': { pose: 'judge', mood: 'calm' },
  'freeze': { pose: 'stamp-down', mood: 'calm' },
  'stamp-up': { pose: 'stamp-up', mood: 'alert' },
  'stamp-down': { pose: 'stamp-down', mood: 'calm' },
  'sniff-high': { pose: 'sit', mood: 'alert' },
  'sniff-low': { pose: 'sit', mood: 'wary' },
};

const xml = (markup: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n${markup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')}\n`;

for (const [name, props] of Object.entries(poses)) {
  writeFileSync(join(out, `${name}.svg`), xml(renderToStaticMarkup(<Hanko {...props} />)));
}
writeFileSync(join(out, 'seal.svg'), xml(renderToStaticMarkup(<Seal />)));
writeFileSync(join(out, 'seal-edition.svg'), xml(renderToStaticMarkup(<Seal ring="VERACITY · ASSAY REGISTER · EDITION SEAL ·" />)));
console.log(`wrote ${Object.keys(poses).length + 2} files to art/hanko`);
