# Score policy

**No evidence, no move.** Scores describe the market as it can be seen, not the reviewer's mood.

## Rules

1. **Cite it.** A criterion moves only on new public evidence: a document, a verified contract, a completed launch, a licence, an incident, a disclosure. The citation goes in that criterion's rationale, in the edition where the score moves.
2. **One point at most.** A criterion moves at most ±1 per edition. A major event (a lost licence, a dark interface, lost domain or keys) may move it further, with a written reason signed by both reviewers.
3. **Silence is fine.** A score that doesn't move needs no new words. Don't invent reasons to fill a month.
4. **Two sign-offs.** Every move is approved by two different reviewers, recorded in the sign-off commit.
5. **Pairing failures are struck, not scored down.** A venue that fails the pairing condition on review leaves the register. Scoring it low would bend the scale for everyone else.

## Calibration window

Edition 01 listed every venue that could be found. The baseline needs time to settle:

- **Editions 02 and 03:** ±1 moves are allowed on judgement alone, with a written reason that includes the word `calibration`.
- **Edition 04 on:** the rules above, in full.

## How the code enforces it

- `validateEdition` hard-fails bad ranges, empty rationale, unknown sources, scores that don't recompute and bands that don't match.
- `warnScoreMoves` flags moves past ±1 and moves whose rationale didn't change. `--strict` turns any warning into a stopped run.
- The AI review (`src/llm/review.ts`) never gets the last word: proposals outside the rules are dropped, a move without new rationale is dropped, and an unreadable reply means the previous edition carries.
