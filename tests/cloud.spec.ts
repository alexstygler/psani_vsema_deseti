import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import type { Progress } from '../src/engine';
test('dva prohlížeče sdílejí historii přes přihlášení a revize', async ({ browser }) => {
  test.setTimeout(60000);
  let snapshot: { user_id: string; payload: Progress; revision: number } | null = null;
  const user = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2026-10-24T00:00:00Z',
  };
  const access = [
    'eyJhbGciOiJIUzI1NiJ9',
    Buffer.from(
      JSON.stringify({
        sub: user.id,
        role: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString('base64url'),
    'test',
  ].join('.');
  const contexts: BrowserContext[] = [];
  async function device() {
    const context = await browser.newContext();
    contexts.push(context);
    await context.addInitScript(() =>
      localStorage.setItem(
        'lehce.cloud.config',
        JSON.stringify({ url: 'https://lehce-test.supabase.co', key: 'sb_publishable_test' }),
      ),
    );
    await context.route('https://lehce-test.supabase.co/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.pathname === '/auth/v1/token')
        return route.fulfill({
          json: {
            access_token: access,
            refresh_token: 'test-refresh',
            token_type: 'bearer',
            expires_in: 3600,
            user,
          },
        });
      if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user });
      if (url.pathname === '/rest/v1/lehce_progress') {
        if (request.method() === 'GET') return route.fulfill({ json: snapshot ? [snapshot] : [] });
        const next = request.postDataJSON();
        if (request.method() === 'POST') {
          if (snapshot)
            return route.fulfill({ status: 409, json: { code: '23505', message: 'conflict' } });
          snapshot = next;
          return route.fulfill({ status: 201, body: '' });
        }
        if (request.method() === 'PATCH') {
          if (url.searchParams.get('revision') !== `eq.${snapshot?.revision}`)
            return route.fulfill({ json: [] });
          snapshot = next;
          return route.fulfill({ json: [{ revision: next.revision }] });
        }
      }
      return route.fulfill({ json: {} });
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.getByRole('button', { name: 'Nastavení', exact: true }).click();
    await page.getByLabel('E-mail', { exact: true }).fill(user.email);
    await page.getByLabel('Heslo', { exact: true }).fill('test-password');
    await page.getByRole('button', { name: 'Přihlásit a synchronizovat' }).click();
    await expect(page.getByText('Přihlášeno:', { exact: false })).toBeVisible();
    return page;
  }
  async function attempt(page: Page, text: string) {
    await page.getByRole('button', { name: 'Procvičování', exact: true }).click();
    await page.getByLabel('Další druhy textů').selectOption('custom');
    await page.getByRole('textbox', { name: 'Vlastní text k procvičení' }).fill(text);
    await page.getByRole('button', { name: 'Procvičit můj text' }).click();
    await page.getByRole('textbox', { name: 'Psací pole' }).focus();
    await page.getByRole('textbox', { name: 'Psací pole' }).pressSequentially(text);
    await expect(page.locator('.result-panel')).toBeVisible();
  }
  try {
    const a = await device();
    const b = await device();
    await Promise.all([
      attempt(a, 'První zařízení píše český text.'),
      attempt(b, 'Druhé zařízení píše jiný text.'),
    ]);
    await expect.poll(() => snapshot?.payload.sessions.length, { timeout: 15000 }).toBe(2);
    for (const page of [a, b]) {
      await page.getByRole('button', { name: 'Nastavení', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Synchronizovat teď' })).toBeEnabled();
      await page.getByRole('button', { name: 'Synchronizovat teď' }).click();
      await expect(page.locator('.cloud-status')).toContainText('Synchronizováno');
      await page.getByRole('button', { name: 'Můj pokrok', exact: true }).click();
      await expect(page.locator('tbody tr')).toHaveCount(2);
    }
    await a.getByRole('button', { name: 'Zjistit mou úroveň', exact: true }).first().click();
    await a.getByRole('button', { name: 'Spustit rozřazení' }).click();
    const target = (await a.locator('.typing-text').textContent())!;
    await a.getByRole('textbox', { name: 'Psací pole' }).pressSequentially(target);
    await expect(a.locator('.lesson-completed')).toContainText('Lekce 1–6');
    await expect.poll(() => snapshot?.payload.completed.length, { timeout: 15000 }).toBe(6);
    await b.getByRole('button', { name: 'Nastavení', exact: true }).click();
    await expect(b.getByRole('button', { name: 'Synchronizovat teď' })).toBeEnabled();
    await b.getByRole('button', { name: 'Synchronizovat teď' }).click();
    await expect(b.locator('.cloud-status')).toContainText('Synchronizováno');
    await b.getByRole('button', { name: 'Cesta od základů', exact: true }).click();
    await expect(b.locator('.lesson-card.complete')).toHaveCount(6);
  } finally {
    await Promise.all(contexts.map((c) => c.close()));
  }
});
