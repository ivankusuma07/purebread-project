# Register scope

## One register until three off-chain venues

Venues on other chains rank in the same register, marked off-chain. When there are three of them (`WATCHLIST_SPLIT_AT` in `src/build/admission.ts`), the desk opens a split: a Robinhood Chain register plus a watchlist. `scopeNote()` reports it and never blocks a run on its own (it does stop a `--strict` run).

## Puppies

A venue registered before it has a completed launch is a puppy: `status: "prelaunch"`, `rank: 0`, no score, band or delta on the page. It is promoted to `active` in the edition after its first live market. Validation rejects a ranked puppy.

## Corrections

- Any error in a published figure, score, band, rank or source reference gets a dated correction with the original kept visible and two sign-offs.
- Typos are fixed quietly in the next edition and logged in the commit message.
- Only the latest and the previous edition take corrections. Older history stands.

## Watchlist candidates

Venues found in research but without a verified contract on record are named in the edition's disclosures, not admitted. Edition 01 names o1.exchange this way.
