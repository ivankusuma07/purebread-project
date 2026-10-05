# VERACITY: Project Plan

**A monthly register that checks the papers on every tokenized-stock venue.**
Fineness (fineness.tech) underneath, rebuilt: the same method, data pipeline, editions, token mechanics and network. What changes is what you see: a new name, a new layout, and a Shiba Inu inspector instead of the cat.

*v1.3 · 5 October 2026 · Supersedes v1.2, v1.1 and v1.0 (PUREBRED) · Reference: the `fineness-main` repo*

**Changes in v1.3:** the design is now the night assay vault (§7): dark, gold and vermilion, WebGL aurora hero, count-up stats, score ticker, glass panels and scroll reveals, built with React Bits. The earlier ban list is lifted at the lead's request, except the rule against em dashes.

**Changes in v1.2:**
- **Everything behind the page works like Fineness.** The method, pipeline, JSON, desk, token and fee router all match Fineness. Veracity-only additions are removed: no on-chain edition seal, no extra fixes, no extra disclosures.
- **Network: Robinhood Chain mainnet (chain ID 4663)**, as Fineness. This replaces v1.1's testnet-only rule.
- **Scoring uses Fineness's karat bands** (22k / 18k / 14k / 9k) and the hallmark at 375. The rosette ranks and "papers line" are gone.
- **What differs is the surface only:** name, layout, character, copy and art. They're built to not look AI-generated (§7).
- **Code is rebuilt, not copied.** It behaves like Fineness but is written fresh, because the Fineness repo has no licence (§15).

---

## 1. The brief

Feedback from the lead:
1. Make the project **as close as possible to Fineness**.
2. **Change the layout** and make it **not look like AI-generated design**.
3. **Change the character to a Shiba Inu.**

How v1.2 reads that:
- **Behind the page: a Fineness copy.** Same features, rules, numbers, routes, JSON shape, monthly job, desk, token, fee router and chain.
- **On the page: new.** New name, layout, palette, type, copy, mascot and art.
- **Code: new.** Written from scratch to behave the same (§15).

---

## 2. Name, concept and vocabulary

**Veracity** means truthfulness. Fineness measures how pure the metal is; Veracity measures how true a venue's claim is. A venue that says it trades stock tokens should have papers to prove it: a named custodian, verifiable inventory and real volume. A venue that launches memecoins and only uses a stock token as the trading pair has no papers behind the claim.

**Hanko** is the mascot, a red Shiba Inu who works as the register's inspector. His name is the Japanese word for a personal seal stamp: he sniffs out the evidence and stamps the papers of every venue that qualifies.

- **Tagline:** *Most venues launch memecoins. Hanko checks the papers.*
- **Headline finding (as Fineness):** *Nothing in this register clears 18 karat.*
- **Ticker:** `$VERA`, launched the way Fineness launched `$FINE` (§9).
- **Name check:** **Verasity ($VRA)** is an existing crypto project with a near-identical name, and "veracity" is a common word. Check for confusion with Verasity, and check the domains (`veracity.xyz`, `veracity.tech`, `veracityregister.xyz`) and X handles (`@veracityxyz`, `@hankoinspects`) before committing.

**Vocabulary map:** every Fineness concept has a one-to-one Veracity name. Only the words change; the meaning and the maths don't.

| Fineness | Veracity |
|---|---|
| Fineness score 0–1000 | **Veracity score** 0–1000 |
| Karat bands (22k / 18k / 14k / 9k) | Karat bands (unchanged) |
| Hallmark gate at 375 | Hallmark at 375 (unchanged). Hanko is the one who stamps it |
| "Below hallmark: listed, not certified" | Below hallmark (unchanged) |
| Edition | Edition (unchanged) |
| Venue dossier | **Venue papers** |
| Admission standard | **Registration standard** |
| Struck | **Struck off the register** |
| Prelaunch holding pen | **Puppies** (registered, not yet shown) |
| Verification Vault | Verification Vault (unchanged) |
| Fineness Cat | **Hanko the Shiba** |
| `$FINE` | `$VERA` |

---

## 3. Feature parity with Fineness

Every Fineness feature found on the live site and in the repo. All of them are kept with the same behaviour. The **Veracity** column only lists what changes on the surface.

