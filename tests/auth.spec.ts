import { test, expect, type Page } from '@playwright/test';
import { freshProgress, type Progress } from '../src/engine';
const user = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'novy@example.com',
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

async function configure(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'lehce.cloud.config',
      JSON.stringify({ url: 'https://lehce-test.supabase.co', key: 'sb_publishable_test' }),
    );
  });
}

test('registrace má správný návrat do repozitáře a potvrzení z e-mailu přihlásí i přenese pokrok', async ({
  page,
}) => {
  await configure(page);
  const guest: Progress = { ...freshProgress(), completed: [0] };
  await page.addInitScript((p) => {
    if (!localStorage.getItem('lehce.progress.v1'))
      localStorage.setItem('lehce.progress.v1', JSON.stringify(p));
  }, guest);
  let redirect = '';
  let snapshot: unknown = null;
  await page.route('https://lehce-test.supabase.co/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/signup')) {
      redirect = url.searchParams.get('redirect_to') ?? '';
      return route.fulfill({ json: { user, session: null } });
    }
    if (url.pathname.endsWith('/user')) return route.fulfill({ json: user });
    if (url.pathname === '/rest/v1/lehce_progress') {
      if (route.request().method() === 'GET')
        return route.fulfill({ json: snapshot ? [snapshot] : [] });
      snapshot = route.request().postDataJSON();
      return route.fulfill({ status: 201, body: '' });
    }
    return route.fulfill({ json: {} });
  });
  await page.goto('/psani_vsema_deseti/');
  await page.getByRole('button', { name: 'Přihlásit / Vytvořit účet', exact: true }).click();
  await page.getByRole('button', { name: 'Vytvořit účet', exact: true }).click();
  await page.getByLabel('E-mail', { exact: true }).fill(user.email);
  await page.getByLabel('Heslo', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Založit účet', exact: true }).click();
  await expect(page.locator('.auth-notice')).toContainText('Poslali jsme potvrzovací e-mail');
  expect(redirect).toBe('http://127.0.0.1:5173/psani_vsema_deseti/');
  // The real link leaves the app for Supabase verification before returning.
  // A hash-only goto would stay in the existing document and skip startup auth.
  await page.goto('about:blank');
  await page.goto(
    `/psani_vsema_deseti/#access_token=${access}&refresh_token=test-refresh&expires_in=3600&token_type=bearer&type=signup`,
  );
  await expect(page.locator('.cloud-account')).toContainText(user.email);
  await expect(page.locator('.account-button')).toHaveText('Můj účet');
  await expect(page.locator('.cloud-status')).toContainText('Synchronizováno');
  await expect.poll(() => page.url()).not.toContain('access_token');
  const progress = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('lehce.progress.v1')!),
  );
  expect(progress.completed).toEqual([0]);
  expect(snapshot).toBeTruthy();
  await page.getByRole('button', { name: 'Odhlásit toto zařízení' }).click();
  await expect(page.locator('.account-button')).toHaveText('Přihlásit / Vytvořit účet');
  await expect(page.locator('.auth-notice')).toHaveCount(0);
});

test('propadlý odkaz zobrazí srozumitelnou zprávu a nové potvrzení zachová cestu webu', async ({
  page,
}) => {
  await configure(page);
  let redirect = '';
  await page.route('https://lehce-test.supabase.co/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/resend')) redirect = url.searchParams.get('redirect_to') ?? '';
    return route.fulfill({ json: {} });
  });
  await page.goto('/psani_vsema_deseti/#error=access_denied&error_description=Email+link+expired');
  await expect(page.locator('.warning')).toContainText('Potvrzovací odkaz vypršel');
  await page.getByLabel('E-mail', { exact: true }).fill(user.email);
  await page.getByRole('button', { name: 'Poslat nový potvrzovací odkaz' }).click();
  await expect(page.locator('.auth-notice')).toContainText('poslali jsme nový odkaz');
  expect(redirect).toBe('http://127.0.0.1:5173/psani_vsema_deseti/');
});

test('účet se dá otevřít jedním kliknutím i na úzkém mobilu', async ({ page }) => {
  await configure(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Přihlásit / Vytvořit účet', exact: true }).click();
  await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/lehce-account-mobile.png', fullPage: true });
});
