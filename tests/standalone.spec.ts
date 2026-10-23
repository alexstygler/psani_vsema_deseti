import { test, expect } from '@playwright/test';
import { copyFile, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('samostatný soubor nepotřebuje další soubory ani síť a zachová pokrok', async ({
  page,
  context,
}) => {
  const folder = await mkdtemp(join(tmpdir(), 'lehce-offline-'));
  const file = join(folder, 'lehce.html');
  await copyFile(fileURLToPath(new URL('../lehce.html', import.meta.url)), file);
  // Managed cloud Chromium forbids file:// navigation. Render the isolated
  // artifact through an in-memory response, with networking disabled; no
  // development server or project assets can satisfy a missing dependency.
  const url = 'https://lehce.invalid/lehce.html';
  const html = await readFile(file, 'utf8');
  await context.route('**/*', (route) =>
    route.request().url() === url
      ? route.fulfill({ contentType: 'text/html; charset=utf-8', body: html })
      : route.abort(),
  );
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  await context.setOffline(true);
  try {
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Psaní může jít lehce.');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('20px Manrope'))).toBe(true);
    await page.getByLabel('Další druhy textů').selectOption('custom');
    await page
      .getByRole('textbox', { name: 'Vlastní text k procvičení' })
      .fill('Příliš žluťoučký kůň. =A1*B1');
    await page.getByRole('button', { name: 'Procvičit můj text' }).click();
    await page.getByRole('button', { name: 'Klikněte sem' }).click();
    await page
      .getByRole('textbox', { name: 'Psací pole' })
      .pressSequentially('Příliš žluťoučký kůň. =A1*B1');
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.locator('.result-stats')).toContainText('100 %');
    await page.reload();
    await page.getByRole('button', { name: 'Můj pokrok', exact: true }).click();
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody')).toContainText('Vlastní text');
    expect(requests.filter((request) => request !== url && !request.startsWith('data:'))).toEqual(
      [],
    );
    expect(errors).toEqual([]);
  } finally {
    await page.close();
    await rm(folder, { recursive: true, force: true });
  }
});
