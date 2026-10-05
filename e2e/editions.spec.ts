import { expect, test } from '@playwright/test';
import { BAND_LABEL } from '../src/site/lib/format';
import { editionFileText, LATEST_ID, loadEdition } from './helpers';

const latest = loadEdition(LATEST_ID);

test('E-04: the edition header shows the JSON snapshot hash, and copy copies it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const hash = page.getByTestId('snapshot-hash');
  await expect(hash).toHaveAttribute('title', latest.snapshotHash);
  await page.getByRole('button', { name: 'Copy snapshot hash' }).click();
  await expect(page.getByRole('button', { name: 'Copied snapshot hash' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(latest.snapshotHash);
});

test('E-05: /editions/:id.json is byte-equal to the frozen file, with open CORS', async ({ request }) => {
  const res = await request.get(`/editions/${LATEST_ID}.json`);
  expect(res.status()).toBe(200);
  expect(res.headers()['access-control-allow-origin']).toBe('*');
  expect(res.headers()['content-type']).toContain('application/json');
  expect(await res.text()).toBe(editionFileText(LATEST_ID));
});

test('unknown editions are a 404', async ({ request }) => {
  expect((await request.get('/editions/1999-01')).status()).toBe(404);
});

test.describe('E-06: an edition page without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('shows every venue, score and band', async ({ page }) => {
    await page.goto(`/editions/${LATEST_ID}`);
    const register = page.locator('#register');
    for (const v of latest.venues.filter((x) => x.status !== 'prelaunch' && x.status !== 'struck')) {
      const row = register.locator(`li[data-venue="${v.id}"]`);
      await expect(row).toContainText(v.name);
      await expect(row).toContainText(String(v.veracity));
      await expect(row).toContainText(BAND_LABEL[v.band]);
    }
    // Rows open without scripts: each entry is a native <details>.
    await register.locator('li[data-venue] summary').first().click();
    await expect(register.locator('li[data-venue] details').first()).toHaveAttribute('open', '');
  });
});

test('E-07: venue papers show history, custody, contracts and the snapshot', async ({ page }) => {
  const v = latest.venues[0];
  await page.goto(`/venues/${v.id}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(v.name);
  await expect(page.getByRole('img', { name: `Veracity of ${v.name} by edition` })).toBeVisible();
  await expect(page.locator('#custody')).toContainText(v.pairing.custodian ?? 'not published');
  await expect(page.locator('#contracts')).toBeVisible();
  await expect(page.locator('#history')).toContainText(latest.edition);
});
