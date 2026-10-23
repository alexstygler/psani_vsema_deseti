import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('začátečník dokončí lekci, chyby se zaznamenají a pokrok přežije obnovení', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Vybrat svou cestu' }).click();
  await page.getByRole('button', { name: 'Začínám od nuly' }).click();
  await page.getByRole('button', { name: 'Najít základní polohu' }).click();
  const target = await page.locator('.typing-text').textContent();
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await page.getByRole('button', { name: 'Klikněte sem' }).click();
  await input.pressSequentially('x');
  await expect(page.locator('.typing-feedback')).toContainText('Zkuste „f“');
  await input.pressSequentially(target!, { delay: 5 });
  await expect(page.getByRole('status')).toContainText('Lekce zvládnutá');
  await expect(page.locator('.result-stats')).toContainText('98 %');
  await page.getByRole('button', { name: 'Můj pokrok', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.reload();
  await page.getByRole('button', { name: 'Můj pokrok', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: 'Cesta od základů', exact: true }).click();
  await expect(page.locator('.lesson-card.complete')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('pauza zastaví čas a limit dokončí právě jedno cvičení', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-23T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-23T12:01:00Z'));
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await page.getByRole('button', { name: 'Klikněte sem' }).click();
  const target = (await page.locator('.typing-text').textContent())!;
  await input.pressSequentially(target.slice(0, 4));
  await page.clock.runFor(10000);
  await input.press('Escape');
  await expect(page.locator('.time-stat strong')).toHaveText('0:50');
  await page.clock.runFor(20000);
  await expect(page.locator('.time-stat strong')).toHaveText('0:50');
  await page.getByRole('button', { name: 'Pokračovat v psaní' }).click();
  await input.pressSequentially(target[4]);
  await page.clock.runFor(50000);
  await expect(page.getByRole('status')).toContainText('Další malý krok', { ignoreCase: true });
  await page.clock.runFor(5000);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!));
  expect(saved.sessions).toHaveLength(1);
  expect(saved.sessions[0].seconds).toBe(60);
  expect(saved.sessions[0].characters).toBe(5);
});

test('české znaky, oprava Backspace a vlastní text skutečně fungují', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Další druhy textů').selectOption('custom');
  await page
    .getByRole('textbox', { name: 'Vlastní text k procvičení' })
    .fill('Příliš žluťoučký kůň. =A1*B1');
  await page.getByRole('button', { name: 'Procvičit můj text' }).click();
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await page.getByRole('button', { name: 'Klikněte sem' }).click();
  await input.pressSequentially('Př');
  await input.press('Backspace');
  await expect(page.locator('.text-count')).toHaveText('1 / 28');
  await input.pressSequentially('říliš žluťoučký kůň. =A1*B1');
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.locator('.result-stats')).toContainText('100 %');
});

test('mrtvá klávesa nepřidává falešný stisk při skládání diakritiky', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Další druhy textů').selectOption('custom');
  await page.getByRole('textbox', { name: 'Vlastní text k procvičení' }).fill('ěščřžýáíéúů');
  await page.getByRole('button', { name: 'Procvičit můj text' }).click();
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await input.focus();
  await input.evaluate((el) => {
    const textarea = el as HTMLTextAreaElement;
    textarea.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    textarea.value = 'e';
    textarea.dispatchEvent(
      new InputEvent('input', { bubbles: true, data: 'e', isComposing: true }),
    );
    textarea.value = 'ě';
    textarea.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'ě' }));
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'ě' }));
  });
  await expect(page.locator('.text-count')).toHaveText('1 / 11');
  await input.pressSequentially('ščřžýáíéúů');
  await expect(page.locator('.result-stats')).toContainText('100 %');
});

test('mobilní navigace, nastavení a export zálohy', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Otevřít navigaci' }).click();
  await page.getByRole('button', { name: 'Nastavení', exact: true }).click();
  await page.getByLabel('Právě píšu na').selectOption('keyboard');
  await page.getByLabel('Cílová rychlost').fill('320');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Stáhnout zálohu' }).click();
  expect((await download).suggestedFilename()).toMatch(/^lehce-pokrok-/);
  await page.reload();
  await page.getByRole('button', { name: 'Otevřít navigaci' }).click();
  await page.getByRole('button', { name: 'Nastavení', exact: true }).click();
  await expect(page.getByLabel('Právě píšu na')).toHaveValue('keyboard');
  await expect(page.getByLabel('Cílová rychlost')).toHaveValue('320');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('zobrazení pracovního prostoru a mobilu', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: '/tmp/lehce-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/tmp/lehce-mobile.png', fullPage: true });
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});

test('základní přístupnost hlavních stránek a dialogu', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');
  for (const destination of [null, 'Cesta od základů', 'Můj pokrok', 'Nastavení']) {
    if (destination) await page.getByRole('button', { name: destination, exact: true }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
  await page.getByRole('button', { name: 'Jak to funguje' }).click();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
});
