// Records a narrated walkthrough of Veracity's core functions with Playwright:
// Hanko's stamping desk, the register, re-weighting, the criteria matrix,
// custody, the sniff test, how an edition is made, a venue paper, the edition
// hash, the method, the fee router and the source on GitHub. Captions and a
// visible cursor are drawn into the page, since Playwright's video shows neither.
//
//   pnpm tsx scripts/record-demo.ts [out-dir]
//
// DEMO_BASE_URL picks the site (default http://localhost:3300, a local
// `next start -p 3300`). Writes <out-dir>/veracity-walkthrough.webm, and an .mp4
// beside it when ffmpeg is on the PATH.

import { execFileSync } from 'node:child_process';
import { mkdirSync, renameSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium, type Locator, type Page } from '@playwright/test';

const BASE = (process.env.DEMO_BASE_URL ?? 'http://localhost:3300').replace(/\/$/, '');
const W = 1600;
const H = 900;

/** Cursor dot and caption bar, re-created on every page load. */
const OVERLAY = `
(() => {
  const mount = () => {
    if (document.getElementById('__demo_cursor')) return;
    const style = document.createElement('style');
    style.textContent = \`
      #__demo_cursor { position: fixed; left: 0; top: 0; width: 26px; height: 26px; margin: -13px 0 0 -13px;
        border-radius: 50%; border: 2px solid #f5c451; background: rgba(245, 196, 81, .25);
        box-shadow: 0 0 18px rgba(245, 196, 81, .7); pointer-events: none; z-index: 2147483647;
        transition: transform .12s ease-out; }
      #__demo_cursor.down { transform: scale(.6); background: rgba(245, 196, 81, .7); }
      #__demo_caption { position: fixed; left: 50%; bottom: 36px; transform: translate(-50%, 16px); max-width: 980px;
        padding: 18px 28px; border-radius: 14px; background: rgba(10, 9, 14, .88); color: #f4efe4;
        border: 1px solid rgba(245, 196, 81, .45); box-shadow: 0 20px 60px rgba(0, 0, 0, .55);
        font: 500 21px/1.45 system-ui, sans-serif; pointer-events: none; z-index: 2147483646;
        opacity: 0; transition: opacity .45s, transform .45s; }
      #__demo_caption.on { opacity: 1; transform: translate(-50%, 0); }
      #__demo_caption b { display: block; margin-bottom: 4px; color: #f5c451; font-size: 14px;
        letter-spacing: .14em; text-transform: uppercase; }
    \`;
    document.head.appendChild(style);
    const cursor = document.createElement('div');
    cursor.id = '__demo_cursor';
    const caption = document.createElement('div');
    caption.id = '__demo_caption';
    // React re-renders can drop foreign nodes from <body>; put them back.
    const attach = () => {
      if (!style.isConnected) document.head.appendChild(style);
      if (!cursor.isConnected) document.body.appendChild(cursor);
      if (!caption.isConnected) document.body.appendChild(caption);
    };
    attach();
    new MutationObserver(attach).observe(document.documentElement, { childList: true, subtree: true });
    const last = window.__demoPos;
    if (last) cursor.style.translate = last[0] + 'px ' + last[1] + 'px';
    addEventListener('mousemove', (e) => {
      window.__demoPos = [e.clientX, e.clientY];
      cursor.style.translate = e.clientX + 'px ' + e.clientY + 'px';
    }, true);
    addEventListener('mousedown', () => cursor.classList.add('down'), true);
    addEventListener('mouseup', () => cursor.classList.remove('down'), true);
    window.__caption = (step, text) => {
      attach();
      caption.classList.remove('on');
      setTimeout(() => {
        if (!text) return;
        caption.innerHTML = '<b>' + step + '</b>' + text;
        caption.classList.add('on');
      }, text ? 250 : 0);
    };
  };
  if (document.body) mount();
  else addEventListener('DOMContentLoaded', mount);
})();
`;

