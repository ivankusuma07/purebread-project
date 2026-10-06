// Writes the seal to art/hanko/*.svg from the same component the site renders,
// so the files and the page never drift apart. Hanko himself is raster art in
// public/hanko; the share cards read the PNGs in art/hanko.
//
//   pnpm art:export

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import Seal from '../src/site/art/Seal';

const out = join(process.cwd(), 'art', 'hanko');
mkdirSync(out, { recursive: true });

const xml = (markup: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n${markup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')}\n`;

writeFileSync(join(out, 'seal.svg'), xml(renderToStaticMarkup(<Seal />)));
writeFileSync(join(out, 'seal-edition.svg'), xml(renderToStaticMarkup(<Seal ring="VERACITY · ASSAY REGISTER · EDITION SEAL ·" />)));
console.log('wrote 2 files to art/hanko');
