import { expect, test } from '@playwright/test';
import { HALLMARK } from '../src/scoring/veracity';
import { applyWeights, parseWeights } from '../src/site/weight-url';
import { LATEST_ID, loadEdition, rowOrder, rowsWithLine } from './helpers';

const latest = loadEdition(LATEST_ID);
const ranked = latest.venues.filter((v) => v.status !== 'prelaunch' && v.status !== 'struck');
const expectedOrder = (search: string) => applyWeights(ranked, parseWeights(search)).map((v) => v.id);

test('E-01: the register is the first screen, with the hallmark between the last ≥375 and the first <375', async ({ page }) => {
  await page.goto('/');
  const firstRow = page.locator('[data-testid="register-rows"] > li[data-venue]').first();
  await expect(firstRow).toBeInViewport();
  expect(await rowOrder(page)).toEqual(expectedOrder(''));

  const rows = await rowsWithLine(page);
  const line = rows.indexOf('|');
  const scores = rows.filter((r) => r !== '|').map((r) => Number(r.split(':')[1]));
  if (scores.some((s) => s < HALLMARK) && scores.some((s) => s >= HALLMARK)) {
    expect(Number(rows[line - 1].split(':')[1])).toBeGreaterThanOrEqual(HALLMARK);
    expect(Number(rows[line + 1].split(':')[1])).toBeLessThan(HALLMARK);
  }
  await expect(page.getByTestId('finding')).toHaveText(/karat/);
});

test.describe('E-02: a shared ?w= link without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('renders the sender order on the server', async ({ page }) => {
    const search = '?w=3,10,4,2,2';
    await page.goto(`/${search}`);
    expect(await rowOrder(page)).toEqual(expectedOrder(search));
    expect(expectedOrder(search)).not.toEqual(expectedOrder(''));
  });
});

test('E-03: the judge’s sheet updates the URL, re-sorts, moves the line, and resets', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('judges-sheet').locator('summary').click();
  await page.getByRole('button', { name: /Traction first/ }).click();
  await expect(page).toHaveURL(/w=3%2C10%2C4%2C2%2C2|w=3,10,4,2,2/);
  await expect(page.getByTestId('custom-banner')).toBeVisible();
  await expect.poll(() => rowOrder(page)).toEqual(expectedOrder('?w=3,10,4,2,2'));

  // Keyboard on a slider moves weights too.
  const asset = page.getByRole('slider', { name: /Asset/ });
  await asset.focus();
  await page.keyboard.press('End');
  await expect(asset).toHaveAttribute('aria-valuenow', '10');
  await expect(page).toHaveURL(/w=10/);

  await page.getByTestId('custom-banner').getByRole('button', { name: /Reset to house weights/ }).click();
  await expect(page.getByTestId('custom-banner')).toBeHidden();
  await expect.poll(() => rowOrder(page)).toEqual(expectedOrder(''));
  expect(new URL(page.url()).searchParams.get('w')).toBeNull();
});

test('E-08: missing figures say "not published", never zero', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('[data-testid="register-rows"] > li[data-venue]').first();
  await first.locator('summary').click();
  const detail = first.locator('dl').last();
  const v = ranked[0];
  if (v.metrics.dailyVolumeUsd == null) await expect(detail).toContainText('not published');
  await expect(page.locator('body')).not.toContainText('$0 ');
});

test('search and band filter narrow the ledger', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Below hallmark', exact: true }).click();
  const below = ranked.filter((v) => v.veracity < HALLMARK).map((v) => v.id);
  await expect.poll(() => rowOrder(page)).toEqual(expectedOrder('').filter((id) => below.includes(id)));
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search venues' }).fill(ranked[0].name);
  await expect.poll(async () => (await rowOrder(page)).includes(ranked[0].id)).toBe(true);
});
