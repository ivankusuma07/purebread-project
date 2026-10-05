# VERACITY: Project Plan

**A monthly register that checks the papers on every tokenized-stock venue.**
Fineness (fineness.tech) underneath, rebuilt: the same method, data pipeline, editions, token mechanics and network. What changes is what you see: a new name, a new layout, and a Shiba Inu inspector instead of the cat.

*v1.2 · 5 October 2026 · Supersedes v1.1 and v1.0 (PUREBRED) · Reference: the `fineness-main` repo*

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

## 7. Design direction: new, and not AI-generated

**The goal:** look like an official assay-office register printed on Japanese ledger paper, not a crypto landing page. An assay office is where metal gets its hallmark stamped, which is exactly Hanko's job. Fineness copied a fintech template (TeraWallet), with its cream background, olive and gold, Inter and Geist Mono, bento grids, a shutter preloader and letter-by-letter reveals. Veracity deliberately goes the other way.

### 7.0 It must not look AI-generated

The lead's feedback is that the design looks AI-generated: built from the same defaults that AI site builders and templates produce, so it reads as nobody's work. These are those defaults. None of them ship:

- **Colour:** no purple-to-blue or any other gradient wash, no gradient text, no glow, no glassmorphism or frosted panels, no neon accents on black.
- **Layout:** no centred hero with a big slogan over a chart, no row of three identical feature cards, no bento grid, no "trusted by" logo strip, no oversized stat cards.
- **Surfaces:** no soft grey shadow on every box, no rounded-xl cards everywhere, no pill badges on every label.
- **Type:** no all-caps tracked eyebrow above every heading, no single coloured word in a headline, no "→" on every button, no Inter + mono pairing.
- **Motion:** no scroll-triggered fade-up on every section, no hover lift on every card, no marquee, no count-up numbers, no letter-by-letter reveals, no WebGL or particle backgrounds.
- **Icons and images:** no icons in tinted circles as section decoration, no emoji, no glossy 3D or AI-rendered mascots.
- **Copy:** no filler ("Unlock the power of…", "Built for the future of…", "Seamless"), no claims the data can't back. Every sentence says something specific about this register.
- **No em dashes (—), anywhere.** Not in headings, body copy, button labels, tooltips, Hanko's lines, meta descriptions, docs or commit messages. Use a full stop, comma, colon or parentheses instead. In the UI, an unchanged delta shows `0` and a missing figure shows "not published", never a dash. Ranges use an en dash (`375–584`) or the word "to". A lint check fails the build if `—` appears in any copy or data file.

What replaces them is in §7.1–7.6: a real palette with a reason for each colour, a ledger layout, two Japanese typefaces, one orchestrated moment, and one hand-drawn character. The test for every page: could someone tell it was made by a person, for this register specifically?

### 7.1 Palette

| Name | Hex | Used for |
|---|---|---|
| Ledger paper | `#E9EEE8` | Page background: a cool sage-grey, like registry stock |
| Indigo ink | `#1F2B4A` | All text and rules. Japanese indigo dye, a real colour rather than a tinted black |
| Grid green | `#9FB8A3` | Ledger and manuscript-paper grid lines, table rules |
| Seal vermilion | `#D8342A` | **Only** the hanko seal and the hallmark line. Never decoration |
| Shiba red | `#C67B3D` | **Only** Hanko's coat in illustrations |

**Band colours** are semantic and used only for karat bands. They're flat ink colours, not gold: Fineness's gold-on-cream is the look being left behind.

| Band | Hex |
|---|---|
| 22k | purple `#5B3A8E` |
| 18k | blue `#2C5AA0` |
| 14k | green `#2F7A4F` |
| 9k | ochre `#B08A1E` |
| Below hallmark | slate `#7A8088`, with no seal |

### 7.2 Type

- **Zen Old Mincho:** the headline, venue names, and the veracity scores. Venue names and scores read like a printed certificate.
- **Zen Kaku Gothic New:** everything else, including tables, UI and body text. It's a Japanese grotesque with tabular figures.
- **No monospace anywhere.** Hashes and addresses use the gothic's tabular figures, shortened to `0x73e6…7b99`, with a copy button.
- **Sentence case everywhere.**
- Body line length stays under about 75 characters. Tables use their own widths.

### 7.3 Layout: the register book

The page reads like a bound register, not a stack of marketing sections. **The register itself is the hero:** on the first screen you see the ranked venues, not a slogan over a chart.

*Numbers in these wireframes are layout placeholders taken from Fineness's Edition 2026-11, not Veracity scores.*

