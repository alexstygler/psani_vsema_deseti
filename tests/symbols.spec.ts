import { test, expect } from '@playwright/test';
import { freshProgress } from '../src/engine';
import { lessons } from '../src/curriculum';
import { beginExercise, finishExercise } from './course-helpers';
test('Excel po deseti minutách bez rychlosti odemkne další lekci', async ({ page }) => {
  test.setTimeout(60000);
  await page.clock.install({ time: new Date('2026-10-24T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-24T12:01:00Z'));
  await page.addInitScript(
    (progress) => localStorage.setItem('lehce.progress.v1', JSON.stringify(progress)),
    {
      ...freshProgress(),
      completed: Array.from(
        { length: lessons.findIndex((l) => l.id === 'excel-sum') },
        (_, i) => i,
      ),
      onboarded: true,
    },
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Cesta od základů', exact: true }).click();
  await page
    .locator('.lesson-card')
    .nth(lessons.findIndex((l) => l.id === 'excel-sum'))
    .click();
  await beginExercise(page);
  await finishExercise(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('.untimed-badge')).toContainText('Bez časového limitu');
  const text = (await page.locator('.typing-text').textContent())!;
  expect(text).toContain('SUM(');
  expect(text).not.toContain('SUMA');
  await page.getByRole('textbox', { name: 'Psací pole' }).focus();
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await input.pressSequentially(text[0]);
  await page.clock.fastForward(600000);
  await expect(page.locator('.result-panel')).toHaveCount(0);
  await input.pressSequentially(text.slice(1));
  await expect(page.locator('.pass-checklist')).toContainText('Rychlost se nehodnotí');
  await expect(page.locator('.pass-checklist')).toContainText('Chyby 0 / 3');
  await page.keyboard.press('Enter');
  await finishExercise(page);
  await page.getByRole('button', { name: 'Dokončit lekci a pokračovat', exact: true }).click();
  await beginExercise(page);
  await expect(page.locator('.session-label')).toContainText(
    `Lekce ${lessons.findIndex((l) => l.id === 'excel-if') + 1}`,
  );
});

test('tahák zaměří znak a zvýrazní Ctrl i Alt, bez numerického bloku', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Čísla a znaky', exact: true }).click();
  await page.locator('.symbol-guide summary').click();
  await page.getByRole('button', { name: 'Procvičit <: Ctrl + Alt + ,', exact: true }).click();
  const text = (await page.locator('.typing-text').textContent())!;
  const prefix = text.slice(0, text.indexOf('<'));
  await page.getByRole('textbox', { name: 'Psací pole' }).focus();
  const input = page.getByRole('textbox', { name: 'Psací pole' });
  await input.pressSequentially(prefix);
  await expect(page.locator('.keyboard-heading')).toContainText('< · Ctrl + Alt + ,');
  await expect(page.locator('.bottom-row .needed')).toHaveCount(2);
  await expect(page.locator('.bottom-row .needed').nth(0)).toHaveText('ctrl');
  await expect(page.locator('.bottom-row .needed').nth(1)).toHaveText('alt');
  await input.pressSequentially(text.slice(prefix.length));
  await expect(page.locator('.result-panel')).toBeVisible();
  await expect(page.locator('.result-stats')).not.toContainText('znaků / min');
  await page.getByRole('button', { name: 'Můj pokrok', exact: true }).click();
  await expect(page.locator('tbody')).toContainText('Bez hodnocení rychlosti');
});
