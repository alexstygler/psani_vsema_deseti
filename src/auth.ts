// Use the served document's path, including the repository on GitHub Pages.
// Supabase must also allow this exact URL in Authentication → URL Configuration.
export function authReturnUrl(href: string) {
  const url = new URL(href);
  url.search = '';
  url.hash = '';
  if (
    url.hostname.endsWith('.github.io') &&
    !url.pathname.endsWith('/') &&
    !url.pathname.split('/').at(-1)!.includes('.')
  )
    url.pathname += '/';
  return url.href;
}

export function hasAuthCallback(href: string) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  return (
    url.searchParams.has('code') ||
    url.searchParams.has('token_hash') ||
    url.searchParams.has('error_description') ||
    hash.has('access_token') ||
    hash.has('error_description')
  );
}

export function authLinkError(href: string) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  if (url.searchParams.has('error_description') || hash.has('error_description'))
    return 'Potvrzovací odkaz vypršel nebo už byl použit. Zkuste se přihlásit, případně si níže nechte poslat nový odkaz.';
  return '';
}

export function authFailure(error: unknown) {
  const value = error as { code?: string; status?: number; message?: string };
  const code = typeof value?.code === 'string' ? value.code : '';
  const status = typeof value?.status === 'number' ? value.status : undefined;
  const message = typeof value?.message === 'string' ? value.message : '';
  let explanation = 'Připojení k účtu se nepodařilo. Zkuste to znovu.';
  if (code === 'invalid_credentials')
    explanation = 'E-mail nebo heslo nesouhlasí. Pokud už účet máte, není potřeba vytvářet nový.';
  else if (code === 'email_not_confirmed')
    explanation = 'Účet čeká na potvrzení e-mailu. Nechte si poslat ověřovací zprávu.';
  else if (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    status === 429
  )
    explanation =
      'Odesílání je dočasně omezené. Chvíli počkejte. Pokud se hláška vrací, musí správce webu zkontrolovat limit odesílání e-mailů.';
  else if (
    code === 'email_address_not_authorized' ||
    /only.*(authorized|organization|team)|email address.*not authorized/i.test(message)
  )
    explanation =
      'Odesílatel zatím nemůže posílat e-maily na tuto adresu. Správce webu musí nastavit odesílání pro všechny uživatele.';
  else if (/sending.*(email|mail)|smtp|email.*provider/i.test(message))
    explanation =
      'Ověřovací e-mail se nepodařilo odeslat. Správce webu musí zkontrolovat nastavení odesílání.';
  else if (code === 'signup_disabled')
    explanation = 'Vytváření účtů je zatím vypnuté. Správce webu musí povolit registraci.';
  else if (code === 'weak_password') explanation = 'Zvolte silnější heslo, alespoň osm znaků.';
  else if (code === 'user_already_exists' || code === 'email_exists')
    explanation = 'Zkuste se přihlásit. Pro tento e-mail už může existovat účet.';
  else if (status && status >= 500)
    explanation = 'Služba účtů má potíže. Počkejte chvíli a zkuste to znovu.';
  else if (/fetch|network|timeout|abort/i.test(message))
    explanation = 'Spojení se službou účtů se nepodařilo. Zkontrolujte internet a zkuste to znovu.';
  return { message: explanation, code, status };
}
