import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// A-09. Em dashes read as AI-written copy, so none ship anywhere: page copy,
// component strings, data, docs. The plan file is exempt because it quotes the
// character in the rule itself.
const ROOTS = ['app', 'src', 'data', 'docs', 'scripts', 'e2e', 'tests', 'README.md'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.json', '.md', '.css', '.mjs']);
const EM_DASH = String.fromCharCode(0x2014);

function walk(path: string): string[] {
  let stats;
  try {
    stats = statSync(path);
  } catch {
    return [];
  }
  if (stats.isFile()) return EXTENSIONS.has(extname(path)) ? [path] : [];
  return readdirSync(path).flatMap((name) => walk(join(path, name)));
}

describe('A-09: no em dashes', () => {
  it('appear in any copy, component, data or doc file', () => {
    const root = process.cwd();
    const hits: string[] = [];
    for (const file of ROOTS.flatMap((r) => walk(join(root, r)))) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (line.includes(EM_DASH)) hits.push(`${relative(root, file)}:${i + 1}`);
        });
    }
    expect(hits).toEqual([]);
  });
});
