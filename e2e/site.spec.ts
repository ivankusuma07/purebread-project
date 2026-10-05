import { expect, test } from '@playwright/test';
import { LATEST_ID, loadEdition } from './helpers';

const latest = loadEdition(LATEST_ID);
const PAGES = ['/', `/editions/${LATEST_ID}`, '/venues', `/venues/${latest.venues[0].id}`, '/method', '/fee-router'];

test.describe('E-11: no horizontal scroll', () => {
  for (const width of [320, 390, 1440, 1920]) {
    test(`at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PAGES) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});

test('E-12: the fee router is in preview mode until the contracts are deployed', async ({ page }) => {
  await page.goto('/fee-router');
  const live = Boolean(process.env.NEXT_PUBLIC_ROUTER_ADDRESS && process.env.NEXT_PUBLIC_VAULT_ADDRESS);
  if (live) {
    await expect(page.getByTestId('preview-banner')).toHaveCount(0);
    await expect(page.getByTestId('balances')).not.toContainText('sample');
  } else {
    await expect(page.getByTestId('preview-banner')).toBeVisible();
    // Every invented figure is labelled.
    await expect(page.getByTestId('balances')).toContainText('sample');
    await expect(page.getByText('not deployed yet').first()).toBeVisible();
  }
  await expect(page.getByTestId('freeze-countdown')).toHaveText(/\d+d \d{2}h \d{2}m/);
});

test('the desk is not indexed', async ({ page }) => {
  await page.goto('/desk');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Editorial desk');
});

test('E-13: every public route answers 200 @smoke', async ({ request }) => {
  for (const path of ['/', `/editions/${LATEST_ID}`, `/editions/${LATEST_ID}.json`, '/method', '/venues', '/fee-router']) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
  }
});

test('robots.txt keeps the desk out and points at the sitemap @smoke', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /desk');
  expect(robots).toMatch(/Sitemap: \S+\/sitemap\.xml/);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain(`/editions/${LATEST_ID}</loc>`);
  for (const v of latest.venues) expect(sitemap).toContain(`/venues/${v.id}</loc>`);
  expect(sitemap).not.toContain('/desk');
});

test('share cards: every page has an Open Graph image and an X card @smoke', async ({ page, request }) => {
  for (const path of ['/', `/venues/${latest.venues[0].id}`]) {
    await page.goto(path);
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(image, path).toBeTruthy();
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    const res = await request.get(new URL(image!).pathname);
    expect(res.status(), image!).toBe(200);
    expect(res.headers()['content-type']).toBe('image/png');
  }
});