| Area | Fineness behaviour (kept as is) | Veracity |
|---|---|---|
| Score | 0–1000, weighted mean × 100, rounded once | Renamed |
| Criteria and house weights | Asset 30, Traction 25, Transparency 20, Compliance 15, Durability 10 | Same |
| Bands | 22k / 18k / 14k / 9k at 916 / 750 / 585 / 375 | Same |
| Tie-break | Alphabetical | Same |
| Reader reweighting | 5 sliders, presets (house, traction, compliance first, equal), `?w=` URL applied before first paint, reset banner | Same, on the "Judge's sheet" |
| Register | Ranked list, expandable entries, live cut line | Ranked ledger, live hallmark line |
| Editions | Monthly, frozen, SHA-256 snapshot hash in the JSON, `/editions/:id` + `.json` | Same |
| Deltas | Score and rank vs prior edition at house weights, NEW marker, band-change flag | Same |
| Admission | 4 conditions | Renamed "registration" |
| Strikes | 60 days idle, dark interface, domain or key loss, failed pairing check | Renamed "struck off" |
| Prelaunch pen | Listed, unscored, `rank: 0` | "Puppies" |
| Off-chain venues | Ranked inline with a marker. Split into a watchlist at 3 | Same |
| Score policy | ±1 per criterion per edition, cited evidence, calibration window | Same |
| Null discipline | Missing = "not published", never 0 | Same |
| Sources | Every figure has a `sourceId`, build fails on an unknown one | Same |
| Corrections | Dated note, original kept visible, two sign-offs, latest + prior edition only | Same |
| Venue pages | Dossier: thesis, docs, score history, custody, pairing, contracts | "Venue papers", new layout |
| Method page | Standing methodology | Rewritten copy |
| Comparison matrix | 5 criteria × venues | New layout |
| Custody table | Custodian, jurisdiction, redeemable, verification | New layout |
| Limits | 4 stated limits of the method | Rewritten copy |
| FAQ | 5 questions, incl. the mascot | "Why a Shiba?" |
| Machine JSON | Open CORS, no key | Same |
| Monthly pipeline | Cron day 1 05:00 UTC: ingest → snapshot → AI review (±1) → carry → validate → commit → deploy | Same steps |
| Editorial desk | `/desk`, noindex: runbook, review queue, sign-off commit generator | Same |
| Token and fee router | `$FINE` on Robinhood Chain mainnet, 50% burn / 30% Verification Vault / 20% data, 72h freeze window, buyback guards, preview mode until the contracts are live | Same, as `$VERA` |
| Mascot | 8-bit Fineness Cat | Hanko the Shiba, ink-and-seal style |
| Preloader | Staged shutters, 1.25s+ | Removed: content shows at once. Hanko's stamp is the one moment (§7.5) |

**Venue data:** the venue universe is the same as Fineness's (§4). Scores, rationale, figures and contract addresses come from Veracity's own review of public sources, entered in the same fields and checked by the same pipeline. Fineness's numbers and text are content, not behaviour, so they aren't copied.

---

## 4. Scoring rules (identical to Fineness)

```ts
export const HOUSE_WEIGHTS = {
  asset: 0.30, traction: 0.25, transparency: 0.20, compliance: 0.15, durability: 0.10,
};
export const HALLMARK = 375;

export function veracity(scores, weights = HOUSE_WEIGHTS): number {
  // weights must sum to 1, scores are integers 0..10, round once at the end
}

export type Band = '22k' | '18k' | '14k' | '9k' | 'below-hallmark';
export function band(v: number): Band {
  if (v >= 916) return '22k';
  if (v >= 750) return '18k';
  if (v >= 585) return '14k';
  if (v >= HALLMARK) return '9k';
  return 'below-hallmark';
}
```

The cut points are real gold standards: 916 parts per thousand is 22 karat, 750 is 18k, 585 is 14k and 375 is 9k, the lowest standard that can be hallmarked.

| Veracity | Band | Meaning |
|---|---|---|
| 916–1000 | **22k** | Top of the scale. No venue is expected here yet |
| 750–915 | **18k** | High veracity. Nothing in the register clears it today |
| 585–749 | **14k** | Where the current leaders sit |
| 375–584 | **9k** | At or above the hallmark: certified |
| < 375 | **Below hallmark** | Listed for scrutiny, not certified |

**The venues** are the Fineness universe: Pons, Long.xyz, StonkFun, Pools.trade, Flap, PAIR, Bankr, Cardpad, Factory New and CSL, plus o1.exchange on the watchlist.

---

## 5. Editions and integrity (as Fineness)