declare global {
  interface Window {
    __caption?: (step: string, text: string) => void;
    __demoPos?: [number, number];
  }
}

const hold = (page: Page, ms: number) => page.waitForTimeout(ms);

async function caption(page: Page, step: string, text: string): Promise<void> {
  await page.evaluate(([s, t]) => window.__caption?.(s, t), [step, text]);
  await hold(page, 500);
}

/** Smooth-scroll so the element sits a little below the top of the viewport. */
async function scrollTo(page: Page, target: Locator, offset = 110): Promise<void> {
  await target.first().evaluate((el, off) => {
    const top = el.getBoundingClientRect().top + window.scrollY - off;
    window.scrollTo({ top, behavior: 'smooth' });
  }, offset);
  await hold(page, 1300);
}

async function scrollBy(page: Page, px: number, ms = 1300): Promise<void> {
  await page.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), px);
  await hold(page, ms);
}

/** Moves the visible cursor onto an element, in steps, so the viewer can follow it. */
async function glide(page: Page, target: Locator, steps = 28): Promise<void> {
  const box = await target.first().boundingBox();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps });
  await hold(page, 250);
}

async function press(page: Page, target: Locator): Promise<void> {
  await glide(page, target);
  await target.first().click();
  await hold(page, 400);
}

async function open(page: Page, path: string): Promise<void> {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await hold(page, 600);
}

