#!/bin/sh
# Railway cron entry, day 1 at 05:00 UTC. Railway starts from a fresh build,
# so the job clones the repo with a push token, runs the suite, builds the
# edition and pushes it. Vercel deploys on push. Any failure exits non-zero
# and nothing is pushed: the previous edition stays live.
set -eu

: "${GITHUB_TOKEN:?GITHUB_TOKEN is required to push the edition}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY (owner/name) is required}"

workdir="$(mktemp -d)"
git clone --depth 1 "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" "$workdir"
cd "$workdir"
git config user.name "veracity-monthly"
git config user.email "veracity-monthly@users.noreply.github.com"

pnpm install --frozen-lockfile
pnpm test
pnpm monthly --strict --commit