- Each month's edition is a frozen JSON file. Its header carries `snapshotHash`, the SHA-256 of the raw data snapshot the scores were built from.
- Published editions are never edited. Errors ship as dated correction notes with the original figure kept visible and two reviewer sign-offs.
- No venue pays for inclusion, placement or removal. No affiliate or referral links.
- Nothing is posted on-chain for editions. The hash in the JSON is the integrity record, as on Fineness.

---

## 6. Site map (same routes as Fineness)

| Route | Content |
|---|---|
| `/` | Latest edition: the register is the first screen (§7.3) |
| `/editions/:id` | Frozen edition page |
| `/editions/:id.json` | Edition JSON, open CORS |
| `/venues` | All venues, including puppies and struck off |
| `/venues/:id` | Venue papers |
| `/method` | Registration standard and scoring method |
| `/fee-router` | Token economics and permissionless contract calls |
| `/desk` | Internal editorial desk, noindex |

---

## 7. Design direction: the night assay vault

**The goal:** an engaging, crypto-native page that still feels like nobody else's. An assay vault after hours: deep ink, molten gold, and the vermilion of Hanko's seal. The register is the product; the motion and light exist to pull people into it. (v1.3 lifted the earlier ban list at the lead's request. The one rule that stays is no em dashes, §7.0.)

### 7.0 Copy rules

- **No em dashes (—), anywhere.** Not in headings, body copy, button labels, tooltips, Hanko's lines, meta descriptions, docs or commit messages. Use a full stop, comma, colon or parentheses. An unchanged delta shows `0`, a missing figure shows "not published", never a dash. Ranges use an en dash (`375–584`) or "to". Test A-09 fails the build if `—` appears in any copy or data file.
- No filler ("Unlock the power of…", "Seamless"), no claims the data can't back.
- Sentence case for headings. Small uppercase mono tags (`02 / KARAT`) label chapters.

### 7.1 Palette

| Name | Hex | Used for |
|---|---|---|
| Vault ink | `#070A12` | Page background, with a faint 64px grid and static film grain |
| Panel | white at 3–5% over ink | Glass panels: cards, tables, the register |
| Cream | `#F3EFE6` | Text |
| Molten gold | `#FFE7A3` → `#F2C14E` → `#B7791F` | Scores, headings accents, primary buttons, score bars, the aurora |
| Seal vermilion | `#FF5A45` | The seal, the hallmark line (with glow), the aurora's second colour |
| Shiba red | `#E08A45` | Hanko's coat |

**Karat band colours** (dots, pills and the karat scale): 22k `#C9A7FF`, 18k `#74AEFF`, 14k `#5AD692`, 9k `#F2C14E`, below hallmark `#6B7389`. All text colours pass 4.5:1 on the vault ink.

### 7.2 Type

- **Zen Old Mincho:** headlines, venue names and every score. Big, high-contrast, certificate-like.
- **Zen Kaku Gothic New:** body and UI.
- **JetBrains Mono:** hashes, addresses, code and the chapter tags.

### 7.3 Layout

- **Top bar:** sticky glass bar with the seal wordmark, page links, an "On this page" menu and a gold edition button. One menu on phones, working without JavaScript.
- **Hero:** WebGL aurora (gold into vermilion) behind a split-text headline, "Hanko checks the papers." in shining gold, the finding, and two calls to action. On the right, the edition seal in a glowing ring with Hanko stamping it and floating chips for the leader and the hallmark.
- **Numbers:** four spotlight cards that count up (venues, median, top score, below hallmark), then the snapshot hash with a decrypt effect and a copy button.
- **Score ticker:** every ranked venue with its score and movement, looping under the hero.
- **The register:** a glass ledger with gold rank badges for the top three, a gold score bar under each venue, band pills, the seal on every hallmarked row, and a glowing hallmark line. Rows re-sort with the judge's sheet.
- **Chapters:** each with a numbered tag and a large heading, easing in on scroll. Bands become a karat scale with every venue plotted on it; the criteria matrix becomes a gold heatmap; data shows in a terminal window.
- **Closing:** a gold call-to-action band, then the archive and the colophon.

### 7.4 Section-by-section mapping

| Fineness section | Veracity | Treatment |
|---|---|---|
| Masthead + menu | Glass top bar | Sticky, "On this page" menu, gold edition button |
| Alert strip | Headline finding | Under the headline |
| Hero + chart + stamping cat | **Aurora hero + edition seal** | The stamp moment plays here |
| Stat row | Count-up spotlight cards | Venues, median, top score, below hallmark |
| Logo row | **Score ticker** | Venue chips with score and movement |
| Backing-gap caliper | **The sniff test** | Gradient slider, gold bars, Hanko reacts |
| Scoring workflow | **How an edition is made** | Three spotlight cards: fetch, judge, freeze |
| Utility bento | **What you can do with it** | 2×2 hover cards with icons |
| Scale table | **Scored like gold** | Karat scale with every venue plotted, band cards |
| Weight panel | **Judge's sheet** | Glass panel, elastic gold sliders, presets |
| Comparison table | **Criteria matrix** | Gold heatmap |
| Regulated table | **Custody and papers** | Glass table |
| Struck list | **Struck off** | Clean-sheet card or table |
| Limits | **Fine print** | Four numbered cards |
| FAQ | **Questions** | Accordion cards beside a glowing Hanko |
| Protocol CTA | **Every edition is a JSON file** | Terminal window |
| Next / corrections / sources | **Colophon** | Three cards side by side |
| Footer | CTA band + archive | Gold call to action, then every edition |
| Floating mascot | **Hanko in the corner** | Magnetic, speaks when clicked |
| Preloader | None | Content renders immediately |

### 7.5 Motion

- **On load:** the aurora drifts; the headline words rise in; the gold line shines; Hanko stamps the seal once per session (under 1.2s); the stats count up; the hash decrypts.
- **On scroll:** chapters ease in; the ticker loops.
- **On hover:** cards lift with a cursor spotlight; Hanko leans toward the cursor; the ticker pauses.
- **On action:** rows re-sort and the hallmark line slides; sliders stretch; copying confirms with a check.
- **Reduced motion:** the stamp moment, scroll reveals, count-ups and hover lifts are skipped. Without JavaScript every number, score and section is still visible.

### 7.6 React Bits and Lucide

| Component | Where |
|---|---|
| **Aurora** | Hero background |
| **SplitText** | Headline entrance |
| **ShinyText** | "Hanko checks the papers." |
| **StarBorder** | Primary hero call to action |
| **CountUp** | Hero stats (adapted: server renders the final value) |
| **DecryptedText** | Snapshot hash |
| **SpotlightCard** | Stats, steps, uses, data, colophon (adapted: themable) |
| **LogoLoop** | Score ticker |
| **AnimatedContent** | Chapter reveals (adapted: visible without JavaScript) |
| **Magnet** | Hanko in the corner |
| **ElasticSlider** | Judge's sheet (adapted: controlled, keyboard) |
| **StatusMark** | Fee router tx states |
| **HoldButton** | Hold-to-confirm on public contract calls |

**Lucide icons:** `BookOpen` (on this page), `Menu`, `ArrowDown`, `Braces` (JSON), `Hash`, `Eye`, `TrendingUp` / `TrendingDown`, `Shuffle`, `Scale`, `Award`, `FileCheck`, `ShieldCheck`, `Ban`, `Database`, `CalendarClock`, `ScrollText`, `Archive`, `Flame`, `Vault`, `Hourglass`, `Wallet`, `Copy` / `Check`, `ExternalLink`, `SlidersHorizontal`, `Plus`. X and GitHub are small custom SVGs.

---

## 8. Hanko the Shiba

### 8.1 Art direction

- **Style:** brush-ink line art in indigo, with flat Shiba-red fill and the vermilion seal as the only bright mark, like a woodblock print or a stamped document illustration. It is deliberately not 8-bit (Fineness's style) and not a glossy 3D render.
- **Character:** a red Shiba with a cream mask and a curled tail. He wears a small inspector's armband in grid green and carries his hanko on a cord. His expression is calm and unimpressed by hype: the classic Shiba side-eye.
- **Making the art:** commission an illustrator, or draw the set yourself and vectorise it as SVG, so every pose shares one line weight and palette. If AI tools are used for drafts, redraw the finals by hand. Mismatched AI renders are exactly what the lead is reacting to.
- **Formats:** SVG for UI poses (small, crisp, and recolourable for the seal). One PNG at 2× for social cards.

### 8.2 Pose sheet (replacing each Fineness cat asset)

| Fineness asset | Hanko pose | Used in |
|---|---|---|
| `cat-inspector-8bit.jpg` (cat with loupe and gold bar) | Hanko sniffing a stock certificate, a jeweller's loupe tucked in his collar | Margin mascot, FAQ |
| `cat-scanner-8bit.jpg` | **Fetch:** Hanko carrying a rolled data sheet in his mouth | How an edition is made, step 1 |
| `cat-smelter-8bit.jpg` | **Judge:** Hanko at a balance scale, a stock token on one side and a memecoin on the other | Step 2 |
| `cat-stamper-8bit.jpg` | **Freeze:** Hanko pressing his hanko onto the edition | Step 3 |
| `cat-up.png` / `cat-down.png` (stamp animation) | Paw raised with seal / paw down on the paper | The stamp moment in the hero |
| `fineness-emblem.jpg`, favicon | Round vermilion hanko with a Shiba head in reverse | Logo, favicon, the seal itself |
| (new pose) | Ears up, tail curled (high veracity) / ears back, side-eye (low veracity) | The sniff test |

### 8.3 Voice

Hanko speaks in short, dry lines when clicked: plain statements about the method, never hype.
- "Sniffed every source. Missing figures stay missing."
- "No papers, no seal."
- "Nobody pays me. I checked."
- "Same inputs, same score. Every time."
- "Frozen. The hash is right there."

**FAQ answer, "Why a Shiba?":** *The Shiba is the internet's memecoin dog. Hanko is the one who doesn't launch memecoins: he checks whether there's a real asset behind the ones that claim it, and stamps the papers when there is.*

---

## 9. Token and fee router (as Fineness)

**Network:** Robinhood Chain mainnet, chain ID **4663**, as Fineness.

**Launch:** `$VERA` launches the way `$FINE` did: on a Robinhood Chain launchpad's bonding curve, so the team doesn't need to provide liquidity. Creator fees from the launch flow to the fee router once it's deployed.

**Mechanics (same as Fineness):**
- Fixed 1B supply, ERC-20 with `burn()`.
- Creator fees in ETH split three ways: **50% burn** (bought back and burned in the 72h window after each edition freezes), **30% Verification Vault** (bought back, paid to readers who prove an error in the register), and **20% data** (ETH to the data wallet for APIs and RPC).
- Buyback guards: delayed reference price (1–6h), ≤2% one-sided band, ≤3% reserve impact per tx, and execution only inside the window.
- **Verification Vault:** one registrar, a 72h public timelock on every bounty, a cap of 25% outflow per 30 days, and anyone can burn the vault after 365 days of inactivity.
- No owner, no withdraw, no keeper. `harvest()`, `recordCheckpoint()` and `executeBuyback()` are permissionless.

**The `/fee-router` page (same as Fineness):** links the token, pool and creator wallet; shows the split, the freeze window and the guards; and lets anyone call the three permissionless functions from an injected wallet on chain 4663. **Preview mode:** until the router and vault addresses are set, the page runs in preview mode with a banner saying so, the same way Fineness does.

The **registrar** is the reviewer key.

---

## 10. Stack and pipeline

The same shape as Fineness: a build-time product with no database and no request-time scoring.

| Layer | Choice | Runs on |
|---|---|---|
| Web | Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind v4 + `motion` | **Vercel** (Hobby while it's a free public register) |
| Monthly job | Node script, the same steps as Fineness's `scripts/monthly.ts` | **Railway cron** (Hobby), `0 5 1 * *` |
| Data | Bitquery (volume), DefiLlama (fees/TVL), Blockscout explorer (verification), per-venue provider mappings | Railway cron |
| AI review | OpenAI-compatible model at temperature 0. Proposes ±1 moves, code clamps them | Railway cron |
| Storage | Frozen editions and snapshots in the Git repo. No database | GitHub → Vercel |
| Chain | Robinhood Chain mainnet (4663), as Fineness: token, fee router and vault only | Robinhood Chain |
| Wallet (fee router page) | Injected wallet (EIP-1193) + viem | Vercel |
| Tests | Vitest (unit, acceptance), **Playwright e2e with recording** | GitHub Actions (public repo) |

**Monthly run, day 1 at 05:00 UTC (Fineness's steps):**
1. Pull providers and write the dated snapshot (atomic write, nulls kept).
2. Hash the snapshot (SHA-256).
3. AI review proposes ±1 moves with rationale. Code clamps them; garbage replies carry the previous edition forward.
4. Carry judgement forward, then score, rank and compute deltas.
5. `validateEdition` runs. Any failure deletes the snapshot and stops the run, and `--strict` also stops on warnings.
6. Commit the snapshot and edition, then push. Vercel deploys.

**Repo layout** (mirrors Fineness's so the docs map across):
```
veracity/
├── app/                      # /, /editions/[edition], /venues, /venues/[id], /method, /fee-router, /desk
├── data/
│   ├── editions/             # 2026-11.json … (frozen)
│   ├── snapshots/            # raw ingest, hashed
│   └── sources.json
├── src/
│   ├── scoring/veracity.ts   # veracity(), band(), normalise()
│   ├── ingest/               # bitquery, defillama, explorer, http, venues
│   ├── build/                # edition, carry, deltas, validate, admission, score-moves
│   ├── llm/                  # client + guarded review
│   └── site/                 # components, tokens.css, editions loader, weight-url
├── art/hanko/                # SVG pose sheet
├── scripts/monthly.ts        # Railway cron entry
├── e2e/                      # Playwright specs; results/ + report/ gitignored
├── tests/                    # Vitest acceptance + per-edition
└── docs/                     # METHOD, RUNBOOK, SCORE-POLICY, REGISTER-SCOPE, DATA-LICENSING
```

---

## 11. Testing

### 11.1 Unit and acceptance (Vitest, mirrors Fineness's suite)

| ID | Case | Expected |
|---|---|---|
| U-01 | `veracity({8,8,6,6,7})` | 720 |
| U-02 | `veracity({2,1,5,1,2})` | 220 |
| U-03 | `band(375)` / `band(374)` / `band(750)` / `band(916)` | 9k / below hallmark / 18k / 22k |
| U-04 | Weights not summing to 1 | Throws |
| U-05 | All slider weights 0 | Equal weights |
| U-06 | `?w=` round-trip; bad input | Exact round-trip; bad input falls back to house weights |
| U-07 | Tie on veracity | Alphabetical order |
| A-01 | Rebuild edition from snapshot | Byte-identical scores and order (determinism) |
| A-02 | Browser score at house weights | Equals the build score for every venue |
| A-03 | Venue with all metrics null | Renders "not published", no zeros |
| A-04 | Deltas vs prior edition | Exact arithmetic difference, at house weights only |
| A-05 | Unknown `sourceId` | Build fails |
| A-06 | AI review: +3 move, unknown ID, empty rationale, garbage | Clamped to ±1, ignored, dropped, previous edition carried |
| A-07 | Prelaunch venue | Listed, `rank: 0`, no score shown |
| A-08 | Correction without two sign-offs | Validation fails |
| A-09 | An em dash (`—`) in any page copy, component string, edition or source file, or doc | Test fails and names the file and line |

### 11.2 End-to-end (Playwright, recorded)

| ID | Flow | Checks |
|---|---|---|
| E-01 | Home | "Explore the register" brings the register into view. Hallmark line sits between the last row ≥375 and the first <375 |
| E-02 | Shared `?w=` link | Same order **with JavaScript off** (server-side ordering) |
| E-03 | Judge's sheet | URL updates, rows re-sort, hallmark line moves, reset restores house order |
| E-04 | Edition header | Snapshot hash shown and equal to the JSON's `snapshotHash`. Copy button copies it |
| E-05 | `/editions/:id.json` | Byte-equal to the frozen file, open CORS |
| E-06 | `/editions/:id` with JavaScript off | Every venue, score and rank readable |
| E-07 | Venue papers | History chart, custody, contracts |
| E-08 | Null metrics | "Not published", never 0 |
| E-09 | Stamp moment | Plays once per session; skipped with `reducedMotion: 'reduce'` |
| E-10 | Hanko | Click shows a line. No timed pop-ups |
| E-11 | Responsive | No horizontal scroll at 320, 390, 1440, 1920 px |
| E-12 | `/fee-router` | Preview banner while router and vault are unset. Once set: figures come from contract reads on chain 4663; a wallet on another chain is asked to switch |
| E-13 `@smoke` | Production / preview URL | `/`, latest edition, its JSON, `/method`, `/venues`, `/fee-router` return 200 |

**Recording:** `video`, `trace` and `screenshot` are set to `'on'`, `outputDir: e2e/results`, with HTML and JSON reports in `e2e/report`.
- **Recording new tests:** `pnpm e2e:record` (Playwright codegen) records new specs.
- **Saving runs:** CI uploads `e2e/results` and `e2e/report` as artifacts on every run: 30 days for PRs, 90 days for `main` and edition releases.

---

## 12. Roadmap

| Phase | Weeks | Deliverables | Done when |
|---|---|---|---|
| **0 · Groundwork** | 1 | Name, domain and X checked (incl. the Verasity clash). Hanko pose sheet commissioned or drawn. Venue research: scores, rationale, contract addresses and provider mappings for every venue. METHOD, RUNBOOK and SCORE-POLICY written in Veracity's own words | Every venue has a complete record |
| **1 · Register** | 2–4 | Next.js site (register, ranks, sniff test, edition flow, matrix, custody, struck off, limits, FAQ, data, archive, method, venues). Monthly job on Railway cron. **Edition 01 published.** Playwright with recording | U-, A- and E-01…11 green |
| **2 · Desk + corrections** | 5–6 | `/desk`, correction flow, **Edition 02 with deltas** | Edition 02 published on schedule with deltas |
| **3 · Token + fee router** | 7–8 | `$VERA` launched on a Robinhood Chain launchpad. Router and vault deployed on mainnet. `/fee-router` out of preview mode | E-12 green |
| **4 · Growth** | Month 3+ | Watchlist split once 3 off-chain venues exist. More venues and asset types | Ongoing |

---

## 13. Budget (lean)

Hosting is not counted: Railway Hobby and Vercel Hobby.

| Item | Cost |
|---|---|
| Domain | $0 on `veracity.vercel.app` (or the closest free subdomain) at launch, ~$10–60/yr once bought |
| RPC | Alchemy free tier |
| Data | DefiLlama and Blockscout are free. Bitquery free tier, or leave its metrics null |
| AI review | Cents per month, optional |
| CI + Playwright recordings | Free with a public repo |
| Mascot art | $0 if drawn yourself. An illustrator for ~7 poses is the one cash cost worth considering |
| Phase 3 | Mainnet gas to deploy the router and vault, plus the launchpad's fee (if any). $0 liquidity on a bonding curve |

---

## 14. Decisions

| # | Decision | Now |
|---|---|---|
| D1 | Name and handles | **VERACITY**, mascot **Hanko**. Domain, X and Verasity clash to check |
| D2 | Behind the page | **A Fineness copy**: same features, rules, pipeline, JSON, desk, token and fee router. No Veracity-only additions |
| D3 | Network | **Robinhood Chain mainnet (4663)**, as Fineness |
| D4 | Token | `$VERA` on a launchpad bonding curve, Fineness's 50/30/20 mechanics |
| D5 | Error reports | Verification Vault bounties, as Fineness |
| D6 | Off-chain venues | Ranked inline, split into a watchlist at 3, as Fineness |
| D7 | Design | The night assay vault (§7): dark, molten gold and vermilion, aurora hero, React Bits motion, Hanko throughout. No em dashes |
| D8 | Code | Rebuilt from scratch with the same behaviour. No Fineness code, copy or art reused |

---

## 15. Risks

| Risk | Mitigation |
|---|---|
| **Copying Fineness too closely.** The repo has no licence file, so its code, copy and art are all rights reserved by default | **Rebuild from scratch.** Mirror the features and methodology (ideas, which aren't protected), but write new code, new copy and new art. Don't copy Fineness's scores or rationale text either |
| **Looking like a clone of Fineness** | New name, character, layout, palette and type |
| **Looking like every other crypto site** | Keep what is ours at the centre: Hanko, the seal, karat bands, the hallmark line and Mincho type. Effects serve the register, not the other way round |
| **Name confusion with Verasity ($VRA)** | Check before committing. Use "Veracity register" in titles and never a `$VRA`-like ticker |
| **Mainnet contracts hold real ETH** | The router and vault have no owner and no withdraw, so mistakes can't be patched after deploy. Test them on a local chain first, and start with small fee balances |
| **Token conflict with scored venues** | Same as Fineness: if `$VERA` launches on a scored venue's launchpad, that venue's score is unaffected by the launch. This is how Fineness ran it |
| **Shiba = memecoin** | Lean into it with the "Shiba who doesn't launch memecoins" line. Keep the art restrained, ink and seal, never a coin-with-a-dog logo |
| **Legal: stock tokens are securities-like and not offered to US users** | "Not an audit, a rating or investment advice" on every page |

---

*Veracity scores are editorial judgements on public information. Veracity is not an audit, a credit rating or investment advice.*
