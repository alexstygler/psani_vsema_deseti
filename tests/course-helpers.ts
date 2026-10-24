import { expect, type Page } from '@playwright/test';
export async function beginExercise(page: Page) {
  await page.getByRole('button', { name: 'Začít cvičení', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Psací pole' })).toBeFocused();
}
export async function finishExercise(page: Page) {
  const text = (await page.locator('.typing-text').textContent())!;
  await page.getByRole('textbox', { name: 'Psací pole' }).pressSequentially(text);
  await expect(page.locator('.result-panel')).toBeVisible();
}
