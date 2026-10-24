import { test, expect } from '@playwright/test';
test('čtyři chyby zamknou postup a opakování nabídne jiný text', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cesta od základů', exact: true }).click();
  await expect(page.locator('.lesson-card')).toHaveCount(36);
  await expect(page.locator('.lesson-card').nth(1)).toBeDisabled();
  await page.locator('.lesson-card').first().click();
  const text = (await page.locator('.typing-text').textContent())!;
  await page.getByRole('button', { name: 'Klikněte sem' }).click();
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await input.pressSequentially('xxxx' + text);
  await expect(page.locator('.pass-checklist')).toContainText('Chyby 4 / 3');
  await expect(page.getByRole('button', { name: 'Další lekce', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ještě jeden malý krok' }).click();
  const retry = (await page.locator('.typing-text').textContent())!;
  expect(retry).not.toBe(text);
  await page.getByRole('button', { name: 'Klikněte sem' }).click();
  await input.pressSequentially('xxx' + retry);
  await expect(page.locator('.pass-checklist')).toContainText('Chyby 3 / 3');
  await page.getByRole('button', { name: 'Další lekce', exact: true }).click();
  await expect(page.locator('.session-label')).toContainText('Lekce 2');
});

test('pomalé dokončení nestačí k odemčení', async ({ page }) => {
  test.setTimeout(60000);
  await page.clock.install({ time: new Date('2026-10-24T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-24T12:01:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Základy', exact: true }).click();
  const text = (await page.locator('.typing-text').textContent())!;
  await page.getByRole('button', { name: 'Klikněte sem' }).click();
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await input.pressSequentially(text[0]);
  await page.clock.runFor(60000);
  await input.pressSequentially(text.slice(1));
  await expect(page.locator('.result-panel')).toContainText('Ještě jeden krok k jistotě');
  await expect(page.locator('.pass-checklist')).toContainText('Chyby 0 / 3');
  await expect(page.getByRole('button', { name: 'Další lekce', exact: true })).toHaveCount(0);
});
