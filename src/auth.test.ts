import { it, expect } from 'vitest';
import { authReturnUrl, hasAuthCallback, authLinkError } from './auth';

it('vrací registraci na cestu repozitáře bez přihlašovacích parametrů', () => {
  expect(
    authReturnUrl('https://alexstygler.github.io/psani_vsema_deseti/?v=1#access_token=private'),
  ).toBe('https://alexstygler.github.io/psani_vsema_deseti/');
  expect(authReturnUrl('https://alexstygler.github.io/psani_vsema_deseti')).toBe(
    'https://alexstygler.github.io/psani_vsema_deseti/',
  );
  expect(authReturnUrl('https://example.com/lehce.html?test=1')).toBe(
    'https://example.com/lehce.html',
  );
});
it('pozná návrat z e-mailu a chyby bez zobrazení tokenů či syrové zprávy', () => {
  expect(hasAuthCallback('https://example.com/#access_token=private')).toBe(true);
  expect(hasAuthCallback('https://example.com/?code=private')).toBe(true);
  expect(hasAuthCallback('https://example.com/?v=1')).toBe(false);
  expect(authLinkError('https://example.com/#error_description=private')).toContain('vypršel');
  expect(authLinkError('https://example.com/#error_description=private')).not.toContain('private');
});