**Desktop (≥1200px)**
```
┌─────────────┬───────────────────────────────────────────────────────────┐
│ VERACITY    │ Most venues launch memecoins. Hanko checks the papers.    │
│             │ Nothing in this register clears 18 karat.                 │
│ Contents    │                                                           │
│  Register   │ Edition 2026-11   [SEAL]  frozen 1 Oct                    │
│  Bands      │                   snapshot sha256:df90…6d23  copy         │
│  Sniff test │ 10 venues · median 557 · 2 below hallmark · data 1 Oct    │
│  How an     │───────────────────────────────────────────────────────────│
│   edition   │  #  Venue          Chain      Veracity Band       Δ       │
│   is made   │  1  Pons           Robinhood   745    14k       ▲25  [▸]  │
│  Criteria   │  2  Long.xyz       Robinhood   720    14k        0   [▸]  │
│  Custody    │  …                                                        │
│  Struck off │ ━━━━━━━━━━━━━━━━━━━ the hallmark · 375 ━━━━━━━━━━━━━━━━━━ │
│  Limits     │  9  Factory New    Robinhood   350    Below hallmark      │
│  FAQ        │ 10  CSL            Robinhood   220    Below hallmark      │
│  Data       │───────────────────────────────────────────────────────────│
│  Archive    │ Judge's sheet ▾  (house weights · 30 25 20 15 10)         │
│             │                                           [Hanko, seated] │
└─────────────┴───────────────────────────────────────────────────────────┘
 left rail: sticky contents, like the tabs on a ledger
```

**Mobile (≤809px)**
```
┌───────────────────────────────┐
│ VERACITY            Contents ▾│
│ Most venues launch memecoins. │
│ Hanko checks the papers.      │
│ [SEAL] Edition 2026-11        │
│ sha256:df90…6d23  copy        │
├───────────────────────────────┤
│ 1 Pons                 745 14k│
│   Robinhood · ▲25          ▸  │
│ 2 Long.xyz             720 14k│
│ …                             │
│ ━━━━━ the hallmark · 375 ━━━━ │
│ 9 Factory New  350 Below hallm│
├───────────────────────────────┤
│ Judge's sheet ▸ (bottom sheet)│
└───────────────────────────────┘
```

**Layout rules:**
- Text is **left-aligned** throughout. The only centred element is the seal.
- The register rows sit on a faint grid-green ledger rule. Hallmarked rows (375 and up) carry a small vermilion hanko imprint. Rows below the hallmark are set in slate with no seal.
- The hallmark line is drawn as a **vermilion rule** across the ledger, and moves live when weights change.
- Sections below the register are **chapters**, each with a plain heading. They're laid out as text, tables and one illustration each, not as grids of identical rounded cards. Border radius is used in two sizes only: 0 for paper and tables, full round for the seal.
- The seal is Hanko's stamp: an ink mark on the edition, printed beside the snapshot hash. It's an illustration, not an on-chain record.

### 7.4 Section-by-section mapping

| Fineness section | Veracity chapter | Treatment |
|---|---|---|
| Masthead + menu | Book header + contents rail | Sticky left rail on desktop, "Contents" sheet on mobile |
| Alert strip | Headline finding | One sentence under the tagline |
| Hero + hero chart + stamping cat | **Register as hero + edition seal** | The stamp moment (§7.5) happens here |
| Stat row | Edition facts | One line of facts under the seal, not big-number cards |
| Logo row | Dropped | The register already names every venue |
| Backing-gap caliper ("Crucible") | **The sniff test** | Drag between "stock on paper" and "stock in the pool". Hanko's ears and tail react, and the karat band updates. An illustration, not a venue |
| Scoring workflow (3 stages) | **How an edition is made: fetch, judge, freeze** | A real sequence, so it's numbered 1–3. One Hanko illustration per step |
| Utility bento (4 decks) | **What you can do with it** | Four short paragraphs: read the gap, follow the deltas, reweight and share, pull the JSON |
| Scale table | **Bands** | The karat scale with the hallmark at 375 |
| Weight panel | **Judge's sheet** | 5 sliders + presets, URL updates, "Custom weights" banner with reset |
| Comparison table | **Criteria matrix** | Venue × 5 criteria, scores 0–10 |
| Regulated table | **Custody and papers** | Custodian, jurisdiction, redeemable, verification |
| Struck list | **Struck off the register** | Final score + date struck |
| Limits | **What these scores don't claim** | 4 limits, rewritten in plain language |
| FAQ | FAQ | 5 questions, incl. "Why a Shiba?" |
| Protocol CTA (JSON) | **Data** | Endpoint, JSON sample, plain copy button |
| Next edition | Next edition | Date and what will change |
| Corrections | Corrections | Dated notes, originals visible |
| Sources | Sources | Provenance list |
| Footer | Footer + **archive** | Every past edition with its snapshot hash |
| Floating mascot | **Hanko in the margin** | Seated at the edge of the page on desktop. Click him for a line. No timed pop-ups |
| Preloader | Removed | Content renders immediately |

