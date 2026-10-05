// Monthly run (Railway cron, day 1 at 05:00 UTC):
// ingest → snapshot → hash → AI review (±1, enforced in code) → carry →
// validate → write edition → commit and push. Without LLM credentials every
// score carries unchanged. Any failure removes the new snapshot and exits
// non-zero, so a bad run leaves nothing behind.
//
//   pnpm monthly [--edition=YYYY-MM] [--as-of=YYYY-MM-DD] [--published=YYYY-MM-DD] [--strict] [--commit]

import { execFileSync } from 'node:child_process';
import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { checkAdmission, scopeNote } from '../src/build/admission';
import { buildNextEdition } from '../src/build/carry';
import { hashSnapshot, serializeEdition } from '../src/build/edition';
import { warnScoreMoves } from '../src/build/score-moves';
import { validateEdition } from '../src/build/validate';
import { runIngest } from '../src/ingest/run';
import { chatClient, llmConfig } from '../src/llm/client';
import { reviewEdition } from '../src/llm/review';
import type { Edition, Snapshot, SourceRegistry } from '../src/types';

function arg(name: string): string | null {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  const value = hit ? hit.slice(name.length + 3) : '';
  return value.length > 0 ? value : null;
}

const flag = (name: string) => process.argv.includes(`--${name}`);
const today = () => new Date().toISOString().slice(0, 10);

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function atomicWrite(path: string, content: string): Promise<void> {
  const tmp = join(dirname(path), `.${Date.now()}.tmp`);
  await writeFile(tmp, content, 'utf8');
  await rename(tmp, path);
}

/** The month after a YYYY-MM id, so an unattended run always targets a fresh slot. */
export function nextEditionId(id: string): string {
  const [y, m] = id.split('-').map(Number);
  const d = new Date(Date.UTC(y, m, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function git(args: string[]): void {
  execFileSync('git', args, { stdio: 'inherit' });
}

async function main(): Promise<void> {
  const root = process.cwd();
  const asOf = arg('as-of') ?? today();
  const published = arg('published') ?? today();
  const editionsDir = join(root, 'data', 'editions');
  const snapshotsDir = join(root, 'data', 'snapshots');
  const sources = await readJson<SourceRegistry>(join(root, 'data', 'sources.json'));

  const files = (await readdir(editionsDir)).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort();
  if (files.length === 0) throw new Error('no published edition to carry from');
  const prev = await readJson<Edition>(join(editionsDir, files[files.length - 1]));

  const editionId = arg('edition') ?? nextEditionId(prev.edition);
  if (!/^\d{4}-\d{2}$/.test(editionId)) throw new Error(`bad edition id ${editionId}`);
  if (prev.edition >= editionId) {
    throw new Error(`edition ${editionId} is not newer than ${prev.edition}, refusing to overwrite the register`);
  }

  // Rebuilt from the frozen edition so the retention rule has a fallback even
  // when last month's snapshot file is missing.
  const prevSnapshot: Snapshot = {
    snapshot: prev.dataAsOf,
    asOf: prev.dataAsOf,
    venues: prev.venues.map((v) => ({
      id: v.id,
      cumulativeVolumeUsd: v.metrics.cumulativeVolumeUsd,
      dailyVolumeUsd: v.metrics.dailyVolumeUsd,
      fees24hUsd: v.metrics.fees24hUsd,
      tvlUsd: v.metrics.tvlUsd,
      contracts: v.contracts,
    })),
  };

  const snapshotPath = join(snapshotsDir, `${asOf}.json`);
  const { snapshot, providers, raw } = await runIngest(
    prev.venues.map((v) => v.id),
    snapshotPath,
    asOf,
    prevSnapshot,
  );

  try {
    const snapshotHash = hashSnapshot(raw);
    const cfg = llmConfig();
    const review = cfg ? await reviewEdition(chatClient(cfg), prev, snapshot) : null;
    console.log(review ? 'review: AI review applied inside the ±1 cap' : 'review: no LLM credentials, scores carried');

    const edition = buildNextEdition(
      prev,
      snapshot,
      providers,
      { edition: editionId, published, dataAsOf: asOf, snapshotHash, disclosures: [...prev.disclosures] },
      review,
    );
    validateEdition(edition, sources);

    const warnings = warnScoreMoves(edition, prev);
    for (const w of warnings) console.log(`warn: ${w}`);
    const admission = checkAdmission(edition.venues);
    for (const f of admission) for (const reason of f.failed) console.log(`admission: ${f.id} ${reason}`);
    const scope = scopeNote(edition.venues);
    if (scope) console.log(scope);
    for (const n of review?.notes ?? []) console.log(`note: ${n}`);

    // --strict: anything that smells of a policy problem halts before writing.
    if (flag('strict') && (warnings.length > 0 || admission.length > 0 || scope !== null)) {
      throw new Error('strict mode: run halted for human review (see warnings above)');
    }

    const editionPath = join(editionsDir, `${editionId}.json`);
    await atomicWrite(editionPath, serializeEdition(edition));
    console.log(`edition ${editionId}: ${edition.venues.length} venues, ${warnings.length} warnings, ${snapshotHash.slice(0, 19)}…`);

    if (flag('commit')) {
      git(['add', snapshotPath, editionPath]);
      git(['commit', '-m', `edition ${editionId}: monthly snapshot and carried edition`]);
      git(['push']);
    }
  } catch (err) {
    await rm(snapshotPath, { force: true });
    throw err;
  }
}

if (process.argv[1]?.endsWith('monthly.ts')) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
