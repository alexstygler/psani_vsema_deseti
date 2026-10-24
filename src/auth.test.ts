import { it, expect } from 'vitest';
import { authReturnUrl, hasAuthCallback, authLinkError, authFailure } from './auth';

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
it('rozliší omezení odesílání, nepotvrzený účet a chybu poštovního odesílatele', () => {
  expect(authFailure({ code: 'over_email_send_rate_limit', status: 429 }).message).toContain(
    'dočasně omezené',
  );
  expect(authFailure({ code: 'email_not_confirmed', status: 400 }).message).toContain(
    'čeká na potvrzení',
  );
  expect(
    authFailure({
      code: 'unexpected_failure',
      status: 500,
      message: 'Error sending confirmation email',
    }).message,
  ).toContain('nepodařilo odeslat');
  expect(authFailure({ code: 'email_address_not_authorized', status: 403 }).message).toContain(
    'zatím nemůže posílat',
  );
  expect(authFailure({ code: 'invalid_credentials', status: 400 }).message).toContain(
    'heslo nesouhlasí',
  );
});
it('pozná návrat z e-mailu a chyby bez zobrazení tokenů či syrové zprávy', () => {
  expect(hasAuthCallback('https://example.com/#access_token=private')).toBe(true);
  expect(hasAuthCallback('https://example.com/?code=private')).toBe(true);
  expect(hasAuthCallback('https://example.com/?v=1')).toBe(false);
  expect(authLinkError('https://example.com/#error_description=private')).toContain('vypršel');
  expect(authLinkError('https://example.com/#error_description=private')).not.toContain('private');
});
