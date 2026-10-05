import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '@playwright/test';
import type { Edition } from '../src/types';

const dir = join(process.cwd(), 'data', 'editions');

export const EDITION_IDS = readdirSync(dir)
  .filter((f) => /^\d{4}-\d{2}\.json$/.test(f))
  .map((f) => f.slice(0, 7))
  .sort();

export const LATEST_ID = EDITION_IDS[EDITION_IDS.length - 1];

export const editionFileText = (id: string) => readFileSync(join(dir, `${id}.json`), 'utf8');

export const loadEdition = (id: string) => JSON.parse(editionFileText(id)) as Edition;

/** Ranked venue ids in on-screen order. */
export async function rowOrder(page: Page): Promise<string[]> {
  return page.locator('[data-testid="register-rows"] > li[data-venue]').evaluateAll((els) => els.map((e) => e.getAttribute('data-venue') ?? ''));
}

/** Rows with the hallmark line as "|" in its position. */
export async function rowsWithLine(page: Page): Promise<string[]> {
  return page
    .locator('[data-testid="register-rows"] > li')
    .evaluateAll((els) =>
      els.map((e) => (e.querySelector('[data-testid="hallmark-line"]') ? '|' : `${e.getAttribute('data-venue')}:${e.getAttribute('data-veracity')}`)),
    );
}
