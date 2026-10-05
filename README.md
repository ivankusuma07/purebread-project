# Veracity

A monthly register that checks the papers on every tokenized-stock venue. Each venue is scored 0 to 1000 and placed in a karat band; 375, the hallmark, is the line between listed and certified. Hanko, a Shiba Inu who works as the register's inspector, stamps the ones that pass.

Behind the page it works like Fineness: same scoring, bands, editions, pipeline, desk and fee router mechanics, on Robinhood Chain mainnet (4663). The layout, copy, character and code are new. The plan is in `veracity-project-plan.md`.

## Run it

```
pnpm install
pnpm dev            # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm test` | Unit and acceptance tests (Vitest), including the no-em-dash check |
| `pnpm e2e` | Builds, starts and runs the Playwright suite with video, trace and screenshots in `e2e/results` |
| `pnpm e2e:smoke` | Smoke tests only. Set `E2E_BASE_URL` to check a deploy |
| `pnpm e2e:record` | Records a new spec with Playwright codegen |
| `pnpm monthly` | Builds next month's edition (see `docs/RUNBOOK.md`) |
| `pnpm art:export` | Writes Hanko's pose sheet to `art/hanko/` |
| `pnpm typecheck`, `pnpm lint` | The usual |

Copy `.env.example` to `.env.local`. Every variable is optional: without provider keys figures stay "not published", without LLM keys scores carry, and without contract addresses the fee router stays in preview mode.

## Where things are

```
app/                 routes: /, /editions/[edition], /editions/:id.json, /venues, /venues/[id], /method, /fee-router, /desk
data/editions/       frozen editions, one JSON file per month
data/snapshots/      raw monthly pulls, hashed into each edition
src/scoring/         veracity(), band(), normalise()
src/build/           edition, carry, deltas, validate, admission, score-moves
src/ingest/          providers and venue mappings
src/llm/             the guarded AI review
src/site/            components, Hanko and the seal, the edition loader, weight URLs
art/hanko/           pose sheet as SVG
e2e/, tests/         Playwright and Vitest
docs/                runbook, score policy, scope, data and licensing
```

## Deploy

- **Site:** Vercel, from `main`. Editions are read from `data/` at request time; `next.config.ts` traces that folder into the server bundle.
- **Monthly job:** Railway cron (`railway.json`, `0 5 1 * *`). Needs `GITHUB_TOKEN` and `GITHUB_REPOSITORY` to push the edition.
- **CI:** `.github/workflows/ci.yml` runs types, lint, unit tests and the recorded e2e suite, and uploads the recordings.

## Status

Edition 2026-10 is built from an evidence review of every venue (October 2026): pairings, issuers and custodians, verified contracts on the Robinhood Chain explorer, and DefiLlama figures pulled by the ingest code itself. Each score's rationale cites its evidence. Venues DefiLlama doesn't track (Long.xyz, Factory New) show their figures as "not published". Hanko's SVGs are working vectors; the plan calls for a hand-drawn final set.

Veracity scores are editorial judgements on public information. Not an audit, a credit rating or investment advice.
