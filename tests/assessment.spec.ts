import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('sekce mají osm souhrnných testů a úspěch uzná všechny lekce vybrané sekce', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cesta od základů', exact: true }).click();
  await expect(page.locator('.course-section')).toHaveCount(8);
  await expect(page.locator('.section-exam-card button')).toHaveCount(8);
  await expect(page.locator('.lesson-card')).toHaveCount(36);
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
  await expect(page.locator('.session-label')).toContainText('Lekce 9');
  await expect(page.locator('.exam-notice')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.garden button')).toContainText('Pokračovat · 13. lekce');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!));
  expect(saved.completed).toEqual([6, 7, 8, 9, 10, 11]);
  expect(saved.sessions[0].assessment).toEqual({ kind: 'section', section: 1, part: 0 });
});

test('pracovní sekce oddělí pomalé znaky od běžného textu a uzná lekce až po obou částech', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.clock.install({ time: new Date('2026-10-24T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-24T12:01:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Cesta od základů', exact: true }).click();
  await page.getByRole('button', { name: 'Závěrečný test sekce 7:', exact: false }).click();
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  const first = (await page.locator('.typing-text').textContent())!;
  await input.pressSequentially(first[0]);
  await page.clock.fastForward(600000);
  await input.pressSequentially(first.slice(1));
  await expect(page.locator('.pass-checklist')).toContainText('Rychlost se nehodnotí');
  await expect(page.locator('.lesson-completed')).toContainText('Část testu splněna');
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!).completed),
  ).toEqual([]);
  await page.getByRole('button', { name: 'Další část testu', exact: true }).click();
  const second = (await page.locator('.typing-text').textContent())!;
  await input.pressSequentially(second[0]);
  await page.clock.fastForward(120000);
  await input.pressSequentially(second.slice(1));
  await expect(page.locator('.lesson-completed')).toHaveCount(0);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!).completed),
  ).toEqual([]);
  await page.keyboard.press('Enter');
  const retry = (await page.locator('.typing-text').textContent())!;
  expect(retry).not.toBe(second);
  await input.pressSequentially(retry);
  await expect(page.locator('.lesson-completed')).toContainText('Lekce 31–34 jsou dokončené');
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!).completed),
  ).toEqual([30, 31, 32, 33]);
  await page.keyboard.press('Enter');
  await expect(page.locator('.session-label')).toContainText('Lekce 35');
});

test('rozřazení uzná oblast, další neúspěch zachová pokrok a nabídne odlišný text', async ({
  page,
}) => {
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
  await expect(page.locator('.placement-recommendation')).toContainText(
    'Celá abeceda bez diakritiky',
  );
});

test('rozřazení pro Excel nehodnotí rychlost a uzná jen čísla a znaky', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-24T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-24T12:01:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Zjistit mou úroveň', exact: true }).first().click();
  await page.locator('.placement-stages > button').nth(4).click();
  const target = (await page.locator('.typing-text').textContent())!;
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await input.pressSequentially(target[0]);
  await page.clock.fastForward(600000);
  await input.pressSequentially(target.slice(1));
  await expect(page.locator('.pass-checklist')).toContainText('Rychlost se nehodnotí');
  await expect(page.locator('.lesson-completed')).toContainText('Lekce 27–32');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!));
  expect(saved.completed).toEqual([26, 27, 28, 29, 30, 31]);
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