### 7.5 Motion

The page has **one orchestrated moment**. On first visit, Hanko raises his paw and stamps the edition seal: the vermilion seal lands with a small ink spread, and hallmarked rows receive their seals in rank order. It lasts under 1.2s, plays once per session, and is skipped entirely with reduced motion.

Everything else moves **only when the reader does something**:
- **Reweighting:** rows re-sort with a layout (FLIP) animation and the hallmark line slides to its new position.
- **Expanding a row:** opens the venue's criteria and rationale.
- **The sniff test:** reacts to dragging.
- **Copying a hash or address:** confirms with a check.

### 7.6 React Bits and Lucide, scaled back

React Bits is limited to pieces that answer a user's action:

| Keep | Where |
|---|---|
| **ElasticSlider** | Judge's sheet sliders |
| **StatusMark** | Fee router tx states (`pending`, `done`, `failed`) |
| **HoldButton** | Hold-to-confirm on `executeBuyback()` and the other public contract calls |

Nothing else from React Bits: no text effects, backgrounds, scroll reveals, spotlight cards or logo loops. The register reorder uses `motion` layout animations directly.

**Lucide icon map:**

| Concept | Icon |
|---|---|
| Edition seal / frozen | `Stamp` |
| Hanko / mascot fallback | `Dog`, `PawPrint` |
| Karat band | `Award` |
| Papers / registration | `FileCheck`, `ScrollText` |
| Judge's sheet | `SlidersHorizontal` |
| Method | `Scale` |
| Contents | `BookOpen` |
| Archive | `Archive` |
| Hash / chain link | `Hash`, `Link2` |
| Struck off | `Ban` |
| Movers | `TrendingUp`, `TrendingDown` |
| Burn / vault / data | `Flame`, `Vault`, `Database` |
| Freeze window | `Hourglass`, `CalendarClock` |
| Copy / done / external | `Copy`, `Check`, `ExternalLink` |
| Wallet | `Wallet` |

Lucide has no brand logos, so the X and GitHub icons are small custom SVGs.

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
| E-01 | Home | Register renders as the first screen. Hallmark line sits between the last row ≥375 and the first <375 |
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
| D7 | Design | Register-book layout, ledger palette, Zen Mincho + Zen Kaku Gothic, one stamp moment, React Bits reduced to 3 components, nothing that looks AI-generated (§7.0) |
| D8 | Code | Rebuilt from scratch with the same behaviour. No Fineness code, copy or art reused |

---

## 15. Risks

| Risk | Mitigation |
|---|---|
| **Copying Fineness too closely.** The repo has no licence file, so its code, copy and art are all rights reserved by default | **Rebuild from scratch.** Mirror the features and methodology (ideas, which aren't protected), but write new code, new copy and new art. Don't copy Fineness's scores or rationale text either |
| **Looking like a clone of Fineness** | New name, character, layout, palette and type |
| **Looking AI-generated** (the lead's main complaint) | The §7.0 list is a review checklist: every page is checked against it before release, and the mascot art is drawn by hand |
| **Name confusion with Verasity ($VRA)** | Check before committing. Use "Veracity register" in titles and never a `$VRA`-like ticker |
| **Mainnet contracts hold real ETH** | The router and vault have no owner and no withdraw, so mistakes can't be patched after deploy. Test them on a local chain first, and start with small fee balances |
| **Token conflict with scored venues** | Same as Fineness: if `$VERA` launches on a scored venue's launchpad, that venue's score is unaffected by the launch. This is how Fineness ran it |
| **Shiba = memecoin** | Lean into it with the "Shiba who doesn't launch memecoins" line. Keep the art restrained, ink and seal, never a coin-with-a-dog logo |
| **Legal: stock tokens are securities-like and not offered to US users** | "Not an audit, a rating or investment advice" on every page |

---

*Veracity scores are editorial judgements on public information. Veracity is not an audit, a credit rating or investment advice.*
