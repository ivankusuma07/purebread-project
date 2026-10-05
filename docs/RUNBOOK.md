# Runbook

How an edition gets made, month by month. The desk at `/desk` tracks the same steps.

## Day 1, 05:00 UTC: the pull

Railway runs `scripts/railway-monthly.sh` on cron `0 5 1 * *`. It clones the repo, runs the test suite, then:

```
pnpm monthly --strict --commit
```

which does, in order:

1. Pulls every mapped provider (DefiLlama, Bitquery, the explorer) and writes `data/snapshots/<date>.json` atomically. A fresh null never overwrites a published figure.
2. Hashes the raw snapshot (SHA-256). The hash goes in the edition header.
3. Runs the AI review if `LLM_*` is set. The code clamps every proposal (see SCORE-POLICY.md). Without credentials every score carries.
4. Carries editorial judgement forward, scores at house weights, ranks, and computes deltas against last month.
5. Runs `validateEdition`. Any failure stops the run and deletes the new snapshot.
6. With `--strict`, any warning (a move past ±1, a move with unchanged rationale, a registration finding, the watchlist threshold) also stops the run for a human.
7. Writes `data/editions/<YYYY-MM>.json`, commits, pushes. Vercel deploys.

Run it by hand for a specific month:

```
pnpm monthly --edition=2026-11 --as-of=2026-11-01 --published=2026-11-08
```

## Days 2 and 3: registration review

Open `/desk`. Check every venue admitted under the standard against the four conditions (METHOD on the site). Machine-checkable failures are listed; condition 3 (a completed launch) always needs a human look when figures are empty.

## Days 4 to 6: score review

Every moved score needs cited evidence in its rationale and two sign-offs. Approve each move on the desk, enter both reviewers, copy the generated sign-off commit message.

## Day 7: freeze

The edition file is final. Its snapshot hash is the integrity record. From here it never changes.

## Day 8: publish

Confirm `pnpm test` and `pnpm e2e` are green, then announce. `E2E_BASE_URL=<deploy url> pnpm e2e:smoke` checks the live routes.

## Corrections

Add a note to the edition's `corrections` array with the date, the note, the original figure and two different reviewers in `signedBy`. Only the latest and the previous edition take corrections. Validation fails a correction with fewer than two sign-offs.

## Adding a data source for a venue

1. Confirm the provider really lists the venue (open its page).
2. Confirm each contract address on the explorer, and that it belongs to the venue.
3. Add the mapping to `src/ingest/venues.ts`.
4. The next pull fills the figures and adds the provider to `sourceIds`.
