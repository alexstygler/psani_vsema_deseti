import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { freshProgress } from '../src/engine';
import { learnedChars } from '../src/curriculum';
import { beginExercise, finishExercise } from './course-helpers';

async function beginner(page: import('@playwright/test').Page) {
  await page.addInitScript(
    (p) => {
      if (!localStorage.getItem('lehce.progress.v1'))
        localStorage.setItem('lehce.progress.v1', JSON.stringify(p));
    },
    {
      ...freshProgress(),
      settings: { ...freshProgress().settings, level: 'beginner' },
    },
  );
  await page.goto('/');
}
test('ukázka hmatů nic nehodnotí a lekce se uzná až po třech skutečně napsaných cvičeních', async ({
  page,
}) => {
  test.setTimeout(90000);
  await beginner(page);
  await expect(page.getByRole('heading', { name: 'Nové znaky: f a j', exact: true })).toBeVisible();
  await expect(page.locator('.intro-keyboard .new-key')).toHaveCount(2);
  await expect(page.locator('.new-key-cards')).toContainText('levý ukazováček');
  await page.getByRole('textbox', { name: 'Vyzkoušet nové znaky' }).pressSequentially('fj');
  await expect(page.locator('.new-key-cards .key-tried')).toHaveCount(2);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('lehce.progress.v1')!).sessions.length,
    ),
  ).toBe(0);
  await page.keyboard.press('Enter');
  await expect(page.locator('.untimed-badge')).toBeVisible();
  await finishExercise(page);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!).completed),
  ).toEqual([]);
  await page.keyboard.press('Enter');
  await finishExercise(page);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!).completed),
  ).toEqual([]);
  await page.keyboard.press('Enter');
  await finishExercise(page);
  await expect(page.locator('.lesson-completed')).toContainText('Lekce zvládnutá');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('lehce.progress.v1')!));
  expect(stored.completed).toEqual([0]);
  expect(stored.sessions.map((s: { exercise: string }) => s.exercise)).toEqual([
    'touch',
    'words',
    'sentences',
  ]);
});

test('rozpracovaná lekce se po obnovení vrátí k dalšímu kroku', async ({ page }) => {
  await beginner(page);
  await beginExercise(page);
  await finishExercise(page);
  await page.reload();
  await expect(page.locator('.lesson-stepper .current-step')).toContainText('Krátké skupiny');
  await expect(page.getByRole('textbox', { name: 'Psací pole' })).toBeFocused();
  await expect(page.locator('.key-intro')).toHaveCount(0);
});

test('ukázka horní řady zobrazí šipky a dva nové znaky, potom přijdou skutečná slova', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.addInitScript(
    (p) => {
      if (!localStorage.getItem('lehce.progress.v1'))
        localStorage.setItem('lehce.progress.v1', JSON.stringify(p));
    },
    {
      ...freshProgress(),
      completed: [0, 1, 2, 3, 4, 5],
    },
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Cesta od základů', exact: true }).click();
  await page.locator('.lesson-card').nth(6).click();
  await expect(page.getByRole('heading', { name: 'Nové znaky: e a i', exact: true })).toBeVisible();
  await expect(page.locator('.intro-keyboard > path')).toHaveCount(2);
  await beginExercise(page);
  await finishExercise(page);
  await page.keyboard.press('Enter');
  const words = (await page.locator('.typing-text').textContent())!;
  expect(words).toMatch(/jde|kde|les|sedl|dali/);
  expect(words).not.toMatch(/[ěščřžýáíéú]/);
  for (const char of learnedChars(6)) expect(words).toContain(char);
  await finishExercise(page);
  await page.keyboard.press('Enter');
  const sentences = (await page.locator('.typing-text').textContent())!;
  for (const char of learnedChars(6)) expect(sentences).toContain(char);
  expect(sentences).toMatch(/hala je sklad|kde je les|jak se jde/);
});

test('účet je v hlavním panelu vidět i na nízké obrazovce', async ({ page }) => {
  for (const viewport of [
    { width: 1366, height: 600 },
    { width: 1024, height: 540 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const account = page.getByRole('button', { name: 'Účet a synchronizace', exact: true });
    await expect(account).toBeInViewport();
    const box = (await account.boundingBox())!;
    expect(box.y + box.height).toBeLessThan(350);
    await account.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Váš účet.');
  }
});

test('ukázka hmatů a kroky lekce projdou přístupností a vejdou se na mobil', async ({ page }) => {
  test.setTimeout(60000);
  await beginner(page);
  for (const stage of ['intro', 'exercise']) {
    if (stage === 'exercise') await beginExercise(page);
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(scan.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
      [],
    );
    await page.screenshot({ path: `/tmp/lehce-v060-${stage}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
