import { expect, test } from '@playwright/test';

test.describe('E-09: the stamp moment', () => {
  test('plays once per session', async ({ page }) => {
    await page.goto('/');
    // First visit: the seal starts hidden and the run class clears within 1.2s.
    await expect(page.locator('html')).toHaveClass(/stamp-(pending|run)/);
    await expect(page.locator('html')).not.toHaveClass(/stamp-/, { timeout: 3000 });
    expect(await page.evaluate(() => sessionStorage.getItem('veracity:stamped'))).toBe('1');
    await expect(page.locator('[data-stamp="seal"]')).toHaveCSS('opacity', '1');

    await page.reload();
    await expect(page.locator('html')).not.toHaveClass(/stamp-/);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('is skipped entirely', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).not.toHaveClass(/stamp-/);
      await expect(page.locator('[data-stamp="seal"]')).toHaveCSS('opacity', '1');
    });
  });
});

test.describe('E-10: Hanko in the margin', () => {
  test.use({ viewport: { width: 1600, height: 900 } });
  test('speaks only when clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    await expect(page.getByTestId('hanko-line')).toHaveCount(0);
    await page.getByTestId('hanko').click();
    await expect(page.getByTestId('hanko-line')).toHaveText(/\S/);
    const first = await page.getByTestId('hanko-line').textContent();
    await page.getByTestId('hanko').click();
    await expect(page.getByTestId('hanko-line')).not.toHaveText(first ?? '');
  });
});

test('the sniff test reacts to dragging', async ({ page }) => {
  await page.goto('/#sniff-test');
  const result = page.getByTestId('sniff-result');
  const slider = page.locator('#sniff-test input[type="range"]');
  await slider.fill('0');
  await expect(result).toContainText('Below hallmark');
  await slider.fill('100');
  await expect(result).toContainText('14k');
});