async function walkthrough(page: Page): Promise<void> {
  // 1. Landing.
  await open(page, '/');
  await page.mouse.move(W * 0.62, H * 0.42);
  await hold(page, 1800); // the stamp moment plays on the first visit
  await caption(page, 'Veracity · Edition 01', 'An independent register of Robinhood Chain launchpads, rated on what really stands behind their tokens. One frozen edition a month.');
  await page.mouse.move(W * 0.4, H * 0.5, { steps: 40 });
  await hold(page, 3800);
  const desk = page.getByTestId('hanko-desk');
  await caption(page, 'Veracity · Edition 01', "Hanko, the register's inspector, stamps one venue's papers after another. Each stamp shows that venue's band and score.");
  await glide(page, desk);
  await hold(page, 4200);
  await caption(page, 'Veracity · Edition 01', 'Click him to rush the stamping.');
  await press(page, desk);
  await hold(page, 4000);

  // 2. The register.
  await caption(page, '1 · The register', 'Every venue gets a Veracity score out of 1000, graded in karat bands like gold. Tap "Explore the register" to jump in.');
  await press(page, page.getByRole('link', { name: /Explore the register/ }));
  await hold(page, 1200);
  const rows = page.locator('[data-testid="register-rows"] > li[data-venue]');
  await caption(page, '1 · The register', 'Ranked by score at house weights. Each row shows the band, the move since last edition and the day\'s published figures.');
  for (let i = 0; i < 3; i++) {
    await glide(page, rows.nth(i), 18);
    await hold(page, 700);
  }
  await caption(page, '1 · The register', 'Open a row to read why. Every one of the five scores carries its evidence, with a source and a date.');
  const long = page.locator('li[data-venue="long-xyz"]');
  await press(page, long.locator('summary'));
  await hold(page, 1200);
  await scrollBy(page, 260);
  await hold(page, 3500);
  await scrollTo(page, long);
  await press(page, long.locator('summary'));

  const line = page.getByTestId('hallmark-line');
  if (await line.count()) {
    await scrollTo(page, line, 380);
    await glide(page, line);
    await caption(page, '1 · The register', 'The gold line is the hallmark at 375. Below it, too little real asset stands behind the token to earn a karat.');
    await hold(page, 4200);
  }

  // 3. Judge's sheet.
  const sheet = page.getByTestId('judges-sheet');
  await caption(page, '2 · Judge it yourself', 'Disagree with the weights? Open the judge\'s sheet and decide how much each criterion counts.');
  await scrollTo(page, sheet, 160);
  await press(page, sheet.locator('summary'));
  await hold(page, 1200);
  await caption(page, '2 · Judge it yourself', 'Presets re-rank instantly. "Traction first" rewards volume over backing, and the order changes.');
  await press(page, page.getByRole('button', { name: /Traction first/ }));
  await hold(page, 2600);
  const asset = page.getByRole('slider', { name: /Asset/ });
  await caption(page, '2 · Judge it yourself', 'Or set each weight by hand. The link updates as you go, so you can share exactly your ranking.');
  await glide(page, asset);
  await asset.focus();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('ArrowRight');
    await hold(page, 260);
  }
  await hold(page, 2200);
  const banner = page.getByTestId('custom-banner');
  if (await banner.isVisible()) {
    await scrollTo(page, banner, 200);
    await caption(page, '2 · Judge it yourself', 'A banner marks any custom view, so nobody mistakes it for the house ranking. One tap resets it.');
    await hold(page, 1500);
    await press(page, banner.getByRole('button', { name: /Reset to house weights/ }));
    await hold(page, 1800);
  }

  // 4. Criteria matrix.
  await scrollTo(page, page.locator('#criteria'), 90);
  await caption(page, '3 · Criteria matrix', 'Every venue on all five criteria at a glance. Gold marks a strength, red a weakness.');
  await page.mouse.move(W * 0.55, H * 0.5, { steps: 30 });
  await hold(page, 4200);

  // 5. Custody and papers.
  await scrollTo(page, page.locator('#custody'), 90);
  await caption(page, '4 · Custody and papers', "Who issues the stock behind each venue's pairs, who holds it, under which regulator, and whether a holder can redeem it.");
  await hold(page, 4800);

  // 6. Sniff test.
  const sniff = page.locator('#sniff-test');
  await caption(page, '5 · Sniff test', "Drag the slider to see how much real stock a venue needs to clear the hallmark and climb the bands. Watch Hanko's ears.");
  await scrollTo(page, sniff, 90);
  const range = sniff.locator('input[type="range"]').first();
  const box = await range.boundingBox();
  if (box) {
    const y = box.y + box.height / 2;
    // The slider moves in steps of 10.
    const at = async (v: number) => {
      await page.mouse.move(box.x + (box.width * v) / 100, y, { steps: 10 });
      await range.fill(String(v));
      await hold(page, 450);
    };
    await glide(page, range);
    for (let v = 40; v >= 0; v -= 10) await at(v);
    await hold(page, 1600);
    for (let v = 10; v <= 100; v += 10) await at(v);
    await hold(page, 2400);
  }

  // 7. How an edition is made.
  const steps = page.locator('#how-it-is-made li');
  await scrollTo(page, page.locator('#how-it-is-made'), 90);
  await caption(page, '6 · How an edition is made', 'Fetch, judge, freeze. Published figures are pulled and hashed, scores move at most one point with two sign-offs, and the edition is frozen for good.');
  for (let i = 0; i < 3; i++) {
    await glide(page, steps.nth(i), 18);
    await hold(page, 1600);
  }

  // 8. Hanko.
  const hanko = page.getByTestId('hanko');
  if (await hanko.isVisible()) {
    await caption(page, '7 · Hanko', 'Hanko also keeps watch from the corner. Click him for a dry line on how the register works.');
    await press(page, hanko);
    await hold(page, 3200);
    await press(page, hanko);
    await hold(page, 3000);
  }

  // 9. A venue paper.
  await open(page, '/venues/long-xyz');
  await caption(page, '8 · Venue papers', 'Each venue has its own paper: its score, its band and its history edition by edition.');
  await page.mouse.move(W * 0.5, H * 0.35, { steps: 30 });
  await hold(page, 3200);
  await scrollBy(page, 520, 1500);
  await caption(page, '8 · Venue papers', 'The evidence behind every score. Here: the chain shows only 50.4% of Long.xyz launches are paired with a stock token, not all of them.');
  await hold(page, 4800);
  const custody = page.locator('#custody');
  if (await custody.count()) {
    await scrollTo(page, custody);
    await caption(page, '8 · Venue papers', 'Who issues the asset behind the pairs, who holds it, under which regulator, and whether you can redeem it.');
    await hold(page, 4200);
  }
  const contracts = page.locator('#contracts');
  await scrollTo(page, contracts);
  await caption(page, '8 · Venue papers', 'Every contract address, checked on the explorer. Copy one, or open it on Blockscout to verify it yourself.');
  await press(page, contracts.getByRole('button', { name: /^Copy / }).first());
  await hold(page, 1200);
  await glide(page, contracts.locator('a.num').first());
  await hold(page, 3200);

  // 10. Edition integrity.
  await open(page, '/');
  const hash = page.getByTestId('snapshot-hash');
  await scrollTo(page, hash, 300);
  await caption(page, '9 · Check the numbers', 'Each edition is frozen with a SHA-256 hash of its raw data, so no figure can change quietly after publication.');
  await glide(page, hash);
  await hold(page, 2200);
  await press(page, page.getByRole('button', { name: 'Copy snapshot hash' }));
  await hold(page, 2400);
  await open(page, '/editions/2026-10.json');
  await caption(page, '9 · Check the numbers', 'The whole edition is open data: one JSON file, free to download, hash and build on.');
  await hold(page, 4200);

  // 11. Method.
  await open(page, '/method');
  await caption(page, '10 · The method', 'Five criteria with fixed weights: asset 30%, traction 25%, transparency 20%, compliance 15%, durability 10%.');
  await hold(page, 3500);
  await scrollBy(page, 600, 1600);
  await caption(page, '10 · The method', 'Scores move only on cited evidence, one point at a time, with two sign-offs. No venue pays to be listed or ranked.');
  await hold(page, 3800);
  await scrollBy(page, 600, 1600);
  await hold(page, 1800);

  // 12. Fee router.
  await open(page, '/fee-router');
  await caption(page, '11 · The $VERA fee router', 'How trading fees on the $VERA token will be split, in the open. Until the token launches the page runs in preview mode and says so.');
  await hold(page, 4200);
  await scrollBy(page, 650, 1600);
  await caption(page, '11 · The $VERA fee router', 'The split, live balances and guards, and the burns and bounties ledgers, all readable straight from the chain.');
  await hold(page, 3800);
  await scrollBy(page, 650, 1600);
  await hold(page, 2000);

  // 13. Close.
  await open(page, '/');
  await caption(page, '12 · Open source', 'The code, the data and every past edition are on GitHub. The link sits in the top bar on every page.');
  await glide(page, page.getByRole('banner').getByRole('link', { name: 'Source on GitHub' }));
  await hold(page, 3800);
  await page.mouse.move(W * 0.55, H * 0.45, { steps: 30 });
  await caption(page, 'useveracity.site', 'Read the register, judge it your way, and check every number yourself.');
  await hold(page, 5000);
}

async function main(): Promise<void> {
  const outDir = resolve(process.argv[2] ?? 'demo');
  const rawDir = join(outDir, '.raw');
  mkdirSync(rawDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: rawDir, size: { width: W, height: H } },
    permissions: ['clipboard-read', 'clipboard-write'],
    colorScheme: 'dark',
  });
  context.setDefaultTimeout(20_000);
  await context.addInitScript(OVERLAY);
  const page = await context.newPage();
  try {
    await walkthrough(page);
  } finally {
    await context.close();
    await browser.close();
  }

  const webm = join(outDir, 'veracity-walkthrough.webm');
  renameSync((await page.video()!.path())!, webm);
  rmSync(rawDir, { recursive: true, force: true });
  console.log(webm);

  try {
    const mp4 = join(outDir, 'veracity-walkthrough.mp4');
    // Drop the blank first second before the site paints.
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1', '-i', webm, '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
    console.log(mp4);
  } catch {
    console.log('ffmpeg not found: keeping the .webm only');
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
