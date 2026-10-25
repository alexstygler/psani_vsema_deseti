import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { lessons } from '../src/curriculum';
import { courseSections } from '../src/assessment';
import { beginExercise } from './course-helpers';

test('sekce mají souhrnné testy a úspěch uzná všechny lekce vybrané sekce', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cesta od základů', exact: true }).click();
  await expect(page.locator('.course-section')).toHaveCount(courseSections.length);
  await expect(page.locator('.section-exam-card button')).toHaveCount(courseSections.length);
  await expect(page.locator('.lesson-card')).toHaveCount(lessons.length);
  await expect(page.getByRole('button', { name: /Závěrečný test lekce/ })).toHaveCount(0);
  await expect(page.locator('.lesson-card').nth(6)).toBeDisabled();
  await page.getByRole('button', { name: 'Závěrečný test sekce 2:', exact: false }).click();
  await expect(page.locator('.session-label')).toContainText('Test sekce 2');
  const text = (await page.locator('.typing-text').textContent())!;
  await page.getByRole('textbox', { name: 'Psací pole' }).pressSequentially(text);
  await expect(page.locator('.lesson-completed')).toContainText('Lekce 7–12 jsou dokončené');
  await page.getByRole('button', { name: 'Zpět na sekce', exact: true }).click();
  await expect(page.locator('.lesson-card.complete')).toHaveCount(6);
  await expect(page.locator('.lesson-card').nth(12)).toBeEnabled();
  await page.locator('.lesson-card').nth(8).click();
  await beginExercise(page);
  await expect(page.locator('.session-label')).toContainText('Lekce 9');
  await expect(page.locator('.exam-notice')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.garden button')).toContainText('Pokračovat · 13. lekce');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!));
  expect(saved.completed).toEqual([6, 7, 8, 9, 10, 11]);
  expect(saved.sessions[0].assessment).toEqual({ kind: 'section', section: 1, part: 0 });
});

test('Excel nehodnotí rychlost, ale závěrečný běžný text vyžaduje 150 CPM', async ({ page }) => {
  test.setTimeout(90000);
  await page.clock.install({ time: new Date('2026-10-25T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-25T12:01:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Cesta od základů', exact: true }).click();
  await page.getByRole('button', { name: 'Závěrečný test sekce 10:', exact: false }).click();
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  const text = (await page.locator('.typing-text').textContent())!;
  await input.pressSequentially(text[0]);
  await page.clock.fastForward(600000);
  await input.pressSequentially(text.slice(1));
  await expect(page.locator('.pass-checklist')).toContainText('Rychlost se nehodnotí');
  await expect(page.locator('.lesson-completed')).toContainText('Lekce 64–65 jsou dokončené');
  await page.getByRole('button', { name: 'Zpět na sekce', exact: true }).click();
  await page.getByRole('button', { name: 'Závěrečný test sekce 11:', exact: false }).click();
  const second = (await page.locator('.typing-text').textContent())!;
  await input.pressSequentially(second[0]);
  await page.clock.fastForward(120000);
  await input.pressSequentially(second.slice(1));
  await expect(page.locator('.lesson-completed')).toHaveCount(0);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!).completed),
  ).toEqual([63, 64]);
  await page.keyboard.press('Enter');
  const retry = (await page.locator('.typing-text').textContent())!;
  expect(retry).not.toBe(second);
  await input.pressSequentially(retry);
  await expect(page.locator('.lesson-completed')).toContainText('Lekce 66–67 jsou dokončené');
});

test('rozřazení uzná oblast, další neúspěch zachová pokrok a nabídne odlišný text', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Zjistit mou úroveň', exact: true }).first().click();
  await page.getByRole('button', { name: 'Spustit rozřazení' }).click();
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await input.pressSequentially((await page.locator('.typing-text').textContent())!);
  await expect(page.locator('.lesson-completed')).toContainText('Lekce 1–6 jsou dokončené');
  await page.keyboard.press('Enter');
  await expect(page.locator('.session-label')).toContainText('Rozřazení 2');
  const target = (await page.locator('.typing-text').textContent())!;
  for (let i = 0; i < 4; i++) {
    await input.pressSequentially('!');
    await input.press('Backspace');
  }
  await input.pressSequentially(target);
  await expect(page.locator('.pass-checklist')).toContainText('Chyby 4 / 3');
  await expect(page.getByRole('button', { name: 'Další část rozřazení' })).toHaveCount(0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!));
  expect(saved.completed).toEqual([0, 1, 2, 3, 4, 5]);
  await page.keyboard.press('Enter');
  expect(await page.locator('.typing-text').textContent()).not.toBe(target);
  await page.getByRole('button', { name: 'Přehled rozřazení' }).click();
  await expect(page.locator('.placement-recommendation')).toContainText('Horní řada');
});

test('rozřazení pro Excel nehodnotí rychlost a uzná jen čísla a znaky', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-24T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-24T12:01:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Zjistit mou úroveň', exact: true }).first().click();
  await page.locator('.placement-stages > button').nth(9).click();
  const target = (await page.locator('.typing-text').textContent())!;
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await input.pressSequentially(target[0]);
  await page.clock.fastForward(600000);
  await input.pressSequentially(target.slice(1));
  await expect(page.locator('.pass-checklist')).toContainText('Rychlost se nehodnotí');
  await expect(page.locator('.lesson-completed')).toContainText('Lekce 64–65');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!));
  expect(saved.completed).toEqual([63, 64]);
});

test('rozřazení odmítne příliš pomalé běžné psaní', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-24T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-24T12:01:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Zjistit mou úroveň', exact: true }).first().click();
  await page.getByRole('button', { name: 'Spustit rozřazení' }).click();
  const target = (await page.locator('.typing-text').textContent())!;
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await input.pressSequentially(target[0]);
  await page.clock.fastForward(120000);
  await input.pressSequentially(target.slice(1));
  await expect(page.locator('.pass-checklist')).toContainText('Chyby 0 / 3');
  await expect(page.locator('.lesson-completed')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Procvičit tuto oblast' })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!));
  expect(saved.completed).toEqual([]);
});

test('rozřazení je dostupné na mobilu a projde kontrolou přístupnosti', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Zjistit mou úroveň', exact: true }).first().click();
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
  await page.screenshot({ path: '/tmp/lehce-placement.png', fullPage: true });
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.account-button')).toBeVisible();
  await page.screenshot({ path: '/tmp/lehce-placement-mobile.png', fullPage: true });
});
