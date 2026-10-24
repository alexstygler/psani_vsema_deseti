import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { freshProgress } from '../src/engine';
import { finishExercise } from './course-helpers';

test('souvislý překlep je jeden úsek a Enter umožní celou cestu bez myši', async ({ page }) => {
  test.setTimeout(90000);
  await page.addInitScript((p) => localStorage.setItem('lehce.progress.v1', JSON.stringify(p)), {
    ...freshProgress(),
    settings: { ...freshProgress().settings, level: 'beginner' },
  });
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  const text = (await page.locator('.typing-text').textContent())!;
  await input.pressSequentially('x' + text.slice(0, 4));
  await expect(page.locator('.typing-text .wrong')).toHaveCount(5);
  await expect(page.locator('.flow-ribbon')).toContainText('1 / 3 chyby');
  expect(
    await page
      .locator('.typing-text .wrong')
      .first()
      .evaluate((e) => getComputedStyle(e).textDecorationLine),
  ).toContain('line-through');
  await expect(page.locator('.result-panel')).toHaveCount(0);
  for (let i = 0; i < 5; i++) await input.press('Backspace');
  await expect(page.locator('.typing-text .wrong')).toHaveCount(0);
  await input.pressSequentially(text);
  await expect(page.locator('.pass-checklist')).toContainText('Chyby 1 / 3');
  await page.keyboard.press('Enter');
  await finishExercise(page);
  await page.keyboard.press('Enter');
  await finishExercise(page);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Nové znaky: d a k', exact: true })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('.session-label')).toContainText('Lekce 2');
  await expect(input).toBeFocused();
  await input.press('Escape');
  await expect(input).not.toBeFocused();
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
});

test('Tab a Enter vytvoří skutečné odstavce a Escape uvolní fokus', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Klávesové dovednosti', exact: true }).click();
  await page.getByRole('button', { name: /Odstavce pod prsty/ }).click();
  const editor = page.getByRole('textbox', { name: 'Váš dokument' });
  await expect(editor).toBeFocused();
  await editor.pressSequentially('Poznámky z porady');
  await editor.press('Enter');
  await editor.press('Tab');
  await expect(editor).toHaveValue('Poznámky z porady\n\t');
  await expect
    .poll(() => editor.evaluate((e: HTMLTextAreaElement) => e.selectionStart))
    .toBe('Poznámky z porady\n\t'.length);
  await editor.pressSequentially('První odstavec začíná tabulátorem.');
  await editor.press('Enter');
  await editor.press('Tab');
  const current = await editor.inputValue();
  await expect
    .poll(() => editor.evaluate((e: HTMLTextAreaElement) => e.selectionStart))
    .toBe(current.length);
  await editor.pressSequentially('Druhý odstavec má vlastní řádek.');
  await expect(page.locator('.editor-complete')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Opravit a pokračovat', exact: true }),
  ).toBeVisible();
  await expect(editor).toBeFocused();
  await editor.press('Escape');
  await expect(editor).not.toBeFocused();
});

test('Backspace odstraní znak vlevo a Delete znak vpravo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Klávesové dovednosti', exact: true }).click();
  await page.getByRole('button', { name: /Opravit a pokračovat/ }).click();
  const editor = page.getByRole('textbox', { name: 'Váš dokument' });
  await expect.poll(() => editor.evaluate((e: HTMLTextAreaElement) => e.selectionStart)).toBe(5);
  await editor.press('Backspace');
  await expect(editor).toHaveValue('Věta o zahradě.\nRostlina roste ppomalu.');
  const text = await editor.inputValue();
  await expect
    .poll(() => editor.evaluate((e: HTMLTextAreaElement) => e.selectionStart))
    .toBe(text.indexOf('ppomalu'));
  await editor.press('Delete');
  await expect(page.locator('.editor-complete')).toBeVisible();
  await page.getByRole('button', { name: 'Můj pokrok', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('.accuracy-badge')).toHaveText('—');
});

test('Caps Lock procvičí velkou češtinu a musí se zase vypnout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Klávesové dovednosti', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Váš dokument' });
  await expect(editor).toBeFocused();
  await editor.press('CapsLock');
  await editor.pressSequentially('ČESKÝ PŘÍBĚH');
  await editor.press('Enter');
  await editor.pressSequentially('ĚŠČŘŽÝÁÍÉÚŮ');
  await editor.press('Enter');
  await editor.press('CapsLock');
  await editor.pressSequentially('Teď zase běžně.');
  await expect(page.locator('.editor-complete')).toBeVisible();
});

test('dovednosti nemají chyby v základní automatické kontrole přístupnosti', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Klávesové dovednosti', exact: true }).click();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
  await page.screenshot({ path: '/tmp/lehce-editor.png', fullPage: true });
});
